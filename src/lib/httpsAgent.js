const tunnel = require("tunnel");
const fs = require("fs");

const key = fs.readFileSync("./.certificate/key.pem");
const cert = fs.readFileSync("./.certificate/cert.pem");

const { PROXY_HOST, PROXY_PORT } = process.env;

const httpsAgent = tunnel.httpsOverHttp({
  proxy: {
    host: PROXY_HOST,
    port: PROXY_PORT
  },
  cert,
  key,
  passphrase: "YYY",
  rejectUnauthorized: false
});

module.exports = httpsAgent;
