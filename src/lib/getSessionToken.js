const superagent = require("superagent");
const getCookieValueOf = require("./getCookieValueOf");

const getSessionToken = async ({ baseUrl, email, password, httpsAgent }) => {
  const acceptRedirects = res => res.status < 400;
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

module.exports = getSessionToken;
