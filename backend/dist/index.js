import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Server } from 'socket.io';
import { config } from './config/env.js';
const fastify = Fastify({
    logger: true,
});
// Register CORS
await fastify.register(cors, {
    origin: config.CORS_ORIGIN || '*',
    credentials: true,
});
// Health check endpoint
fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});
// API routes
fastify.get('/api', async () => {
    return { message: 'AlexDrikkelek API Server', version: '1.0.0' };
});
// Initialize Socket.IO for real-time communication
const io = new Server(fastify.server, {
    cors: {
        origin: config.CORS_ORIGIN || '*',
        credentials: true,
    },
});
io.on('connection', (socket) => {
    fastify.log.info(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        fastify.log.info(`Client disconnected: ${socket.id}`);
    });
});
// Start server
const start = async () => {
    try {
        const port = config.PORT || 3001;
        const host = config.HOST || '0.0.0.0';
        await fastify.listen({ port, host });
        fastify.log.info(`Server listening on ${host}:${port}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map