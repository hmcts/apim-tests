# APIM tests

These scripts allow to quickly test that the previwe apim works as expected. As the setup can be quite tedious, these scripts make it quicker.

## Prerequisites

- GNUmake
- nodejs
- curl
- an **active** VPN connection
- env variables as specified in the `.env.sample` file to place in a `.env` as specified above

| Name                | Description                                                                         |
| ------------------- | ----------------------------------------------------------------------------------- |
| SUBSCRIPTION_KEY    | corresponds to the `Ocp-Apim-Subscription-Key` you can find in the apim GUI console |
| CYPRESS_CASE_ID     | valid case ID as we tests against CCD                                               |
| CYPRESS_USERNAME    | test account email                                                                  |
| CYPRESS_PASSWORD    | test account password                                                               |
| PORTAL_EMAIL        | portal account email                                                                |
| PORTAL_PASSWORD     | portal account password                                                             |
| PORTAL_BASE_URL     | portal base url                                                                     |
| PORTAL_PREVIEW_HOST | portal base preview host name                                                       |
| PROXY_HOST          | vpn proxy host name                                                                 |
| PROXY_PORT          | vpn proxy port                                                                      |

## Commands

`make test`

Will take care of installing dependencies and curl against one of the apim endpoints.

You should expect a JSON response corresponding to the case ID data
