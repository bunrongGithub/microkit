interface IAuth{
    login():Promise<any>
    logout():Promise<any>
}
export class Auth implements IAuth {
    login(): Promise<any> {
        return {
    then: function <TResult1 = any, TResult2 = never>(onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
        throw new Error("Function not implemented.")
    },
    catch: function <TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<any> {
        throw new Error("Function not implemented.")
    },
    finally: function (onfinally?: (() => void) | null | undefined): Promise<any> {
        throw new Error("Function not implemented.")
    },
    [Symbol.toStringTag]: ""
} 
    }
    logout(): Promise<any> {
        return {
    then: function <TResult1 = any, TResult2 = never>(onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
        throw new Error("Function not implemented.")
    },
    catch: function <TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<any> {
        throw new Error("Function not implemented.")
    },
    finally: function (onfinally?: (() => void) | null | undefined): Promise<any> {
        throw new Error("Function not implemented.")
    },
    [Symbol.toStringTag]: ""
}
    }
}