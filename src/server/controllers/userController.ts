import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../db/store.ts';
import { AuthRequest } from '../middleware/auth.ts';
import { updateProfileSchema, changePasswordSchema } from '../validators/schemas.ts';

export class UserController {
  public static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    const { passwordHash: _, ...user } = req.user;
    res.json({ success: true, data: user });
  }

  public static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const validated = updateProfileSchema.parse(req.body);
      const updated = await dbStore.updateUser(req.user._id, validated);

      if (!updated) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      const { passwordHash: _, ...safeUser } = updated;
      res.json({ success: true, message: 'Profile updated successfully', data: safeUser });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating profile';
      res.status(400).json({ success: false, message: msg });
    }
  }

  public static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      // Verify current password
      const match = await bcrypt.compare(currentPassword, req.user.passwordHash);
      if (!match) {
        res.status(400).json({ success: false, message: 'Current password is incorrect' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await dbStore.updateUser(req.user._id, { passwordHash: newHash });

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error changing password';
      res.status(400).json({ success: false, message: msg });
    }
  }

  public static async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const notifications = await dbStore.findNotificationsByUserId(req.user._id);
      res.json({ success: true, data: notifications });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching notifications';
      res.status(500).json({ success: false, message: msg });
    }
  }

  public static async markNotificationRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { id } = req.params;
      const success = await dbStore.markNotificationAsRead(id, req.user._id);

      if (!success) {
        res.status(404).json({ success: false, message: 'Notification not found' });
        return;
      }

      res.json({ success: true, message: 'Notification marked as read' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating notification';
      res.status(500).json({ success: false, message: msg });
    }
  }
}
