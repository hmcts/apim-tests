# APIM tests

[![Build Status](https://dev.azure.com/hmcts/CNP/_apis/build/status/CNP/Api%20Management%20Tests?branchName=master)](https://dev.azure.com/hmcts/CNP/_build/latest?definitionId=167&branchName=master)

This project is aimed at performing tests on an Azure API gateway, especially on its policies as some can involve programatic computation (via Azure Function apps for example).

As the manual setup can be quite tedious, these scripts will ease the checks.

## Prerequisites

- GNUmake
- nodejs
- curl
- jq
- an **active** VPN connection
- env variables as specified in the `.env.sample` file to place in a `.env` as specified above

| Name                   | Description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `API_BASE_NAME`        | is the prefix of the api, as in `<host>/<API_BASE_NAME>/*`                          |
| `SUBSCRIPTION_KEY`     | corresponds to the `Ocp-Apim-Subscription-Key` you can find in the apim GUI console |
| `SERVICE_SUBSCRIPTION` | corresponds to the vault service subscription key used to generate the s2s secret   |
| `CYPRESS_CASE_ID`      | valid case ID as we tests against CCD                                               |
| `CYPRESS_USERNAME`     | test account email                                                                  |
| `CYPRESS_PASSWORD`     | test account password                                                               |
| `PORTAL_EMAIL`         | portal account email                                                                |
| `PORTAL_PASSWORD`      | portal account password                                                             |
| `PORTAL_BASE_URL`      | portal base url                                                                     |
| `API_HOSTNAME`         | api host name                                                                       |
| `PROXY_HOST`           | vpn proxy host name                                                                 |
| `PROXY_PORT`           | vpn proxy port                                                                      |

Notice that the CI expects these environment variables as well.

## Commands

You can use the command `make test` to trigger policies tests.

Type `make help` to list the other available commands:

```
Available commands:

	api-call                          Performs an api call and displays the returned payload
	certificate                       Creates a new self-signed certificate
	help                              Display help section
	session                           Creates a new sidam session
	test                              Runs tests against APIM s2s policy
```

## How the tests work

As the api gateway is only a proxy, we don't have the ability to properly frame it, and use a stub backend service for example. The setup of such tests would be tedious.

Fortunately, any Azure Api Gateway Management instance exposes a developer portal with the ability to display a trace of the policies being applied when testing an endpoint. This is what those tests use to make sure the policies are applied as expected, regardless of the actual backend response.

It is the reason why you'll see a curl multipart request in `src/utils/getQueryTrace.ts`, which mimics the developer portal's testing requests.
