const superagent = require("superagent");
const curlCmd = require("./curlCmd");
const { exec } = require("child_process");

const getTraceFor = async ({
  baseUrl,
  formData,
  sessionToken,
  verificationToken,
  proxyHost,
  proxyPort
}) => {
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
  });

  const data = JSON.parse(await queryResult);

  const traceUrl = data.headers.find(
    ({ name }) => name === "Ocp-Apim-Trace-Location"
  ).value;

  const traceResponse = await superagent.get(traceUrl);

  const trace = traceResponse.body;

  return trace;
};

module.exports = getTraceFor;
