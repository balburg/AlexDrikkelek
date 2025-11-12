'use client';

import { useSocket } from '@/lib/SocketProvider';
import { useState, useEffect } from 'react';
import { GameRoom, SocketEvent, Challenge, Tile, Player } from '@/types/game';
import ChallengeModal from '@/components/ChallengeModal';

export default function PlayerPage() {
  const { socket, isConnected } = useSocket();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<{
    challenge: Challenge;
    playerName: string;
    playerId: string;
  } | null>(null);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!socket) return;

    // Listen for room updates
    socket.on(SocketEvent.ROOM_UPDATED, (room: GameRoom) => {
      setGameRoom(room);
      setMessage('Room updated!');
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

    // Listen for errors
    socket.on('error', (data: { message: string }) => {
      setMessage(`Error: ${data.message}`);
      setIsRolling(false);
    });

    return () => {
      socket.off(SocketEvent.ROOM_UPDATED);
      socket.off(SocketEvent.GAME_STARTED);
      socket.off(SocketEvent.DICE_ROLLED);
      socket.off(SocketEvent.PLAYER_MOVED);
      socket.off(SocketEvent.CHALLENGE_STARTED);
      socket.off(SocketEvent.CHALLENGE_COMPLETED);
      socket.off(SocketEvent.TURN_CHANGED);
      socket.off('error');
    };
  }, [socket, gameRoom]);

  const handleCreateRoom = () => {
    if (!socket || !playerName) return;
    socket.emit(SocketEvent.CREATE_ROOM, { playerName });
  };

  const handleJoinRoom = () => {
    if (!socket || !playerName || !roomCode) return;
    socket.emit(SocketEvent.JOIN_ROOM, { code: roomCode.toUpperCase(), playerName });
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

  const isMyTurn = gameRoom && socket && gameRoom.players[gameRoom.currentTurn]?.id === socket.id;
  const myPlayer = gameRoom && socket ? gameRoom.players.find(p => p.id === socket.id) : null;

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-accent-orange via-accent-yellow to-accent-orange bg-pattern flex items-center justify-center">
        <div className="card-game border-8 border-white">
          <p className="text-2xl font-bold text-primary">Connecting to server...</p>
        </div>
      </main>
    );
  }

  if (!gameRoom) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-accent-orange via-accent-yellow to-accent-orange bg-pattern">
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <div className="text-center mb-8 animate-float">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-2 drop-shadow-2xl">
              🎮 Player Mode 🎮
            </h1>
            <p className="text-xl md:text-2xl font-bold text-white/90 drop-shadow-lg">
              Join the fun or start your own game!
            </p>
          </div>

          <div className="card-game max-w-md w-full border-8 border-white">
            <div className="space-y-6">
              {/* Player Name Input */}
              <div className="space-y-3">
                <label className="block text-center">
                  <span className="text-xl font-bold text-gray-700 mb-2 block">
                    Your Name:
                  </span>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="input-game text-center"
                    maxLength={20}
                  />
                </label>
              </div>

              {/* Create Room Button */}
              <button 
                onClick={handleCreateRoom}
                disabled={!playerName}
                className="w-full btn-primary text-2xl py-6 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-3">
                  <span className="text-3xl group-hover:scale-125 transition-transform">🎲</span>
                  <span>Create New Room</span>
                </span>
              </button>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-4 border-gray-300 rounded"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-6 text-2xl font-black text-gray-500">OR</span>
                </div>
              </div>

              {/* Join Room Section */}
              <div className="space-y-4">
                <label className="block text-center">
                  <span className="text-xl font-bold text-gray-700 mb-3 block">
                    Enter Game PIN:
                  </span>
                  <input
                    type="text"
                    placeholder="ABC123"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="input-game text-center uppercase tracking-widest"
                    maxLength={6}
                  />
                </label>

                <button 
                  onClick={handleJoinRoom}
                  disabled={!playerName || !roomCode}
                  className="w-full btn-secondary text-2xl py-6 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-3xl group-hover:scale-125 transition-transform">🚀</span>
                    <span>Join Room</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <a
            href="/"
            className="mt-8 text-white font-bold text-xl hover:text-accent-yellow transition-colors duration-300 hover:scale-110 transform inline-block"
          >
            ← Back to Home
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-accent-orange via-accent-yellow to-accent-orange bg-pattern">
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        {/* Game Room */}
        <div className="card-game max-w-2xl w-full border-8 border-white space-y-6">
          {/* Room Info */}
          <div className="text-center pb-6 border-b-4 border-gray-200">
            <p className="text-xl font-bold text-gray-600 mb-2">Game PIN</p>
            <p className="text-5xl font-black text-primary tracking-wider">{gameRoom.code}</p>
            <p className="text-lg font-semibold text-gray-500 mt-2">
              Status: {gameRoom.status}
            </p>
          </div>

          {/* Players */}
          <div>
            <h3 className="text-2xl font-black text-primary mb-4 text-center">
              Players ({gameRoom.players.length}/{gameRoom.maxPlayers})
            </h3>
            <div className="space-y-2">
              {gameRoom.players.map((player, index) => (
                <div 
                  key={player.id}
                  className={`p-4 rounded-xl font-bold flex items-center justify-between ${
                    gameRoom.currentTurn === index && gameRoom.status === 'PLAYING'
                      ? 'bg-accent-green text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {player.isHost && '👑'} {player.name}
                  </span>
                  <span>Position: {player.position}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className="bg-accent-blue/20 border-4 border-accent-blue rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-primary">{message}</p>
            </div>
          )}

          {/* Dice Roll Display */}
          {diceRoll && (
            <div className="bg-white border-4 border-accent-orange rounded-xl p-8 text-center animate-bounce">
              <p className="text-7xl mb-2">🎲</p>
              <p className="text-5xl font-black text-primary">{diceRoll}</p>
            </div>
          )}

          {/* Game Controls */}
          {gameRoom.status === 'WAITING' && myPlayer?.isHost && (
            <button
              onClick={handleStartGame}
              disabled={gameRoom.players.length < 2}
              className="w-full btn-primary text-2xl py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Game! 🎮
            </button>
          )}

          {gameRoom.status === 'PLAYING' && isMyTurn && !currentChallenge && !isRolling && !diceRoll && (
            <button
              onClick={handleRollDice}
              className="w-full btn-primary text-3xl py-8 group"
            >
              <span className="flex items-center justify-center gap-3">
                <span className="text-4xl group-hover:scale-125 transition-transform">🎲</span>
                <span>Roll Dice!</span>
              </span>
            </button>
          )}

          {isRolling && (
            <div className="bg-white border-4 border-accent-yellow rounded-xl p-8 text-center">
              <p className="text-3xl font-black text-primary animate-pulse">Rolling...</p>
            </div>
          )}
        </div>
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
    </main>
  );
}
