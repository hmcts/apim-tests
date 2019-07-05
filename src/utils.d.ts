import {
  HttpOptions,
  HttpsOverHttpOptions,
  ProxyOptions,
  HttpsOverHttpsOptions
} from "tunnel";
import { Agent } from "https";

export declare namespace Utils {
  export interface Token {
    name: string;
    value: string;
  }
  export interface DecodedJwt {
    sub: string;
    exp: string;
  }
  export type Hostname = string;
  export type Port = number;
  export type Url = string;

  interface Trace {
    [key: string]: any;
  }

  interface HeaderSpec {
    name: string;
    value: string | number;
    secret?: boolean;
  }

  type HttpMethod =
    | "GET"
    | "HEAD"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE"
    | "OPTIONS"
    | "TRACE";

  export interface FormData {
    httpMethod: HttpMethod;
    scheme: "http" | "https";
    host: Hostname;
    path: string;
    headers: HeaderSpec[];
  }

  export interface CreateCurlCmdFn {
    (p: {
      queryUrl: string;
      sessionToken: Token;
      verificationToken: Token;
      formData: FormData;
      proxyHost: Hostname;
      proxyPort: Port;
    }): string;
  }

  export interface CreateHttpsAgentFn {
    (options: { host: Hostname; port: Port; key: Buffer; cert: Buffer }): Agent;
  }

  export interface GetCookieValueOfFn {
    (cookieKey: string): (headers: Headers) => string | undefined;
  }

  export interface getPortalSessionTokenFn {
    (options: {
      baseUrl: Url;
      email: string;
      password: string;
      httpsAgent: Agent;
    }): Promise<Token>;
  }

  export interface getPortalVerificationTokenParamsFn {
    (options: { baseUrl: Url; httpsAgent: Agent }): Promise<Token>;
  }

  export interface getQueryTraceFn {
    (options: {
      baseUrl: string;
      formData: FormData;
      sessionToken: Token;
      verificationToken: Token;
      proxyHost: Hostname;
      proxyPort: Port;
    }): Promise<Trace>;
  }
}
