'use client';

import { useSocket } from '@/lib/SocketProvider';
import { useState, useEffect } from 'react';
import { GameRoom, SocketEvent, Challenge, Tile, Player } from '@/types/game';
import ChallengeModal from '@/components/ChallengeModal';
import CastButton from '@/components/CastButton';
import WinnerCelebration from '@/components/WinnerCelebration';
import { AVATARS, getRandomAvatar } from '@/lib/avatars';

export default function PlayerPage() {
  const { socket, isConnected, playerSessionId, setPlayerSessionId } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(getRandomAvatar());
  const [roomCode, setRoomCode] = useState('');
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<{
    challenge: Challenge;
    playerName: string;
    playerId: string;
  } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState('');
  const [showCopied, setShowCopied] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const handleCopyCode = async () => {
    if (!gameRoom) return;
    try {
      await navigator.clipboard.writeText(gameRoom.code);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareCode = async () => {
    if (!gameRoom) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join my AlexDrikkelek game!',
          text: `Join my game with code: ${gameRoom.code}`,
          url: window.location.origin + '/player',
        });
      } else {
        // Fallback to copy
        handleCopyCode();
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for room updates
    socket.on(SocketEvent.ROOM_UPDATED, (room: GameRoom) => {
      setGameRoom(room);
      setMessage('Room updated!');
      
      // Store playerSessionId when we receive room data
      if (socket.id) {
        const myPlayer = room.players.find(p => p.id === socket.id);
        if (myPlayer && myPlayer.playerSessionId) {
          setPlayerSessionId(myPlayer.playerSessionId);
        }
      }
    });

    // Listen for successful reconnection
    socket.on(SocketEvent.PLAYER_RECONNECTED, (data: any) => {
      if (data.room && data.player) {
        // This is our own reconnection
        setGameRoom(data.room);
        setReconnecting(false);
        setMessage('Reconnected successfully! 🎉');
        console.log('Reconnected to room:', data.room.code);
      } else if (data.playerName) {
        // Another player reconnected
        setMessage(`${data.playerName} reconnected!`);
      }
    });

    // Listen for player disconnections
    socket.on(SocketEvent.PLAYER_DISCONNECTED, (data: { playerName: string; temporary: boolean }) => {
      if (data.temporary) {
        setMessage(`${data.playerName} disconnected (reconnecting...)`);
      } else {
        setMessage(`${data.playerName} left the game`);
      }
    });

    // Listen for game start
    socket.on(SocketEvent.GAME_STARTED, (room: GameRoom) => {
      setGameRoom(room);
      setMessage('Game started! 🎮');
    });

    // Listen for dice rolls
    socket.on(SocketEvent.DICE_ROLLED, (data: { playerId: string; playerName: string; diceRoll: number }) => {
      setDiceRoll(data.diceRoll);
      setIsRolling(false);
      setMessage(`${data.playerName} rolled a ${data.diceRoll}!`);
      
      // Auto-move after rolling
      if (socket && gameRoom) {
        setTimeout(() => {
          socket.emit(SocketEvent.MOVE_PLAYER, {
            roomId: gameRoom.id,
            playerId: data.playerId,
            diceRoll: data.diceRoll,
          });
        }, 1000);
      }
    });

    // Listen for player movements
    socket.on(SocketEvent.PLAYER_MOVED, (data: { playerId: string; playerName: string; newPosition: number; tile: Tile }) => {
      setMessage(`${data.playerName} moved to position ${data.newPosition}!`);
      setDiceRoll(null);
    });

    // Listen for challenge starts
    socket.on(SocketEvent.CHALLENGE_STARTED, (data: { 
      playerId: string; 
      playerName: string; 
      tile: Tile; 
      challenge: Challenge;
    }) => {
      setCurrentChallenge({
        challenge: data.challenge,
        playerName: data.playerName,
        playerId: data.playerId,
      });
      setMessage(`${data.playerName} got a challenge!`);
    });

    // Listen for challenge completion
    socket.on(SocketEvent.CHALLENGE_COMPLETED, (data: { playerId: string; playerName: string; success: boolean }) => {
      setMessage(`${data.playerName} ${data.success ? 'completed' : 'failed'} the challenge!`);
      setCurrentChallenge(null);
    });

    // Listen for turn changes
    socket.on(SocketEvent.TURN_CHANGED, (data: { currentTurn: number; currentPlayer: Player }) => {
      if (gameRoom) {
        setGameRoom({ ...gameRoom, currentTurn: data.currentTurn });
      }
      setMessage(`${data.currentPlayer.name}'s turn!`);
    });

    // Listen for player finishing
    socket.on(SocketEvent.PLAYER_FINISHED, (data: { player: Player; playerId: string; playerName: string }) => {
      setWinner(data.player);
      setMessage(`${data.playerName} finished the game! 🏆`);
    });

    // Listen for game ended (returned to lobby)
    socket.on(SocketEvent.GAME_ENDED, (room: GameRoom) => {
      setGameRoom(room);
      setWinner(null);
      setMessage('Returned to lobby! Ready for a new game 🎮');
    });

    // Listen for errors
    socket.on('error', (data: { message: string }) => {
      setMessage(`Error: ${data.message}`);
      setIsRolling(false);
      setReconnecting(false);
    });

    return () => {
      socket.off(SocketEvent.ROOM_UPDATED);
      socket.off(SocketEvent.PLAYER_RECONNECTED);
      socket.off(SocketEvent.PLAYER_DISCONNECTED);
      socket.off(SocketEvent.GAME_STARTED);
      socket.off(SocketEvent.DICE_ROLLED);
      socket.off(SocketEvent.PLAYER_MOVED);
      socket.off(SocketEvent.CHALLENGE_STARTED);
      socket.off(SocketEvent.CHALLENGE_COMPLETED);
      socket.off(SocketEvent.TURN_CHANGED);
      socket.off(SocketEvent.PLAYER_FINISHED);
      socket.off(SocketEvent.GAME_ENDED);
      socket.off('error');
    };
  }, [socket, gameRoom, setPlayerSessionId]);

  const handleCreateRoom = () => {
    if (!socket || !playerName) return;
    socket.emit(SocketEvent.CREATE_ROOM, { playerName, avatar: selectedAvatar });
  };

  const handleJoinRoom = () => {
    if (!socket || !playerName || !roomCode) return;
    socket.emit(SocketEvent.JOIN_ROOM, { code: roomCode.toUpperCase(), playerName, avatar: selectedAvatar });
  };

  const handleStartGame = () => {
    if (!socket || !gameRoom) return;
    socket.emit(SocketEvent.GAME_STARTED, { roomId: gameRoom.id });
  };

  const handleRollDice = () => {
    if (!socket || !gameRoom || isRolling) return;
    setIsRolling(true);
    socket.emit(SocketEvent.ROLL_DICE, { 
      roomId: gameRoom.id, 
      playerId: socket.id 
    });
  };

  const handleChallengeComplete = (success: boolean, answer?: number) => {
    if (!socket || !gameRoom || !currentChallenge) return;
    
    socket.emit(SocketEvent.CHALLENGE_COMPLETED, {
      roomId: gameRoom.id,
      playerId: currentChallenge.playerId,
      challengeId: currentChallenge.challenge.id,
      success,
      answer,
    });
  };

  const handleFinishGame = () => {
    if (!socket || !gameRoom) return;
    socket.emit(SocketEvent.FINISH_GAME, { roomId: gameRoom.id });
  };

  const isMyTurn = gameRoom && socket && gameRoom.players[gameRoom.currentTurn]?.id === socket.id;
  const myPlayer = gameRoom && socket ? gameRoom.players.find(p => p.id === socket.id) : null;

  if (!isConnected || reconnecting) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-secondary bg-pattern flex items-center justify-center p-4">
        <div className="bg-light-yellow rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <p className="text-3xl mb-4 animate-spin">🔄</p>
          <p className="text-2xl font-bold text-primary">
            {reconnecting ? 'Reconnecting...' : 'Connecting...'}
          </p>
          {reconnecting && (
            <p className="text-sm text-gray-600 mt-2">Restoring your game session...</p>
          )}
        </div>
      </main>
    );
  }

  if (!gameRoom) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-secondary bg-pattern">
        <div className="flex min-h-screen flex-col p-4 max-w-md mx-auto justify-center">
          {/* Simplified Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-white mb-2 drop-shadow-2xl">
              🎮
            </h1>
            <p className="text-2xl font-bold text-white/90 drop-shadow-lg">
              Player Mode
            </p>
          </div>

          <div className="bg-light-yellow rounded-3xl shadow-2xl p-6 space-y-5">
            {/* Avatar Selection */}
            <div>
              <label className="block">
                <span className="text-lg font-bold text-gray-700 mb-3 block text-center">
                  Choose Your Avatar
                </span>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`text-4xl p-3 rounded-xl border-4 transition-all transform hover:scale-110 ${
                        selectedAvatar === avatar
                          ? 'border-primary bg-accent-yellow shadow-lg scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      type="button"
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            {/* Player Name Input */}
            <div>
              <label className="block">
                <span className="text-lg font-bold text-gray-700 mb-2 block text-center">
                  Your Name
                </span>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-6 py-4 text-xl font-bold border-4 border-gray-300 rounded-xl text-center focus:outline-none focus:ring-4 focus:ring-primary focus:border-primary transition-all"
                  maxLength={20}
                />
              </label>
            </div>

            {/* Create Room Button */}
            <button 
              onClick={handleCreateRoom}
              disabled={!playerName}
              className="w-full btn-primary text-2xl py-5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
            >
              <span className="block text-4xl mb-1">🎲</span>
              Create Game
            </button>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-4 border-gray-300 rounded"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-5 text-xl font-black text-gray-500">OR</span>
              </div>
            </div>

            {/* Join Room Section */}
            <div className="space-y-3">
              <label className="block">
                <span className="text-lg font-bold text-gray-700 mb-2 block text-center">
                  Game PIN
                </span>
                <input
                  type="text"
                  placeholder="ABC123"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-6 py-4 text-2xl font-black border-4 border-gray-300 rounded-xl text-center uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-secondary focus:border-secondary transition-all"
                  maxLength={6}
                />
              </label>

              <button 
                onClick={handleJoinRoom}
                disabled={!playerName || !roomCode}
                className="w-full btn-secondary text-2xl py-5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              >
                <span className="block text-4xl mb-1">🚀</span>
                Join Game
              </button>
            </div>
          </div>

          <a
            href="/"
            className="mt-6 text-white font-bold text-lg hover:text-accent-yellow transition-colors text-center block"
          >
            ← Back
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-secondary bg-pattern">
      <div className="flex min-h-screen flex-col p-4 max-w-md mx-auto">
        {/* Compact Header */}
        <div className="bg-light-yellow rounded-2xl shadow-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">Game PIN</p>
              <p className="text-2xl font-black text-primary tracking-wider">{gameRoom.code}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-500 uppercase">Players</p>
              <p className="text-2xl font-black text-primary">{gameRoom.players.length}/{gameRoom.maxPlayers}</p>
            </div>
          </div>
          
          {/* Share and Copy Buttons - Only show for host when waiting */}
          {myPlayer?.isHost && gameRoom.status === 'WAITING' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 bg-accent-blue hover:bg-accent-blue/90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                >
                  {showCopied ? '✓ Copied!' : '📋 Copy Code'}
                </button>
                <button
                  onClick={handleShareCode}
                  className="flex-1 bg-accent-green hover:bg-accent-green/90 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                >
                  📤 Share
                </button>
              </div>
              <CastButton roomCode={gameRoom.code} className="w-full" />
            </div>
          )}
          
          {/* Cast Button only when playing */}
          {myPlayer?.isHost && gameRoom.status !== 'WAITING' && (
            <CastButton roomCode={gameRoom.code} className="w-full" />
          )}
        </div>

        {/* Current Player Indicator - Show who's turn it is */}
        {gameRoom.status === 'PLAYING' && (
          <div className={`rounded-2xl shadow-xl p-6 mb-4 text-center ${
            isMyTurn ? 'bg-accent-green' : 'bg-light-green'
          }`}>
            <p className={`text-lg font-bold mb-1 ${isMyTurn ? 'text-white' : 'text-gray-600'}`}>
              {isMyTurn ? "🎯 Your Turn!" : "⏳ Waiting..."}
            </p>
            <p className={`text-3xl font-black ${isMyTurn ? 'text-white' : 'text-primary'}`}>
              {gameRoom.players[gameRoom.currentTurn]?.name}
            </p>
          </div>
        )}

        {/* Dice Roll Display - Larger for mobile */}
        {diceRoll && (
          <div className="bg-light-yellow rounded-2xl shadow-2xl p-12 mb-4 text-center animate-bounce">
            <p className="text-9xl mb-4">🎲</p>
            <p className="text-6xl font-black text-primary">{diceRoll}</p>
          </div>
        )}

        {/* Main Action Area */}
        <div className="flex-1 flex flex-col justify-center">
          {gameRoom.status === 'WAITING' && myPlayer?.isHost && (
            <div className="space-y-4">
              <button
                onClick={handleStartGame}
                disabled={gameRoom.players.length < 2}
                className="w-full btn-primary text-3xl py-10 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
              >
                <span className="block text-5xl mb-2">🎮</span>
                Start Game!
              </button>
              {gameRoom.players.length < 2 && (
                <div className="bg-light-orange rounded-2xl shadow-xl p-6 text-center">
                  <p className="text-4xl mb-3">👥</p>
                  <p className="text-xl font-bold text-gray-600">
                    Need at least 2 players to start
                  </p>
                  <p className="text-lg font-semibold text-gray-500 mt-2">
                    ({gameRoom.players.length}/2 players)
                  </p>
                </div>
              )}
            </div>
          )}

          {gameRoom.status === 'WAITING' && !myPlayer?.isHost && (
            <div className="bg-light-blue rounded-2xl shadow-xl p-8 text-center">
              <p className="text-5xl mb-4">⏳</p>
              <p className="text-2xl font-bold text-gray-600">Waiting for host to start...</p>
            </div>
          )}

          {gameRoom.status === 'PLAYING' && isMyTurn && !currentChallenge && !isRolling && !diceRoll && (
            <button
              onClick={handleRollDice}
              className="w-full btn-primary text-3xl py-12 rounded-2xl group shadow-2xl"
            >
              <span className="block text-7xl mb-3 group-hover:scale-110 transition-transform">🎲</span>
              <span className="text-4xl font-black">Roll Dice!</span>
            </button>
          )}

          {gameRoom.status === 'PLAYING' && !isMyTurn && !diceRoll && (
            <div className="bg-light-purple rounded-2xl shadow-xl p-10 text-center">
              <p className="text-6xl mb-4 animate-pulse">⏳</p>
              <p className="text-xl font-bold text-gray-600">Wait for your turn</p>
            </div>
          )}

          {isRolling && (
            <div className="bg-light-yellow rounded-2xl shadow-xl p-12 text-center">
              <p className="text-7xl mb-4 animate-spin">🎲</p>
              <p className="text-3xl font-black text-primary animate-pulse">Rolling...</p>
            </div>
          )}
        </div>

        {/* Compact Status Message */}
        {message && gameRoom.status === 'PLAYING' && (
          <div className="bg-white/90 rounded-xl p-3 mt-4 text-center backdrop-blur-sm">
            <p className="text-sm font-bold text-gray-700">{message}</p>
          </div>
        )}

        {/* Player List - Collapsible/Minimal */}
        {gameRoom.status === 'WAITING' && (
          <div className="bg-light-green rounded-2xl shadow-xl p-4 mt-4">
            <p className="text-sm font-bold text-gray-500 mb-3 text-center uppercase">Players</p>
            <div className="space-y-2">
              {gameRoom.players.map((player, index) => (
                <div 
                  key={player.id}
                  className="bg-gray-50 p-3 rounded-xl font-bold text-center flex items-center justify-center gap-2"
                >
                  {player.avatar && <span className="text-2xl">{player.avatar}</span>}
                  <span>{player.isHost && '👑 '}{player.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Challenge Modal */}
      {currentChallenge && currentChallenge.playerId === socket?.id && (
        <ChallengeModal
          challenge={currentChallenge.challenge}
          playerName={currentChallenge.playerName}
          onComplete={handleChallengeComplete}
          onClose={() => setCurrentChallenge(null)}
        />
      )}

      {/* Winner Celebration */}
      {winner && (
        <WinnerCelebration
          winner={winner}
          onFinishGame={handleFinishGame}
        />
      )}
    </main>
  );
}
