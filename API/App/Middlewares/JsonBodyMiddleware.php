<?php

namespace App\Middlewares;

use App\Core\Context;

class JsonBodyMiddleware
{
    public static function handle() 
    {
        $json = file_get_contents('php://input');
        Context::$rawBody = $json;

        if(!empty($json)) {
            $data = json_decode($json, true);

            if(json_last_error() === JSON_ERROR_NONE) {
                Context::$requestBody = $data;
            } else {
                Context::$requestBody = [];
            }
        }
    }
}