import { Request } from 'express';
import { UserAttributes } from './models';

declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes;
    }
  }
}

export {};
