<?php

namespace App\Core;

class Context {
    public static $isMaster = true;
    public static $tenantId = null;
    public static $tenantName = null;

    public static $tenantDbName = null;
    public static $tenantDbUser = null;
    public static $tenantDbPass = null;

    public static $user = null;

    public static $requestBody = [];
    public static $rawBody = null;
}