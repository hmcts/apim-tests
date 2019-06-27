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
	@echo 🌀 Creating a new sidam session
	@. .env; cypress run

.PHONY: session ## Creates a new sidam session
session:
	@rm -f $(.SESSION_COOKIE_SPEC_FILE)
	@$(MAKE) $(.SESSION_COOKIE_SPEC_FILE)

.PHONY: test ## Tests the api gateway
test: $(.SESSION_COOKIE_SPEC_FILE)
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
		https://apim-preview.service.core-compute-preview.internal/ccd-data-store-api/cases/$$CYPRESS_CASE_ID
