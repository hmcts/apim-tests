PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash
.DEFAULT_GOAL := help
.SESSION_COOKIE_SPEC_FILE := session_cookie.json

.PHONY: help ## Display help section
help:
	@echo ""
	@echo "  Available commands:"
	@echo ""
	@grep -E '^\.PHONY: [a-zA-Z_-]+ .*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = "(: |##)"}; {printf "\033[36m\t%-32s\033[0m %s\n", $$2, $$3}'
	@echo ""


node_modules/:
	@echo ""; echo 🌀 Install npm dependencies
	@cd $(@D); npm i


$(.SESSION_COOKIE_SPEC_FILE): node_modules/
	@. .env; cypress run

.PHONY: test ## Tests the api gateway
test: $(.SESSION_COOKIE_SPEC_FILE)
	$(eval is_session_expired = $(shell node -e "const data = require('./session_cookie'); console.log(data.expiry * 1000 < Date.now())"))
	@if [ $(is_session_expired) = "true" ]; then\
        echo "Trigger session generation";\
    fi
	@echo 🌀 Current token is valid
	$(eval session_token = $(shell node -e "const data = require('./session_cookie'); console.log(data.value)"))
	curl \
		-v \
		-k \
		-x proxyout.reform.hmcts.net:8080 \
		-H "User-Agent:" \
		-H "Authorization: Bearer $(session_token)" \
		-H "ServiceAuthorization: ccd_gw" \
		-H "experimental: false" \
		-H "Ocp-Apim-Subscription-Key: $(shell . .env; echo $${SUBSCRIPTION_KEY})" \
		https://apim-preview.service.core-compute-preview.internal/ccd-data-store-api/cases/1544633061047766
