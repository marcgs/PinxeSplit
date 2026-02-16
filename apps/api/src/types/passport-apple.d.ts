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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type AppleVerifyFunction = (
    accessToken: string,
    refreshToken: string,
    idToken: string,
    profile: AppleProfile,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done: (error: any, user?: any) => void
  ) => void;

  class AppleStrategy extends Strategy {
    constructor(options: AppleStrategyOptions, verify: AppleVerifyFunction);
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authenticate(req: any, options?: any): void;
  }

  export = AppleStrategy;
}
