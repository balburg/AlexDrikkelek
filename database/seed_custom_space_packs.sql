-- Seed data for Custom Space Packs
-- AlexDrikkelek Database

-- This script creates custom space packs based on:
-- 1. Doraemon theme
-- 2. The Simpsons theme (2 packs)

-- ========================================
-- DORAEMON THEME PACK
-- ========================================

-- Create Doraemon Pack
DECLARE @DoraemonPackId UNIQUEIDENTIFIER = NEWID();

INSERT INTO CustomSpacePacks (Id, Name, Description, IsActive, CreatedAt, UpdatedAt)
VALUES (
    @DoraemonPackId,
    'Doraemon Adventures',
    'Journey through the world of Doraemon with futuristic gadgets and time-traveling challenges!',
    1,
    GETUTCDATE(),
    GETUTCDATE()
);

-- Create Doraemon Spaces
INSERT INTO CustomSpaces (Id, PackId, Name, Description, Type, LogoUrl, BackgroundColor, TextColor, CreatedAt, UpdatedAt)
VALUES
    -- Space 1: Anywhere Door
    (NEWID(), @DoraemonPackId, 'Anywhere Door', 'Use the Anywhere Door to teleport! Take an extra turn.', 'BONUS', NULL, '#4A90E2', '#FFFFFF', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 2: Time Machine
    (NEWID(), @DoraemonPackId, 'Time Machine', 'Travel back in time - move back 3 spaces!', 'PENALTY', NULL, '#E94B3C', '#FFFFFF', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 3: Bamboo Copter
    (NEWID(), @DoraemonPackId, 'Bamboo Copter', 'Fly over obstacles! Skip the next challenge.', 'SPECIAL', NULL, '#50C878', '#FFFFFF', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 4: Take-copter Quiz
    (NEWID(), @DoraemonPackId, 'Take-copter Quiz', 'Answer a futuristic trivia question!', 'TRIVIA', NULL, '#FFD700', '#000000', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 5: Translation Jelly
    (NEWID(), @DoraemonPackId, 'Translation Jelly', 'Eat Translation Jelly and speak in a funny accent for your next turn!', 'DARE', NULL, '#FF69B4', '#FFFFFF', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 6: Small Light
    (NEWID(), @DoraemonPackId, 'Small Light', 'You got hit by the Small Light! Move forward 2 spaces.', 'BONUS', NULL, '#9370DB', '#FFFFFF', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 7: Memory Bread
    (NEWID(), @DoraemonPackId, 'Memory Bread', 'Eat Memory Bread! Answer a memory challenge about the game so far.', 'CHALLENGE', NULL, '#FFA500', '#000000', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 8: Dokodemo Door
    (NEWID(), @DoraemonPackId, 'Dokodemo Door', 'The door appears! Perform a funny action.', 'ACTION', NULL, '#20B2AA', '#FFFFFF', GETUTCDATE(), GETUTCDATE());

-- ========================================
-- THE SIMPSONS THEME PACK 1: Springfield
-- ========================================

-- Create Simpsons Springfield Pack
DECLARE @SimpsonsSpringfieldPackId UNIQUEIDENTIFIER = NEWID();

INSERT INTO CustomSpacePacks (Id, Name, Description, IsActive, CreatedAt, UpdatedAt)
VALUES (
    @SimpsonsSpringfieldPackId,
    'Springfield Adventures',
    'Explore Springfield with the Simpson family and their hilarious mishaps!',
    1,
    GETUTCDATE(),
    GETUTCDATE()
);

-- Create Simpsons Springfield Spaces
INSERT INTO CustomSpaces (Id, PackId, Name, Description, Type, LogoUrl, BackgroundColor, TextColor, CreatedAt, UpdatedAt)
VALUES
    -- Space 1: Homer's Donut
    (NEWID(), @SimpsonsSpringfieldPackId, 'Homer''s Donut', 'D''oh! Homer ate all the donuts. Miss your next turn while you get more.', 'PENALTY', NULL, '#FFB6C1', '#8B4513', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 2: Moe's Tavern
    (NEWID(), @SimpsonsSpringfieldPackId, 'Moe''s Tavern', 'Take a drink at Moe''s! Complete a drinking challenge.', 'DRINKING', NULL, '#8B4513', '#FFD700', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 3: Bart's Skateboard
    (NEWID(), @SimpsonsSpringfieldPackId, 'Bart''s Skateboard', 'Cowabunga! Bart lets you use his skateboard. Move forward 4 spaces!', 'BONUS', NULL, '#FF6347', '#FFFF00', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 4: Lisa's Saxophone
    (NEWID(), @SimpsonsSpringfieldPackId, 'Lisa''s Saxophone', 'Lisa challenges you to a trivia question!', 'TRIVIA', NULL, '#FF8C00', '#FFFFFF', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 5: Krusty Burger
    (NEWID(), @SimpsonsSpringfieldPackId, 'Krusty Burger', 'You ate at Krusty Burger! Do your best Krusty laugh.', 'ACTION', NULL, '#FF0000', '#FFFF00', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 6: Nuclear Power Plant
    (NEWID(), @SimpsonsSpringfieldPackId, 'Nuclear Power Plant', 'Mr. Burns caught you sleeping! Answer a challenge or go back 3 spaces.', 'CHALLENGE', NULL, '#32CD32', '#000000', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 7: Kwik-E-Mart
    (NEWID(), @SimpsonsSpringfieldPackId, 'Kwik-E-Mart', 'Apu gives you a free Squishee! Move forward 2 spaces.', 'BONUS', NULL, '#00CED1', '#8B0000', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 8: Itchy & Scratchy
    (NEWID(), @SimpsonsSpringfieldPackId, 'Itchy & Scratchy', 'Watch Itchy & Scratchy! Tell a funny story from your life.', 'DARE', NULL, '#9400D3', '#FFFFFF', GETUTCDATE(), GETUTCDATE());

-- ========================================
-- THE SIMPSONS THEME PACK 2: Treehouse of Horror
-- ========================================

-- Create Simpsons Treehouse of Horror Pack
DECLARE @SimpsonsTreehousePackId UNIQUEIDENTIFIER = NEWID();

INSERT INTO CustomSpacePacks (Id, Name, Description, IsActive, CreatedAt, UpdatedAt)
VALUES (
    @SimpsonsTreehousePackId,
    'Treehouse of Horror',
    'Spooky and hilarious challenges inspired by The Simpsons Halloween specials!',
    1,
    GETUTCDATE(),
    GETUTCDATE()
);

-- Create Simpsons Treehouse of Horror Spaces
INSERT INTO CustomSpaces (Id, PackId, Name, Description, Type, LogoUrl, BackgroundColor, TextColor, CreatedAt, UpdatedAt)
VALUES
    -- Space 1: Evil Homer
    (NEWID(), @SimpsonsTreehousePackId, 'Evil Homer', 'Evil Homer takes over! Switch positions with another player.', 'SPECIAL', NULL, '#800080', '#00FF00', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 2: Zombie Simpsons
    (NEWID(), @SimpsonsTreehousePackId, 'Zombie Simpsons', 'The zombies are coming! Do your best zombie impression.', 'ACTION', NULL, '#228B22', '#8B0000', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 3: Kang & Kodos
    (NEWID(), @SimpsonsTreehousePackId, 'Kang & Kodos', 'Aliens abduct you! Answer their trivia question or be probed!', 'TRIVIA', NULL, '#9370DB', '#90EE90', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 4: The Raven
    (NEWID(), @SimpsonsTreehousePackId, 'The Raven', 'The Raven haunts you! Recite a spooky poem or move back 2 spaces.', 'DARE', NULL, '#000000', '#FF4500', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 5: Time Machine Malfunction
    (NEWID(), @SimpsonsTreehousePackId, 'Time Machine Malfunction', 'Homer broke the time machine! Go back to the last special space.', 'PENALTY', NULL, '#4B0082', '#FFD700', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 6: Vampire Burns
    (NEWID(), @SimpsonsTreehousePackId, 'Vampire Burns', 'Mr. Burns is a vampire! Take a penalty drink or lose your next turn.', 'DRINKING', NULL, '#8B0000', '#FFFFFF', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 7: The Shinning
    (NEWID(), @SimpsonsTreehousePackId, 'The Shinning', 'Willie chases you! Run forward 3 spaces!', 'BONUS', NULL, '#FF6347', '#F0E68C', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 8: Devil Flanders
    (NEWID(), @SimpsonsTreehousePackId, 'Devil Flanders', 'Stupid Flanders! Answer his devilishly difficult challenge.', 'CHALLENGE', NULL, '#DC143C', '#FFD700', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 9: The Island of Dr. Hibbert
    (NEWID(), @SimpsonsTreehousePackId, 'The Island of Dr. Hibbert', 'Dr. Hibbert''s experiments! Do something wacky.', 'ACTION', NULL, '#20B2AA', '#000000', GETUTCDATE(), GETUTCDATE()),
    
    -- Space 10: Nightmare Cafeteria
    (NEWID(), @SimpsonsTreehousePackId, 'Nightmare Cafeteria', 'The cafeteria serves mystery meat! Tell everyone your worst food experience.', 'DARE', NULL, '#8FBC8F', '#8B4513', GETUTCDATE(), GETUTCDATE());

-- Display summary
SELECT 
    'Custom Space Packs Seeded Successfully!' as Status,
    (SELECT COUNT(*) FROM CustomSpacePacks WHERE Id IN (@DoraemonPackId, @SimpsonsSpringfieldPackId, @SimpsonsTreehousePackId)) as PacksCreated,
    (SELECT COUNT(*) FROM CustomSpaces WHERE PackId IN (@DoraemonPackId, @SimpsonsSpringfieldPackId, @SimpsonsTreehousePackId)) as SpacesCreated;
