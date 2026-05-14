<?php

namespace App\Models;

use App\Core\Model;

class RefreshToken extends Model 
{
    public function create($data)
    {
        $fields = [];
        foreach(array_keys($data) as $key){
            $fields[] = "$key";
        }

        $query = "INSERT INTO RefreshTokens (" . implode(", ", $fields) . ") VALUES (:" . implode(", :", $fields) . ");";

        $this->db->query($query);

        foreach ($data as $key => $value){
            $this->db->bind(":$key", $value);
        }

        return $this->db->execute();
    }

    public function findByJti($jti)
    {
        $this->db->query("SELECT * FROM RefreshTokens WHERE Token_JTI = :jti");
        $this->db->bind(":jti", $jti);
        return $this->db->singleResult();
    }

    public function deleteByJti($jti)
    {
        $this->db->query("DELETE FROM RefreshTokens WHERE Token_JTI = :jti");
        $this->db->bind(":jti", $jti);
        return $this->db->execute();
    }
}
