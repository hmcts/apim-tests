import * as superagent from "superagent";
import getCookieValueOf from "./getCookieValueOf";
import { Utils } from "../utils";

const getPortalVerificationToken: Utils.getPortalVerificationTokenParamsFn = async ({
  baseUrl,
  httpsAgent
}) => {
  const name = "__RequestVerificationToken";
  const sessionReq = await superagent.get(baseUrl).agent(httpsAgent);
  const value = getCookieValueOf(name)(sessionReq.header);
  return {
    name,
    value
  };
};

export default getPortalVerificationToken;
