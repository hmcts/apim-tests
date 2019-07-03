const querystring = require("querystring");

const curlCmd = ({
  queryUrl,
  sessionToken,
  verificationToken,
  formData,
  proxyHost,
  proxyPort
}) => {
  const now = Date.now();
  return `
    curl '${queryUrl}' \
      -x ${proxyHost}:${proxyPort} \
      -H 'Content-Type: multipart/form-data; boundary=----${now}' \
      -H 'Accept: application/json' \
      -H 'Cookie: ${sessionToken.name}=${querystring.stringify(
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

module.exports = curlCmd;
