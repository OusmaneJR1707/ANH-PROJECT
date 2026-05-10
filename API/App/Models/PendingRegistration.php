<?php

namespace App\Models;

use App\Core\Database;

class PendingRegistration
{
    private $db;

    public function __construct(Database $db)
    {
        $this->db = $db;
    }

    public function create($data)
    {
        $fields = [];
        foreach(array_keys($data) as $key){
            $fields[] = "$key";
        }

        $query = "INSERT INTO Pending_Registrations (" . implode(", ", $fields) . ") VALUES (:" . implode(", :", $fields) . ");";

        $this->db->query($query);

        foreach ($data as $key => $value){
            $this->db->bind(":$key", $value);
        }

        $this->db->execute();
        return $data['ID'];
    }

    public function update($id, $data){
        $fields = [];
        foreach(array_keys($data) as $key){
            $fields[] = "$key = :$key";
        }

        $query = "UPDATE Pending_Registrations SET " . implode(", ", $fields) . " WHERE ID = :id";

        $this->db->query($query);

        foreach ($data as $key => $value) {
            $this->db->bind(":$key", $value);
        }
        $this->db->bind(":id", $id);

        return $this->db->execute();
    }

    public function findById($id){
        $this->db->query("SELECT * FROM Pending_Registrations WHERE ID = :id");
        $this->db->bind(":id", $id);
        return $this->db->singleResult();
    }

    public function findBySubdomain($subdomain)
    {
        $this->db->query("SELECT ID FROM Pending_Registrations WHERE Subdomain = :subdomain AND Status = 'pending'");
        $this->db->bind(":subdomain", $subdomain);
        return $this->db->singleResult();
    }
}