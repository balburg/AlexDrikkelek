# Custom Space Database Integration - Testing Guide

This document provides manual testing steps to verify that the custom space database integration is working correctly.

## Prerequisites

1. Azure SQL Database is set up and accessible
2. Database schema has been created (`database/schema.sql`)
3. Sample custom space packs have been seeded (optional: `database/seed_custom_space_packs.sql`)
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

**Objective**: Ensure the backend can connect to the database and retrieve custom space packs.

**Steps**:
1. Start the backend server
2. Make a GET request to `/api/admin/custom-space-packs`
3. Provide admin credentials

**Expected Result**:
- Returns HTTP 200
- Response contains an array of custom space packs
- Each pack has all required fields: id, name, description, isActive, spaces, createdAt, updatedAt
- Each space in the pack has: id, packId, name, description, type, optional styling fields

### Test 2: Get Active Custom Space Packs

**Objective**: Verify active custom space packs can be retrieved.

**Steps**:
1. Make a GET request to `/api/admin/custom-space-packs/active`

**Expected Result**:
- Returns HTTP 200
- Response contains only packs where `isActive` is `true`
- Each pack includes its associated spaces

### Test 3: Create a Custom Space Pack

**Objective**: Test creating a new custom space pack in the database.

**Steps**:
1. Make a POST request to `/api/admin/custom-space-packs` with body:
```json
{
  "name": "Test Gaming Pack",
  "description": "A test pack for verification",
  "isActive": false
}
```

**Expected Result**:
- Returns HTTP 201
- Response contains the created pack with a generated UUID
- `isActive` is `false`
- `spaces` is an empty array
- Verify by making another GET to `/api/admin/custom-space-packs` and see the new pack

### Test 4: Update a Custom Space Pack

**Objective**: Test updating an existing custom space pack.

**Steps**:
1. Get the ID of the "Test Gaming Pack" created in Test 3
2. Make a PUT request to `/api/admin/custom-space-packs/{id}` with body:
```json
{
  "name": "Updated Gaming Pack",
  "description": "Updated description for testing"
}
```

**Expected Result**:
- Returns HTTP 200
- Response shows updated name and description
- `updatedAt` timestamp is updated
- Other fields remain unchanged
- `spaces` array is preserved

### Test 5: Activate a Custom Space Pack

**Objective**: Test activating/deactivating a custom space pack.

**Steps**:
1. Get the ID of the "Test Gaming Pack"
2. Make a POST request to `/api/admin/custom-space-packs/{id}/toggle` with body:
```json
{
  "isActive": true
}
```

**Expected Result**:
- Returns HTTP 200
- Pack has `isActive: true`
- Verify by GET `/api/admin/custom-space-packs/active` - pack appears in results

### Test 6: Create Custom Spaces in a Pack

**Objective**: Test creating custom spaces within a pack.

**Steps**:
1. Get the ID of an existing pack
2. Make a POST request to `/api/admin/custom-space-packs/{packId}/spaces` with body:
```json
{
  "name": "Power Up Space",
  "description": "Land here to get a power boost!",
  "type": "BONUS",
  "backgroundColor": "#FFD700",
  "textColor": "#000000",
  "logoUrl": "https://example.com/power-up-icon.png"
}
```

**Expected Result**:
- Returns HTTP 201
- Response contains the created space with a generated UUID
- Space has all provided fields
- `packId` matches the pack it was created in
- The pack's `updatedAt` timestamp is updated

### Test 7: Create Multiple Spaces in a Pack

**Objective**: Verify multiple spaces can be added to a pack.

**Steps**:
1. Create several different space types in the same pack:
   - CHALLENGE space
   - DRINKING space
   - PENALTY space
   - SPECIAL space

**Expected Result**:
- All spaces are created successfully
- GET the pack by ID shows all spaces in the `spaces` array
- Spaces are ordered by creation time

### Test 8: Update a Custom Space

**Objective**: Test updating an existing custom space.

