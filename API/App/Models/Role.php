<?php

namespace App\Models;

use App\Core\Model;

class Role extends Model
{
    public function create($data)
    {
        $fields = [];
        foreach(array_keys($data) as $key){
            $fields[] = "$key";
        }

        $query = "INSERT INTO Role (" . implode(", ", $fields) . ") VALUES (:" . implode(", :", $fields) . ");";

        $this->db->query($query);

        foreach ($data as $key => $value){
            $this->db->bind(":$key", $value);
        }

        $this->db->execute();
        return $this->db->lastInsertId();
    }

    public function findByName($name)
    {
        $this->db->query("SELECT * FROM Role WHERE Name = :name");
        $this->db->bind(":name", $name);
        return $this->db->singleResult();
    }
}