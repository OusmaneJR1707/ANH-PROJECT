<?php

namespace App\Controllers;

use App\Core\Context;
use App\Core\Response;
use App\Core\Database;
use App\Models\Company;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Employee;
use App\Models\PendingRegistration;
use App\Models\Role;
use App\Models\Project;
use App\Models\ProjectMember;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

class StripeWebhookController
{
    public function handle()
    {
        $payload = Context::$rawBody;
        $sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

        $event = null;
        
        try {
            // Verifica che la chiamata sia effettivamente di Stripe
            $event = \Stripe\Webhook::constructEvent(
                $payload, $sig_header, STRIPE_WEBHOOK_SECRET
            );
        } catch (\UnexpectedValueException $e) {
            Response::response("Bad Request", 400, "Invalid Webhook Payload");
            exit();
        } catch (\Stripe\Exception\SignatureVerificationException $e) {
            Response::response("Unauthorized", 401, "Invalid Webhook Signature");
            exit();
        }

        // Controllo sull'evento per vedere se il pagamento è completato
        if ($event->type == 'checkout.session.completed') {
            $session = $event->data->object; 

            // Recupero dell'id che collega ai dati dell'utente
            $pending_id = $session->client_reference_id;

            if($pending_id) {
                $this->provisionTenant($pending_id);
            }
        }

        Response::response("OK", 200, "Webhook handled successfully");
    }

