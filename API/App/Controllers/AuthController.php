<?php

namespace App\Controllers;

use App\Core\Response;
use App\Core\Context;
use App\Core\Database;
use App\Models\Company;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Employee;
use App\Models\Role;
use App\Models\Project;
use App\Models\ProjectMember;

class AuthController
{
    public function ping()
    {
        $isMaster = Context::$isMaster ? 'YES' : 'NO';
        \App\Core\Response::response("OK", 200, "Pong! APIs working. Master DB: " . $isMaster);
    }

    public function registerTenant()
    {
        if (!Context::$isMaster) {
            Response::response("Forbidden", 403, "Company registration is only permitted on the main domain");
            exit();
        }

        $data = Context::$requestBody;

        // Validazione formale dei dati
        $errors = $this->validateRegistrationData($data);

        // Controllo se sono stati trovati errori, in quel caso restituisco 400 e l'array degli errori a NextJS
        if(!empty($errors)) {
            Response::response("Bad Request", 400, "Invalid data", $errors);
            return;
        }

        $master_db = new Database();
        $company_db = new Company($master_db);
        $plan_db = new Plan($master_db);
        $subscription_db = new Subscription($master_db);

        $plan_name = $data['plan_name'];
        $subdomain = $data['subdomain'];
        $vat_number = $data['vat_number'];

        $dbErrors = [];

        // Verifica esistenza piano
        $plan = $plan_db->findByName($plan_name);
        if(!$plan) {
            $dbErrors['plan'] = "The selected plan does not exist";
        }

        // Verifica se il sottodominio è già in uso
        $result = $company_db->findBySubdomain($subdomain);
        if($result) {
            $dbErrors['subdomain'] = "Subdomain already in use";
        }

        // Verifica se la partita IVA è già presente
        $result = $company_db->findByVatNumber($vat_number);
        if($result) {
            $dbErrors['vat_number'] = "VAT number is already registered";
        }

        if (!empty($dbErrors)) {
            Response::response("Conflict", 409, "Data conflict", $dbErrors);
            return;
        }

        // Verifica partita IVA con API esterna
        try {
            if (!$this->verifyVatNumber($vat_number)) {
                Response::response("Bad request", 400, "VAT number invalid or inactive in the official registers");
                return;
            }
        } catch (\Exception $e) {
            Response::response("Service Unavailable", 503, $e->getMessage());
            return;
        }

        try {
            $master_db->beginTransaction();

            // Preparazione dati da inserire nella tabella del tenant
            $company_data = [
                'VAT_Number' => $vat_number,
                'Name' => $data['tenant_name'],
                'Subdomain' => $subdomain,
                'DB_Type' => $data['db_type']
            ];

            if(!empty($data['province'])) {
                $company_data['Province'] = $data['province'];
            }

            if(!empty($data['city'])) {
                $company_data['City'] = $data['city'];
            }

            if(!empty($data['street'])) {
                $company_data['Street'] = $data['street'];
            }

            if(!empty($data['suite'])) {
                $company_data['Suite'] = $data['suite'];
            }

            if(!empty($data['logo'])) {
                $company_data['Logo_URL'] = $data['logo'];
            }

            if(!empty($data['primary_color'])) {
                $company_data['Primary_Color'] = $data['primary_color'];
            }

            $tenant_id = $company_db->create($company_data);

            $start_date = date('Y-m-d');
            $duration = $plan->Duration_Days;
            $end_date = date('Y-m-d', strtotime("+$duration days"));

            $subscription_db->create([
                'Tenant_ID' => $tenant_id,
                'Plan_Name' => $plan_name,
                'Start_Date' => $start_date,
                'End_Date' => $end_date
            ]);

            // Creazione del database del tenant
            $tenant_db_name = $subdomain . 'db';
            $tenant_db_user = $subdomain;
            $tenant_db_pass = hash_hmac('sha256', $subdomain, TENANT_SECRET_KEY);

            $master_db->query("CREATE DATABASE IF NOT EXISTS `$tenant_db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $master_db->execute();

            $master_db->query("CREATE USER IF NOT EXISTS '$tenant_db_user'@'localhost' IDENTIFIED BY '$tenant_db_pass'");
            $master_db->execute();

            $master_db->query("GRANT ALL PRIVILEGES ON `$tenant_db_name`.* TO '$tenant_db_user'@'localhost'");
            $master_db->execute();

            $master_db->query("FLUSH PRIVILEGES");
            $master_db->execute();

            $this->setupTenantDatabase($tenant_db_name, $tenant_db_user, $tenant_db_pass, $data);

            if ($master_db->inTransaction()) {
                $master_db->commitTransaction(); 
            }

            Response::response("Created", 201, "Tenant environment created successfully", [
                'tenant_url' => 'https://' . $subdomain . '.tuodominio.it',
                'tenant_id'  => $tenant_id 
            ]);
        } catch (\Exception $e) {

            if ($master_db->inTransaction()) {
                $master_db->rollbackTransaction();
            }

            // Rimuovo manualmente il database se era stato creato
            if (isset($tenant_db_name)) {
                $master_db->query("DROP DATABASE IF EXISTS `$tenant_db_name`");
                $master_db->execute();
            }

            // Rimuovo l'utente se era stato creato
            if (isset($tenant_db_user)) {
                $master_db->query("DROP USER IF EXISTS '$tenant_db_user'@'localhost'");
                $master_db->execute();
            }

            // Rimuovo il tenant
            if (isset($tenant_id)) {
                $company_db->delete($tenant_id);
            }

            error_log("FALLIMENTO CRITICO PROVISIONING TENANT [$subdomain]. Rollback manuale eseguito. Causa: " . $e->getMessage());

            Response::response("Internal Server Error", 500, "DEBUG ERRORE: " . $e->getMessage());
        }
    }

    private function validateRegistrationData($data)
    {
        $errors = [];

        // Campi obbligatori
        $vat_number = $data['vat_number'];
        $tenant_name = $data['tenant_name'];
        $subdomain = $data['subdomain'];
        $db_type = $data['db_type'];
        $plan_name = $data['plan_name'];
        $admin_firstname = $data['admin_firstname'];
        $admin_lastname = $data['admin_lastname'];
        $admin_email = $data['admin_email'];
        $admin_password = $data['admin_password'];

        // Campi opzionali

        // Controllo partita IVA
        if (empty($vat_number)) {
            $errors['vat_number'] = "The VAT number is required";
        } else {
            // 1. Rimuoviamo spazi o trattini che l'utente potrebbe aver inserito per sbaglio
            $vat_clean = preg_replace('/[^A-Za-z0-9]/', '', $vat_number);

            // 2. Controlliamo se inizia con due lettere (Country Code, es. 'IT', 'FR', 'DE')
            if (preg_match('/^[A-Za-z]{2}/', $vat_clean)) {
                // Formato Europeo: 2 lettere seguite da 8-12 caratteri (numeri o lettere)
                if (!preg_match('/^[A-Za-z]{2}[A-Za-z0-9]{8,12}$/', $vat_clean)) {
                    $errors['vat_number'] = "Invalid European VAT number format";
                }
            } else {
                // Formato locale (senza nazione): assumiamo sia Italiana e pretendiamo 11 numeri esatti
                if (!preg_match('/^[0-9]{11}$/', $vat_clean)) {
                    $errors['vat_number'] = "The Italian VAT number must be exactly 11 digits";
                }
            }
            
            // Opzionale: Riscriviamo il dato pulito nell'array così il resto del codice usa quello giusto
            $data['vat_number'] = strtoupper($vat_clean); 
        }

        // Controllo nome tenant
        if (empty($tenant_name)) {
            $errors['tenant_name'] = "Tenant name is required";
        }

        if (strlen($tenant_name) > 255) {
            $errors['tenant_name'] = "Tenant name cannot exceed 255 characters";
        }

        // Controllo sottodominio
        $reservedSubdomains = ['www', 'api', 'admin', 'master', 'app', 'test'];
        if (empty($subdomain)) {
            $errors['subdomain'] = "Subdomain is required";
        }

        if (!preg_match('/^[a-z0-9-]+$/', $subdomain)) {
            $errors['subdomain'] = "Subdomain can contain only lowercase letters, numbers and dashes";
        }

        if (strlen($subdomain) > 32) {
            $errors['subdomain'] = "Subdomain cannot exceed 32 characters";
        }

        if (in_array($subdomain, $reservedSubdomains)) {
            $errors['subdomain'] = "This subdomain is reserved by the system";
        }

        // Controllo sul tipo db
        $validDBTypes = ['private', 'hosted'];
        if (empty($db_type)) {
            $errors['db_type'] = "Database type is required";
        }

        if (!in_array($db_type, $validDBTypes)) {
            $errors['db_type'] = "Invalid database type";
        }

        // Controllo sul piano scelto
        if (empty($plan_name)) {
            $errors['plan_name'] = "No plan selected";
        }

        // Controllo dati admin
        if (empty($admin_firstname)) {
            $errors['admin_firstname'] = "Admin firstname is required";
        }

        if (empty($admin_lastname)) {
            $errors['admin_lastname'] = "Admin lastname is required";
        }

        $emailPattern = '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/';
        if (empty($admin_email)) {
            $errors['admin_email'] = "Admin email is required";
        }

        if(!preg_match($emailPattern, $admin_email)) {
            $errors['admin_email'] = "Invalid admin email format";
        }

        $passwordPattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/';
        if (empty($admin_password)) {
            $errors['admin_password'] = "Admin password is required";
        }

        if (!preg_match($passwordPattern, $admin_password)) {
            $errors['admin_password'] = "Password must contain at least 8 characters, one uppercase letter, one number and one special character";
        }

        // Controllo sui campi opzionali
        if (isset($data['province']) && !empty($province) && !preg_match('/^[A-Za-z]{2}$/', $province)) {
            $errors['province'] = "The province must be a 2-letter acronym";
        }

        if (isset($data['primary_color']) && !empty($primary_color) && !preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $primary_color)) {
            $errors['primary_color'] = "Color must be a valid HEX format";
        }

        if (isset($data['logo']) && !empty($logo_url)) {
            if (!filter_var($logo_url, FILTER_VALIDATE_URL) && !preg_match('/^data:image\/(jpeg|png|gif|svg\+xml);base64,/', $logo_url)) {
                $errors['logo'] = "The logo must be a valid URL or a correct base64 string";
            }
        }

        return $errors;
    }

