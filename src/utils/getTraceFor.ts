import * as superagent from "superagent";
import createCurlCmd from "./createCurlCmd";
import { exec } from "child_process";
import { Utils } from "../utils";

const getTraceFor: Utils.GetTraceForFn = async ({
  baseUrl,
  formData,
  sessionToken,
  verificationToken,
  proxyHost,
  proxyPort
}) => {
  const queryUrl = baseUrl + "/console/query";
  const cmd = createCurlCmd({
    queryUrl,
    sessionToken,
    verificationToken,
    formData,
    proxyHost,
    proxyPort
  });

  const queryResult = new Promise((resolve, reject) => {
    exec(cmd, (error, stdout) => {
      if (error) {
        return reject(error);
      }
      return resolve(stdout.toString());
    });
  }) as Promise<string>;

  const data = JSON.parse(await queryResult);

  const traceUrl = data.headers.find(
    ({ name }) => name === "Ocp-Apim-Trace-Location"
  ).value;

  const traceResponse = await superagent.get(traceUrl);

  const trace = traceResponse.body;

  return trace;
};

export default getTraceFor;
