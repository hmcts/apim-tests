# APIM tests

These scripts allow to quickly test that the previwe apim works as expected. As the setup can be quite tedious, these scripts make it quicker.

## Prerequisites

- GNUmake
- nodejs
- curl
- 2 env variables as specified in the `.env.sample` file to place in a `.env` file:
  - `SUBSCRIPTION_KEY` corresponds to the `Ocp-Apim-Subscription-Key` you can find in the apim GUI console
  - `CYPRESS_CASE_ID` corresponds to a valid case ID as we tests against CCD
  - `CYPRESS_USERNAME` corresponds to a test account email
  - `CYPRESS_PASSWORD` corresponds to a test account password
- an **active** VPN connection

## Commands

`make test`

Will take care of installing dependencies and curl against one of the apim endpoints.

You should expect a JSON response corresponding to the case ID data
