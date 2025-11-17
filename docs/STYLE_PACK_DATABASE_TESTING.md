# Style Pack Database Integration - Testing Guide

This document provides manual testing steps to verify that the style pack database integration is working correctly.

## Prerequisites

1. Azure SQL Database is set up and accessible
2. Database schema has been created (`database/schema.sql`)
3. Default style packs have been seeded (`database/seed_style_packs.sql`)
4. Backend `.env` file is configured with database credentials:
   ```
   DB_SERVER=your-server.database.windows.net
   DB_DATABASE=alexdrikkelek
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_ENCRYPT=true
   ```
5. Backend server is running (`npm run dev:backend`)

## Test Cases

### Test 1: Verify Database Connection

**Objective**: Ensure the backend can connect to the database and retrieve style packs.

**Steps**:
1. Start the backend server
2. Make a GET request to `/api/admin/style-packs`
3. Provide admin credentials if required

**Expected Result**:
- Returns HTTP 200
- Response contains an array of 3 style packs (Default, Christmas, Halloween)
- Each pack has all required fields: id, name, description, isActive, isDefault, theme, createdAt, updatedAt

**Fallback Behavior**:
- If database is unavailable, the service returns built-in packs from memory
- No errors are thrown to the client

### Test 2: Get Active Style Pack

**Objective**: Verify the active style pack can be retrieved.

**Steps**:
1. Make a GET request to `/api/admin/style-packs/active`

**Expected Result**:
- Returns HTTP 200
- Response contains the "Default" style pack
- `isActive` field is `true`

### Test 3: Create a Custom Style Pack

**Objective**: Test creating a new style pack in the database.

**Steps**:
1. Make a POST request to `/api/admin/style-packs` with body:
```json
{
  "name": "Test Theme",
  "description": "A test theme for verification",
  "theme": {
    "primary": "#FF0000",
    "primaryLight": "#FF3333",
    "primaryDark": "#CC0000",
    "secondary": "#00FF00",
    "secondaryLight": "#33FF33",
    "secondaryDark": "#00CC00",
    "accentBlue": "#0000FF",
    "accentOrange": "#FF8800",
    "accentGreen": "#00FF88",
    "accentYellow": "#FFFF00"
  }
}
```

**Expected Result**:
- Returns HTTP 201
- Response contains the created style pack with a generated UUID
- `isActive` is `false`
- `isDefault` is `false`
- Verify by making another GET to `/api/admin/style-packs` and see 4 packs

### Test 4: Update a Style Pack

**Objective**: Test updating an existing style pack.

**Steps**:
1. Get the ID of the "Test Theme" created in Test 3
2. Make a PUT request to `/api/admin/style-packs/{id}` with body:
```json
{
  "name": "Updated Test Theme",
  "description": "Updated description"
}
```

**Expected Result**:
- Returns HTTP 200
- Response shows updated name and description
- `updatedAt` timestamp is updated
- Other fields remain unchanged

### Test 5: Activate a Style Pack

**Objective**: Test activating a style pack (which should deactivate others).

**Steps**:
1. Get the ID of the "Christmas" style pack
2. Make a POST request to `/api/admin/style-packs/{id}/activate`

**Expected Result**:
- Returns HTTP 200
- Christmas pack has `isActive: true`
- Make a GET to `/api/admin/style-packs` and verify:
  - Christmas pack is active
  - All other packs are inactive

### Test 6: Get Active Pack After Activation

**Objective**: Verify the active pack endpoint returns the newly activated pack.

**Steps**:
1. Make a GET request to `/api/admin/style-packs/active`

**Expected Result**:
- Returns the Christmas style pack
- `isActive` is `true`

### Test 7: Public Theme Endpoint

**Objective**: Test the public theme endpoint used by the frontend.

**Steps**:
1. Make a GET request to `/api/theme` (no authentication required)

**Expected Result**:
- Returns HTTP 200
- Response contains:
  ```json
  {
    "theme": { /* theme colors */ },
    "name": "Christmas"
  }
  ```

### Test 8: Delete Custom Style Pack

**Objective**: Test deleting a custom style pack.

**Steps**:
1. Ensure "Test Theme" is not active (activate another if needed)
2. Get the ID of "Test Theme"
3. Make a DELETE request to `/api/admin/style-packs/{id}`

**Expected Result**:
- Returns HTTP 204 (No Content)
- Verify by GET `/api/admin/style-packs` - "Test Theme" should be gone

### Test 9: Attempt to Delete Built-in Pack

**Objective**: Verify built-in packs cannot be deleted.

**Steps**:
1. Get the ID of the "Default" pack
2. Make a DELETE request to `/api/admin/style-packs/{id}`

**Expected Result**:
- Returns HTTP 400
- Error message: "Cannot delete built-in style pack"

### Test 10: Attempt to Delete Active Pack

**Objective**: Verify active packs cannot be deleted.

**Steps**:
1. Create a new custom pack and activate it
2. Attempt to delete it

**Expected Result**:
- Returns HTTP 400
- Error message: "Cannot delete active style pack. Please activate another pack first."

## Database Verification

After running all tests, verify the database directly:

```sql
-- Check all style packs
SELECT Id, Name, IsActive, IsDefault, CreatedAt, UpdatedAt 
FROM StylePacks 
ORDER BY CreatedAt;

-- Verify only one pack is active
SELECT COUNT(*) as ActiveCount 
FROM StylePacks 
WHERE IsActive = 1;
-- Should return 1

-- Check theme colors
SELECT Name, ThemePrimary, ThemeSecondary 
FROM StylePacks;
```

## Error Handling Tests

### Test 11: Database Unavailable

**Objective**: Verify graceful degradation when database is unavailable.

**Steps**:
1. Stop the database or use invalid credentials
2. Make a GET request to `/api/admin/style-packs`

**Expected Result**:
- Returns HTTP 200 (still succeeds)
- Returns the 3 built-in packs from memory as fallback
- Backend logs show database error but doesn't crash

### Test 12: Invalid Style Pack Data

**Objective**: Test validation of style pack data.

**Steps**:
1. Attempt to create a style pack with missing fields
2. Attempt to create with invalid color codes

**Expected Result**:
- Returns HTTP 400
- Error message indicates what's wrong

## Success Criteria

All tests should pass with expected results. The system should:
- ✅ Store style packs in the database
- ✅ Retrieve style packs from the database
- ✅ Create new style packs
- ✅ Update existing style packs
- ✅ Activate style packs (only one active at a time)
- ✅ Delete custom style packs
- ✅ Protect built-in and active packs from deletion
- ✅ Provide fallback when database is unavailable
- ✅ Handle errors gracefully

## Notes

- All admin endpoints require authentication
- The public `/api/theme` endpoint does not require authentication
- Style pack IDs are UUIDs generated by the database
- Only one style pack can be active at a time
- Built-in packs (Default, Christmas, Halloween) have `isDefault: true`
