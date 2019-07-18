.DEFAULT_GOAL := help
.SESSION_COOKIE_SPEC_FILE := session_cookie.json
.CERTIFICATE_DIR := .certificate
.NODE_MODULES_DIR := node_modules

PATH  := $(.NODE_MODULES_DIR)/.bin:$(PATH)
SHELL := /bin/bash

.PHONY: help ## Display help section
help:
	@echo ""
	@echo "  Available commands:"
	@echo ""
	@grep -E '^\.PHONY: [a-zA-Z_-]+ .*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = "(: |##)"}; {printf "\033[36m\t%-32s\033[0m %s\n", $$2, $$3}'
	@echo ""


$(.NODE_MODULES_DIR):
	@echo ""; echo 🌀 Install npm dependencies
	@cd $(@D); npm i

$(.SESSION_COOKIE_SPEC_FILE): $(.NODE_MODULES_DIR)
	@echo 🌀 Creating a new sidam session
	@. .env; cypress run --spec cypress/integration/session_token_spec.js

.PHONY: session ## Creates a new sidam session
session:
	@rm -f $(.SESSION_COOKIE_SPEC_FILE)
	@$(MAKE) $(.SESSION_COOKIE_SPEC_FILE)

.PHONY: api-call ## Performs an api call and displays the returned payload
api-call: $(.SESSION_COOKIE_SPEC_FILE)
	@if [ $(shell ./bin/session_expired) = true ]; then \
		$(MAKE) session; \
    fi
	@. .env; curl \
		-v \
		-k \
		-x proxyout.reform.hmcts.net:8080 \
		-H "User-Agent:" \
		-H "Authorization: Bearer $(shell ./bin/session_token)" \
		-H "ServiceAuthorization: ccd_gw" \
		-H "experimental: false" \
		-H "Ocp-Apim-Subscription-Key: $(shell . .env; echo $${SUBSCRIPTION_KEY})" \
		https://$$PORTAL_PREVIEW_HOST/$$API_BASE_NAME/cases/$$CYPRESS_CASE_ID \
		| jq

.PHONY: cypress
cypress:
	@. .env; export HTTP_PROXY="proxyout.reform.hmcts.net:8080"; cypress open

$(.CERTIFICATE_DIR):
	@echo ""; echo 🌀 Create self-signed certificate
	@mkdir -p $@ && openssl req \
		-newkey rsa:2048 \
		-new \
		-nodes \
		-x509 \
		-days 3650 \
		-keyout $@/key.pem \
		-out $@/cert.pem \
		-subj "/C=UK/ST=Denial/L=London/O=Dis/CN=www.example.com"

.PHONY: certificate  ## Creates a new self-signed certificate
certificate: $(.CERTIFICATE_DIR)

.PHONY: test ## Runs tests against APIM s2s policy
test: $(.NODE_MODULES_DIR) $(.CERTIFICATE_DIR)
	@echo ""; echo 🌀 Run policy tests
	@echo ""; . .env; echo 👩‍💻 testing against $${API_BASE_NAME}
	@. .env; npm test

.PHONY: test-ci ## Runs tests against APIM s2s policy (CI mode)
test-ci: $(.NODE_MODULES_DIR) $(.CERTIFICATE_DIR)
	@echo ""; echo 🌀 Run policy tests
	@npm test
