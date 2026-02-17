import { User as PassportUser } from 'passport';

// Extend Express Request type to include user from JWT
declare global {
  namespace Express {
    interface User extends PassportUser {
      userId?: string;
      email?: string;
    }
  }
}
