import * as querystring from "querystring";
import { Apim } from "../lib";

interface curlCmdParams {
  queryUrl: string;
  sessionToken: Apim.Token;
  verificationToken: Apim.Token;
  formData: Apim.FormData;
  proxyHost: Apim.Hostname;
  proxyPort: Apim.Port;
}

const curlCmd = ({
  queryUrl,
  sessionToken,
  verificationToken,
  formData,
  proxyHost,
  proxyPort
}: curlCmdParams) => {
  const now = Date.now();
  return `
    curl '${queryUrl}' \
      -x ${proxyHost}:${proxyPort} \
      -H 'Content-Type: multipart/form-data; boundary=----${now}' \
      -H 'Accept: application/json' \
      -H 'Cookie: ${sessionToken.name}=${querystring.escape(
    sessionToken.value
  )};' \
      -H 'Connection: keep-alive' \
      -H 'X-Request-Verification-Token: ${verificationToken.value}' \
      --data-binary $'------${now}\r\nContent-Disposition: form-data; name="heading"; filename="blob"\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(
    formData
  )}\r\n------${now}--\r\n' \
      --compressed \
      --insecure
  `;
};

export default curlCmd;
