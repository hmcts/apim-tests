import * as querystring from "querystring";
import * as superagent from "superagent";
import { exec } from "child_process";
import { Utils } from "../utils";

const createCurlCmd: Utils.CreateCurlCmdFn = ({
  queryUrl,
  sessionToken,
  verificationToken,
  formData,
  proxyHost,
  proxyPort
}) => {
  const multipartBoundary = Date.now();
  const escapedSessionToken = querystring.escape(sessionToken.value);
  const escapedVerificationToken = querystring.escape(verificationToken.value);
  const stringifiedFormData = JSON.stringify(formData);
  return `curl -v '${queryUrl}' \
-x ${proxyHost}:${proxyPort} \
-H 'Content-Type: multipart/form-data; boundary=----${multipartBoundary}' \
-H 'Accept: application/json' \
-H 'Cookie: ${verificationToken.name}=${escapedVerificationToken}; ${
    sessionToken.name
  }=${escapedSessionToken};' \
-H 'Connection: keep-alive' \
-H 'X-Request-Verification-Token: ${escapedVerificationToken}' \
--data-binary $'------${multipartBoundary}\r\nContent-Disposition: form-data; name="heading"; filename="blob"\r\nContent-Type: application/json\r\n\r\n${stringifiedFormData}\r\n------${multipartBoundary}--\r\n' \
--compressed \
--insecure`;
};

const runCmd = (cmd: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const cmdProcess = exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      return resolve(stdout.toString());
    });
    cmdProcess.stdout.on("data", data => {
      console.log("stdout: " + data.toString());
    });
    cmdProcess.stderr.on("data", data => {
      console.log("stderr: " + data.toString());
    });
  });

const getQueryTrace: Utils.getQueryTraceFn = async ({
  baseUrl,
  formData,
  sessionToken,
  verificationToken,
  proxyHost,
  proxyPort
}) => {
  const queryUrl = baseUrl + "/console/query";
  const curlCmd = createCurlCmd({
    queryUrl,
    sessionToken,
    verificationToken,
    formData,
    proxyHost,
    proxyPort
  });
  console.log("curlCmd:", curlCmd);
  const queryResult = JSON.parse(await runCmd(curlCmd));
  console.log("queryResult:", queryResult);
  const matchTraceHeader = ({ name }) => name === "Ocp-Apim-Trace-Location";
  const traceUrl = queryResult.headers.find(matchTraceHeader).value;
  const traceResponse = await superagent.get(traceUrl);
  const trace = traceResponse.body;
  return trace;
};

export default getQueryTrace;
