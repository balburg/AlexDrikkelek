-- AlexDrikkelek Database Schema
-- Azure SQL Database

-- Players Table
CREATE TABLE Players (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    AvatarUrl NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Game Rooms Table
CREATE TABLE GameRooms (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(10) NOT NULL UNIQUE,
    HostId UNIQUEIDENTIFIER NOT NULL,
    MaxPlayers INT NOT NULL DEFAULT 10,
    Status NVARCHAR(20) NOT NULL DEFAULT 'WAITING',
    CurrentTurn INT DEFAULT 0,
    BoardSeed NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (HostId) REFERENCES Players(Id),
    CHECK (Status IN ('WAITING', 'PLAYING', 'FINISHED')),
    CHECK (MaxPlayers >= 2 AND MaxPlayers <= 10)
);

-- Room Players (Join Table)
CREATE TABLE RoomPlayers (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RoomId UNIQUEIDENTIFIER NOT NULL,
    PlayerId UNIQUEIDENTIFIER NOT NULL,
    Position INT DEFAULT 0,
    IsConnected BIT DEFAULT 1,
    JoinedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (RoomId) REFERENCES GameRooms(Id) ON DELETE CASCADE,
    FOREIGN KEY (PlayerId) REFERENCES Players(Id) ON DELETE CASCADE,
    UNIQUE (RoomId, PlayerId)
);

-- Challenges Table
CREATE TABLE Challenges (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Type NVARCHAR(20) NOT NULL,
    Category NVARCHAR(50) NOT NULL,
    AgeRating NVARCHAR(20) NOT NULL DEFAULT 'ALL',
    Question NVARCHAR(1000),
    Answers NVARCHAR(MAX), -- JSON array
    CorrectAnswer INT,
    Action NVARCHAR(500),
    Points INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CHECK (Type IN ('TRIVIA', 'ACTION', 'DARE', 'DRINKING')),
    CHECK (AgeRating IN ('ALL', 'TEEN', 'ADULT'))
);

-- Game History Table
CREATE TABLE GameHistory (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RoomId UNIQUEIDENTIFIER NOT NULL,
    WinnerId UNIQUEIDENTIFIER,
    PlayerCount INT NOT NULL,
    StartedAt DATETIME2,
    FinishedAt DATETIME2,
    Duration INT, -- in seconds
    FOREIGN KEY (RoomId) REFERENCES GameRooms(Id),
    FOREIGN KEY (WinnerId) REFERENCES Players(Id)
);

-- Indexes for performance
CREATE INDEX IX_GameRooms_Code ON GameRooms(Code);
CREATE INDEX IX_GameRooms_Status ON GameRooms(Status);
CREATE INDEX IX_RoomPlayers_RoomId ON RoomPlayers(RoomId);
CREATE INDEX IX_RoomPlayers_PlayerId ON RoomPlayers(PlayerId);
CREATE INDEX IX_Challenges_Type ON Challenges(Type);
CREATE INDEX IX_Challenges_Category ON Challenges(Category);
CREATE INDEX IX_Challenges_AgeRating ON Challenges(AgeRating);

-- Custom Space Packs Table
CREATE TABLE CustomSpacePacks (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Custom Spaces Table
CREATE TABLE CustomSpaces (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PackId UNIQUEIDENTIFIER NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Type NVARCHAR(20) NOT NULL,
    LogoUrl NVARCHAR(500),
    BackgroundUrl NVARCHAR(500),
    ImageUrl NVARCHAR(500),
    BackgroundColor NVARCHAR(20),
    TextColor NVARCHAR(20),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (PackId) REFERENCES CustomSpacePacks(Id) ON DELETE CASCADE,
    CHECK (Type IN ('CHALLENGE', 'DRINKING', 'QUIZ', 'TRIVIA', 'ACTION', 'DARE', 'BONUS', 'PENALTY', 'SPECIAL'))
);

-- Indexes for performance
CREATE INDEX IX_CustomSpaces_PackId ON CustomSpaces(PackId);
CREATE INDEX IX_CustomSpaces_Type ON CustomSpaces(Type);
CREATE INDEX IX_CustomSpacePacks_IsActive ON CustomSpacePacks(IsActive);

-- Sample Challenges Data
INSERT INTO Challenges (Type, Category, AgeRating, Question, Answers, CorrectAnswer, Points)
VALUES 
    ('TRIVIA', 'General Knowledge', 'ALL', 'What is the capital of France?', '["Paris", "London", "Berlin", "Madrid"]', 0, 10),
    ('TRIVIA', 'Science', 'ALL', 'What is H2O?', '["Water", "Oxygen", "Hydrogen", "Carbon Dioxide"]', 0, 10),
    ('ACTION', 'Fun', 'ALL', NULL, NULL, NULL, 'Do 5 jumping jacks', 5),
    ('DARE', 'Social', 'TEEN', NULL, NULL, NULL, 'Tell an embarrassing story', 10);
