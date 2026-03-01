<?php

namespace App\Middlewares;

use App\Core\Response;
use App\Core\Context;
use App\Core\HandlerJwt;
use App\Core\CookieHandler;
use App\Core\Database;
use App\Models\Company;
use Firebase\JWT\ExpiredException;
use Exception;

class AuthMiddleware 
{
    private $tenantWhitelist = [
        'auth/login', 
        'auth/register'
    ];

    public function handle() {
        if(Context::$isMaster){
            return;
        }

        $url = trim($_SERVER['REQUEST_URI'], "/");

        $url = str_replace(ROOT, "", $url);

        if(in_array($url, $this->tenantWhitelist)) {
            return;
        }

        $this->checkJwt();
    }

    private function checkJwt()
    {
        if(!isset($_COOKIE["Authorization"])){
            $this->handleTokenRefresh();
            return;
        }

        $token = trim($_COOKIE["Authorization"]);

        try {
            $handler = new HandlerJwt();
            $payload = $handler->validateJwt($token);

            if ($payload['data']->tenant_id !== Context::$tenantId){
                Response::response("Forbidden", 403, "Token tenant_id is different from subdomain");
                exit();
            }

            Context::$user = $payload['sub'];
            return;
        } catch (ExpiredException $e) {
            $this->handleTokenRefresh();
        } catch (Exception $e) {
            CookieHandler::remove("Authorization");
            Response::response("error", $e->getCode(), $e->getMessage());
        }
    }

    private function handleTokenRefresh()
    {
        if (!isset($_COOKIE["Refresh"])) {
            Response::response("error", 401, "Your session has expired. Please log in again.");
            exit();
        }

        $refresh_token = trim($_COOKIE["Refresh"]);
        
        if (is_null(Context::$tenantId)) {
            Response::response("error", 400, "Missing tenant context");
            exit();
        }

        $db = new Database();
        $company_db = new Company($db);
        $tenant = $company_db->findById(Context::$tenantId);

        if(!isset($tenant)) {
            Response::response("error", 403, "The company associated with this session is no longer active");
            exit();
        }

        // Proseguire ...

    }
        
}