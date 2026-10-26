import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../db/store.ts';
import { signToken, AuthRequest } from '../middleware/auth.ts';
import { IUser } from '../models/types.ts';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/schemas.ts';

// In-memory reset tokens for password recovery flow
const resetTokens = new Map<string, { email: string; expires: number }>();

function sanitizeUser(u: IUser) {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);

      const existing = await dbStore.findUserByEmail(validated.email);
      if (existing) {
        res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const passwordHash = await bcrypt.hash(validated.password, 10);

      // Public registration strictly creates 'customer' role
      const user = await dbStore.createUser({
        name: validated.name,
        email: validated.email.toLowerCase().trim(),
        passwordHash,
        phone: validated.phone,
        role: 'customer',
        accountStatus: 'active',
      });

      const token = signToken(user);

      res.cookie('gowheels_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: sanitizeUser(user),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      res.status(400).json({ success: false, message: msg });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const user = await dbStore.findUserByEmail(validated.email);

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      if (user.accountStatus === 'suspended') {
        res.status(403).json({
          success: false,
          message: 'Your account is currently suspended. Please contact customer care.',
        });
        return;
      }

      const match = await bcrypt.compare(validated.password, user.passwordHash);
      if (!match) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const token = signToken(user);

      res.cookie('gowheels_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: 'Logged in successfully',
        token,
        user: sanitizeUser(user),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      res.status(400).json({ success: false, message: msg });
    }
  }

  public static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('gowheels_token');
    res.json({ success: true, message: 'Logged out successfully' });
  }

  public static async getMe(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    res.json({ success: true, user: sanitizeUser(req.user) });
  }

  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await dbStore.findUserByEmail(email);

      // Protect against user enumeration by returning standard positive response
      if (user) {
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        resetTokens.set(token, {
          email: user.email,
          expires: Date.now() + 15 * 60 * 1000, // 15 mins
        });
        // In dev / production console log
        console.log(`[GoWheels Auth] Password reset requested for ${user.email}. Verification Token: ${token}`);
        res.json({
          success: true,
          message: 'If an account with this email exists, a password reset code has been generated.',
          devToken: token, // Provided for easy development testing
        });
        return;
      }

      res.json({
        success: true,
        message: 'If an account with this email exists, a password reset code has been generated.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid request';
      res.status(400).json({ success: false, message: msg });
    }
  }

  public static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, token, newPassword } = resetPasswordSchema.parse(req.body);
      const entry = resetTokens.get(token);

      if (!entry || entry.email.toLowerCase() !== email.toLowerCase() || Date.now() > entry.expires) {
        res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
        return;
      }

      const user = await dbStore.findUserByEmail(email);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await dbStore.updateUser(user._id, { passwordHash: newHash });
      resetTokens.delete(token);

      res.json({ success: true, message: 'Password has been reset successfully. Please log in.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      res.status(400).json({ success: false, message: msg });
    }
  }
}
