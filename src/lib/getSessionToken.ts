import * as superagent from "superagent";
import getCookieValueOf from "./getCookieValueOf";
import { Apim } from "../lib";

const getSessionToken = async ({
  baseUrl,
  email,
  password,
  httpsAgent
}): Promise<Apim.Token> => {
  const acceptRedirects = (res: superagent.Response) => res.status < 400;
  const name = ".AspNet.ApplicationCookie";
  const sessionReq = await superagent
    .post(baseUrl + "/signin")
    .agent(httpsAgent)
    .redirects(0)
    .ok(acceptRedirects)
    .send({
      ReturnUrl: "/",
      Email: email,
      Password: password
    });
  const value = getCookieValueOf(name)(sessionReq.header);
  return {
    name,
    value
  };
};

export default getSessionToken;
