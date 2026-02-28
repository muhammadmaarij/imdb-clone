import { Request } from 'express';
import { UserWithoutPassword } from './models';

declare global {
  namespace Express {
    interface Request {
      user?: UserWithoutPassword;
    }
  }
}

export {};
