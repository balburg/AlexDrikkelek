# Database Setup

This directory contains the database schema and seed data for AlexDrikkelek.

## Files

- **schema.sql** - Main database schema for Azure SQL Database
- **seed_custom_space_packs.sql** - Seed data for custom space packs

## Setup Instructions

### 1. Create the Database Schema

Run the schema.sql file to create all the necessary tables:

```sql
-- Execute schema.sql in your Azure SQL Database
```

### 2. Populate Custom Space Packs (Optional)

After creating the schema, you can populate the database with pre-made custom space packs:

```sql
-- Execute seed_custom_space_packs.sql
```

This will create:
- **1 Doraemon-themed pack** - "Doraemon Adventures" with 8 custom spaces featuring iconic gadgets and challenges
- **2 Simpsons-themed packs**:
  - "Springfield Adventures" with 8 spaces featuring locations and characters from Springfield
  - "Treehouse of Horror" with 10 spooky spaces inspired by Halloween specials

All packs are created with `IsActive = 1` by default, making them immediately available in the game.

## Custom Space Pack Details

### Doraemon Adventures
Features spaces based on Doraemon's futuristic gadgets:
- Anywhere Door (Bonus)
- Time Machine (Penalty)
- Bamboo Copter (Special)
- Take-copter Quiz (Trivia)
- Translation Jelly (Dare)
- Small Light (Bonus)
- Memory Bread (Challenge)
- Dokodemo Door (Action)

### Springfield Adventures
Explore the world of The Simpsons:
- Homer's Donut (Penalty)
- Moe's Tavern (Drinking)
- Bart's Skateboard (Bonus)
- Lisa's Saxophone (Trivia)
- Krusty Burger (Action)
- Nuclear Power Plant (Challenge)
- Kwik-E-Mart (Bonus)
- Itchy & Scratchy (Dare)

### Treehouse of Horror
Spooky Halloween-themed challenges:
- Evil Homer (Special)
- Zombie Simpsons (Action)
- Kang & Kodos (Trivia)
- The Raven (Dare)
- Time Machine Malfunction (Penalty)
- Vampire Burns (Drinking)
- The Shinning (Bonus)
- Devil Flanders (Challenge)
- The Island of Dr. Hibbert (Action)
- Nightmare Cafeteria (Dare)

## Notes

- The backend service uses an in-memory store for game state management
- Custom space packs in the database can be synced to the in-memory store via API calls
- All custom spaces include color-coded backgrounds matching their space type
