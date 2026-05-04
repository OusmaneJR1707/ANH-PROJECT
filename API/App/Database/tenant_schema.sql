-- Disabilitiamo temporaneamente i controlli sulle chiavi esterne per evitare blocchi
SET FOREIGN_KEY_CHECKS = 0;

-- ====================================================
-- 1. TABELLE INDIPENDENTI (Nessuna Foreign Key)
-- ====================================================

CREATE TABLE IF NOT EXISTS Employee (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password_Hash VARCHAR(255),
    First_Name VARCHAR(100) NOT NULL,
    Last_Name VARCHAR(100) NOT NULL,
    Status ENUM('active', 'inactive', 'pending', 'suspended') DEFAULT 'active',
    Profile_Picture LONGTEXT NULL,
    `Auth_Provider` VARCHAR(50) DEFAULT 'local',
    CONSTRAINT chk_email_format CHECK (Email LIKE '%_@__%.__%')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Role (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Permission (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL UNIQUE,
    Description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Project (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Status ENUM ('Draft', 'In Progress', 'Suspended', 'Completed', 'Cancelled') DEFAULT 'Draft'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS General_Report (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Total_Hours DECIMAL(10, 2) DEFAULT 0,
    Period_Start DATE NOT NULL,
    Period_End DATE NOT NULL,
    Completed_Projects INT DEFAULT 0,
    Employee_Count INT DEFAULT 0,
    CONSTRAINT chk_gen_report_period CHECK (Period_End >= Period_Start),
    CONSTRAINT chk_gen_total_hours CHECK (Total_Hours >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 2. TABELLE DI PRIMO LIVELLO (Dipendono da 1 tabella)
-- ====================================================

CREATE TABLE IF NOT EXISTS Refresh_Token (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Employee_ID INT NOT NULL,
    JTI VARCHAR(255) NOT NULL UNIQUE,
    Expires_At DATETIME NOT NULL,
    Is_Revoked BOOLEAN DEFAULT FALSE,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Source_IP VARCHAR(45),
    User_Agent TEXT,
    FOREIGN KEY (Employee_ID) REFERENCES Employee(ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Message (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Content TEXT NOT NULL,
    Sender_ID INT,
    Sent_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Sender_ID) REFERENCES Employee(ID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS System_Logs (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Employee_ID INT,
    Action VARCHAR(100) NOT NULL,
    Description TEXT,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Table_Name VARCHAR(100),
    Record_ID INT,
    Old_Value VARCHAR(255),
    New_Value VARCHAR(255),
    Source_IP VARCHAR(45),
    FOREIGN KEY (Employee_ID) REFERENCES Employee(ID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Timesheet (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Date DATE NOT NULL,
    Hours_Worked DECIMAL(4, 2) NOT NULL,
    Employee_ID INT NOT NULL,
    FOREIGN KEY (Employee_ID) REFERENCES Employee(ID) ON DELETE CASCADE,
    CONSTRAINT chk_hours_worked CHECK (Hours_Worked > 0 AND Hours_Worked <= 24)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Task (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Start_Date DATETIME,
    Duration INT, 
    Status ENUM('To Do', 'In Progress', 'In Review', 'Completed') DEFAULT 'To Do',
    Color VARCHAR(7),
    Project_ID INT NOT NULL,
    FOREIGN KEY (Project_ID) REFERENCES Project(ID) ON DELETE CASCADE,
    CONSTRAINT chk_task_duration CHECK (Duration >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Project_Report (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Total_Hours DECIMAL(10, 2) DEFAULT 0,
    Period_Start DATE NOT NULL,
    Period_End DATE NOT NULL,
    Task_Completion_Percentage DECIMAL(5, 2) DEFAULT 0,
    Employee_Count INT DEFAULT 0,
    Project_ID INT NOT NULL,
    FOREIGN KEY (Project_ID) REFERENCES Project(ID) ON DELETE CASCADE,
    CONSTRAINT chk_proj_report_period CHECK (Period_End >= Period_Start),
    CONSTRAINT chk_proj_completion_perc CHECK (Task_Completion_Percentage BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Role_Permissions (
    Role_ID INT NOT NULL,
    Permission_ID INT NOT NULL,
    PRIMARY KEY (Role_ID, Permission_ID),
    FOREIGN KEY (Role_ID) REFERENCES Role(ID) ON DELETE CASCADE,
    FOREIGN KEY (Permission_ID) REFERENCES Permission(ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- 3. TABELLE COMPLESSE (Dipendono da più tabelle)
-- ====================================================

CREATE TABLE IF NOT EXISTS Received_Message (
    Message_ID INT NOT NULL,
    Recipient_ID INT NOT NULL,
    Is_Delivered BOOLEAN DEFAULT FALSE,
    Received_At DATETIME,
    PRIMARY KEY (Message_ID, Recipient_ID),
    FOREIGN KEY (Message_ID) REFERENCES Message(ID) ON DELETE CASCADE,
    FOREIGN KEY (Recipient_ID) REFERENCES Employee(ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Attachment (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    File_Name VARCHAR(255) NOT NULL,
    Mime_Type VARCHAR(100),
    Storage_Path VARCHAR(255) NOT NULL,
    Size INT NOT NULL, 
    Message_ID INT NOT NULL,
    FOREIGN KEY (Message_ID) REFERENCES Message(ID) ON DELETE CASCADE,
    CONSTRAINT chk_attachment_size CHECK (Size >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Project_Member (
    Employee_ID INT NOT NULL,
    Project_ID INT NOT NULL,
    Role_ID INT NOT NULL,
    Added_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (Employee_ID, Project_ID),
    FOREIGN KEY (Employee_ID) REFERENCES Employee(ID) ON DELETE CASCADE,
    FOREIGN KEY (Project_ID) REFERENCES Project(ID) ON DELETE CASCADE,
    FOREIGN KEY (Role_ID) REFERENCES Role(ID) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Task_Assignments (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Employee_ID INT NOT NULL,
    Task_ID INT NOT NULL,
    FOREIGN KEY (Employee_ID) REFERENCES Employee(ID) ON DELETE CASCADE,
    FOREIGN KEY (Task_ID) REFERENCES Task(ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Task_Relation (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Task_1_ID INT NOT NULL,
    Task_2_ID INT NOT NULL,
    Relation_Type ENUM('start-start', 'start-finish', 'finish-start', 'finish-finish') NOT NULL, 
    FOREIGN KEY (Task_1_ID) REFERENCES Task(ID) ON DELETE CASCADE,
    FOREIGN KEY (Task_2_ID) REFERENCES Task(ID) ON DELETE CASCADE,
    CONSTRAINT chk_different_tasks CHECK (Task_1_ID <> Task_2_ID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS Personal_Reports (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Total_Hours DECIMAL(10, 2) DEFAULT 0,
    Period_Start DATE NOT NULL,
    Period_End DATE NOT NULL,
    Task_Completion_Percentage DECIMAL(5, 2) DEFAULT 0,
    Project_ID INT NOT NULL,
    Employee_ID INT NOT NULL,
    FOREIGN KEY (Project_ID) REFERENCES Project(ID) ON DELETE CASCADE,
    FOREIGN KEY (Employee_ID) REFERENCES Employee(ID) ON DELETE CASCADE,
    CONSTRAINT chk_pers_report_period CHECK (Period_End >= Period_Start),
    CONSTRAINT chk_pers_completion_perc CHECK (Task_Completion_Percentage BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Riabilitiamo i controlli
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO Role (Name, Description) VALUES ('Admin', 'Global System Administrator');
INSERT INTO Project (Title, Description, Status) VALUES ('Admin', 'Project reserved for the global management of the company', 'In progress');