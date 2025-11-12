# AlexDrikkelek Features

Complete guide to all features available in AlexDrikkelek.

## Table of Contents

1. [Room Management](#room-management)
2. [Code Sharing](#code-sharing)
3. [Player Features](#player-features)
4. [Board Display](#board-display)
5. [Gameplay Features](#gameplay-features)
6. [Challenge System](#challenge-system)
7. [Accessibility](#accessibility)
8. [Progressive Web App](#progressive-web-app)

## Room Management

### Creating a Game Room

**Host Capabilities:**
- Create a new game room with a unique 6-character PIN
- Choose your player name and avatar
- Set maximum number of players (2-10)
- Control when the game starts
- See all connected players in real-time

**Room Codes:**
- Automatically generated alphanumeric codes (e.g., "ABC123")
- Case-insensitive for easy entry
- Unique per game session
- Valid until the game ends

**Source:** [`/packages/frontend/src/app/player/PlayerGame.tsx`](https://github.com/balburg/AlexDrikkelek/blob/main/packages/frontend/src/app/player/PlayerGame.tsx#L141-L144)

### Joining a Game Room

**Player Actions:**
- Enter your name and choose an avatar
- Input the 6-character room code
- Join instantly with real-time confirmation
- See other players as they join

**Multiple Views:**
- **Player View**: Control interface for mobile/tablet
- **Board View**: Display-only mode for TV/large screens

## Code Sharing

### Copy to Clipboard

**Feature:** One-tap room code copying

**Available On:**
- Player View (host only, during waiting phase)
- Board View (during waiting phase)

**How It Works:**
- Click the **"📋 Copy Code"** button
- Room code is copied to device clipboard
- Visual feedback: "✓ Copied!" appears for 2 seconds
- Works on all modern browsers and devices

**Implementation:**
```typescript
// Uses the Clipboard API
await navigator.clipboard.writeText(gameRoom.code);
```

**Use Cases:**
- Quickly paste code into messaging apps (WhatsApp, Telegram, etc.)
- Share via email or social media
- Copy to notes for reference

**Source:** 
- Player View: [`/packages/frontend/src/app/player/PlayerGame.tsx#L26-L35`](https://github.com/balburg/AlexDrikkelek/blob/main/packages/frontend/src/app/player/PlayerGame.tsx#L26-L35)
- Board View: [`/packages/frontend/src/app/board/BoardGame.tsx#L23-L32`](https://github.com/balburg/AlexDrikkelek/blob/main/packages/frontend/src/app/board/BoardGame.tsx#L23-L32)

### Native Share Dialog

**Feature:** Mobile-friendly sharing using Web Share API

**Available On:**
- Player View (host only, during waiting phase)

**How It Works:**
- Click the **"📤 Share"** button
- Native share dialog opens on supported devices
- Choose from available sharing options (Messages, Email, WhatsApp, etc.)
- Automatically falls back to copy function on desktop browsers

**Share Content:**
- **Title**: "Join my AlexDrikkelek game!"
- **Text**: "Join my game with code: [ROOM_CODE]"
- **URL**: Link to the player view page

**Implementation:**
```typescript
if (navigator.share) {
  await navigator.share({
    title: 'Join my AlexDrikkelek game!',
    text: `Join my game with code: ${gameRoom.code}`,
    url: window.location.origin + '/player',
  });
} else {
  // Fallback to clipboard copy
  handleCopyCode();
}
```

**Browser Support:**
- ✅ iOS Safari (12.2+)
- ✅ Android Chrome (61+)
- ✅ Android Firefox (71+)
- ⚠️ Desktop browsers (falls back to copy)

**Source:** [`/packages/frontend/src/app/player/PlayerGame.tsx#L37-L53`](https://github.com/balburg/AlexDrikkelek/blob/main/packages/frontend/src/app/player/PlayerGame.tsx#L37-L53)

### UI Integration

**Player View (Host):**
- Buttons appear below the room code display
- Only visible during the "WAITING" phase
- Disappear once game starts
- Located in the header section with game PIN and player count

**Board View:**
- Copy button appears below the large room code display
- Only visible during the "WAITING" phase
- Provides easy code access for late joiners
- Integrated into the header section

**Design:**
- Copy button: Blue background (📋 icon)
- Share button: Green background (📤 icon)
- Hover effects for better UX
- Clear visual feedback on interaction

## Player Features

### Avatar Selection

**Options:**
- 10+ emoji avatars to choose from
- Visual grid selection interface
- Highlighted when selected
- Persists throughout the game

**Available Avatars:**
- 🎮 Gaming controller
- 🎲 Dice
- 🎯 Target
- 🎪 Circus tent
- 🎨 Palette
- And more!

### Player Status

**Real-time Information:**
- Current position on the board
- Turn indicator (highlighted when it's your turn)
- Host badge (👑) for the room creator
- Avatar display
- Player name

### Game Controls

**During Your Turn:**
- Roll dice button (🎲)
- Automatic piece movement
- Challenge interaction
- Turn completion

**Visual Feedback:**
- Dice rolling animation
- Position updates
- Turn notifications
- Status messages

## Board Display

### Large Screen Optimization

**Features:**
- Full-screen game board visualization
- Large, readable player information
- Prominent room code display
- Real-time dice roll animations
- Turn indicator

**Display Elements:**
- Game board with all tiles
- Player positions
- Current turn indicator
- Dice roll display (3-second overlay)
- Player grid with avatars
- Game status

### Chromecast Support

**Casting the Board:**
1. Click the Cast icon in your Chrome browser
2. Select your Chromecast device
3. Navigate to Board View
4. Game displays on your TV

**Auto-Join:**
- Use the `?autoJoin=CODE` URL parameter
- Board automatically connects to the specified game
- Perfect for permanent casting setups

## Gameplay Features

### Turn-Based System

**Turn Order:**
- Players take turns in join order
- Automatic turn progression
- Clear visual indicators
- Server-validated turns (anti-cheat)

**Turn Actions:**
1. Roll dice
2. Move automatically
3. Complete any challenges
4. Turn advances to next player

### Dice Rolling

**Features:**
- Server-authoritative rolls (prevents cheating)
- Animated dice display
- 1-6 random results
- Synchronized across all devices
- 3-second display on board view

**Security:**
- All rolls validated by backend
- Client cannot manipulate results
- Fair random number generation
- Audit trail in server logs

### Movement System

**Automatic Movement:**
- Players move automatically after rolling
- Smooth position updates
- Real-time synchronization
- Visual animations

**Position Tracking:**
- Current position displayed
- Tile type shown
- Distance to finish
- Movement history

## Challenge System

### Challenge Types

**1. Trivia Challenges**
- Multiple choice questions
- Various difficulty levels
- Timed responses
- Correct answer bonuses

**2. Action Challenges**
- Physical activities
- Self-reported completion
- Fun and engaging
- Social interaction

**3. Dare Challenges**
- Social challenges
- Age-appropriate content
- Group participation
- Entertainment value

**4. Drinking Challenges** (Adult Mode)
- Party game mode
- 18+ content filtering
- Responsible gaming

### Challenge Features

**Interactive Modals:**
- Full-screen challenge display
- Clear instructions
- Answer buttons (for trivia)
- Completion tracking

**Age Filtering:**
- Kids (6+)
- Teens (13+)
- Adults (18+)

## Accessibility

### Design Principles

**Color-Blind Friendly:**
- Not relying solely on color
- Patterns and labels used
- High contrast options
- Clear visual indicators

**Screen Reader Support:**
- ARIA labels on interactive elements
- Semantic HTML structure
- Keyboard navigation
- Focus indicators

**Responsive Design:**
- Works on all screen sizes
- Touch-friendly controls
- Large tap targets
- Readable text sizes

## Progressive Web App

### PWA Features

**Installation:**
- Add to home screen on mobile
- Standalone app experience
- App icon on device
- Splash screen

**Offline Capabilities:**
- Service worker implementation
- Cached assets
- Offline page
- Background sync

**Performance:**
- Fast load times
- Optimized assets
- Code splitting
- Lazy loading

## Technical Implementation

### Frontend Technologies

**Framework:**
- Next.js 14 with App Router
- React 18
- TypeScript
- Tailwind CSS

**Real-time Communication:**
- Socket.IO Client
- WebSocket connections
- Event-driven architecture
- Auto-reconnection

### Backend Technologies

**Server:**
- Node.js 18+
- Fastify framework
- Socket.IO Server
- TypeScript

**Data Storage:**
- Azure SQL Database
- Azure Cache for Redis
- Session management
- Real-time state sync

## Feature Roadmap

### Planned Features

- [ ] Multi-language support (Spanish, French, German, Dutch)
- [ ] Custom board creation
- [ ] Tournament mode
- [ ] Player statistics and achievements
- [ ] Voice chat integration
- [ ] Spectator mode
- [ ] Replay system
- [ ] Advanced analytics

### Recently Added ✨

- ✅ **Copy to Clipboard** (Nov 2025) - One-tap room code copying
- ✅ **Native Share Dialog** (Nov 2025) - Mobile-friendly code sharing
- ✅ Avatar selection system
- ✅ Board view copy button
- ✅ Enhanced visual feedback

## Browser Compatibility

### Minimum Requirements

**Desktop:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile:**
- iOS Safari 12.2+
- Android Chrome 90+
- Android Firefox 88+

**Features Requiring Modern Browsers:**
- Clipboard API (Copy button)
- Web Share API (Share button)
- WebSocket support
- Service Workers (PWA)

### Feature Detection

The application gracefully handles missing features:
- Share button falls back to copy on unsupported devices
- PWA features degrade gracefully
- WebSocket fallback to polling
- Error messages for critical features

## Security Features

### Anti-Cheat Measures

**Server-Authoritative:**
- All dice rolls validated by server
- Movement verified server-side
- Challenge completion tracked
- Turn order enforced

**Session Security:**
- Unique room codes
- Player ID validation
- Session timeout handling
- Reconnection support

### Privacy

**Data Handling:**
- Minimal data collection
- No persistent user tracking
- Temporary session storage
- GDPR compliant

## Support and Resources

For more information about specific features:
- [User Guide](./User-Guide.md) - How to use all features
- [Architecture](./Architecture.md) - Technical implementation details
- [API Reference](./API-Reference.md) - Developer documentation
- [Troubleshooting](./Troubleshooting.md) - Common issues and solutions

---

**Last updated:** 12-11-2025
