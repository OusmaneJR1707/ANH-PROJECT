<?php

namespace App\Middlewares; 

use App\Core\Context;
use App\Core\Database;
use App\Core\Response;
use App\Models\Company;

class TenantMiddleware {

    public static function handle() {
        $tenantHeader = $_SERVER['HTTP_X_TENANT'] ?? null;

        if ($tenantHeader) {
            Context::$isMaster = false;
            self::loadTenantFromMaster($tenantHeader);
            return; 
        }

        $host = explode(':', $_SERVER['HTTP_HOST'])[0];

        if (strpos($host, 'www.') === 0) {
            $host = substr($host, 4); 
        }

        if ($host === DOMAIN_NAME){
            Context::$isMaster = true;
        } else {
            Context::$isMaster = false;
            $subdomain = str_replace('.' . DOMAIN_NAME, '', $host); 
            self::loadTenantFromMaster($subdomain); 
        }
    }

    private static function loadTenantFromMaster($subdomain) {
        $db = new Database(DB_HOST, DB_NAME, DB_USER, DB_PASS);
        $company_db = new Company($db);

        $tenant = $company_db->findBySubdomain($subdomain);

        if(!$tenant) {
            // Il tenant richiesto non esiste nel db
            Response::response("Not Found", 404, "Tenant not found");
            exit();
        }

        if($tenant->Status !== 'active'){
            // Il tenant richiesto è sospeso o inattivo sul db
            Response::response("Forbidden", 403, "Tenant is suspended or inactive");
        }

        // Tenant trovato, ora si impostano le varie proprietà statiche che serviranno nei controller
        Context::$tenantId = $tenant->Tenant_ID;
        Context::$tenantName = $tenant->Name;

        $db_safe_identifier = str_replace('-', '_', $subdomain);

        Context::$tenantDbName = "anhproject_" . $db_safe_identifier . "_db";
        Context::$tenantDbUser = $db_safe_identifier;

        $secure_hash = hash_hmac('sha256', $db_safe_identifier, TENANT_SECRET_KEY);
        Context::$tenantDbPass = $secure_hash;
    }
}