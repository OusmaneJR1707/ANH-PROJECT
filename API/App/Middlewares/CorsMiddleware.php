<?php

namespace App\Middlewares;

class CorsMiddleware 
{
    public static function handle()
    {
        $allowedOrigins = ['http://localhost:3000', 'https://www.tuodominio.it', 'http://localhost:3001'];
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: $origin");
        }

        header("Access-Control-Allow-Credentials: true"); // Autorizza l'invio di credenziali (Cookie o header Authorization)
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD"); // Specifica i metodi HTTP accettati dall'API
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With"); // Specifica quali header personalizzati possono essere passati dal frontend

        // Se si tratta di una richiesta di preflight termina qui l'esecuzione senza richiamare il Router
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}