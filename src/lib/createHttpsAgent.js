const tunnel = require("tunnel");

const createHttpsAgent = ({ host, port, key, cert }) =>
  tunnel.httpsOverHttp({
    proxy: { host, port },
    cert,
    key,
    passphrase: "YYY",
    rejectUnauthorized: false
  });

module.exports = createHttpsAgent;
