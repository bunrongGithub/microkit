export type TSocialProvider = "google" | "facebook";


export interface IBaseSocialProviderConfig {
    /** Public URL of your server, without trailing slash. e.g. https://api.example.com */
    baseUrl: string;
    /** Path prefix for auth endpoints (default: /auth) */
    routesPrefix?: string;
    /** Optional: custom callback path per provider, else defaults to `${routesPrefix}/${provider}/callback` */
    callbackPath?: string;
    /** Optional: additional Passport strategy options */
    strategyOptions?: Record<string, any>;
}

export interface IGoogleConfig extends IBaseSocialProviderConfig {
    clientID: string;
    clientSecret: string;
    /** Default: ['profile', 'email'] */
    scope?: string[];
}


export interface IFacebookConfig extends IBaseSocialProviderConfig {
    clientID: string;
    clientSecret: string;
    /** Default: ['email', 'public_profile'] */
    scope?: string[];
    /** Default fields below */
    profileFields?: string[];
}


export interface ISocialProfile {
    provider: TSocialProvider;
    providerId: string;
    email?: string | null;
    displayName?: string | null;
    name?: {
        familyName?: string | null;
        givenName?: string | null;
        middleName?: string | null;
    };
    photo?: string | null;
    /** Raw profile if you need more data downstream */
    raw?: any;
}

export interface IVerifyResult {
    /** Your app's user id, if you create/lookup users */
    userId?: string | number;
    /** Anything else you want to stash on req.user */
    meta?: Record<string, any>;
}

/** Hook used by the SDK to turn SocialProfile into your app user */
export type TOnProfile = (profile: ISocialProfile, req: Express.Request) => Promise<IVerifyResult>;



export interface ISDKCommonOptions {
    /** Use cookie-session based Passport sessions (default: true). Set false for stateless. */
    session?: boolean;
    /** If stateless, issue a JWT with this secret. Ignored if `session=true`. */
    jwtSecret?: string;
    /** Optional: customize JWT payload generation */
    makeJwtPayload?: (verify: IVerifyResult, profile: ISocialProfile) => Record<string, any>;
    /** Optional: adjust JWT expiresIn (e.g., '1h') */
    jwtExpiresIn?: string | number;
    /** On success, redirect here (both session & stateless). Can include query like `?token={{jwt}}` for stateless */
    successRedirect?: string;
    /** On failure, redirect here */
    failureRedirect?: string;
}



export interface ISDKOptions extends ISDKCommonOptions {
    /** Which providers to enable and their configs */
    providers: {
        google?: IGoogleConfig | false;
        facebook?: IFacebookConfig | false;
    };
    /** Required: your function to link/create users */
    onProfile: TOnProfile;
}
