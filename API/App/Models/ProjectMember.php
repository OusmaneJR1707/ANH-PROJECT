<?php 

namespace App\Models;

use App\Core\Model;

class ProjectMember extends Model
{
    public function create($data)
    {
        $fields = [];
        foreach(array_keys($data) as $key){
            $fields[] = "$key";
        }

        $query = "INSERT INTO Project_Member (" . implode(", ", $fields) . ") VALUES (:" . implode(", :", $fields) . ");";

        $this->db->query($query);

        foreach ($data as $key => $value){
            $this->db->bind(":$key", $value);
        }

        $this->db->execute();
    }
}