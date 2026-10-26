import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../db/store.ts';
import { IUser } from '../models/types.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'gowheels_super_secure_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: IUser;
}

export function signToken(user: IUser): string {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token = '';

    // 1. Check Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // 2. Check cookies
    else if (req.cookies && req.cookies.gowheels_token) {
      token = req.cookies.gowheels_token;
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = await dbStore.findUserById(decoded.id);

    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found.' });
      return;
    }

    if (user.accountStatus === 'suspended') {
      res.status(403).json({ success: false, message: 'This account has been suspended. Contact support.' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
}

export async function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.gowheels_token) {
      token = req.cookies.gowheels_token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await dbStore.findUserById(decoded.id);
      if (user && user.accountStatus !== 'suspended') {
        req.user = user;
      }
    }
  } catch {
    // Ignore optional auth failures
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
}

// In-memory IP rate limiter for login/registration
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function authRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxAttempts = 15;

  const current = rateLimitMap.get(ip);
  if (!current || now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    next();
    return;
  }

  if (current.count >= maxAttempts) {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait a minute before trying again.',
    });
    return;
  }

  current.count++;
  next();
}
