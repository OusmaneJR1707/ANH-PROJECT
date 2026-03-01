<?php 

namespace App\Core;

use App\Core\Database;

class Model 
{
    protected Database $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }
}