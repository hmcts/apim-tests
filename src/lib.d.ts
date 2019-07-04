export declare namespace Apim {
  export interface Token {
    name: string;
    value: string;
  }
  export interface Decoded {
    [key: string]: any;
  }
  export type Hostname = string;
  export type Port = string;
  export type Url = string;

  interface HeaderSpec {
    name: string;
    value: string | number;
    secret?: boolean;
  }

  export interface FormData {
    httpMethod:
      | "GET"
      | "HEAD"
      | "POST"
      | "PUT"
      | "DELETE"
      | "CONNECT"
      | "OPTIONS"
      | "TRACE";
    scheme: "http" | "https";
    host: Hostname;
    path: string;
    headers: HeaderSpec[];
  }
}
