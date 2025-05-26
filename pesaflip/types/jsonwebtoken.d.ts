declare module 'jsonwebtoken' {
  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string | Buffer,
    options?: SignOptions
  ): string;
  
  export function verify<T>(
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: VerifyOptions
  ): T;
  
  export interface SignOptions {
    algorithm?: string;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    issuer?: string;
    jwtid?: string;
    subject?: string;
    noTimestamp?: boolean;
    header?: object;
    keyid?: string;
  }
  
  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | RegExp | string[] | RegExp[];
    clockTimestamp?: number;
    clockTolerance?: number;
    complete?: boolean;
    issuer?: string | string[];
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
    jwtid?: string;
    nonce?: string;
    subject?: string;
    maxAge?: string | number;
  }
  
  export interface DecodeOptions {
    complete?: boolean;
    json?: boolean;
  }
  
  export function decode(
    token: string,
    options?: DecodeOptions
  ): null | { [key: string]: any };
} 