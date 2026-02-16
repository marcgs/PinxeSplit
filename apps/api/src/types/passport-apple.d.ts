declare module 'passport-apple' {
  import { Strategy } from 'passport';

  interface AppleStrategyOptions {
    clientID: string;
    teamID: string;
    keyID: string;
    privateKeyString: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback?: boolean;
  }

  interface AppleProfile {
    id: string;
    email: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  }

  type AppleVerifyFunction = (
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: AppleProfile,
    done: (error: any, user?: any) => void
  ) => void;

  class AppleStrategy extends Strategy {
    constructor(options: AppleStrategyOptions, verify: AppleVerifyFunction);
    name: string;
    authenticate(req: any, options?: any): void;
  }

  export = AppleStrategy;
}
