const superagent = require("superagent");
const getCookieValueOf = require("./getCookieValueOf");

const getVerificationToken = async ({ baseUrl, httpsAgent }) => {
  const name = "__RequestVerificationToken";
  const sessionReq = await superagent.get(baseUrl).agent(httpsAgent);
  const value = getCookieValueOf(name)(sessionReq.header);
  return {
    name,
    value
  };
};

module.exports = getVerificationToken;
