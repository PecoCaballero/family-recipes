import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'invalid_token' });
    return;
  }

  try {
    const payload = verifyAccessToken(parts[1]);
    req.userId = payload.sub;
    next();
  } catch (err) {
    const error = err as Error;
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'token_expired' });
      return;
    }
    res.status(401).json({ error: 'invalid_token' });
  }
}
