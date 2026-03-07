<?php

namespace App\Core;

use Firebase\JWT\JWT;
use Firebase\JWT\Key; // Importa la classe che serve per gestire in modo sicuro la chiave e l'algoritmo di cifratura
use Firebase\JWT\ExpiredException;
use Exception;

class HandlerJwt
{
    public function generateAccessToken($userId, $tenantId)
    {
        $payload = 
        [
            'iss' => JWT_ISSUER,
            'iat' => time(),
            'exp' => time() + 900, // durata di 15 minuti
            'sub' => $userId,
            'data' => [
                "tenant_id" => $tenantId,
                "type" => "access"
            ]
        ];

        return JWT::encode($payload, SECRET_KEY, 'HS256');
    }

    public function generateRefreshToken($userId, $tenantId, $jti)
    {
        $payload = 
        [
            'iss' => JWT_ISSUER,
            'iat' => time(),
            'exp' => time() + (3600 * 24 * 7), // durata di 7 giorni
            'sub' => $userId,
            'data' => [
                "tenant_id" => $tenantId,
                "type" => "refresh"
            ]
        ];

        return JWT::encode($payload, SECRET_KEY, 'HS256');
    }

    public function validateJwt($token)
    {
        if(empty($token)) {
            throw new Exception("Token not provided", 400);
        }

        try {
            return JWT::decode($token, new Key(SECRET_KEY, '"HS256'));
        } catch (ExpiredException $e) {
            throw $e;
        } catch (\Throwable $e) {
            throw new Exception("Invalid or corrupted token", 401);
        }
    }

    
}