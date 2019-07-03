const querystring = require("querystring");

const curlCmd = ({ queryUrl, sessionToken, verificationToken, formData }) => {
  const now = Date.now();
  return `
    curl '${queryUrl}' \
      -x proxyout.reform.hmcts.net:8080 \
      -H 'Content-Type: multipart/form-data; boundary=----${now}' \
      -H 'Accept: application/json' \
      -H 'Cookie: .AspNet.ApplicationCookie=${querystring.stringify(
        sessionToken
      )};' \
      -H 'Connection: keep-alive' \
      -H 'X-Request-Verification-Token: ${verificationToken}' \
      --data-binary $'------${now}\r\nContent-Disposition: form-data; name="heading"; filename="blob"\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(
    formData
  )}\r\n------${now}--\r\n' \
      --compressed \
      --insecure
  `;
};

module.exports = curlCmd;
