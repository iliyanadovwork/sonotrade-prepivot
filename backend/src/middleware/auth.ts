import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }

    // Attach user to request
    (req as any).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({
        success: false,
        error: 'Token expired',
      });
    }

    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to authenticate and verify admin role.
 * Must be used after or instead of authenticateToken.
 */
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // First run the standard token auth
  return authenticateToken(req, res, async () => {
    const user = (req as any).user;

    if (!user?.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    next();
  });
};

// Alias for convenience
export const auth = authenticateToken;
