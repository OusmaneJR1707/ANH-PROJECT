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
use App\Models\PendingRegistration;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use PHPMailer\PHPMailer\SMTP;

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

        $errors = $this->validateRegistrationData($data, false);

        if(!empty($errors)) {
            Response::response("Bad Request", 400, "Invalid data", $errors);
            return;
        }

        $this->processRegistration($data, false);
    }

    public function registerGoogle(){
        if (!Context::$isMaster) {
            Response::response("Forbidden", 403, "Company registration is only permitted on the main domain");
            exit();
        }

        $data = Context::$requestBody;

        if (empty($data['google_token'])) {
            Response::response("Bad Request", 400, "Google Token mancante");
            return;
        }

        try {
            $client = new \Google_Client(['client_id' => GOOGLE_CLIENT_ID]);
            $payload = $client->verifyIdToken($data['google_token']);

            if ($payload) {
                $data['admin_email'] = $payload['email'];
                $data['admin_firstname'] = $payload['given_name'] ?? "Admin";
                $data['admin_lastname'] = $payload['family_name'] ?? "ND";
                $data['admin_profile_picture'] = $payload['picture'] ?? null;

                $errors = $this->validateRegistrationData($data, true);

                if(!empty($errors)) {
                    Response::response("Bad Request", 400, "Invalid data", $errors);
                    return;
                }

                $this->processRegistration($data, true);
            } else {
                Response::response("Unauthorized", 401, "Firma del token Google non valida.");
            }
        } catch (\Exception $e) {
            error_log("Errore Google OAuth: " . $e->getMessage());
            Response::response("Internal Server Error", 500, "Errore durante la verifica dell'account Google.");
        }
    }

    private function processRegistration($data, $isGoogleAuth)
    {
        $master_db = new Database();
        $company_db = new Company($master_db);
        $plan_db = new Plan($master_db);
        $pending_db = new PendingRegistration($master_db);

        $plan_name = $data['plan_name'] ?? '';
        $db_type = $data['db_type'] ?? '';
        $subdomain = $data['subdomain'] ?? '';
        $vat_number = $data['vat_number'] ?? '';

        $dbErrors = [];

        // Verifica esistenza piano
        $plan = $plan_db->findByName($plan_name);
        if(!$plan) {
            $dbErrors['plan'] = "The selected plan does not exist";
        } else {
            if (empty($plan->Stripe_Price_ID)) {
                $dbErrors['plan'] = "Configurazione del prezzo Stripe mancante per questo piano.";
            }
        }

        if($db_type == "hosted" && !$plan->Cloud_Managed){
            $dbErrors['db_type'] = "The selected plan does not support hosted databases. Please select 'private' or upgrade your plan.";
        }

        // Verifica se il sottodominio è già in uso
        $result = $company_db->findBySubdomain($subdomain);
        if($result) {
            $dbErrors['subdomain'] = "Subdomain already in use";
        }

        $result = $company_db->findByVatNumber($vat_number);
        if($result) {
            $dbErrors['vat_number'] = "VAT number is already registered";
        }

        if ($pending_db->findBySubdomain($subdomain)) {
            $dbErrors['subdomain'] = "This subdomain is currently reserved by another pending registration.";
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
            // Generazione di un id univoco per la richiesta che permetterà di ricollegare i dati dell'utente alla richiesta stessa
            $pending_id = bin2hex(random_bytes(16));

            $hashed_password = null;
            if (!$isGoogleAuth) {
                $peppered_password = hash_hmac('sha256', $data['admin_password'], PEPPER_SECRET_KEY);
                $hashed_password = password_hash($peppered_password, PASSWORD_BCRYPT);
            }

            $optional_data = json_encode([
                'province' => $data['province'] ?? null,
                'city' => $data['city'] ?? null,
                'street' => $data['street'] ?? null,
                'suite' => $data['suite'] ?? null,
                'logo' => $data['logo'] ?? null,
                'primary_color' => $data['primary_color'] ?? null,
                'admin_profile_picture' => $data['admin_profile_picture'] ?? null
            ]);

            $pending_db->create([
                'ID' => $pending_id,
                'Tenant_Name' => $data['tenant_name'],
                'Subdomain' => $subdomain,
                'VAT_Number' => $vat_number,
                'Plan_Name' => $plan_name,
                'DB_Type' => $data['db_type'],
                'Admin_Firstname' => $data['admin_firstname'],
                'Admin_Lastname' => $data['admin_lastname'],
                'Admin_Email' => $data['admin_email'],
                'Admin_Password_Hash' => $hashed_password,
                'Auth_Provider' => $isGoogleAuth ? 'google' : 'local',
                'Optional_Data' => $optional_data,
                'Status' => 'pending'
            ]);

            // Inizializzazione di Stripe
            \Stripe\Stripe::setApiKey(STRIPE_SECRET_KEY);

            $frontend_url = "http://localhost:3000";

            // Creazione di una sessione per il checkout personalizzata
            $checkout_session = \Stripe\Checkout\Session::create([
                'payment_method_types' => ['card'], // Accetta carte di credito
                'line_items' => [[ // Specifica a Stripe cosa si sta acquistando
                    'price' => $plan->Stripe_Price_ID,
                    'quantity' => 1,
                ]],
                'mode' => 'subscription', // Gestione di pagamenti ricorrenti 
                'client_reference_id' => $pending_id, // ID con cui ci si collega ai dati dell'utente
                'customer_email' => $data['admin_email'], // Precompilazione dell'email
                'success_url' => $frontend_url . '/register/success?session_id={CHECKOUT_SESSION_ID}', // Dove bisogna mandare l'utente se paga
                'cancel_url' => $frontend_url . '/register?error=payment_cancelled' // Dove mandare l'utente se clicca indietro
            ]);

            // Aggiunta dell'id della sessione ai campi della riga di richiesta dell'utente
            $pending_db->update($pending_id, [
                'Stripe_Session_ID' => $checkout_session->id
            ]);

            Response::response("OK", 200, "Checkout created! Redirecting to Stripe.", [
                'checkout_url' => $checkout_session->url
            ]);
        } catch (\Stripe\Exception\ApiErrorException $e) {
            error_log("Errore API Stripe: " . $e->getMessage());
            Response::response("Payment Gateway Error", 500, "Error communicating with the payment system.");
        } catch (\Exception $e) {
            error_log("Errore registrazione in attesa: " . $e->getMessage());
            Response::response("Internal Server Error", 500, "");
        }
    }

    private function validateRegistrationData(&$data, $isGoogleAuth)
    {
        $errors = [];

        // Campi obbligatori
        $vat_number = $data['vat_number'] ?? '';
        $tenant_name = $data['tenant_name'] ?? '';
        $subdomain = $data['subdomain'] ?? '';
        $db_type = $data['db_type'] ?? '';
        $plan_name = $data['plan_name'] ?? '';
        $admin_firstname = $data['admin_firstname'] ?? '';
        $admin_lastname = $data['admin_lastname'] ?? '';
        $admin_email = $data['admin_email'] ?? '';
        $admin_password = $data['admin_password'] ?? '';

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

        if (!$isGoogleAuth) {
            $passwordPattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/';

            if(empty($admin_password)) {
                $errors['admin_password'] = "Admin password is required";
            } else if (!preg_match($passwordPattern, $admin_password)) {
                $errors['admin_password'] = "Password must contain at least 8 characters, one uppercase letter, one number and one special character";
            }
        }
        
        // Controllo sui campi opzionali
        if (!empty($data['province']) && !preg_match('/^[A-Za-z]{2}$/', $data['province'])) {
            $errors['province'] = "The province must be a 2-letter acronym";
        }

        if (!empty($data['primary_color']) && !preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $data['primary_color'])) {
            $errors['primary_color'] = "Color must be a valid HEX format";
        }

        if (!empty($data['logo'])) {
            $logo_url = $data['logo'];
            if (!filter_var($logo_url, FILTER_VALIDATE_URL) && !preg_match('/^data:image\/(jpeg|png|webp|gif|svg\+xml);base64,/', $logo_url)) {
                $errors['logo'] = "The logo must be a valid URL or a correct base64 string";
            } elseif (strlen($logo_url) > 2800000) {
                $errors['logo'] = "The logo exceeds the maximum size of 2MB";
            }
        }

        if (!empty($data['admin_profile_picture'])) {
            $pic = $data['admin_profile_picture'];
            if (!filter_var($pic, FILTER_VALIDATE_URL) && !preg_match('/^data:image\/(jpeg|png|webp|gif|svg\+xml);base64,/', $pic)) {
                $errors['admin_profile_picture'] = "The profile picture must be a valid URL or a correct base64 string";
            } elseif (strlen($pic) > 2800000) {
                $errors['admin_profile_picture'] = "The profile picture exceeds the maximum size of 2MB";
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