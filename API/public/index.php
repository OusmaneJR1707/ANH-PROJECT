<?php

require_once __DIR__ . '/../App/bootstrap.php';

require_once __DIR__ . '/../App/Config/config.php';

use App\Core\Router;
use App\Core\Context;
use App\Middlewares\CorsMiddleware;
use App\Middlewares\JsonBodyMiddleware;
use App\Middlewares\TenantMiddleware;
use App\Middlewares\AuthMiddleware;

CorsMiddleware::handle();

// Gestisce il parsing del body della richiesta JSON
JsonBodyMiddleware::handle();

// Determina se siamo sul master o su un tenant popolando il contesto
TenantMiddleware::handle();

$authMiddleware = new AuthMiddleware();
$authMiddleware->handle();

$router = new Router();

$router->get('ping', [\App\Controllers\AuthController::class, 'ping']);

$router->post('auth/register', [\App\Controllers\AuthController::class, 'registerTenant']);

$router->run();
