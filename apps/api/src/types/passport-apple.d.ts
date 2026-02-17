declare module 'passport-apple' {
  import { Strategy as PassportStrategy } from 'passport';

  export interface AppleStrategyOptions {
    clientID: string;
    teamID: string;
    keyID: string;
    privateKeyString: string;
    callbackURL: string;
    passReqToCallback?: boolean;
  }

  export interface AppleProfile {
    sub: string;
    email?: string;
    email_verified?: boolean;
    is_private_email?: boolean;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  }

  type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: AppleProfile,
    done: (error: any, user?: any) => void
  ) => void;

  export default class AppleStrategy extends PassportStrategy {
    constructor(options: AppleStrategyOptions, verify: VerifyFunction);
    name: string;
    authenticate(req: any, options?: any): void;
  }
}
