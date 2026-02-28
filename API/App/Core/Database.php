<?php 

namespace App\Core;

use PDO;
use PDOException;

class Database
{
    private $db;
    private $stmt;
    private $error;

    public function __construct($host = DB_HOST, $db_name = DB_NAME, $user = DB_USER, $pass = DB_PASS)
    {
        $dsn ='mysql:host=' . $host . ';dbname=' . $db_name . ';charset=utf8';

        $options = [
            PDO::ATTR_PERSISTENT => false, // Finita l'esecuzione dello script PHP chiude la connessione con il db
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"
        ];

        try{
            $this->db = new PDO($dsn, $user, $pass, $options);
        }catch (PDOException $e){
            $this->error = $e->getMessage();
            // Loggare l'errore su file e inviare messaggio generico
            die("Errore critico db: " . $this->error);
        }
    }

    public function getPDO()
    {
        return $this->db;
    }

    // Gestione delle transazioni
    public function beginTransaction()
    {
        return $this->db->beginTransaction();
    }

    public function commitTransaction()
    {
        return $this->db->commit();
    }

    public function rollbackTransaction()
    {
        return $this->db->rollBack();
    }

    public function inTransaction()
    {
        return $this->db->inTransaction();
    }


    // Esecuzione query
    public function query($sql)
    {
        $this->stmt = $this->db->prepare($sql);
    }

    public function bind($param, $value, $type = null)
    {
        if(is_null($type)){
            $type = match(true) {
                is_int($value) => PDO::PARAM_INT,
                is_bool($value) => PDO::PARAM_BOOL,
                is_null($value) => PDO::PARAM_NULL,
                default => PDO::PARAM_STR
            };
        }

        $this->stmt->bindValue($param, $value, $type);
    }

    public function execute()
    {
        return $this->stmt->execute();
    }

    public function resultObj()
    {
        $this->execute();
        return $this->stmt->fetchAll(PDO::FETCH_OBJ);
    }

    public function resultAssoc()
    {
        $this->execute();
        return $this->stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function singleResult()
    {
        $this->execute();
        return $this->stmt->fetch(PDO::FETCH_OBJ);
    }

    public function rowCount()
    {
        return $this->stmt->rowCount();
    }

    public function lastInsertId()
    {
        return $this->db->lastInsertId();
    }
}