const superagent = require("superagent");
const httpsAgent = require("./lib/httpsAgent");
const getCookieValueOf = require("./lib/getCookieValueOf");
const curlCmd = require("./lib/curlCmd");
const { exec } = require("child_process");
const { inspect } = require("util");
const bearer = require("../session_cookie").value;

const {
  PORTAL_EMAIL,
  PORTAL_PASSWORD,
  PORTAL_BASE_URL,
  SUBSCRIPTION_KEY,
  PORTAL_PREVIEW_HOST,
  CYPRESS_CASE_ID
} = process.env;

const getSession = async () => {
  const acceptRedirects = res => res.status < 400;
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

const getTraceFor = async (formData, sessionToken, verificationToken) => {
  const queryUrl = PORTAL_BASE_URL + "/console/query";
  const cmd = curlCmd({
    queryUrl,
    sessionToken,
    verificationToken,
    formData
  });

  const queryResult = new Promise((resolve, reject) => {
    exec(cmd, (error, stdout) => {
      if (error) {
        return reject(error);
      }
      return resolve(stdout.toString());
    });
  });

  const data = JSON.parse(await queryResult);

  const traceUrl = data.headers.find(
    ({ name }) => name === "Ocp-Apim-Trace-Location"
  ).value;

  const traceResponse = await superagent.get(traceUrl);

  const trace = traceResponse.body;

  return trace;
};

async function main() {
  try {
    const [sessionToken, verificationToken] = await Promise.all([
      getSession(),
      getVerificationToken()
    ]);

    const formData = {
      headers: [
        {
          name: "Host",
          value: PORTAL_PREVIEW_HOST
        },
        {
          name: "Authorization",
          value: `Bearer ${bearer}`
        },
        {
          name: "ServiceAuthorization",
          value: "ccd_gw"
        },
        {
          name: "experimental",
          value: "false"
        },
        {
          name: "Ocp-Apim-Subscription-Key",
          value: SUBSCRIPTION_KEY,
          secret: true
        },
        {
          name: "Ocp-Apim-Trace",
          value: "true"
        }
      ],
      httpMethod: "GET",
      host: PORTAL_PREVIEW_HOST,
      path: `ccd-data-store-api/cases/${CYPRESS_CASE_ID}`,
      scheme: "https"
    };

    const trace = await getTraceFor(formData, sessionToken, verificationToken);

    console.log(inspect(trace, { compact: false, depth: 10, breakLength: 80 }));
  } catch (e) {
    console.log(e);
  }
}

main();
