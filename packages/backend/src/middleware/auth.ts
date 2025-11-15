import { FastifyRequest, FastifyReply } from 'fastify';

// Hardcoded credentials for now
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

export interface AuthenticatedRequest extends FastifyRequest {
  isAuthenticated?: boolean;
}

/**
 * Simple authentication middleware for admin routes
 * This is a basic implementation with hardcoded credentials
 * In production, this should use proper authentication (JWT, sessions, etc.)
 */
export async function authMiddleware(request: AuthenticatedRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    reply.code(401).send({ error: 'Authentication required' });
    return;
  }

  try {
    // Decode Base64 credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    // Verify credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      request.isAuthenticated = true;
      return;
    }

    reply.code(401).send({ error: 'Invalid credentials' });
  } catch (error) {
    reply.code(401).send({ error: 'Invalid authorization header' });
  }
}

/**
 * Verify credentials without using middleware (for login endpoint)
 */
export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
