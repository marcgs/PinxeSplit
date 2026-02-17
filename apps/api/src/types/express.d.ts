import { User as PassportUser } from 'passport';

// Extend Express Request type to include user from JWT or OAuth
declare global {
  namespace Express {
    // The User interface extends PassportUser and defines optional properties
    // to be compatible with Passport's authentication flow.
    // In practice, authGuard ensures these are always set when present.
    interface User extends PassportUser {
      userId?: string;
      email?: string;
    }
  }
}

export {};
