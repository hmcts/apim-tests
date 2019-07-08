import { readFileSync } from "fs";
import * as jwt from "jsonwebtoken";
import createHttpsAgent from "./utils/createHttpsAgent";
import getPortalSessionToken from "./utils/getPortalSessionToken";
import getPortalVerificationToken from "./utils/getPortalVerificationToken";
import getQueryTrace from "./utils/getQueryTrace";
import { Utils } from "./utils";

const {
  PORTAL_EMAIL,
  PORTAL_PASSWORD,
  PORTAL_BASE_URL,
  SUBSCRIPTION_KEY,
  SERVICE_SUBSCRIPTION,
  PORTAL_PREVIEW_HOST,
  PROXY_HOST,
  PROXY_PORT
} = process.env;

const httpsAgent = createHttpsAgent({
  host: PROXY_HOST,
  port: +PROXY_PORT,
  key: readFileSync("./.certificate/key.pem"),
  cert: readFileSync("./.certificate/cert.pem")
});

const getTrace = async (formData: Utils.FormData) => {
  const baseUrl = PORTAL_BASE_URL;

  const sessionToken = await getPortalSessionToken({
    baseUrl,
    email: PORTAL_EMAIL,
    password: PORTAL_PASSWORD,
    httpsAgent
  });

  const verificationToken = await getPortalVerificationToken({
    baseUrl,
    httpsAgent
  });

  const trace = await getQueryTrace({
    baseUrl,
    formData,
    sessionToken,
    verificationToken,
    proxyHost: PROXY_HOST,
    proxyPort: +PROXY_PORT
  });

  return trace;
};

const timeout = 1000 * 30; // 30s

describe("The api gateway", () => {
  let trace: Utils.Trace | undefined;

  beforeAll(async () => {
    trace = await getTrace({
      httpMethod: "GET",
      scheme: "http",
      host: PORTAL_PREVIEW_HOST,
      path: `ccd-data-store-api/cases/1111222233334444`,
      headers: [
        {
          name: "Host",
          value: PORTAL_PREVIEW_HOST
        },
        {
          name: "Authorization",
          value: `Bearer whatevertokenyouwantdude`
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
          secret: "true"
        },
        {
          name: "Ocp-Apim-Trace",
          value: "true"
        }
      ]
    });
  }, timeout);

  it("forwards the incoming request", () => {
    expect(trace !== undefined).toBeTruthy();

    const forwarded = trace.traceEntries.backend[0];
    expect(forwarded.source).toEqual("forward-request");
    expect(forwarded.data.request.url).toContain(`cases/1111222233334444`);
  });

  it("adds a valid s2s token to the forwarded request", () => {
    const forwarded = trace.traceEntries.backend[0];

    const s2sToken = forwarded.data.request.headers.find(
      ({ name }) => name === "ServiceAuthorization"
    ).value;
    expect(typeof s2sToken === "string").toBeTruthy();

    const decoded = jwt.decode(s2sToken) as Utils.DecodedJwt;

    const serviceSubscription = decoded.sub;
    expect(serviceSubscription).toEqual(SERVICE_SUBSCRIPTION);

    const secondsTillExpiration = +decoded.exp - Math.round(Date.now() / 1000);
    expect(secondsTillExpiration > 0).toBeTruthy();
  });
});
