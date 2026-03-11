<?php

namespace App\Controllers;

use App\Core\Response;
use App\Core\Context;
use App\Core\Database;
use App\Models\Company;
use App\Models\Plan;

class AuthController
{
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

        $plan_name = $data['plan_name'];
        $subdomain = $data['subdomain'];
        $vat_number = $data['vat_number'];

        $dbErrors = [];

        // Verifica esistenza piano
        $result = $plan_db->findByName($plan_name);
        if(!$result) {
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
        $province = $data['province'];
        $primary_color = $data['primary_color'];
        $logo_url = $data['logo'];

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
        if (!empty($province) && !preg_match('/^[A-Za-z]{2}$/', $province)) {
            $errors['province'] = "The province must be a 2-letter acronym";
        }

        if (!empty($primary_color) && !preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $primary_color)) {
            $errors['primary_color'] = "Color must be a valid HEX format";
        }

        if (!empty($logo_url)) {
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
}