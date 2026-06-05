import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

      req.user = { id: decoded.userId };
      
      return next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ error: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};
