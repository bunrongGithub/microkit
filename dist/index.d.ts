interface IAuth {
    login(): Promise<any>;
    logout(): Promise<any>;
}
export declare class Auth implements IAuth {
    login(): Promise<any>;
    logout(): Promise<any>;
}
export {};
