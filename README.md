# APIM tests

This project is aimed at performing tests on an Azure API gateway, especially on its policies as some can involve programatic computation (via Azure Function apps for example).

As the manual setup can be quite tedious, these scripts will ease the checks.

## Prerequisites

- GNUmake
- nodejs
- curl
- an **active** VPN connection
- env variables as specified in the `.env.sample` file to place in a `.env` as specified above

| Name                   | Description                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `SUBSCRIPTION_KEY`     | corresponds to the `Ocp-Apim-Subscription-Key` you can find in the apim GUI console |
| `SERVICE_SUBSCRIPTION` | corresponds to the vault service subscription key used to generate the s2s secret   |
| `CYPRESS_CASE_ID`      | valid case ID as we tests against CCD                                               |
| `CYPRESS_USERNAME`     | test account email                                                                  |
| `CYPRESS_PASSWORD`     | test account password                                                               |
| `PORTAL_EMAIL`         | portal account email                                                                |
| `PORTAL_PASSWORD`      | portal account password                                                             |
| `PORTAL_BASE_URL`      | portal base url                                                                     |
| `PORTAL_PREVIEW_HOST`  | portal base preview host name                                                       |
| `PROXY_HOST`           | vpn proxy host name                                                                 |
| `PROXY_PORT`           | vpn proxy port                                                                      |

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
