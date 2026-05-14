<?php

use PHPUnit\Framework\TestCase;
use App\Models\Plan;
use App\Core\Database;

class PlanTest extends TestCase
{
    public function test_get_all_plans()
    {
        $dbMock = $this->createMock(Database::class);

        $fakePlans = [
            (object) ['Name' => 'Basic', 'Price' => 0.00, 'Max_Employees' => 5, 'Max_Projects' => 10, 'Max_Reports' => 50, 'Duration_Days' => 30, 'Cloud_Managed' => 0, "Is_Featured" => 1, "Stripe_Price_ID" => 'price_1234'],
            (object) ['Name' => 'Standard', 'Price' => 30.00, 'Max_Employees' => 100, 'Max_Projects' => 100, 'Max_Reports' => 500, 'Duration_Days' => 365, 'Cloud_Managed' => 1, "Is_Featured" => 0, "Stripe_Price_ID" => 'price_456']
        ];

        $dbMock->expects($this->once())
               ->method('query')
               ->with($this->stringContains('SELECT')); 

        $dbMock->expects($this->once())
               ->method('resultObj')
               ->willReturn($fakePlans);

        $model = new Plan($dbMock);

        $results = $model->findAll();

        $this->assertIsArray($results);
        
        $this->assertCount(2, $results);

        $this->assertEquals('Basic', $results[0]->Name);
        $this->assertEquals(30.00, $results[1]->Price);
    }

    public function test_get_all_returns_empty_array_if_database_is_empty()
    {
        $dbMock = $this->createMock(Database::class);

        $dbMock->expects($this->once())->method('query');
        
        $dbMock->expects($this->once())
               ->method('resultObj')
               ->willReturn([]);

        $model = new Plan($dbMock);

        $results = $model->findAll();

        $this->assertIsArray($results);
        $this->assertEmpty($results);
    }
}