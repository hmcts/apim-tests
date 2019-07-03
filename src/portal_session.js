const superagent = require("superagent");
const httpsAgent = require("./lib/httpsAgent");

const { PORTAL_EMAIL, PORTAL_PASSWORD, PORTAL_BASE_URL } = process.env;

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
  const sessionCookieKey = ".AspNet.ApplicationCookie";

  try {
    const sessionReq = await superagent
      .post(PORTAL_BASE_URL + "/signin")
      .agent(httpsAgent)
      .redirects(0)
      .ok(res => res.status < 400)
      .send({
        ReturnUrl: "/",
        Email: PORTAL_EMAIL,
        Password: PORTAL_PASSWORD
      });

    const sessionToken = getCookieValueOf(sessionCookieKey)(sessionReq.header);
    console.log(`Using sessionToken token ${sessionToken}`);
  } catch (e) {
    console.log(e);
  }
}

main();
