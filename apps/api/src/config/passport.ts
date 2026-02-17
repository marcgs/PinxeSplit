import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import AppleStrategy from 'passport-apple';
import { env } from './env.js';
import { prisma } from './prisma.js';
import { readFileSync } from 'fs';

/**
 * Configure Passport.js with OAuth strategies
 * 
 * Email-based deduplication: If a user signs in with Google and later with Apple
 * using the same email, they will be logged into the same account.
 */

// Google OAuth 2.0 Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/v1/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          const firstName = profile.name?.givenName || '';
          const lastName = profile.name?.familyName || '';
          const name = profile.displayName || email;
          const avatar = profile.photos?.[0]?.value;

          // Find or create user based on email (email-based deduplication)
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            // User exists - update provider info if needed
            if (user.authProvider === 'mock') {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  authProvider: 'google',
                  authProviderId: profile.id,
                },
              });
            }
          } else {
            // Create new user
            user = await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                name,
                avatar,
                authProvider: 'google',
                authProviderId: profile.id,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
}

// Apple Sign-In Strategy
if (
  env.APPLE_CLIENT_ID &&
  env.APPLE_TEAM_ID &&
  env.APPLE_KEY_ID &&
  env.APPLE_PRIVATE_KEY_PATH
) {
  try {
    const privateKey = readFileSync(env.APPLE_PRIVATE_KEY_PATH, 'utf8');

    passport.use(
      new AppleStrategy(
        {
          clientID: env.APPLE_CLIENT_ID,
          teamID: env.APPLE_TEAM_ID,
          keyID: env.APPLE_KEY_ID,
          privateKeyString: privateKey,
          callbackURL: '/api/v1/auth/apple/callback',
          passReqToCallback: false,
        },
        async (_accessToken, _refreshToken, _idToken, profile, done) => {
          try {
            // Extract user info from Apple profile
            const email = profile.email;
            if (!email) {
              return done(new Error('No email found in Apple profile'));
            }

            const firstName = profile.name?.firstName || '';
            const lastName = profile.name?.lastName || '';
            const name = profile.name
              ? `${firstName} ${lastName}`.trim() || email
              : email;

            // Find or create user based on email (email-based deduplication)
            let user = await prisma.user.findUnique({
              where: { email },
            });

            if (user) {
              // User exists - update provider info if needed
              if (user.authProvider === 'mock') {
                user = await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    authProvider: 'apple',
                    authProviderId: profile.sub,
                  },
                });
              }
            } else {
              // Create new user
              user = await prisma.user.create({
                data: {
                  email,
                  firstName,
                  lastName,
                  name,
                  authProvider: 'apple',
                  authProviderId: profile.sub,
                },
              });
            }

            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  } catch (error) {
    console.warn('Failed to configure Apple Sign-In strategy:', error);
  }
}

export default passport;
