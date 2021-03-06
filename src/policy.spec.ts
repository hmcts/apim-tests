import { readFileSync } from "fs";
import * as jwt from "jsonwebtoken";
import createHttpsAgent from "./utils/createHttpsAgent";
import getPortalSessionToken from "./utils/getPortalSessionToken";
import getPortalVerificationToken from "./utils/getPortalVerificationToken";
import getQueryTrace from "./utils/getQueryTrace";
import { Utils } from "./utils";

const {
  API_BASE_NAME,
  PORTAL_EMAIL,
  PORTAL_PASSWORD,
  PORTAL_BASE_URL,
  API_HOSTNAME,
  PROXY_HOST,
  PROXY_PORT,
  SERVICE_SUBSCRIPTION,
  SUBSCRIPTION_KEY
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

const defaultHeaders = [
  {
    name: "Host",
    value: API_HOSTNAME
  },
  {
    name: "Authorization",
    value: `Bearer whatevertokenyouwantdude`
  },
  {
    name: "experimental",
    value: false
  },
  {
    name: "Ocp-Apim-Subscription-Key",
    value: SUBSCRIPTION_KEY,
    secret: true
  },
  {
    name: "Ocp-Apim-Trace",
    value: true
  }
];

describe("The api gateway", () => {
  describe("with an incoming request WITHOUT an s2s token", () => {
    let trace: Utils.Trace | undefined;

    beforeAll(async () => {
      trace = await getTrace({
        httpMethod: "GET",
        scheme: "https",
        host: API_HOSTNAME,
        path: `${API_BASE_NAME}/cases/1111222233334444`,
        headers: defaultHeaders
      });
    }, timeout);

    it("has a trace", () => {
      expect(trace !== undefined).toBeTruthy();
    });

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

      const secondsTillExpiration =
        +decoded.exp - Math.round(Date.now() / 1000);
      expect(secondsTillExpiration > 0).toBeTruthy();
    });
  });

  describe("with an incoming request WITH an s2s token", () => {
    let trace: Utils.Trace | undefined;
    const dummyJwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    beforeAll(async () => {
      trace = await getTrace({
        httpMethod: "GET",
        scheme: "https",
        host: API_HOSTNAME,
        path: `${API_BASE_NAME}/cases/1111222233334444`,
        headers: [
          ...defaultHeaders,
          {
            name: "ServiceAuthorization",
            value: dummyJwt
          }
        ]
      });
    }, timeout);

    it("has a trace", () => {
      expect(trace !== undefined).toBeTruthy();
    });

    it("forwards the s2s token if it is already present in the incoming request", () => {
      const forwarded = trace.traceEntries.backend[0];
      expect(forwarded.source).toEqual("forward-request");

      const s2sToken = forwarded.data.request.headers.find(
        ({ name }) => name === "ServiceAuthorization"
      ).value;
      expect(s2sToken).toEqual(dummyJwt);
    });
  });
});