**Steps**:
1. Get the ID of a custom space
2. Make a PUT request to `/api/admin/custom-spaces/{id}` with body:
```json
{
  "name": "Updated Space Name",
  "description": "Updated description",
  "backgroundColor": "#FF0000"
}
```

**Expected Result**:
- Returns HTTP 200
- Response shows updated fields
- `updatedAt` timestamp is updated
- Other fields remain unchanged
- The parent pack's `updatedAt` timestamp is also updated

### Test 9: Delete a Custom Space

**Objective**: Test deleting a custom space from a pack.

**Steps**:
1. Get the ID of a custom space
2. Make a DELETE request to `/api/admin/custom-spaces/{id}`

**Expected Result**:
- Returns HTTP 204 (No Content)
- Verify by GET the parent pack - space is no longer in the `spaces` array
- The pack's `updatedAt` timestamp is updated
- Other spaces in the pack are unaffected

### Test 10: Get Active Custom Spaces

**Objective**: Verify the public endpoint returns spaces from active packs only.

**Steps**:
1. Ensure at least one pack is active with spaces
2. Ensure at least one pack is inactive with spaces
3. Make a GET request to `/api/custom-spaces/active` (no authentication required)

**Expected Result**:
- Returns HTTP 200
- Response contains only spaces from active packs
- Spaces from inactive packs are not included

### Test 11: Delete a Custom Space Pack

**Objective**: Test deleting a custom space pack and verify cascade deletion.

**Steps**:
1. Create a new pack with several spaces
2. Get the pack ID
3. Make a DELETE request to `/api/admin/custom-space-packs/{id}`

**Expected Result**:
- Returns HTTP 204 (No Content)
- Verify by GET `/api/admin/custom-space-packs` - pack is gone
- All spaces in the pack are also deleted (CASCADE DELETE)
- Verify by checking that individual space IDs return 404

### Test 12: Get Custom Space Pack by ID

**Objective**: Verify retrieving a specific pack with all its spaces.

**Steps**:
1. Get the ID of a pack with multiple spaces
2. Make a GET request to `/api/admin/custom-space-packs/{id}`

**Expected Result**:
- Returns HTTP 200
- Response contains the pack with all its spaces
- Spaces are nested within the `spaces` array
- All space properties are included

## Database Verification

After running all tests, verify the database directly:

```sql
-- Check all custom space packs
SELECT Id, Name, IsActive, CreatedAt, UpdatedAt 
FROM CustomSpacePacks 
ORDER BY CreatedAt DESC;

-- Check all custom spaces
SELECT Id, PackId, Name, Type, CreatedAt 
FROM CustomSpaces 
ORDER BY PackId, CreatedAt;

-- Verify spaces belong to correct packs
SELECT 
  csp.Name AS PackName,
  cs.Name AS SpaceName,
  cs.Type AS SpaceType
FROM CustomSpaces cs
INNER JOIN CustomSpacePacks csp ON cs.PackId = csp.Id
ORDER BY csp.Name, cs.CreatedAt;

-- Count spaces per pack
SELECT 
  csp.Id,
  csp.Name,
  COUNT(cs.Id) AS SpaceCount
FROM CustomSpacePacks csp
LEFT JOIN CustomSpaces cs ON csp.Id = cs.PackId
GROUP BY csp.Id, csp.Name
ORDER BY csp.Name;

-- Get only active packs and their spaces
SELECT 
  csp.Name AS PackName,
  csp.IsActive,
  cs.Name AS SpaceName,
  cs.Type
FROM CustomSpacePacks csp
LEFT JOIN CustomSpaces cs ON csp.Id = cs.PackId
WHERE csp.IsActive = 1
ORDER BY csp.Name, cs.CreatedAt;
```

## Error Handling Tests

### Test 13: Invalid Pack ID

**Objective**: Verify proper error handling for non-existent packs.

**Steps**:
1. Make a GET request to `/api/admin/custom-space-packs/{invalid-uuid}`

**Expected Result**:
- Returns HTTP 404
- Error message: "Custom space pack not found"

