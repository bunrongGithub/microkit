import type passport from "passport";
import type { Request } from "express";

import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";


import { BaseSocialAuth } from "./base";

import type { IGoogleConfig, ISocialProfile, TSocialProvider } from "../type";


export class SocialAuthGoogle extends BaseSocialAuth<IGoogleConfig> {
    readonly name: TSocialProvider = "google" as const;

    configure(passportInstance: passport.PassportStatic): void {
        const scope = this.cfg.scope ?? ["profile", "email"];
        const strategy = new GoogleStrategy(
            {
                clientID: this.cfg.clientID,
                clientSecret: this.cfg.clientSecret,
                callbackURL: this.callbackURL(),
                passReqToCallback: true,
                ...this.cfg.strategyOptions,
            },
            async (req: Request, accessToken: string, refreshToken: string, profile: any, done: Function) => {
                await this.verifyWrapper(req, accessToken, refreshToken, profile, done);
            }
        );
        passportInstance.use(this.name, strategy);
        // Expose a helper property for initiating auth (optional)
        (strategy as any)._scope = scope;
    }
    protected mapProfile(raw: GoogleProfile): ISocialProfile {
        const email = raw.emails?.[0]?.value ?? null;
        const photo = raw.photos?.[0]?.value ?? null;
        return {
            provider: "google",
            providerId: raw.id,
            email: email,
            displayName: raw.displayName,
            name: {
                familyName: raw.name?.familyName,
                givenName: raw.name?.givenName,
            },
            photo,
            raw,
        }
    }

}