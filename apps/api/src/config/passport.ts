import passport from 'passport';
import { Strategy as GoogleStrategy, type VerifyCallback } from 'passport-google-oauth20';
import AppleStrategy from 'passport-apple';
import { env } from './env.js';
import { prisma } from './prisma.js';
import type { User as PrismaUser } from '@prisma/client';

// Helper to convert Prisma user to Express user
function toExpressUser(prismaUser: PrismaUser): Express.User {
  return {
    userId: prismaUser.id,
    email: prismaUser.email,
  };
}

/**
 * Configure Passport.js strategies for OAuth authentication
 */

// Google OAuth 2.0 Strategy
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: any,
        done: VerifyCallback
      ) => {
        try {
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }
          
          // Find or create user with email-based deduplication
          let user = await prisma.user.findUnique({
            where: { email },
          });
          
          if (user) {
            // User exists - update auth provider if it was different
            if (user.authProvider !== 'google' && user.authProviderId !== profile.id) {
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
            const firstName = profile.name?.givenName || '';
            const lastName = profile.name?.familyName || '';
            const name = profile.displayName || email.split('@')[0];
            
            user = await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                name,
                avatar: profile.photos?.[0]?.value,
                authProvider: 'google',
                authProviderId: profile.id,
              },
            });
          }
          
          return done(null, toExpressUser(user));
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
  env.APPLE_PRIVATE_KEY &&
  env.APPLE_CALLBACK_URL
) {
  passport.use(
    new AppleStrategy(
      {
        clientID: env.APPLE_CLIENT_ID,
        teamID: env.APPLE_TEAM_ID,
        keyID: env.APPLE_KEY_ID,
        privateKeyString: env.APPLE_PRIVATE_KEY,
        callbackURL: env.APPLE_CALLBACK_URL,
        scope: ['email', 'name'],
        passReqToCallback: false,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        _idToken: string,
        profile: any,
        done: any
      ) => {
        try {
          const email = profile.email;
          
          if (!email) {
            return done(new Error('No email found in Apple profile'));
          }
          
          // Find or create user with email-based deduplication
          let user = await prisma.user.findUnique({
            where: { email },
          });
          
          if (user) {
            // User exists - update auth provider if it was different
            if (user.authProvider !== 'apple' && user.authProviderId !== profile.id) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  authProvider: 'apple',
                  authProviderId: profile.id,
                },
              });
            }
          } else {
            // Create new user
            const firstName = profile.name?.firstName || '';
            const lastName = profile.name?.lastName || '';
            const name = firstName && lastName ? `${firstName} ${lastName}` : email.split('@')[0];
            
            user = await prisma.user.create({
              data: {
                email,
                firstName,
                lastName,
                name,
                authProvider: 'apple',
                authProviderId: profile.id,
              },
            });
          }
          
          return done(null, toExpressUser(user));
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

export default passport;

