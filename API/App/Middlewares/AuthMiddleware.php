<?php

namespace App\Middlewares;

use App\Core\Response;
use App\Core\Context;
use App\Core\HandlerJwt;
use Firebase\JWT\ExpiredException;
use Exception;

class AuthMiddleware 
{
    private $tenantWhitelist = [
        'ping',
        'plans',
        'auth/login', 
        'auth/register',
        'auth/google'
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
            Response::response("Unauthorized", 401, "Token missing");
            exit();
        }

        $token = trim($_COOKIE["Authorization"]);

        try {
            $handler = new HandlerJwt();
            $payload = $handler->validateJwt($token);

            if ($payload['data']->tenant_id !== Context::$tenantId){
                Response::response("Forbidden", 403, "Tenant mismatch");
                exit();
            }

            Context::$user = $payload['sub'];
            return;
        } catch (ExpiredException $e) {
            Response::response("Unauthorized", 401, "Token expired");
            exit();
        } catch (Exception $e) {
            Response::response("Unauthorized", 401, "Invalid token");
            exit();
        }
    }
}