import jwt, { type SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';

export interface JwtPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

/**
 * Generate an access token (15 minutes TTL)
 */
export function generateAccessToken(userId: string, email: string): string {
  const payload: JwtPayload = {
    userId,
    email,
    type: 'access',
  };

  const options: SignOptions = {
    // Type cast needed because env.JWT_ACCESS_TOKEN_EXPIRES_IN is string but needs StringValue type
    // StringValue is from 'ms' package and accepts time strings like '15m', '7d', etc.
    expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN as StringValue,
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Generate a refresh token (7 days TTL) and store it in the database
 */
export async function generateRefreshToken(userId: string, email: string): Promise<string> {
  const payload: JwtPayload = {
    userId,
    email,
    type: 'refresh',
  };

  const options: SignOptions = {
    // Type cast needed because env.JWT_REFRESH_TOKEN_EXPIRES_IN is string but needs StringValue type
    // StringValue is from 'ms' package and accepts time strings like '15m', '7d', etc.
    expiresIn: env.JWT_REFRESH_TOKEN_EXPIRES_IN as StringValue,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, options);

  // Calculate expiration date (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Verify and decode a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    // Check if token exists in database and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });
    
    if (!storedToken) {
      throw new Error('Token not found');
    }
    
    if (storedToken.revokedAt) {
      throw new Error('Token has been revoked');
    }
    
    if (storedToken.expiresAt < new Date()) {
      throw new Error('Token expired');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Revoke a refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revoke all refresh tokens for a user
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Clean up expired tokens from the database
 */
export async function cleanupExpiredTokens(): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}
