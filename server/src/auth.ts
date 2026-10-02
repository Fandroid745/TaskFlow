import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const JWT_EXPIRES_IN = '7d';

type TokenPayload = { userId: string };

declare global {
  namespace Express {
    interface Request { userId?: string; }
  }
}

export function createToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign({ userId }, secret, { expiresIn: JWT_EXPIRES_IN });
}

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const token = request.header('authorization')?.replace('Bearer ', '');
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return response.status(401).json({ message: 'Authentication required' });
  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    if (!mongoose.isValidObjectId(payload.userId)) return response.status(401).json({ message: 'Invalid session' });
    request.userId = payload.userId;
    next();
  } catch {
    return response.status(401).json({ message: 'Invalid or expired session' });
  }
}
