SHELL := /bin/bash
DC_RUN ?= docker-compose run --rm --user $$(id -u):$$(id -g)
POETRY ?= ${DC_RUN} --entrypoint poetry python

.PHONY: install
install:
	@${MAKE} python-install

.PHONY: python-install
python-install: .venv
	@{POETRY} install

.PHONY: python-venv-shell
python-venv-shell: .venv
	@${DC_RUN} --entrypoint /venv-shell.sh python

.PHONY: python-add-pkg
python-add-pkg: PKG ?=
python-add-pkg:
	@[ "${PKG}" ] || ( echo "! Make variable PKG is not set"; exit 1 )
	@source .venv/bin/activate && ${POETRY} add "${PKG}" && deactivate

.venv:
	${DC_RUN} python -m venv "/app/.venv"
