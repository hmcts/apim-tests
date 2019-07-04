import * as superagent from "superagent";
import getCookieValueOf from "./getCookieValueOf";
import { Apim } from "../lib";

interface getVerificationTokenParams {
  baseUrl: Apim.Url;
  httpsAgent: any;
}

const getVerificationToken = async ({
  baseUrl,
  httpsAgent
}: getVerificationTokenParams): Promise<Apim.Token> => {
  const name = "__RequestVerificationToken";
  const sessionReq = await superagent.get(baseUrl).agent(httpsAgent);
  const value = getCookieValueOf(name)(sessionReq.header);
  return {
    name,
    value
  };
};

export default getVerificationToken;
