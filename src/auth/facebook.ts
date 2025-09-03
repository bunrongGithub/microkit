import type passport from "passport";
import { Strategy as FacebookStrategy, Profile as FacebookProfile } from "passport-facebook";
import { BaseSocialAuth } from "./base";
import type { IFacebookConfig, ISocialProfile } from "../type";

export class SocialAuthFacebook extends BaseSocialAuth<IFacebookConfig> {
    readonly name = "facebook" as const;

    configure(passportInstance: passport.PassportStatic): void {
        const scope = this.cfg.scope ?? ["email", "public_profile"];
        const profileFields = this.cfg.profileFields ?? [
            "id",
            "displayName",
            "name",
            "emails",
            "photos",
        ];

        const strategy = new FacebookStrategy(
            {
                clientID: this.cfg.clientID,
                clientSecret: this.cfg.clientSecret,
                callbackURL: this.callbackURL(),
                profileFields,
                passReqToCallback: true,
                ...this.cfg.strategyOptions,
            },
            async (req, accessToken, refreshToken, profile, done) => {
                await this.verifyWrapper(req, accessToken, refreshToken, profile, done);
            }
        );

        passportInstance.use(this.name, strategy);
        (strategy as any)._scope = scope;
    }

    protected mapProfile(raw: FacebookProfile): ISocialProfile {
        const email = raw.emails?.[0]?.value ?? null;
        const photo = raw.photos?.[0]?.value ?? null;
        return {
            provider: "facebook",
            providerId: raw.id,
            email,
            displayName: raw.displayName,
            name: {
                familyName: (raw as any).name?.familyName,
                givenName: (raw as any).name?.givenName,
                middleName: (raw as any).name?.middleName,
            },
            photo,
            raw,
        };
    }
}
