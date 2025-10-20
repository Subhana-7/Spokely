import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
dotenv.config();

import User from "../models/user.model";
import container from "./inversify.config";
import { TYPES } from "../types/types";
import { IUserService } from "../services/interfaces/IUserService";

const service = container.get<IUserService>(TYPES.IUserService);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Google profile received:", profile);
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google account missing email"));

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            role: "user",
            isVerified: true,
            profilePicture: profile.photos?.[0]?.value,
            uniqueCode: await service.generateUniqueCode(),
            isGoogleUser: true,
          });
        }

        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  const user = await User.findById(id);
  done(null, user);
});

export default passport;
