import type passport from "passport";
import type { Request } from "express";
import type { TSocialProvider, IBaseSocialProviderConfig, ISocialProfile, IVerifyResult, TOnProfile } from "../type";


export abstract class BaseSocialAuth<TCfg extends IBaseSocialProviderConfig = IBaseSocialProviderConfig> {
    abstract readonly name: TSocialProvider;
    protected onProfile: TOnProfile;
    protected cfg: TCfg;

    constructor(cfg: TCfg, onProfile: TOnProfile) {
        this.cfg = {
            routesPrefix: "/auth",
            ...cfg
        }
        this.onProfile = onProfile
    }
    /** Configure Passport: register strategy and verify handler */
    abstract configure(passport: passport.PassportStatic): void;


    /** Build provider-specific callback URL */
    protected callbackURL(): string {
        const routesPrefix = this.cfg.routesPrefix ?? "/auth";
        const callbackPath = this.cfg.callbackPath ?? `${routesPrefix}/${this.name}/callback`;
        const base = this.cfg.baseUrl.replace(/\/$/, "");
        return `${base}${callbackPath}`;
    }


    /** Maps a provider user profile into our normalized `SocialProfile` */
    protected abstract mapProfile(rawProfile: any): ISocialProfile;


    /** Default verify wrapper that calls user-supplied onProfile() */
    protected verifyWrapper = async (req: Request, accessToken: string, refreshToken: string, rawProfile: any, done: Function) => {
        try {
            const profile = this.mapProfile(rawProfile);
            const result: IVerifyResult = await this.onProfile(profile, req);
            // Place both in "user" so it ends up in req.user
            done(null, { ...result, profile });
        } catch (err) {
            done(err);
        }
    };

}