import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { SocketEvent, TileType } from './models/types';
import * as gameService from './services/gameService';
import * as challengeService from './services/challengeService';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

async function start() {
  // Register CORS
  await fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  fastify.get('/api/ping', async () => {
    return { message: 'pong' };
  });

  // Start the server
  try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`Server listening on ${HOST}:${PORT}`);

    // Initialize Socket.IO
    const io = new Server(fastify.server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Create Room
      socket.on(SocketEvent.CREATE_ROOM, async (data: { playerName: string; avatar?: string }) => {
        try {
          const room = await gameService.createRoom(socket.id, data.playerName, data.avatar);
          socket.join(room.id);
          socket.emit(SocketEvent.ROOM_UPDATED, room);
          console.log(`Room created: ${room.code}`);
        } catch (error) {
          socket.emit('error', { message: 'Failed to create room' });
        }
      });

      // Join Room
      socket.on(SocketEvent.JOIN_ROOM, async (data: { code: string; playerName: string; avatar?: string }) => {
        try {
          const room = await gameService.getRoomByCode(data.code.toUpperCase());
          if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }

          await gameService.addPlayerToRoom(room.id, socket.id, data.playerName, data.avatar);
          const updatedRoom = await gameService.getRoom(room.id);
          
          socket.join(room.id);
          io.to(room.id).emit(SocketEvent.ROOM_UPDATED, updatedRoom);
          console.log(`Player ${data.playerName} joined room ${room.code}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to join room';
          socket.emit('error', { message });
        }
      });

      // Start Game
      socket.on(SocketEvent.GAME_STARTED, async (data: { roomId: string }) => {
        try {
          const room = await gameService.startGame(data.roomId);
          if (room) {
            io.to(room.id).emit(SocketEvent.GAME_STARTED, room);
            io.to(room.id).emit(SocketEvent.TURN_CHANGED, {
              currentTurn: room.currentTurn,
              currentPlayer: room.players[room.currentTurn],
            });
            console.log(`Game started in room ${room.code}`);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to start game';
          socket.emit('error', { message });
        }
      });

      // Roll Dice
      socket.on(SocketEvent.ROLL_DICE, async (data: { roomId: string; playerId: string }) => {
        try {
          const room = await gameService.getRoom(data.roomId);
          if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }

          // Validate it's the player's turn
          const currentPlayer = room.players[room.currentTurn];
          if (currentPlayer.id !== data.playerId) {
            socket.emit('error', { message: 'Not your turn' });
            return;
          }

          // Roll the dice (1-6)
          const diceRoll = Math.floor(Math.random() * 6) + 1;
          
          // Broadcast dice roll to all players in the room
          io.to(data.roomId).emit(SocketEvent.DICE_ROLLED, {
            playerId: data.playerId,
            playerName: currentPlayer.name,
            diceRoll,
          });

          console.log(`Player ${currentPlayer.name} rolled a ${diceRoll}`);
        } catch (error) {
          socket.emit('error', { message: 'Failed to roll dice' });
        }
      });

      // Move Player
      socket.on(SocketEvent.MOVE_PLAYER, async (data: { roomId: string; playerId: string; diceRoll: number }) => {
        try {
          const { room, tile } = await gameService.movePlayer(
            data.roomId,
            data.playerId,
            data.diceRoll
          );

          const player = room.players.find(p => p.id === data.playerId);
          
          // Broadcast player movement
          io.to(data.roomId).emit(SocketEvent.PLAYER_MOVED, {
            playerId: data.playerId,
            playerName: player?.name,
            newPosition: player?.position,
            tile,
          });

          // Check if player landed on a special tile and trigger challenge
          if (tile && (tile.type === TileType.CHALLENGE || tile.type === TileType.BONUS || tile.type === TileType.PENALTY)) {
            // Get a random challenge based on tile type
            const challenge = challengeService.getRandomChallenge();
            
            io.to(data.roomId).emit(SocketEvent.CHALLENGE_STARTED, {
              playerId: data.playerId,
              playerName: player?.name,
              tile,
              challenge,
            });

            console.log(`Challenge started for player ${player?.name} on ${tile.type} tile`);
          } else {
            // No challenge, move to next turn
            const updatedRoom = await gameService.nextTurn(data.roomId);
            if (updatedRoom) {
              io.to(data.roomId).emit(SocketEvent.TURN_CHANGED, {
                currentTurn: updatedRoom.currentTurn,
                currentPlayer: updatedRoom.players[updatedRoom.currentTurn],
              });
            }
          }

          console.log(`Player ${player?.name} moved to position ${player?.position}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to move player';
          socket.emit('error', { message });
        }
      });

      // Challenge Completed
      socket.on(SocketEvent.CHALLENGE_COMPLETED, async (data: { 
        roomId: string; 
        playerId: string; 
        challengeId: string;
        success: boolean;
        answer?: number;
      }) => {
        try {
          const room = await gameService.getRoom(data.roomId);
          if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }

          const player = room.players.find(p => p.id === data.playerId);
          
          // Validate trivia answer if provided
          let isCorrect = data.success;
          if (data.answer !== undefined) {
            isCorrect = challengeService.validateTriviaAnswer(data.challengeId, data.answer);
          }

          // Broadcast challenge result
          io.to(data.roomId).emit(SocketEvent.CHALLENGE_COMPLETED, {
            playerId: data.playerId,
            playerName: player?.name,
            success: isCorrect,
          });

          // Move to next turn
          const updatedRoom = await gameService.nextTurn(data.roomId);
          if (updatedRoom) {
            io.to(data.roomId).emit(SocketEvent.TURN_CHANGED, {
              currentTurn: updatedRoom.currentTurn,
              currentPlayer: updatedRoom.players[updatedRoom.currentTurn],
            });
          }

          console.log(`Challenge ${isCorrect ? 'completed' : 'failed'} by player ${player?.name}`);
        } catch (error) {
          socket.emit('error', { message: 'Failed to complete challenge' });
        }
      });

      socket.on('disconnect', async () => {
        console.log('Client disconnected:', socket.id);
        
        // Find all rooms this socket is in
        const rooms = Array.from(socket.rooms);
        
        for (const roomId of rooms) {
          // Skip the default socket room (same as socket.id)
          if (roomId === socket.id) continue;
          
          try {
            const room = await gameService.getRoom(roomId);
            if (!room) continue;
            
            const disconnectedPlayer = room.players.find(p => p.id === socket.id);
            if (!disconnectedPlayer) continue;
            
            const wasHost = disconnectedPlayer.isHost;
            const playerName = disconnectedPlayer.name;
            
            // Remove the player from the room
            const updatedRoom = await gameService.removePlayer(roomId, socket.id);
            
            if (updatedRoom && updatedRoom.players.length > 0) {
              // Notify remaining players
              io.to(roomId).emit(SocketEvent.PLAYER_DISCONNECTED, {
                playerId: socket.id,
                playerName,
              });
              
              // If host was removed and a new host was promoted, notify everyone
              if (wasHost) {
                const newHost = updatedRoom.players.find(p => p.isHost);
                io.to(roomId).emit(SocketEvent.HOST_CHANGED, {
                  newHostId: newHost?.id,
                  newHostName: newHost?.name,
                });
                console.log(`Host disconnected from room ${updatedRoom.code}. New host: ${newHost?.name}`);
              }
              
              // Broadcast updated room state
              io.to(roomId).emit(SocketEvent.ROOM_UPDATED, updatedRoom);
              
              console.log(`Player ${playerName} removed from room ${updatedRoom.code}`);
            }
          } catch (error) {
            console.error(`Error handling disconnect for room ${roomId}:`, error);
          }
        }
      });
    });

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
