<?php 

namespace App\Core;

class Response
{
    public static function response($status, $code, $message, $data = null)
    {
        header('Content-Type: application/json');
        http_response_code($code);

        $body = [
            "status" => $status,
            "message" => $message
        ];

        if($data) {
            $body["data"] = $data;
        }

        echo json_encode($body);
        
        return;
    }
}