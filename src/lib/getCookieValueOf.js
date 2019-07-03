const getCookieValueOf = cookieKey => headers => {
  const str = headers["set-cookie"][0];
  const matcher = new RegExp(`(?<=${cookieKey}=).*?(?=;)`, "gi");
  const matches = str.match(matcher);
  if (matches && matches.length > 0) {
    return str.match(matcher)[0];
  }
  return undefined;
};

module.exports = getCookieValueOf;
