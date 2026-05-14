<?php

namespace App\Middlewares;

class CorsMiddleware 
{
    public static function handle()
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        $allowedBaseDomains = [
            'localhost:3000',     // Sviluppo
            'anh-project.it'      // Produzione
        ];

        $isAllowed = false;

        if ($origin) {
            // Estraiamo l'host dalla stringa origin (es: da "http://tenant.localhost:3000" otteniamo "tenant.localhost:3000")
            $parsedUrl = parse_url($origin);
            $host = $parsedUrl['host'] ?? '';
            $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
            $hostWithPort = $host . $port;

            // Verifichiamo se l'host è uno dei domini base o un suo sottodominio
            foreach ($allowedBaseDomains as $domain) {
                if ($hostWithPort === $domain || str_ends_with($hostWithPort, '.' . $domain)) {
                    $isAllowed = true;
                    break;
                }
            }
        }

        if ($isAllowed) {
            header("Access-Control-Allow-Origin: " . $origin);
        } else {
            // Fallback per richieste dirette senza Origin o domini non autorizzati
            header("Access-Control-Allow-Origin: http://localhost:3000");
        }

        header("Access-Control-Allow-Credentials: true"); // Autorizza l'invio di credenziali (Cookie o header Authorization)
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD"); // Specifica i metodi HTTP accettati dall'API
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Tenant"); // Specifica quali header personalizzati possono essere passati dal frontend

        // Se si tratta di una richiesta di preflight termina qui l'esecuzione senza richiamare il Router
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}