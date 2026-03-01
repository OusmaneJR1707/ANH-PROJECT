<?php

namespace App\Core;

use Firebase\JWT\JWT;
use Firebase\JWT\Key; // Importa la classe che serve per gestire in modo sicuro la chiave e l'algoritmo di cifratura
use Firebase\JWT\ExpiredException;
use Exception;

class HandlerJwt
{
    public function validateJwt($token)
    {
        if(empty($token)) {
            throw new Exception("Token not given", 400);
        }

        try {
            return JWT::decode($token, new Key(SECRET_KEY, "HS256"));
        } catch (ExpiredException $e) {
            throw $e;
        } catch (\Throwable $e) {
            throw new Exception("Invalid or corrupted token");
        }
    }

    public function generateJwt($data)
    {
        $payload = [
            'iss' => JWT_ISSUER, 
            'iat' => time(),
            'exp' => time() + 1200, 
            'sub' => $data['user_id'],
            'jti' => $data['refresh_token_id'],
            'data' => [
                "tenant_id" => $data['tenant_id'],
            ]
        ];

        return JWT::encode($payload, SECRET_KEY, 'HS256');
    }
}