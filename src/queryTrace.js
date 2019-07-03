const fs = require("fs");
const createHttpsAgent = require("./lib/createHttpsAgent");
const getSessionToken = require("./lib/getSessionToken");
const getVerificationToken = require("./lib/getVerificationToken");
const getTraceFor = require("./lib/getTraceFor");

const { inspect } = require("util");
const bearer = require("../session_cookie").value;

const {
  PORTAL_EMAIL,
  PORTAL_PASSWORD,
  PORTAL_BASE_URL,
  SUBSCRIPTION_KEY,
  PORTAL_PREVIEW_HOST,
  CYPRESS_CASE_ID,
  PROXY_HOST,
  PROXY_PORT
} = process.env;

const httpsAgent = createHttpsAgent({
  host: PROXY_HOST,
  port: PROXY_PORT,
  key: fs.readFileSync("./.certificate/key.pem"),
  cert: fs.readFileSync("./.certificate/cert.pem")
});

async function main() {
  try {
    const baseUrl = PORTAL_BASE_URL;

    const sessionToken = await getSessionToken({
      baseUrl,
      email: PORTAL_EMAIL,
      password: PORTAL_PASSWORD,
      httpsAgent
    });

    const verificationToken = await getVerificationToken({
      baseUrl,
      httpsAgent
    });

    const formData = {
      httpMethod: "GET",
      scheme: "https",
      host: PORTAL_PREVIEW_HOST,
      path: `ccd-data-store-api/cases/${CYPRESS_CASE_ID}`,
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
      ]
    };

    const trace = await getTraceFor({
      baseUrl,
      formData,
      sessionToken,
      verificationToken,
      proxyHost: PROXY_HOST,
      proxyPort: PROXY_PORT
    });

    console.log(inspect(trace, { compact: false, depth: 10, breakLength: 80 }));
  } catch (e) {
    console.log(e);
  }
}

main();
