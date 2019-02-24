SHELL := /bin/bash
DC_RUN ?= docker-compose run --rm --user $$(id -u):$$(id -g)
POETRY ?= ${DC_RUN} --entrypoint poetry -e PIP_NO_BINARY=psycopg2 -e PYTHONPATH=/app/src:/app/src/apps python
DJANGO_MANAGE ?= ${DC_RUN} --workdir=/app/src --entrypoint /app/.venv/bin/python python manage.py

.PHONY: install
install:
	@${MAKE} python-install

.PHONY: dev
dev:
	@${DC_RUN} -p 8000:8000 --workdir=/app/src --entrypoint /app/.venv/bin/python python manage.py runserver 0:8000

.PHONY: python-install
python-install: .venv
	@${DC_RUN} --entrypoint /app/.venv/bin/pip python install --upgrade pip
	@${POETRY} install

.PHONY: python-venv-shell
python-venv-shell: .venv
	@${DC_RUN} --entrypoint /venv-shell.sh python

.PHONY: python-add-pkg
python-add-pkg: PKG ?=
python-add-pkg: OPTS ?=
python-add-pkg:
	@[ "${PKG}" ] || ( echo "! Make variable PKG is not set"; exit 1 )
	${POETRY} add ${OPTS} "${PKG}"

.PHONY: python-black
python-black:
	@${POETRY} run black src/

.PHONY: python-pylint
python-pylint:
	@${POETRY} run pylint project library

.venv:
	${DC_RUN} python -m venv "/app/.venv"

.PHONY: django-manage
django-manage: CMD ?=
django-manage:
	@[ "${CMD}" ] || ( echo "! Make variable CMD is not set"; exit 1 )
	@${DJANGO_MANAGE} ${CMD}
