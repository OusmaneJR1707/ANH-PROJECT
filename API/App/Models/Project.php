<?php

namespace App\Models;

use App\Core\Model;

class Project extends Model 
{
    public function create($data)
    {
        $fields = [];
        foreach(array_keys($data) as $key){
            $fields[] = "$key";
        }

        $query = "INSERT INTO Project (" . implode(", ", $fields) . ") VALUES (:" . implode(", :", $fields) . ");";

        $this->db->query($query);

        foreach ($data as $key => $value){
            $this->db->bind(":$key", $value);
        }

        $this->db->execute();
        return $this->db->lastInsertId();
    }

    public function findByTitle($title)
    {
        $this->db->query("SELECT * FROM Project WHERE Title = :title");
        $this->db->bind(":title", $title);
        return $this->db->singleResult();
    }
}