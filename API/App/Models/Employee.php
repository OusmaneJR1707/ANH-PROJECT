<?php

namespace App\Models;

use App\Core\Model;

class Employee extends Model
{
    public function create($data)
    {
        $fields = [];
        foreach(array_keys($data) as $key){
            $fields[] = "$key";
        }

        $query = "INSERT INTO Employee (" . implode(", ", $fields) . ") VALUES (:" . implode(", :", $fields) . ");";

        $this->db->query($query);

        foreach ($data as $key => $value){
            $this->db->bind(":$key", $value);
        }

        $this->db->execute();
        return $this->db->lastInsertId();
    }

    public function findByID($id)
    {
        $this->db->query("SELECT * FROM Employee WHERE ID = :id");
        $this->db->bind(":id", $id);
        return $this->db->singleResult();
    }

    public function findByEmail($email)
    {
        $this->db->query("SELECT * FROM Employee WHERE Email = :email");
        $this->db->bind(":email", $email);
        return $this->db->singleResult();
    }
}