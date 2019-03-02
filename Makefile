SHELL := /bin/bash
DOCKER_COMPOSE_OPTS ?=
DC_RUN ?= docker-compose run --rm --user $$(id -u):$$(id -g) ${DOCKER_COMPOSE_OPTS}
POETRY ?= ${DC_RUN} --entrypoint poetry -e PIP_NO_BINARY=psycopg2 -e PYTHONPATH=/app/src python
DJANGO_MANAGE ?= ${DC_RUN} --workdir=/app/src --entrypoint /app/.venv/bin/python python manage.py
PSQL ?= psql 'postgresql://goodauldbooks:goodauldbooks@localhost:5433/goodauldbooks' -v ON_ERROR_STOP=1
SQLITE_DB_PATH ?= /app/raw_books.db
FRONTEND_ROOT ?= src/app/website/css_js_src

.PHONY: install
install:
	@${MAKE} python-install

.PHONY: dev
dev: OPTS ?=
dev:
	@${DC_RUN} -p 8000:8000 --workdir=/app/src --entrypoint /app/.venv/bin/python python manage.py runserver 0:8000 ${OPTS}

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
	@${POETRY} run pylint project app

.venv:
	${DC_RUN} python -m venv "/app/.venv"

.PHONY: django-manage
django-manage: CMD ?= shell
django-manage:
	@[ "${CMD}" ] || ( echo "! Make variable CMD is not set"; exit 1 )
	@${DJANGO_MANAGE} ${CMD}

.PHONY: psql
psql:
	${PSQL}

.PHONY: yarn-install
yarn-install:
	cd ${FRONTEND_ROOT} && yarn install

.PHONY: yarn-dev
yarn-dev:
	cd ${FRONTEND_ROOT} && yarn dev:watch:js


.PHONY: store-raw-gutenberg-library-in-transitional-db
store-raw-gutenberg-library-in-transitional-db: GENERATED_COLLECTION_PATH ?= ~/gutenberg-mirror/generated-collection/
store-raw-gutenberg-library-in-transitional-db: OPTS ?=
store-raw-gutenberg-library-in-transitional-db:
	@${MAKE} --no-print-directory django-manage \
		DOCKER_COMPOSE_OPTS="-v ${GENERATED_COLLECTION_PATH}:/collection" \
	 	CMD="store_rsynced_library_in_transitional_db /collection '${SQLITE_DB_PATH}' ${OPTS}"

.PHONY: populate-postgres-from-transitional-db
populate-postgres-from-transitional-db: OPTS ?=
populate-postgres-from-transitional-db:
	@${MAKE} --no-print-directory django-manage \
	 	CMD="populate_postgres_from_transitional_db '${SQLITE_DB_PATH}' ${OPTS}"
