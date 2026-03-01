<?php

namespace App\Core;

class CookieHandler
{
    public static function createCookie($name, $value, $expiresAfter, $domain = "")
    {
        $expiresAt = time() + $expiresAfter;

        $path = ROOT_FOLDER;

        setcookie(
            $name,
            $value,
            $expiresAt,
            $path,
            $domain,
            true, // Secure: solo su HTTPS
            true  // HttpOnly: inaccessibile a JavaScript (anti-XSS)
        );
    }

    public static function remove($name, $domain = "")
    {
        $path = defined('ROOT_FOLDER') ? ROOT_FOLDER : '/';

        setcookie($name, "", time() - 3600, $path, $domain);

        if (isset($_COOKIE[$name])) {
            unset($_COOKIE[$name]);
        }
    }
}