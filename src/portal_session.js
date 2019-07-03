const fs = require("fs");
const superagent = require("superagent");
const tunnel = require("tunnel");

const key = fs.readFileSync("./.certificate/key.pem");
const cert = fs.readFileSync("./.certificate/cert.pem");

const httpsAgent = tunnel.httpsOverHttp({
  proxy: {
    host: "proxyout.reform.hmcts.net",
    port: 8080
  },
  cert,
  key,
  passphrase: "YYY",
  rejectUnauthorized: false
});

const getSessionToken = headers => {
  const str = headers["set-cookie"][0];
  const token = str.match(/(?<=.AspNet.ApplicationCookie=).*?(?=;)/g)[0];
  return token;
};

async function main() {
  const baseUrl = "https://apim-portal.service.core-compute-preview.internal";

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

    const sessionToken = getSessionToken(sessionReq.header);
    console.log(`Using sessionToken token ${sessionToken}`);
  } catch (e) {
    console.log(e);
  }
}

main();
