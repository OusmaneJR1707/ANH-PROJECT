<?php 

namespace App\Models;

use App\Core\Model;

class Company extends Model
{
    public function create($data)
    {
        $fields = [];
        foreach(array_keys($data) as $key){
            $fields[] = "$key";
        }

        $query = "INSERT INTO Company (" . implode(", ", $fields) . ") VALUES (:" . implode(", :", $fields) . ");";

        $this->db->query($query);

        foreach ($data as $key => $value){
            $this->db->bind(":$key", $value);
        }

        $this->db->execute();
        return $this->db->lastInsertId();
    }

    public function update($tenant_id, $data){
        $fields = [];
        foreach(array_keys($data) as $key){
            $fields[] = "$key = :$key";
        }

        $query = "UPDATE Company SET " . implode(", ", $fields) . "WHERE Tenant_ID = :tenant_id";

        $this->db->query($query);

        foreach ($data as $key => $value) {
            $this->db->bind(":key", $value);
        }
        $this->db->bind(":tenant_id", $tenant_id);

        return $this->db->execute();
    }

    public function delete($tenant_id){
        $this->db->query("DELETE FROM Company WHERE Tenant_ID = :tenant_id");
        $this->db->bind("tenant_id", $tenant_id);
        return $this->db->execute();
    }

    public function findAll() {
        $this->db->query("SELECT * FROM Company");
        return $this->db->resultObj();
    }

    public function findBySubdomain($subdomain){
        $this->db->query("SELECT * FROM Company WHERE Subdomain = :subdomain");
        $this->db->bind(":subdomain", $subdomain);
        return $this->db->singleResult();
    }
}