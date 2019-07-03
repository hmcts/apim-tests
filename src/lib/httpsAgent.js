const tunnel = require("tunnel");
const fs = require("fs");

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

module.exports = httpsAgent;
