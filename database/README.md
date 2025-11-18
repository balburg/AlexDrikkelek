# Database Setup

This directory contains the database schema and seed data for AlexDrikkelek.

## Files

- **schema.sql** - Main database schema for Azure SQL Database
- **seed_custom_space_packs.sql** - Seed data for custom space packs
- **seed_style_packs.sql** - Seed data for style packs (themes)

## Setup Instructions

### 1. Create the Database Schema

Run the schema.sql file to create all the necessary tables:

```sql
-- Execute schema.sql in your Azure SQL Database
```

### 2. Populate Style Packs (Recommended)

After creating the schema, populate the database with default style packs (themes):

```sql
-- Execute seed_style_packs.sql
```

This will create three built-in style packs:
- **Default** - The original AlexDrikkelek vibrant theme (active by default)
- **Christmas** - Festive red and green holiday theme
- **Halloween** - Spooky orange and black theme

The Default pack is marked as active and will be used as the application's theme.

### 3. Populate Custom Space Packs (Optional)

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

- Style packs (themes) are now stored in the SQL Server database
- **Database Optional**: If the database is not configured, the backend will automatically fall back to built-in style packs (Default, Christmas, Halloween)
- The active style pack in the database dictates the application's visual theme
- The backend service uses the database for style pack CRUD operations
- The backend service uses an in-memory store for game state management
- Custom space packs in the database can be synced to the in-memory store via API calls
- All custom spaces include color-coded backgrounds matching their space type

## Troubleshooting Connection Issues

If you experience connection timeout errors when connecting to Azure SQL Database:

1. **Check Firewall Rules**: Ensure your IP address is allowed in Azure SQL Database firewall settings
2. **Verify Credentials**: Double-check that `DB_SERVER`, `DB_DATABASE`, `DB_USER`, and `DB_PASSWORD` are correct
3. **Connection Timeout**: The application uses a 30-second connection timeout and 30-second request timeout to accommodate Azure SQL Database
4. **Network Connectivity**: Ensure you have stable network connectivity to Azure

Common error messages:
- `Failed to connect to <server>:1433 in 30000ms` - Connection timeout, likely firewall or network issue
- `Login failed for user` - Incorrect username or password
- `Database not configured` - Environment variables are not set

The backend will automatically fall back to built-in data if the database is unavailable.
