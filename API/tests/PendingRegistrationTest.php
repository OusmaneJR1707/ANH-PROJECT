<?php

use PHPUnit\Framework\TestCase;
use App\Models\PendingRegistration;
use App\Core\Database;

class PendingRegistrationTest extends TestCase
{
    public function test_create_saves_data_correctly()
    {
        $dbMock = $this->createMock(Database::class);

        $testData = [
            'ID' => 12345,
            'Tenant_Name' => 'Grena SRL',
            'Subdomain' => 'grena-srl',
            'VAT_Number' => '00159560366',
            'Plan_Name' => 'Basic',
            'DB_Type' => 'private',
            'Admin_Firstname' => 'Marco',
            'Admin_Lastname' => 'Grena',
            'Admin_Email' => 'email@gmail.com',
            'Admin_Password_Hash' => 'hashed_password',
            'Auth_Provider' => 'google',
            'Optional_Data' => null,
            'Status' => 'pending'
        ];

        $dbMock->expects($this->once())
               ->method('query')
               ->with($this->stringContains('INSERT INTO Pending_Registration'));

        $dbMock->expects($this->any())
               ->method('bind');

        $dbMock->expects($this->once())
               ->method('execute')
               ->willReturn(true);

        $model = new PendingRegistration($dbMock);

        $result = $model->create($testData);

        $this->assertEquals($testData['ID'], $result);
    }

    public function test_find_by_id_returns_object()
    {
        $dbMock = $this->createMock(Database::class);
        
        $testId = 12345; 

        $fakeDbRow = (object) [
            'ID' => $testId,
            'Tenant_Name' => 'Grena SRL',
            'Subdomain' => 'grena-srl',
            'VAT_Number' => '00159560366',
            'Plan_Name' => 'Basic',
            'DB_Type' => 'private',
            'Admin_Firstname' => 'Marco',
            'Admin_Lastname' => 'Grena',
            'Admin_Email' => 'email@gmail.com',
            'Admin_Password_Hash' => 'hashed_password',
            'Auth_Provider' => 'google',
            'Optional_Data' => null,
            'Status' => 'pending'
        ];


        $dbMock->expects($this->once())
               ->method('query')
               ->with($this->stringContains('SELECT * FROM Pending_Registrations'));
        
        $dbMock->expects($this->once())
               ->method('bind')
               ->with(':id', $testId);

        $dbMock->expects($this->once())
               ->method('singleResult')
               ->willReturn($fakeDbRow);

        $model = new PendingRegistration($dbMock);

        $result = $model->findById($testId);

        $this->assertNotNull($result);
        
        $this->assertEquals($testId, $result->ID);
        $this->assertEquals('grena-srl', $result->Subdomain);
        $this->assertEquals('email@gmail.com', $result->Admin_Email);
    }
}