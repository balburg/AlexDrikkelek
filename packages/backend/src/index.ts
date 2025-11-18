import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { SocketEvent, TileType, ChallengeType, GameSettings, StyleTheme, CustomSpaceType, Challenge, RoomStatus } from './models/types';
import * as gameService from './services/gameService';
import * as challengeService from './services/challengeService';
import * as challengeVotingService from './services/challengeVotingService';
import * as settingsService from './services/settingsService';
import * as stylePackService from './services/stylePackService';
import * as customSpaceService from './services/customSpaceService';
import * as gameStatsService from './services/gameStatsService';
import * as databaseStatusService from './services/databaseStatusService';
import { authMiddleware, verifyCredentials } from './middleware/auth';

// Load .env from the backend package directory
dotenv.config({ path: path.join(__dirname, '../.env') });

/**
 * AlexDrikkelek Backend Server
 * 
 * AUTHENTICATION: Intentionally disabled - the game operates with anonymous access.
 * Players join with just a name and avatar. No login or user accounts required.
 * This design choice prioritizes ease of use and privacy.
 */

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

  // Health check endpoint with monitoring
  fastify.get('/health', async () => {
    const rooms = await gameService.getAllRooms();
    const activeRooms = rooms.filter(room => 
      room.status === RoomStatus.PLAYING || room.status === RoomStatus.WAITING
    );
    const totalPlayers = rooms.reduce((sum, room) => sum + room.players.length, 0);
    const connectedPlayers = rooms.reduce((sum, room) => 
      sum + room.players.filter(p => p.isConnected).length, 0);
    
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      stats: {
        totalRooms: rooms.length,
        activeRooms: activeRooms.length,
        totalPlayers,
        connectedPlayers,
      }
    };
  });

  // API routes
  fastify.get('/api/ping', async () => {
    return { message: 'pong' };
  });

  // Admin login route (no auth required)
  fastify.post('/api/admin/login', async (request, reply) => {
    try {
      const { username, password } = request.body as { username: string; password: string };
      
      if (!username || !password) {
        reply.code(400).send({ error: 'Username and password required' });
        return;
      }

      if (verifyCredentials(username, password)) {
        // Create a simple session token (in production, use JWT)
        const token = Buffer.from(`${username}:${password}`).toString('base64');
        reply.send({ success: true, token });
      } else {
        reply.code(401).send({ error: 'Invalid credentials' });
      }
    } catch (error) {
      reply.code(500).send({ error: 'Login failed' });
    }
  });

  // Settings routes (Admin - Protected)
  fastify.get('/api/admin/settings', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const settings = await settingsService.getSettings();
      reply.type('application/json');
      return settings;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get settings' });
    }
  });

  fastify.put('/api/admin/settings', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const updates = request.body as Partial<GameSettings>;
      const settings = await settingsService.updateSettings(updates);
      reply.type('application/json');
      return settings;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  fastify.post('/api/admin/settings/reset', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const settings = await settingsService.resetSettings();
      reply.type('application/json');
      return settings;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to reset settings' });
    }
  });

  // Style Pack routes (Admin)
  fastify.get('/api/admin/style-packs', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const packs = await stylePackService.getAllStylePacks();
      reply.type('application/json');
      return packs;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get style packs' });
    }
  });

  fastify.get('/api/admin/style-packs/active', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const pack = await stylePackService.getActiveStylePack();
      reply.type('application/json');
      return pack;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get active style pack' });
    }
  });

  fastify.get('/api/admin/style-packs/:id', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const pack = await stylePackService.getStylePackById(id);
      if (!pack) {
        reply.code(404).type('application/json').send({ error: 'Style pack not found' });
        return;
      }
      reply.type('application/json');
      return pack;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get style pack' });
    }
  });

  fastify.post('/api/admin/style-packs', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { name, description, theme, previewImage } = request.body as {
        name: string;
        description: string;
        theme: StyleTheme;
        previewImage?: string;
      };
      const pack = await stylePackService.createStylePack(name, description, theme, previewImage);
      reply.code(201).type('application/json');
      return pack;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create style pack';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  fastify.put('/api/admin/style-packs/:id', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updates = request.body as Partial<{ name: string; description: string; theme: StyleTheme; previewImage: string }>;
      const pack = await stylePackService.updateStylePack(id, updates);
      reply.type('application/json');
      return pack;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update style pack';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  fastify.post('/api/admin/style-packs/:id/activate', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const pack = await stylePackService.activateStylePack(id);
      reply.type('application/json');
      return pack;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to activate style pack';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  fastify.delete('/api/admin/style-packs/:id', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await stylePackService.deleteStylePack(id);
      reply.code(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete style pack';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  // Public route to get active theme
  fastify.get('/api/theme', async (request, reply) => {
    try {
      const pack = await stylePackService.getActiveStylePack();
      reply.type('application/json');
      return { theme: pack.theme, name: pack.name };
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get theme' });
    }
  });

  // Custom Space Pack routes (Admin)
  fastify.get('/api/admin/custom-space-packs', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const packs = await customSpaceService.getAllPacks();
      reply.type('application/json');
      return packs;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get custom space packs' });
    }
  });

  fastify.get('/api/admin/custom-space-packs/active', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const packs = await customSpaceService.getActivePacks();
      reply.type('application/json');
      return packs;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get active custom space packs' });
    }
  });

  fastify.get('/api/admin/custom-space-packs/:id', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const pack = await customSpaceService.getPackById(id);
      if (!pack) {
        reply.code(404).type('application/json').send({ error: 'Custom space pack not found' });
        return;
      }
      reply.type('application/json');
      return pack;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get custom space pack' });
    }
  });

  fastify.post('/api/admin/custom-space-packs', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { name, description, isActive } = request.body as {
        name: string;
        description: string;
        isActive?: boolean;
      };
      const pack = await customSpaceService.createPack(name, description, isActive);
      reply.code(201).type('application/json');
      return pack;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create custom space pack';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  fastify.put('/api/admin/custom-space-packs/:id', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updates = request.body as Partial<{ name: string; description: string; isActive: boolean }>;
      const pack = await customSpaceService.updatePack(id, updates);
      reply.type('application/json');
      return pack;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update custom space pack';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  fastify.post('/api/admin/custom-space-packs/:id/toggle', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { isActive } = request.body as { isActive: boolean };
      const pack = await customSpaceService.togglePackActivation(id, isActive);
      reply.type('application/json');
      return pack;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle custom space pack activation';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  fastify.delete('/api/admin/custom-space-packs/:id', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await customSpaceService.deletePack(id);
      reply.code(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete custom space pack';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  // Custom Space routes (Admin)
  fastify.post('/api/admin/custom-space-packs/:packId/spaces', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { packId } = request.params as { packId: string };
      const { name, description, type, logoUrl, backgroundUrl, imageUrl, backgroundColor, textColor } = request.body as {
        name: string;
        description: string;
        type: CustomSpaceType;
        logoUrl?: string;
        backgroundUrl?: string;
        imageUrl?: string;
        backgroundColor?: string;
        textColor?: string;
      };
      const space = await customSpaceService.createSpace(packId, name, description, type, {
        logoUrl,
        backgroundUrl,
        imageUrl,
        backgroundColor,
        textColor,
      });
      reply.code(201).type('application/json');
      return space;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create custom space';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  fastify.put('/api/admin/custom-spaces/:id', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updates = request.body as Partial<{
        name: string;
        description: string;
        type: CustomSpaceType;
        logoUrl: string;
        backgroundUrl: string;
        imageUrl: string;
        backgroundColor: string;
        textColor: string;
      }>;
      const space = await customSpaceService.updateSpace(id, updates);
      reply.type('application/json');
      return space;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update custom space';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  fastify.delete('/api/admin/custom-spaces/:id', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await customSpaceService.deleteSpace(id);
      reply.code(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete custom space';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  // Public route to get active custom spaces
  fastify.get('/api/custom-spaces/active', async (request, reply) => {
    try {
      const spaces = await customSpaceService.getActiveSpaces();
      reply.type('application/json');
      return spaces;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get active custom spaces' });
    }
  });

  // Challenges routes (Admin - Protected)
  fastify.get('/api/admin/challenges', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const challenges = await challengeService.getAllChallenges();
      reply.type('application/json');
      return challenges;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get challenges' });
    }
  });

  fastify.post('/api/admin/challenges', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const challengeData = request.body as Omit<Challenge, 'id'>;
      const challenge = await challengeService.createChallenge(challengeData);
      reply.code(201).type('application/json');
      return challenge;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create challenge';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  fastify.put('/api/admin/challenges/:id', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updates = request.body as Partial<Omit<Challenge, 'id'>>;
      const challenge = await challengeService.updateChallenge(id, updates);
      if (!challenge) {
        reply.code(404).type('application/json').send({ error: 'Challenge not found' });
        return;
      }
      reply.type('application/json');
      return challenge;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update challenge';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  fastify.delete('/api/admin/challenges/:id', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const success = await challengeService.deleteChallenge(id);
      if (!success) {
        reply.code(404).type('application/json').send({ error: 'Challenge not found' });
        return;
      }
      reply.code(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete challenge';
      reply.code(400).type('application/json').send({ error: message });
    }
  });

  // Game Statistics routes (Admin - Protected)
  fastify.get('/api/admin/statistics', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const stats = await gameStatsService.getGameStatistics();
      reply.type('application/json');
      return stats;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get game statistics' });
    }
  });

  // Database Status route (Admin - Protected)
  fastify.get('/api/admin/database-status', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const status = await databaseStatusService.getDatabaseStatus();
      reply.type('application/json');
      return status;
    } catch (error) {
      reply.code(500).type('application/json').send({ error: 'Failed to get database status' });
    }
  });

  // Board Generation Testing route (Admin - Protected)
  fastify.post('/api/admin/generate-board', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const { seed, boardSize } = request.body as { seed?: string; boardSize?: number };
      
      // Use provided seed or generate random one
      const finalSeed = seed || `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const finalSize = boardSize && boardSize >= 20 && boardSize <= 100 ? boardSize : 50;
      
      const board = await gameService.generateBoard(finalSeed, finalSize);
      reply.type('application/json');
      return board;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate board';
      reply.code(500).type('application/json').send({ error: message });
    }
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

      // Reconnect Player
      socket.on(SocketEvent.RECONNECT, async (data: { playerSessionId: string }) => {
        try {
          const result = await gameService.reconnectPlayer(data.playerSessionId, socket.id);
          
          if (!result) {
            socket.emit('error', { message: 'Session not found or expired' });
            return;
          }

          const { room, player } = result;
          
          // Join the room
          socket.join(room.id);
          
          // Notify the player of successful reconnection
          socket.emit(SocketEvent.PLAYER_RECONNECTED, {
            room,
            player,
            playerSessionId: data.playerSessionId,
          });
          
          // Notify other players in the room
          socket.to(room.id).emit(SocketEvent.PLAYER_RECONNECTED, {
            playerId: socket.id,
            playerSessionId: player.playerSessionId,
            playerName: player.name,
          });
          
          // Broadcast updated room state
          io.to(room.id).emit(SocketEvent.ROOM_UPDATED, room);
          
          console.log(`Player ${player.name} reconnected to room ${room.code}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to reconnect';
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

          // Check if player reached the finish
          if (tile && tile.type === TileType.FINISH) {
            // Player finished the game!
            io.to(data.roomId).emit(SocketEvent.PLAYER_FINISHED, {
              player,
              playerId: data.playerId,
              playerName: player?.name,
            });
            console.log(`Player ${player?.name} finished the game!`);
          }
          // Check if player landed on a special tile and trigger challenge
          else if (tile && (tile.type === TileType.CHALLENGE || tile.type === TileType.BONUS || tile.type === TileType.PENALTY)) {
            // Get a random challenge based on tile type
            // CHALLENGE tiles can be any type (ACTION, DARE, DRINKING, etc.) - they require voting
            let challengeType;
            if (tile.type === TileType.CHALLENGE) {
              // For CHALLENGE tiles, use random challenge type
              challengeType = undefined;
            }
            const challenge = await challengeService.getRandomChallenge(challengeType);
            
            io.to(data.roomId).emit(SocketEvent.CHALLENGE_STARTED, {
              playerId: data.playerId,
              playerName: player?.name,
              tile,
              challenge,
            });

            // Start voting session for ACTION, DARE, and DRINKING challenges
            if (challenge.type === ChallengeType.ACTION || 
                challenge.type === ChallengeType.DARE || 
                challenge.type === ChallengeType.DRINKING) {
              // Get number of other players (exclude the challenging player)
              const otherPlayers = room.players.filter(p => p.id !== data.playerId && p.isConnected);
              
              if (otherPlayers.length > 0) {
                // Create voting session
                await challengeVotingService.createVotingSession(
                  data.roomId,
                  data.playerId,
                  player?.name || 'Unknown',
                  challenge.id,
                  otherPlayers.length
                );

                // Notify players to vote
                io.to(data.roomId).emit(SocketEvent.CHALLENGE_VOTE_STARTED, {
                  challengingPlayerId: data.playerId,
                  challengingPlayerName: player?.name,
                  challengeId: challenge.id,
                  totalVoters: otherPlayers.length,
                });

                console.log(`Voting started for ${player?.name}'s ${challenge.type} challenge`);
              }
            }

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
            isCorrect = await challengeService.validateTriviaAnswer(data.challengeId, data.answer);
          }

          // Broadcast challenge result
          io.to(data.roomId).emit(SocketEvent.CHALLENGE_COMPLETED, {
            playerId: data.playerId,
            playerName: player?.name,
            success: isCorrect,
          });

          // Move to next turn only if answer is incorrect
          if (!isCorrect) {
            const updatedRoom = await gameService.nextTurn(data.roomId);
            if (updatedRoom) {
              io.to(data.roomId).emit(SocketEvent.TURN_CHANGED, {
                currentTurn: updatedRoom.currentTurn,
                currentPlayer: updatedRoom.players[updatedRoom.currentTurn],
              });
            }
          }

          console.log(`Challenge ${isCorrect ? 'completed' : 'failed'} by player ${player?.name}`);
        } catch (error) {
          socket.emit('error', { message: 'Failed to complete challenge' });
        }
      });

      // Cast Vote for Challenge
      socket.on(SocketEvent.CHALLENGE_VOTE_CAST, async (data: { 
        roomId: string; 
        playerId: string; 
        vote: boolean; // true for "Yes", false for "No"
      }) => {
        try {
          const session = await challengeVotingService.castVote(data.roomId, data.playerId, data.vote);
          
          if (!session) {
            socket.emit('error', { message: 'Voting session not found' });
            return;
          }

          // Broadcast vote count update
          io.to(data.roomId).emit(SocketEvent.CHALLENGE_VOTE_CAST, {
            votesReceived: session.votes.length,
            totalVoters: session.totalVoters,
          });

          console.log(`Vote cast: ${session.votes.length}/${session.totalVoters}`);

          // Check if voting is complete
          if (challengeVotingService.isVotingComplete(session)) {
            const voteResult = challengeVotingService.calculateVoteResult(session);
            
            // Get room to apply penalties if needed
            const room = await gameService.getRoom(data.roomId);
            if (!room) {
              socket.emit('error', { message: 'Room not found' });
              return;
            }

            const challengingPlayer = room.players.find(p => p.id === session.challengingPlayerId);

            // If vote failed, penalize the player with 2 turns to skip
            if (!voteResult && challengingPlayer) {
              challengingPlayer.turnsToSkip = 2;
              await gameService.updateRoom(room);
            }

            // Broadcast vote result
            io.to(data.roomId).emit(SocketEvent.CHALLENGE_VOTE_COMPLETED, {
              challengingPlayerId: session.challengingPlayerId,
              challengingPlayerName: session.challengingPlayerName,
              success: voteResult,
              yesVotes: session.votes.filter(v => v.vote).length,
              noVotes: session.votes.filter(v => !v.vote).length,
              penalized: !voteResult,
            });

            // Also broadcast as challenge completed for consistency
            io.to(data.roomId).emit(SocketEvent.CHALLENGE_COMPLETED, {
              playerId: session.challengingPlayerId,
              playerName: session.challengingPlayerName,
              success: voteResult,
            });

            // Clean up voting session
            await challengeVotingService.deleteVotingSession(data.roomId);

            // Move to next turn
            const updatedRoom = await gameService.nextTurn(data.roomId);
            if (updatedRoom) {
              io.to(data.roomId).emit(SocketEvent.TURN_CHANGED, {
                currentTurn: updatedRoom.currentTurn,
                currentPlayer: updatedRoom.players[updatedRoom.currentTurn],
              });
            }

            console.log(`Voting completed for ${session.challengingPlayerName}: ${voteResult ? 'Success' : 'Failed'}`);
          }
        } catch (error) {
          console.error('Error casting vote:', error);
          socket.emit('error', { message: 'Failed to cast vote' });
        }
      });

      // Finish Game - reset to lobby
      socket.on(SocketEvent.FINISH_GAME, async (data: { roomId: string }) => {
        try {
          const room = await gameService.finishGame(data.roomId);
          if (room) {
            // Broadcast game ended and room updated to all players
            io.to(data.roomId).emit(SocketEvent.GAME_ENDED, room);
            io.to(data.roomId).emit(SocketEvent.ROOM_UPDATED, room);
            console.log(`Game finished in room ${room.code}, returned to lobby`);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to finish game';
          socket.emit('error', { message });
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
            
            const playerName = disconnectedPlayer.name;
            const playerSessionId = disconnectedPlayer.playerSessionId;
            
            // Mark player as disconnected instead of removing them
            const updatedRoom = await gameService.markPlayerDisconnected(roomId, socket.id);
            
            if (updatedRoom && updatedRoom.players.length > 0) {
              // Notify remaining players that player disconnected
              io.to(roomId).emit(SocketEvent.PLAYER_DISCONNECTED, {
                playerId: socket.id,
                playerSessionId,
                playerName,
                temporary: true, // Indicate this might be temporary
              });
              
              // Broadcast updated room state
              io.to(roomId).emit(SocketEvent.ROOM_UPDATED, updatedRoom);
              
              console.log(`Player ${playerName} marked as disconnected in room ${updatedRoom.code}`);
              
              // Set a timeout to remove player permanently if they don't reconnect
              setTimeout(async () => {
                try {
                  const currentRoom = await gameService.getRoom(roomId);
                  if (!currentRoom) return;
                  
                  const player = currentRoom.players.find(p => p.playerSessionId === playerSessionId);
                  // Only remove if still disconnected after timeout period
                  if (player && !player.isConnected) {
                    const wasHost = player.isHost;
                    const finalRoom = await gameService.removePlayer(roomId, player.id);
                    
                    if (finalRoom && finalRoom.players.length > 0) {
                      // Notify that player was permanently removed
                      io.to(roomId).emit(SocketEvent.PLAYER_DISCONNECTED, {
                        playerId: player.id,
                        playerSessionId,
                        playerName,
                        temporary: false, // Permanent removal
                      });
                      
                      // If host was removed, notify about new host
                      if (wasHost) {
                        const newHost = finalRoom.players.find(p => p.isHost);
                        io.to(roomId).emit(SocketEvent.HOST_CHANGED, {
                          newHostId: newHost?.id,
                          newHostName: newHost?.name,
                        });
                        console.log(`Host permanently removed from room ${finalRoom.code}. New host: ${newHost?.name}`);
                      }
                      
                      io.to(roomId).emit(SocketEvent.ROOM_UPDATED, finalRoom);
                      console.log(`Player ${playerName} permanently removed from room ${finalRoom.code} after timeout`);
                    }
                  }
                } catch (error) {
                  console.error(`Error in delayed player removal for room ${roomId}:`, error);
                }
              }, 60000); // 60 second grace period for reconnection
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
