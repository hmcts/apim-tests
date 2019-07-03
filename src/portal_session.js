const superagent = require("superagent");
const httpsAgent = require("./lib/httpsAgent");
const querystring = require("querystring");
const { exec } = require("child_process");
const { inspect } = require("util");
const bearer = require("../session_cookie").value;

const {
  PORTAL_EMAIL,
  PORTAL_PASSWORD,
  PORTAL_BASE_URL,
  SUBSCRIPTION_KEY
} = process.env;

const getCookieValueOf = cookieKey => headers => {
  const str = headers["set-cookie"][0];
  const matcher = new RegExp(`(?<=${cookieKey}=).*?(?=;)`, "gi");
  const matches = str.match(matcher);
  if (matches && matches.length > 0) {
    return str.match(matcher)[0];
  }
  return undefined;
};

const acceptRedirects = res => res.status < 400;

const getSession = async () => {
  const sessionCookieKey = ".AspNet.ApplicationCookie";
  const sessionReq = await superagent
    .post(PORTAL_BASE_URL + "/signin")
    .agent(httpsAgent)
    .redirects(0)
    .ok(acceptRedirects)
    .send({
      ReturnUrl: "/",
      Email: PORTAL_EMAIL,
      Password: PORTAL_PASSWORD
    });

  const sessionToken = getCookieValueOf(sessionCookieKey)(sessionReq.header);
  return sessionToken;
};

const getVerificationToken = async () => {
  const verificationCookieKey = "__RequestVerificationToken";
  const sessionReq = await superagent.get(PORTAL_BASE_URL).agent(httpsAgent);
  const verificationToken = getCookieValueOf(verificationCookieKey)(
    sessionReq.header
  );
  return verificationToken;
};

async function main() {
  try {
    const sessionToken = await getSession();
    const verificationToken = await getVerificationToken();

    const queryUrl = PORTAL_BASE_URL + "/console/query";

    const now = Date.now();

    const curlCmd = `
      curl '${queryUrl}' \
        -x proxyout.reform.hmcts.net:8080 \
        -H 'Content-Type: multipart/form-data; boundary=----${now}' \
        -H 'Accept: application/json' \
        -H 'Cookie: .AspNet.ApplicationCookie=${querystring.stringify(
          sessionToken
        )};' \
        -H 'Connection: keep-alive' \
        -H 'X-Request-Verification-Token: ${verificationToken}' \
        --data-binary $'------${now}\r\nContent-Disposition: form-data; name="heading"; filename="blob"\r\nContent-Type: application/json\r\n\r\n{"headers":[{"name":"Host","value":"apim-preview.service.core-compute-preview.internal"},{"name":"Authorization","value":"Bearer ${bearer}"},{"name":"ServiceAuthorization","value":"ccd_gw"},{"name":"experimental","value":"false"},{"name":"Ocp-Apim-Subscription-Key","value":"${SUBSCRIPTION_KEY}","secret":true},{"name":"Ocp-Apim-Trace","value":"true"}],"httpMethod":"GET","host":"apim-preview.service.core-compute-preview.internal","path":"ccd-data-store-api/cases/1544633061047766","scheme":"https"}\r\n------${now}--\r\n' \
        --compressed \
        --insecure
    `;

    const queryResult = new Promise((resolve, reject) => {
      exec(curlCmd, function(error, stdout) {
        if (error) {
          return reject(error);
        }
        return resolve(stdout.toString());
      });
    });

    const data = JSON.parse(await queryResult);

    const traceUrl = data.headers.find(
      header => header.name === "Ocp-Apim-Trace-Location"
    ).value;

    const traceResponse = await superagent.get(traceUrl);

    const trace = traceResponse.body;

    console.log(inspect(trace, { compact: false, depth: 5, breakLength: 80 }));
  } catch (e) {
    console.log(e);
  }
}

main();
