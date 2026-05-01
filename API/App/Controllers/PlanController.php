<?php 

namespace App\Controllers;

use App\Core\Response;
use App\Core\Database;
use App\Models\Plan;

class PlanController {

    public function getPlans() {
        try{
            $master_db = new Database();
            $plan_db = new Plan($master_db);

            $response = $plan_db->findAll();

            Response::response("OK", 200, "Plans retrieved successfully", $response);
            return;
        } catch (\Exception $e) {
            error_log("Errore nel recupero dei piani: " . $e->getMessage()); // Scrive l'errore del database nel file php_errors_log sul server
            Response::response("Internal Server Error", 500, "Impossibile recuperare i piani");
        }
    }
}