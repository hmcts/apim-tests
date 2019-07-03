const superagent = require("superagent");
const httpsAgent = require("./lib/httpsAgent");

const getCookieValueOf = cookieKey => headers => {
  const str = headers["set-cookie"][0];
  const matcher = new RegExp(`(?<=${cookieKey}=).*?(?=;)`, "gi");
  const matches = str.match(matcher);
  if (matches && matches.length > 0) {
    return str.match(matcher)[0];
  }
  return undefined;
};

async function main() {
  const baseUrl = "https://apim-portal.service.core-compute-preview.internal";
  const sessionCookieKey = ".AspNet.ApplicationCookie";

  try {
    const sessionReq = await superagent
      .post(baseUrl + "/signin")
      .agent(httpsAgent)
      .redirects(0)
      .ok(res => res.status < 400)
      .send({
        ReturnUrl: "/",
        Email: process.env.PORTAL_EMAIL,
        Password: process.env.PORTAL_PASSWORD
      });

    const sessionToken = getCookieValueOf(sessionCookieKey)(sessionReq.header);
    console.log(`Using sessionToken token ${sessionToken}`);
  } catch (e) {
    console.log(e);
  }
}

main();
