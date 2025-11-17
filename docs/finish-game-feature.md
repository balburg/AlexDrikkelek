# Finish Game Feature

## Overview
When a player reaches the finish tile in the game, a celebration animation is triggered on all connected devices with a "Finish the Game" button that returns all players to the lobby.

## User Flow

1. **Player Reaches Finish**
   - When a player lands on the last tile (FINISH tile), the backend detects this
   - The backend emits a `PLAYER_FINISHED` event to all players in the room

2. **Winner Celebration Animation**
   - All devices display the `WinnerCelebration` component
   - Shows a crown rain animation (50 animated crown emojis falling)
   - Displays the winner's name and avatar
   - Shows celebratory emojis (confetti, sparkles, balloons)
   - Displays a "Finish the Game" button

3. **Return to Lobby**
   - Any player can click the "Finish the Game" button
   - This emits a `FINISH_GAME` event to the server
   - Server resets the game state:
     - Status changes to `WAITING`
     - All player positions reset to 0
     - Current turn resets to 0
     - A new board is generated with a new seed
   - Server emits `GAME_ENDED` and `ROOM_UPDATED` events
   - All devices return to the lobby, ready for a new game

## Technical Implementation

### Socket Events
- `PLAYER_FINISHED`: Emitted when a player reaches the finish tile
- `FINISH_GAME`: Emitted when the finish button is clicked
- `GAME_ENDED`: Emitted when the game returns to lobby state

### Backend Changes
- **index.ts**: Added detection for FINISH tile type in MOVE_PLAYER handler
- **gameService.ts**: Added `finishGame()` function to reset game state
- **models/types.ts**: Added new socket events

### Frontend Changes
- **WinnerCelebration.tsx**: New component with crown rain animation
- **PlayerGame.tsx**: Listen for PLAYER_FINISHED, show celebration, handle finish button
- **BoardGame.tsx**: Listen for PLAYER_FINISHED, show celebration, handle finish button
- **game.ts**: Added new socket event types

### Animation Details
The crown rain animation uses CSS keyframes:
- 50 crown emojis fall from top to bottom
- Each crown has randomized position, delay, and duration
- Crowns rotate as they fall for visual interest
- Background overlay dims the game board
- Winner card bounces in with scale animation
- Avatar wiggles continuously

## Testing
- Added 3 unit tests for `finishGame()` function
- All 69 backend tests passing
- Frontend builds successfully with no errors
- No security vulnerabilities detected by CodeQL
