import express, { Request, Response, NextFunction, Router } from "express";
import { type RequestHandler } from "express";

import type passport from "passport";
import jwt, { type SignOptions } from "jsonwebtoken";
import { ISDKOptions, ISocialProfile, IVerifyResult } from "../type";
import { SocialAuthGoogle } from "./google";
import { SocialAuthFacebook } from "./facebook";

/** Make jwtExpiresIn compatible with jsonwebtoken’s typings */
type JWTExpires = SignOptions["expiresIn"];

/** Options after we apply defaults (no more undefined/null where we need concrete values) */
type ResolvedOptions =
    Omit<ISDKOptions,
        "session" | "successRedirect" | "failureRedirect" | "jwtSecret" | "jwtExpiresIn"
    > & {
        session: boolean;
        successRedirect: string;
        failureRedirect: string;
        jwtSecret: string;            // <- non-nullable now
        jwtExpiresIn: JWTExpires;     // <- matches jsonwebtoken
    };

export class SocialAuthSDK {
    private options: ResolvedOptions;

    constructor(opts: ISDKOptions) {
        // 2) Destructure to prevent spread from re-introducing a looser type
        const {
            session,
            jwtSecret,
            jwtExpiresIn: rawExp, // <- take it out so it can't override later
            successRedirect,
            failureRedirect,
            ...rest
        } = opts;

        // 3) Spread rest first, then normalized fields
        this.options = {
            ...rest, // providers, onProfile, etc.

            session: session ?? true,
            jwtSecret: jwtSecret ?? "jwt-secret",
            jwtExpiresIn: (rawExp ?? "1h") as JWTExpires, // now matches SignOptions["expiresIn"]
            successRedirect: successRedirect ?? "/",
            failureRedirect: failureRedirect ?? "/auth/failure",
        };
    }


    private isConfig<T>(v: T | false | undefined): v is T {
        return Boolean(v); // filters out false/undefined
    }
    /** Tiny narrowers so we can safely access properties even if a provider is `false` */
    private googleCfg() {
        const g = this.options.providers.google;
        return this.isConfig(g) ? g : undefined;
    }
    private facebookCfg() {
        const f = this.options.providers.facebook;
        return this.isConfig(f) ? f : undefined;
    }

    // configure()
    configure(passportInstance: passport.PassportStatic) {
        const { onProfile } = this.options;

        const g = this.googleCfg();
        if (g) new SocialAuthGoogle(g, onProfile).configure(passportInstance);

        const f = this.facebookCfg();
        if (f) new SocialAuthFacebook(f, onProfile).configure(passportInstance);

        if (this.options.session) {
            passportInstance.serializeUser((user: any, done) => done(null, user));
            passportInstance.deserializeUser((obj: any, done) => done(null, obj));
        }
    }

    // scope + prefix helpers (unchanged call sites)
    private scopeFor(provider: string): string[] | undefined {
        if (provider === "google") return this.googleCfg()?.scope ?? ["profile", "email"];
        if (provider === "facebook") return this.facebookCfg()?.scope ?? ["email", "public_profile"];
        return undefined;
    }

    private routesPrefixForAny(): string {
        return (this.googleCfg()?.routesPrefix
            ?? this.facebookCfg()?.routesPrefix
            ?? "/auth")
            .replace(/\/$/, "");
    }


    /** Returns init middlewares: passport.initialize(), and passport.session() if enabled */
    init(passportInstance: passport.PassportStatic) {
        const middlewares: express.RequestHandler[] = [passportInstance.initialize()];
        if (this.options.session) {
            middlewares.push((passportInstance as any).session());
        }
        return middlewares;
    }


    router(passportInstance: passport.PassportStatic): Router {
        const r = express.Router();
        const { session } = this.options;
        const routesPrefix = this.routesPrefixForAny();

        // Start auth
        const startAuth: RequestHandler = (req, res, next) => {
            const provider = req.params.provider;
            if (!this.isEnabled(provider)) {
                res.status(404).send("Unknown provider");
                return;
            }
            const handler = passportInstance.authenticate(provider, {
                scope: this.scopeFor(provider),
                session,
            }) as RequestHandler;
            handler(req, res, next);
        };

        // Callback
        const callback: RequestHandler = (req, res, next) => {
            const provider = req.params.provider;
            if (!this.isEnabled(provider)) {
                res.redirect(this.options.failureRedirect);
                return;
            }

            (passportInstance.authenticate(
                provider,
                { session: this.options.session },
                (err: any, user: any) => {
                    if (err || !user) {
                        res.redirect(this.options.failureRedirect);
                        return;
                    }

                    if (this.options.session) {
                        req.logIn(user as any, (loginErr) => {
                            if (loginErr) {
                                res.redirect(this.options.failureRedirect);
                                return;
                            }
                            res.redirect(this.options.successRedirect);
                        });
                    } else {
                        const payloadMaker =
                            this.options.makeJwtPayload ??
                            ((vr: IVerifyResult, profile: ISocialProfile) => ({
                                sub: vr.userId ?? `${profile.provider}:${profile.providerId}`,
                                provider: profile.provider,
                                providerId: profile.providerId,
                                email: profile.email,
                            }));

                        const payload = payloadMaker({ userId: user.userId, meta: user.meta }, user.profile);
                        const token = jwt.sign(payload, this.options.jwtSecret, {
                            expiresIn: this.options.jwtExpiresIn,
                        });

                        const sep = this.options.successRedirect.includes("?") ? "&" : "?";
                        res.redirect(`${this.options.successRedirect}${sep}token=${encodeURIComponent(token)}`);
                    }
                }
            ) as RequestHandler)(req, res, next);
        };

        r.get(`${routesPrefix}/:provider`, startAuth);
        r.get(`${routesPrefix}/:provider/callback`, callback);

        // Optional failure UI
        r.get(this.options.failureRedirect, ((_, res) => {
            res.status(401).send("Authentication failed");
        }) as RequestHandler);

        return r;
    }

    /** Helper: check if provider enabled */
    private isEnabled(p: string) {
        const { providers } = this.options;
        if (p === "google") return !!providers.google;
        if (p === "facebook") return !!providers.facebook;
        return false;
    }
}
