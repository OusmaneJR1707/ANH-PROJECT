<?php

namespace App\Middleware; 

use App\Core\Context;
use App\Core\Database;
use App\Core\Response;
use App\Models\Company;

class TenantMiddleware {

    public static function handle() {
        $host = explode(':', $_SERVER['HTTP_HOST'])[0];

        if ($host === DOMAIN_NAME || $host === 'www.' . DOMAIN_NAME){
            // E' stata fatta una richiesta su master
            Context::$isMaster = true;
        }else{
            // E' stata fatta una richiesta per uno specifico tenant, il quale potrebbe anche non esistere
            Context::$isMaster = false;

            $subdomain = str_replace('.' . DOMAIN_NAME, '', $host); // Prende il sottodominio
 
            self::loadTenantFromMaster($subdomain); // Controlla se il sottodominio esiste nella tabella master e, nel caso, imposta i parametri
        }
    }

    private static function loadTenantFromMaster($subdomain) {
        $db = new Database();
        $company_db = new Company($db);

        $tenant = $company_db->findBySubdomain($subdomain);

        if(!$tenant) {
            Response::response("Not Found", 404, "Tenant not found");
            exit();
        }

        if($tenant->Status !== 'active'){
            Response::response("Forbidden", 403, "Tenant is suspended or inactive");
        }

        Context::$tenantId = $tenant->Tenant_ID;
        Context::$tenantName = $tenant->Name;

        Context::$tenantDbName = $subdomain . "_db";
        Context::$tenantDbUser = $subdomain;

        $secure_hash = hash_hmac('sha256', $subdomain, TENANT_SECRET_KEY);
        Context::$tenantDbPass = $secure_hash;
    }
}