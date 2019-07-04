import * as superagent from "superagent";
import curlCmd from "./curlCmd";
import { exec } from "child_process";
import { Apim } from "../lib";

interface getTraceParams {
  baseUrl: string;
  formData: any;
  sessionToken: Apim.Token;
  verificationToken: Apim.Token;
  proxyHost: Apim.Hostname;
  proxyPort: Apim.Port;
}

const getTraceFor = async ({
  baseUrl,
  formData,
  sessionToken,
  verificationToken,
  proxyHost,
  proxyPort
}: getTraceParams) => {
  const queryUrl = baseUrl + "/console/query";
  const cmd = curlCmd({
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
