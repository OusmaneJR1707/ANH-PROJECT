<?php

namespace App\Middlewares;

use App\Core\Context;

class JsonBodyMiddleware
{
    public static function handle() 
    {
        $json = file_get_contents('php://input');

        if(!empty($json)) {
            $data = json_decode($json, true);

            if(json_last_error() === JSON_ERROR_NONE) {
                Context::$requestBody = $data;
            }
        }
    }
}