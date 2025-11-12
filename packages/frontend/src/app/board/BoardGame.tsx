'use client';

import { useSocket } from '@/lib/SocketProvider';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameRoom, SocketEvent, Player } from '@/types/game';
import Board from '@/components/Board';
import QRCodeDisplay from '@/components/QRCodeDisplay';

export default function BoardGame() {
  const { socket, isConnected } = useSocket();
  const searchParams = useSearchParams();
  const autoJoinCode = searchParams.get('autoJoin');
  const [roomCode, setRoomCode] = useState(autoJoinCode || '');
  const [gameRoom, setGameRoom] = useState<GameRoom | null>(null);
  const [diceRoll, setDiceRoll] = useState<{ 
    playerName: string; 
    value: number; 
    timestamp: number;
  } | null>(null);
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

    // Listen for dice rolls - THIS IS THE KEY FEATURE
    socket.on(SocketEvent.DICE_ROLLED, (data: { playerId: string; playerName: string; diceRoll: number }) => {
      setDiceRoll({
        playerName: data.playerName,
        value: data.diceRoll,
        timestamp: Date.now(),
      });
      setMessage(`${data.playerName} rolled a ${data.diceRoll}!`);
      
      // Clear dice display after 3 seconds
      setTimeout(() => {
        setDiceRoll(null);
      }, 3000);
    });

    // Listen for player movements
    socket.on(SocketEvent.PLAYER_MOVED, (data: { playerId: string; playerName: string; newPosition: number }) => {
      setMessage(`${data.playerName} moved to position ${data.newPosition}!`);
      
      // Update player position in gameRoom
      if (gameRoom) {
        const updatedPlayers = gameRoom.players.map(p => 
          p.id === data.playerId ? { ...p, position: data.newPosition } : p
        );
        setGameRoom({ ...gameRoom, players: updatedPlayers });
      }
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
    });

    return () => {
      socket.off(SocketEvent.ROOM_UPDATED);
      socket.off(SocketEvent.GAME_STARTED);
      socket.off(SocketEvent.DICE_ROLLED);
      socket.off(SocketEvent.PLAYER_MOVED);
      socket.off(SocketEvent.TURN_CHANGED);
      socket.off('error');
    };
  }, [socket, gameRoom]);

  // Auto-join room when autoJoin parameter is present
  useEffect(() => {
    if (socket && isConnected && autoJoinCode && !gameRoom) {
      socket.emit(SocketEvent.JOIN_ROOM, { 
        code: autoJoinCode.toUpperCase(), 
        playerName: '📺 Board Display' 
      });
    }
  }, [socket, isConnected, autoJoinCode, gameRoom]);

  const handleJoinRoom = () => {
    if (!socket || !roomCode) return;
    // Board joins as an observer, using a special board ID
    socket.emit(SocketEvent.JOIN_ROOM, { 
      code: roomCode.toUpperCase(), 
      playerName: '📺 Board Display' 
    });
  };

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-primary-dark bg-pattern flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <p className="text-6xl mb-4">🔄</p>
          <p className="text-3xl font-bold text-primary">Connecting...</p>
        </div>
      </main>
    );
  }

  if (!gameRoom) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-primary-dark bg-pattern">
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          {/* Header */}
          <div className="text-center mb-8 animate-float">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-2 drop-shadow-2xl">
              🎪 Game Board 🎪
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-accent-yellow drop-shadow-lg">
              Enter Game PIN
            </p>
          </div>

          {/* Join Room Card */}
          <div className="card-game max-w-md w-full border-8 border-white">
            <div className="text-center">
              <label className="block">
                <span className="text-2xl font-bold text-gray-700 mb-4 block">
                  Game PIN
                </span>
                <input
                  type="text"
                  placeholder="ABC123"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-8 py-6 text-4xl font-black border-4 border-gray-300 rounded-xl text-center uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-primary focus:border-primary transition-all"
                  maxLength={6}
                />
              </label>

              <button 
                onClick={handleJoinRoom}
                disabled={!roomCode}
                className="w-full mt-6 btn-primary text-3xl py-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
              >
                <span className="block text-5xl mb-2">📺</span>
                Connect to Game
              </button>
            </div>
          </div>

          {/* Back Button */}
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
    <main className="min-h-screen bg-gradient-to-br from-primary via-accent-blue to-primary-dark bg-pattern">
      <div className="flex min-h-screen flex-col p-6">
        {/* Header with Room Code */}
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">
            🎪 Game Board 🎪
          </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            {/* Room Code Display */}
            <div className="bg-gradient-to-r from-accent-yellow via-accent-orange to-accent-yellow p-2 rounded-3xl inline-block">
              <p className="bg-white px-8 py-4 text-5xl md:text-6xl font-black text-primary tracking-wider rounded-2xl shadow-inner">
                {gameRoom.code}
              </p>
            </div>
            
            {/* QR Code Display */}
            <div className="bg-white p-4 rounded-3xl shadow-2xl">
              <p className="text-sm font-bold text-gray-600 mb-2 text-center">Scan to Join</p>
              <QRCodeDisplay roomCode={gameRoom.code} size={150} />
            </div>
          </div>
        </div>

        {/* Dice Roll Display - Large and Prominent */}
        {diceRoll && (
          <div className="mb-8 mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-12 text-center animate-bounce border-8 border-accent-yellow max-w-2xl">
              <p className="text-3xl md:text-4xl font-bold text-gray-600 mb-4">
                {diceRoll.playerName} rolled
              </p>
              <div className="relative">
                <p className="text-9xl md:text-[12rem] mb-2">🎲</p>
                <p className="text-8xl md:text-[10rem] font-black text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {diceRoll.value}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Turn Indicator */}
        {gameRoom.status === 'PLAYING' && (
          <div className="bg-gradient-to-r from-accent-green to-accent-blue rounded-2xl p-6 mb-6 text-center max-w-6xl mx-auto border-8 border-white shadow-2xl">
            <p className="text-2xl md:text-3xl font-bold text-white mb-2">
              🎯 Current Turn
            </p>
            <p className="text-4xl md:text-6xl font-black text-white">
              {gameRoom.players[gameRoom.currentTurn]?.name}
            </p>
          </div>
        )}

        {/* Visual Board - Only show during gameplay */}
        {gameRoom.status === 'PLAYING' && (
          <div className="card-game max-w-6xl mx-auto border-8 border-white mb-6">
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-6 text-center">
              🎲 Game Board
            </h2>
            <Board board={gameRoom.board} players={gameRoom.players} />
          </div>
        )}

        {/* Players Grid */}
        <div className="card-game max-w-6xl mx-auto border-8 border-white">
          <h2 className="text-3xl md:text-4xl font-black text-primary mb-6 text-center">
            👥 Players ({gameRoom.players.filter(p => !p.name.includes('Board Display')).length}/{gameRoom.maxPlayers})
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {gameRoom.players.filter(p => !p.name.includes('Board Display')).map((player, index) => (
              <div 
                key={player.id}
                className={`rounded-2xl p-4 md:p-6 text-center transform transition-all duration-300 shadow-game border-4 ${
                  gameRoom.status === 'PLAYING' && gameRoom.currentTurn === index
                    ? 'bg-gradient-to-br from-accent-yellow to-accent-orange border-white scale-105 animate-pulse'
                    : 'bg-gradient-to-br from-accent-green to-accent-blue border-white'
                }`}
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-inner">
                  <span className="text-3xl md:text-4xl">{player.avatar || '🎮'}</span>
                </div>
                <p className="font-black text-white text-lg md:text-xl break-words">
                  {player.isHost && '👑 '}{player.name}
                </p>
                {gameRoom.status === 'PLAYING' && (
                  <p className="text-sm md:text-base font-bold text-white/90 mt-2">
                    Position: {player.position}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Game Status */}
          <div className="mt-8 text-center">
            {gameRoom.status === 'WAITING' && (
              <div className="bg-accent-yellow rounded-2xl p-6">
                <p className="text-2xl md:text-3xl font-black text-primary">
                  ⏳ Waiting for players to join...
                </p>
              </div>
            )}
            {gameRoom.status === 'PLAYING' && (
              <div className="bg-accent-green rounded-2xl p-6">
                <p className="text-2xl md:text-3xl font-black text-white">
                  🎮 Game in Progress!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className="mt-6 bg-white/90 rounded-2xl p-4 max-w-2xl mx-auto text-center backdrop-blur-sm">
            <p className="text-xl md:text-2xl font-bold text-gray-700">{message}</p>
          </div>
        )}

        {/* Back Button */}
        <a
          href="/"
          className="mt-8 text-white font-bold text-xl hover:text-accent-yellow transition-colors duration-300 hover:scale-110 transform text-center block"
        >
          ← Back to Home
        </a>
      </div>
    </main>
  );
}
