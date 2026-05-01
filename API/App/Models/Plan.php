<?php 

namespace App\Models;

use App\Core\Model;

class Plan extends Model
{
    public function findByName($plan_name){
        $this->db->query("SELECT * FROM Plan WHERE Name = :plan_name");
        $this->db->bind(":plan_name", $plan_name);
        return $this->db->singleResult();
    }

    public function findAll() {
        $this->db->query("SELECT * FROM Plan");
        return $this->db->resultObj();
    }
}