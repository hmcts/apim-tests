import { Agent } from "http";
import { httpsOverHttp } from "tunnel";

const createHttpsAgent = ({ host, port, key, cert }): Agent =>
  httpsOverHttp({
    proxy: { host, port },
    cert,
    key,
    passphrase: "YYY",
    rejectUnauthorized: false
  });

export default createHttpsAgent;