    private function provisionTenant($pending_id)
    {
        $master_db = new Database();
        $company_db = new Company($master_db);
        $plan_db = new Plan($master_db);
        $subscription_db = new Subscription($master_db);
        $pending_db = new PendingRegistration($master_db);

        // Recupero dei dati
        $data = $pending_db->findById($pending_id);

        if (!$data || $data->Status !== 'pending') {
            return;
        }

        // Decodifica dei dati facoltativi
        $optional_data = json_decode($data->Optional_Data, true);

        try {
            $master_db->beginTransaction();

            $company_data = [
                'VAT_Number' => $data->VAT_Number,
                'Name' => $data->Tenant_Name,
                'Subdomain' => $data->Subdomain,
                'DB_Type' => $data->DB_Type
            ];

            if(!empty($optional_data['province'])) $company_data['Province'] = $optional_data['province'];
            if(!empty($optional_data['city'])) $company_data['City'] = $optional_data['city'];
            if(!empty($optional_data['street'])) $company_data['Street'] = $optional_data['street'];
            if(!empty($optional_data['suite'])) $company_data['Suite'] = $optional_data['suite'];
            if(!empty($optional_data['logo'])) $company_data['Logo_URL'] = $optional_data['logo'];
            if(!empty($optional_data['primary_color'])) $company_data['Primary_Color'] = $optional_data['primary_color'];

            $tenant_id = $company_db->create($company_data);

            $plan = $plan_db->findByName($data->Plan_Name);
            $start_date = date('Y-m-d');
            $duration = $plan->Duration_Days;
            $end_date = date('Y-m-d', strtotime("+$duration days"));

            $subscription_db->create([
                'Tenant_ID' => $tenant_id,
                'Plan_Name' => $data->Plan_Name,
                'Start_Date' => $start_date,
                'End_Date' => $end_date
            ]);

            $db_safe_identifier = str_replace('-', '_', $data->Subdomain);
            $tenant_db_name = 'anhproject_' . $db_safe_identifier . '_db';
            $tenant_db_user = $db_safe_identifier;
            $tenant_db_pass = hash_hmac('sha256', $db_safe_identifier, TENANT_SECRET_KEY);

            $master_db->query("CREATE DATABASE IF NOT EXISTS `$tenant_db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $master_db->execute();

            $master_db->query("CREATE USER IF NOT EXISTS '$tenant_db_user'@'localhost' IDENTIFIED BY '$tenant_db_pass'");
            $master_db->execute();

            $master_db->query("GRANT ALL PRIVILEGES ON `$tenant_db_name`.* TO '$tenant_db_user'@'localhost'");
            $master_db->execute();

            $master_db->query("FLUSH PRIVILEGES");
            $master_db->execute();

            $this->setupTenantDatabase($tenant_db_name, $tenant_db_user, $tenant_db_pass, $data, $optional_data);

            $pending_db->update($pending_id, ["Status" => "completed"]);

            if ($master_db->inTransaction()) {
                $master_db->commitTransaction();
            }

            // Invio email di benvenuto
            $this->sendWelcomeEmail($data);

        } catch (\Exception $e) {
            if ($master_db->inTransaction()) {
                $master_db->rollbackTransaction();
            }

            $pending_db->update($pending_id, ["Status" => "failed"]);

            if (isset($tenant_db_name)) {
                $master_db->query("DROP DATABASE IF EXISTS `$tenant_db_name`");
                $master_db->execute();
            }
            if (isset($tenant_db_user)) {
                $master_db->query("DROP USER IF EXISTS '$tenant_db_user'@'localhost'");
                $master_db->execute();
            }
            
            error_log("FALLIMENTO CRITICO WEBHOOK per Tenant [{$data->Subdomain}]. Causa: " . $e->getMessage());
        }
    }

    private function setupTenantDatabase($db_name, $db_user, $db_pass, $data, $optionalData) {
        
        $host = defined('DB_HOST') ? DB_HOST : 'localhost';
        $tenant_db = new Database($host, $db_name, $db_user, $db_pass);

        $schema_path = __DIR__ . '/../Database/tenant_schema.sql';
        if(!file_exists($schema_path)) {
            throw new \Exception("SQL schema file not found in: " . $schema_path);
        }

        $schema_sql = file_get_contents($schema_path);
        $tenant_db->getPDO()->exec($schema_sql);

        $employee_db = new Employee($tenant_db);
        $role_db = new Role($tenant_db);
        $project_db = new Project($tenant_db);
        $projectMember_db = new ProjectMember($tenant_db);

        try {
            $tenant_db->beginTransaction();

            $admin_id = $employee_db->create([
                'Email' => $data->Admin_Email,
                'Password_Hash' => $data->Admin_Password_Hash, 
                'First_Name' => $data->Admin_Firstname,
                'Last_Name' => $data->Admin_Lastname,
                'Status' => 'active',
                'Profile_Picture' => $optionalData['admin_profile_picture'] ?? null,
                'Auth_Provider' => $data->Auth_Provider
            ]);

            $adminRole = $role_db->findByName('Admin');
            if(!$adminRole) throw new \Exception("Critical error: admin role not found");

            $adminProject = $project_db->findByTitle('Admin');
            if(!$adminProject) throw new \Exception("Critical error: admin project not found");

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

    private function sendWelcomeEmail($data)
    {
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = SMTP_USER;
            $mail->Password   = SMTP_PASS;
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = SMTP_PORT;

            $mail->setFrom(SMTP_USER, 'ANH-Project');
            $mail->addAddress($data->Admin_Email, $data->Admin_Firstname . ' ' . $data->Admin_Lastname);
            $mail->addReplyTo('supporto@anh-project.it', 'Supporto ANH-Project');

            $mail->isHTML(true); 
            $mail->Subject = "Benvenuto in ANH-Project, " . $data->Admin_Firstname . "!";
            
            $mail->Body    = "
                <div style='font-family: Arial, sans-serif; color: #333;'>
                    <h2>Ciao {$data->Admin_Firstname},</h2>
                    <p>Il tuo workspace per <strong>{$data->Tenant_Name}</strong> è stato creato con successo ed è attivo.</p>
                    <p>Puoi accedere al tuo pannello di controllo cliccando sul link qui sotto:</p>
                    <p>
                        <a href='https://{$data->Subdomain}.anh-project.it' style='display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;'>
                            Accedi al Workspace
                        </a>
                    </p>
                </div>
            ";
            
            $mail->AltBody = "Ciao {$data->Admin_Firstname},\n\nIl tuo workspace per {$data->Tenant_Name} è pronto.\nAccedi qui: https://{$data->Subdomain}.anh-project.it";

            $mail->send();
        } catch (\Exception $e) {
            error_log("Errore invio email da Webhook: " . $e->getMessage());
        }
    }
}