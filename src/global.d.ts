import "https";

// Fix tunnel declaration
declare module "tunnel" {
  export interface HttpsOverHttpOptions extends HttpOptions {
    ca?: Buffer[];
    key?: Buffer;
    cert?: Buffer;
    passphrase?: Buffer | String;
    rejectUnauthorized?: boolean;
  }
}
