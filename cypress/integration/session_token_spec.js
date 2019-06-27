const CASE_ID = Cypress.env("CASE_ID");
const USERNAME = Cypress.env("USERNAME");
const PASSWORD = Cypress.env("PASSWORD");

const reducer = (acc, d, i) => {
  const sep = i % 4 === 0 && i !== 0 ? "-" : "";
  acc += sep + d;
  return acc;
};

const formatCaseId = caseId =>
  String(caseId)
    .split("")
    .reduce(reducer, "");

const timeout = 60000; // 1 min

describe("Authentication", async function() {
  it("Visits the ccd app and logs in", function() {
    cy.visit("https://www-ccd.aat.platform.hmcts.net/", { timeout });
    cy.wait(100);
    cy.get("#username").type(USERNAME);
    cy.get("#password").type(PASSWORD);
    cy.get(".button").click();

    cy.wait(2000);

    cy.get(
      `[aria-label='go to case with Case reference:${formatCaseId(CASE_ID)}']`,
      { timeout }
    ).click();

    cy.request(
      `https://gateway-ccd.aat.platform.hmcts.net/activity/cases/${CASE_ID}/activity`
    );

    cy.getCookie("accessToken").then(sessionCookie =>
      cy.writeFile("session_cookie.json", sessionCookie, "utf8").end()
    );
  });
});
