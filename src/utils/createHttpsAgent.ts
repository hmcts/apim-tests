import { httpsOverHttp } from "tunnel";
import { Agent } from "https";
import { Utils } from "../utils";

const createHttpsAgent: Utils.CreateHttpsAgentFn = ({
  host,
  port,
  key,
  cert
}) =>
  httpsOverHttp({
    proxy: { host, port },
    cert,
    key,
    passphrase: "YYY",
    rejectUnauthorized: false
  }) as Agent;

export default createHttpsAgent;
