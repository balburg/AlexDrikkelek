# Casting Feature Documentation

## Overview

The casting feature allows the game host to automatically display the game board on a big screen (TV, monitor, or second display) using the Web Presentation API. This creates a better experience for group gameplay, where all players can see the board on a shared screen while controlling the game from their mobile devices.

## How It Works

### Technology

The implementation uses the **Web Presentation API**, a web standard supported by modern browsers for casting content to secondary displays. This includes:
- Chromecast devices
- Smart TVs with casting support
- Wireless displays (Miracast)
- Second monitors/screens

### User Flow

1. **Host Creates/Joins Game**: The host creates or joins a game room on their mobile device
2. **Cast Button Appears**: A "Cast to TV" button appears in the header (only visible to the host)
3. **Select Display**: When clicked, a browser dialog appears to select a casting device
4. **Automatic Board Display**: The board view automatically opens on the selected display
5. **Auto-Join**: The board automatically connects to the game room using the room code

## Implementation Details

### Components

#### 1. `useCast.ts` Hook
Custom React hook that handles the Presentation API:
- Checks for casting device availability
- Initiates presentation requests
- Manages connection lifecycle
- Handles connection state (connected, closed, terminated)

```typescript
const { isAvailable, isCasting, startCasting, stopCasting } = useCast(roomCode);
```

#### 2. `CastButton.tsx` Component
UI component for the cast button:
- Only renders when casting is available
- Shows appropriate icon (📡 for available, 📺 for active)
- Handles start/stop casting actions
- Only visible to the game host

#### 3. Board Auto-Join
The board page accepts an `autoJoin` URL parameter:
- When present, automatically connects to the specified room
- No manual room code entry required
- Displays as "📺 Board Display" in the player list

### Files Modified

1. **New Files:**
   - `/packages/frontend/src/lib/useCast.ts` - Custom hook for Presentation API
   - `/packages/frontend/src/components/CastButton.tsx` - Cast button component

2. **Modified Files:**
   - `/packages/frontend/src/app/board/BoardGame.tsx` - Added auto-join support
   - `/packages/frontend/src/app/board/page.tsx` - Added Suspense wrapper for Next.js
   - `/packages/frontend/src/app/player/PlayerGame.tsx` - Added Cast button for hosts

## Browser Support

The Presentation API is supported in:
- ✅ Chrome/Chromium (Desktop & Android)
- ✅ Edge (Desktop)
- ✅ Opera (Desktop & Android)
- ⚠️ Safari (Limited support)
- ❌ Firefox (Not supported)

For browsers without Presentation API support, the cast button will not appear.

## Usage Instructions

### For Hosts

1. **Create or join a game** on your mobile device
2. **Look for the Cast button** in the header section (below the Game PIN)
3. **Click "Cast to TV"** to see available casting devices
4. **Select your TV or display** from the list
5. **Board automatically appears** on the selected display
6. **Play the game** normally - the board updates in real-time

### For Players

- Players don't need to do anything special
- They can see their own view on their phones
- The shared board view shows everyone's positions and the current game state

## Troubleshooting

### Cast Button Not Appearing

**Possible causes:**
- Browser doesn't support Presentation API
- No casting devices available on the network
- Not logged in as the host

**Solutions:**
- Use Chrome or Edge browser
- Ensure casting device is on the same WiFi network
- Make sure you're the game host

### Connection Issues

**Possible causes:**
- Network connectivity problems
- Firewall blocking connections
- Incompatible casting device

**Solutions:**
- Check WiFi connection on both devices
- Ensure devices are on same network
- Try restarting the casting device
- Try a different browser

### Board Not Auto-Joining

**Possible causes:**
- Invalid room code
- Room already full
- Connection timeout

**Solutions:**
- Try manually entering the room code on the board view
- Check room status in player view
- Restart the casting session

## Technical Notes

### Security

- Room codes are passed via URL parameters
- Connection uses existing Socket.IO authentication
- No additional credentials required
- Board joins as a special "observer" player

### Performance

- Board view is optimized for large displays
- Real-time updates via WebSocket
- Minimal bandwidth usage
- No video streaming (only data synchronization)

### Limitations

- Only the host can initiate casting
- One cast session per game
- Requires modern browser with Presentation API support
- Requires local network or internet connection

## Future Enhancements

Potential improvements for future versions:

- [ ] Support for multiple simultaneous cast sessions
- [ ] Custom board layout for different screen sizes
- [ ] Picture-in-picture support for player cams
- [ ] Voice chat integration during casting
- [ ] Recording/replay of casted games
- [ ] Custom branding for casted board view

## Related Documentation

- [Architecture Documentation](./ARCHITECTURE.md)
- [Development Roadmap](./wiki/Roadmap.md)
- [API Documentation](./API.md)

## Support

For issues or questions about the casting feature:
1. Check the troubleshooting section above
2. Open an issue on [GitHub](https://github.com/balburg/AlexDrikkelek/issues)
3. Include browser version and device information

---

**Last Updated:** November 12, 2024  
**Feature Status:** ✅ Implemented  
**Supported Browsers:** Chrome, Edge, Opera
