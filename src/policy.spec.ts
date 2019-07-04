import { readFileSync } from "fs";
import * as jwt from "jsonwebtoken";
import createHttpsAgent from "./lib/createHttpsAgent";
import getSessionToken from "./lib/getSessionToken";
import getVerificationToken from "./lib/getVerificationToken";
import getTraceFor from "./lib/getTraceFor";
import { Apim } from "./lib";
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

const SERVICE_SUBSCRIPTION = "ccd_gw";

const httpsAgent = createHttpsAgent({
  host: PROXY_HOST,
  port: PROXY_PORT,
  key: readFileSync("./.certificate/key.pem"),
  cert: readFileSync("./.certificate/cert.pem")
});

const getTrace = async formData => {
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

  const trace = await getTraceFor({
    baseUrl,
    formData,
    sessionToken,
    verificationToken,
    proxyHost: PROXY_HOST,
    proxyPort: PROXY_PORT
  });

  return trace;
};

describe("The api gateway", () => {
  let trace;

  beforeAll(async () => {
    trace = await getTrace({
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
          value: SERVICE_SUBSCRIPTION
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
    });
  });

  it("forwards the incoming request", () => {
    const forwarded = trace.traceEntries.backend[0];
    expect(forwarded.source).toEqual("forward-request");
    expect(forwarded.data.request.url).toContain(`cases/${CYPRESS_CASE_ID}`);
  });

  it("adds a valid s2s token to the forwarded request", () => {
    const forwarded = trace.traceEntries.backend[0];

    const s2sToken = forwarded.data.request.headers.find(
      ({ name }) => name === "ServiceAuthorization"
    ).value;
    expect(typeof s2sToken === "string").toBeTruthy();

    const decoded = jwt.decode(s2sToken) as Apim.Decoded;

    const serviceSubscription = decoded.sub;
    expect(serviceSubscription).toEqual(SERVICE_SUBSCRIPTION);

    const secondsTillExpiration =
      parseInt(decoded.exp, 10) - Math.round(Date.now() / 1000);
    expect(secondsTillExpiration > 0).toBeTruthy();
  });
});
