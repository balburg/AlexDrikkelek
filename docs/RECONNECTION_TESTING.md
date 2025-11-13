# Seamless Reconnection Feature - Testing Guide

## Overview
This document describes how to test the seamless reconnection feature implemented to address the issue: "As a player, I want to reconnect seamlessly if my network drops."

## Test Scenarios

### Scenario 1: Reconnection During Waiting Phase
1. Create a room with Player 1
2. Join the room with Player 2
3. Disconnect Player 2's network (e.g., turn off Wi-Fi or use browser dev tools)
4. Observe that Player 2 is marked as disconnected (grayed out with 🔌 icon on board view)
5. Reconnect Player 2's network within 60 seconds
6. Verify Player 2 automatically reconnects and rejoins the room
7. Verify all players see "Player 2 reconnected! 🔄" message

**Expected Result:** Player 2 seamlessly rejoins the room with the same identity, avatar, and position in player list.

### Scenario 2: Reconnection During Active Game
1. Start a game with 2+ players
2. Play a few turns so players have different positions on the board
3. Disconnect the current player's network mid-turn
4. Observe disconnection indicators
5. Reconnect the player's network
6. Verify the player reconnects with:
   - Same position on the board
   - Same avatar
   - Same turn order
   - Game state intact

**Expected Result:** The game continues from where it left off, preserving all player state.

### Scenario 3: Reconnection Timeout (60 seconds)
1. Create a room with 2 players
2. Disconnect Player 2
3. Wait more than 60 seconds
4. Observe Player 2 is permanently removed from the room
5. Attempt to reconnect Player 2
6. Verify Player 2 cannot reconnect to the same session

**Expected Result:** After 60 seconds, the player is permanently removed and would need to join as a new player.

### Scenario 4: Multiple Disconnections
1. Start a game with 3+ players
2. Disconnect Player 2
3. Continue playing with remaining players
4. Reconnect Player 2 before timeout
5. Disconnect Player 3
6. Verify both disconnections are handled independently

**Expected Result:** Each player's disconnection is tracked separately, and reconnection works for each.

### Scenario 5: Host Disconnection
1. Create a room (Player 1 is host)
2. Add Player 2
3. Disconnect Player 1 (host)
4. Verify Player 1 is marked as disconnected but host status preserved
5. Reconnect Player 1
6. Verify Player 1 is still the host

**Expected Result:** Host reconnects with host privileges intact.

### Scenario 6: Reconnection After Page Reload
1. Join a room as a player
2. Note down the room code
3. Reload the page (F5 or Ctrl+R)
4. Observe automatic reconnection using stored session

**Expected Result:** Player automatically rejoins the same room with the same identity due to localStorage persistence.

## Technical Details

### Backend Implementation
- **Session Storage**: Redis with 4-hour expiry
- **Grace Period**: 60 seconds before permanent removal
- **Session ID**: UUID-based persistent identifier
- **Events**: `RECONNECT`, `PLAYER_RECONNECTED`, `PLAYER_DISCONNECTED`

### Frontend Implementation
- **Storage**: localStorage for session persistence
- **Auto-reconnect**: Automatic on socket reconnection
- **UI Indicators**: "Reconnecting..." spinner, grayed-out disconnected players
- **Events Handled**: Connection, disconnection, reconnection

### Testing Tools
- **Browser DevTools**: Network throttling to simulate poor connection
- **Network Tab**: Disable/enable network
- **Console**: Monitor socket events and connection status
- **Multiple Browsers/Tabs**: Test multiple simultaneous players

## Automated Tests
Run the comprehensive test suite:
```bash
npm test -- reconnection.test.ts
```

**Test Coverage:**
- ✅ Mark player as disconnected without removing
- ✅ Reconnect player with previous session
- ✅ Handle invalid session gracefully
- ✅ Preserve player state during reconnection
- ✅ Session tracking in room creation
- ✅ Session tracking when joining room
- ✅ Multiple player scenarios
- ✅ All edge cases covered

## Success Criteria
- [x] Players can reconnect after network drop
- [x] Game state is preserved during reconnection
- [x] UI clearly indicates disconnected players
- [x] No data loss on temporary disconnection
- [x] Permanent removal after timeout prevents stale sessions
- [x] All tests passing
- [x] No security vulnerabilities (CodeQL scan passed)