### Test 14: Create Space in Non-Existent Pack

**Objective**: Test error handling when creating a space in a non-existent pack.

**Steps**:
1. Attempt to POST to `/api/admin/custom-space-packs/{invalid-uuid}/spaces`

**Expected Result**:
- Returns HTTP 400
- Error message: "Pack not found"

### Test 15: Invalid Space Type

**Objective**: Test validation of space type.

**Steps**:
1. Attempt to create a space with an invalid type
```json
{
  "name": "Test Space",
  "description": "Test",
  "type": "INVALID_TYPE"
}
```

**Expected Result**:
- Returns HTTP 400
- Error indicates invalid type

### Test 16: Delete Non-Existent Space

**Objective**: Verify error handling when deleting a non-existent space.

**Steps**:
1. Make a DELETE request to `/api/admin/custom-spaces/{invalid-uuid}`

**Expected Result**:
- Returns HTTP 400
- Error message: "Space not found"

## Integration Tests

### Test 17: Full Pack Lifecycle

**Objective**: Test complete lifecycle of a custom space pack.

**Steps**:
1. Create a new pack (inactive)
2. Add 5 different spaces to it
3. Verify all spaces are in the pack
4. Update 2 of the spaces
5. Delete 1 space
6. Activate the pack
7. Verify pack appears in active packs
8. Deactivate the pack
9. Delete the entire pack
10. Verify pack and all remaining spaces are gone

**Expected Result**:
- All operations succeed
- Database remains consistent throughout
- Timestamps are properly updated at each step

### Test 18: Multiple Active Packs

**Objective**: Verify multiple packs can be active simultaneously.

**Steps**:
1. Create 3 different packs with different themes
2. Add spaces to each pack
3. Activate all 3 packs
4. Make a GET to `/api/custom-spaces/active`

**Expected Result**:
- All 3 packs show `isActive: true`
- Active spaces endpoint returns spaces from all 3 packs
- Spaces are differentiated by their `packId`

### Test 19: Pack with Many Spaces

**Objective**: Test performance with a pack containing many spaces.

**Steps**:
1. Create a pack
2. Add 20+ spaces to it
3. Retrieve the pack
4. Update the pack
5. Activate/deactivate it

**Expected Result**:
- All operations complete successfully
- All 20+ spaces are returned correctly
- Performance is acceptable (< 1 second for retrieval)

## Success Criteria

All tests should pass with expected results. The system should:
- ✅ Store custom space packs in the database
- ✅ Store custom spaces in the database
- ✅ Retrieve packs with their associated spaces
- ✅ Create new packs and spaces
- ✅ Update existing packs and spaces
- ✅ Activate/deactivate packs
- ✅ Delete spaces and packs
- ✅ CASCADE DELETE spaces when parent pack is deleted
- ✅ Update pack timestamps when spaces are modified
- ✅ Filter active spaces for public endpoint
- ✅ Handle errors gracefully
- ✅ Maintain referential integrity

## Notes

- All admin endpoints require authentication
- The public `/api/custom-spaces/active` endpoint does not require authentication
- Pack and space IDs are UUIDs generated by the database
- Multiple packs can be active simultaneously
- Deleting a pack automatically deletes all its spaces (CASCADE DELETE)
- Updating a space automatically updates the parent pack's `updatedAt` timestamp
- Space types must match the CustomSpaceType enum: CHALLENGE, DRINKING, QUIZ, TRIVIA, ACTION, DARE, BONUS, PENALTY, SPECIAL

## Sample Data for Testing

If you want to seed some test data, you can use the provided seed script:

```bash
# Run the seed script (from database folder)
sqlcmd -S your-server.database.windows.net -d alexdrikkelek -U your-username -P your-password -i seed_custom_space_packs.sql
```

This will create:
- Doraemon Adventures pack (8 spaces)
- Springfield Adventures pack (8 spaces)
- Treehouse of Horror pack (10 spaces)

All packs are created as active by default in the seed script.
