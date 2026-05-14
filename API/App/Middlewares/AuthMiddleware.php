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
        'auth/refresh',
        'auth/login',
        'auth/login/google',
        'auth/logout'
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
        // Cerca il token negli header Authorization (standard HTTP)
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        $token = '';

        if (!empty($authHeader) && strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7); // Rimuove "Bearer "
        }

        if (empty($token)) {
            error_log("Token missing - HTTP_AUTHORIZATION: " . ($authHeader ?? 'empty') . " | Cookie Auth: " . ($_COOKIE["Authorization"] ?? 'empty'));
            Response::response("Unauthorized", 401, "Token missing");
            exit();
        }

        try {
            $handler = new HandlerJwt();
            $payload = $handler->validateJwt($token);

            if ($payload->data->tenant_id !== Context::$tenantId){
                Response::response("Forbidden", 403, "Tenant mismatch");
                exit();
            }

            Context::$user = $payload->sub;
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