    private function verifyVatNumber($vat_number, $country_code = 'IT') 
    {
        $vat_number = preg_replace('/[^A-Za-z0-9]/', '', $vat_number);

        // Controllo se l'utente ha inserito la sigla nel campo della partita IVA e lo estraggo
        if (preg_match('/^[A-Za-z]{2}/', $vat_number, $matches)) {
            $country_code = strtoupper($matches[0]);
            $vat_number = substr($vat_number, 2);
        }

        try {
            $wsdl = "http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl";

            $client = new \SoapClient($wsdl, ['connection_timeout' => 5]);

            $result = $client->checkVat([
                'countryCode' => $country_code,
                'vatNumber' => $vat_number
            ]);

            // Restituisco la proprietà booleana che dice se la partita IVA è valida o meno
            return $result->valid;
        } catch (\SoapFault $e) {
            error_log("VIES SOAP error for {$country_code}{$vat_number}: " . $e->getMessage());

            throw new \Exception("The European VIES service is temporarily unavailable");
        }
    }

    private function setupTenantDatabase($db_name, $db_user, $db_pass, $data)
    {
        $host = defined('DB_HOST') ? DB_HOST : 'localhost';
        $tenant_db = new Database($host, $db_name, $db_user, $db_pass);

        $schema_path = __DIR__ . '/../Database/tenant_schema.sql';

        if(!file_exists($schema_path)) {
            throw new \Exception("SQL schema file not found in: " . $schema_path);
        }

        $schema_sql = file_get_contents($schema_path);

        $tenant_db->getPDO()->exec($schema_sql);

        // Istanze dei model per proseguire
        $employee_db = new Employee($tenant_db);
        $role_db = new Role($tenant_db);
        $project_db = new Project($tenant_db);
        $projectMember_db = new ProjectMember($tenant_db);

        // Creazione dell'admin

        try {
            $tenant_db->beginTransaction();

            $peppered_password = hash_hmac('sha256', $data['admin_password'], PEPPER_SECRET_KEY);
            $hashed_password = password_hash($peppered_password, PASSWORD_BCRYPT); // aggiunge il salt ed esegue l'hash

            $admin_id = $employee_db->create([
                'Email' => $data['admin_email'],
                'Password_Hash' => $hashed_password,
                'First_Name' => $data['admin_firstname'],
                'Last_name' => $data['admin_lastname'],
                'Status' => 'active'
            ]);

            $adminRole = $role_db->findByName('Admin');
            if(!$adminRole) {
                throw new \Exception("Critical error: admin role not found");
            }

            $adminProject = $project_db->findByTitle('Admin');
            if(!$adminProject) {
                throw new \Exception("Critical error: admin project not found in default schema");
            }

            $projectMember_db->create([
                'Employee_ID' => $admin_id,
                'Project_ID' => $adminProject->ID,
                'Role_ID' => $adminRole->ID
            ]);

            $tenant_db->commitTransaction();
        } catch (\Exception $e) {
            $tenant_db->rollbackTransaction();

            throw $e;
        }
    }
}