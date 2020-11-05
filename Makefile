PYTHON ?= python3.8
PYTHONPATH ?= ${PWD}/src
PYTHON_W_PATH ?= PYTHONPATH=${PYTHONPATH} ${PYTHON}
FLASK_ENV ?= development
FLASK_APP ?= server
PSQL ?= psql 'postgresql://goodauldbooks:goodauldbooks@localhost:5433/goodauldbooks' -v ON_ERROR_STOP=1
SQLITE_DB_PATH ?= $(pwd)/data/raw_books.db
FRONTEND_ROOT ?= src/app/website/css_js_src

.PHONY: install
install:
	@${MAKE} python-install

.PHONY: dev
dev: OPTS ?=
dev:
	PYTHONPATH=${PYTHONPATH} FLASK_ENV=${FLASK_ENV} FLASK_APP=${FLASK_APP} flask run ${OPTS}

.PHONY: python-install
python-install: .venv
	@${PYTHON} -m venv .venv
	poetry install

.PHONY: python-black
python-black:
	@${POETRY} run black src/ --exclude node_modules

.PHONY: python-pylint
python-pylint:
	@${POETRY} run pylint project app

.PHONY: psql
psql:
	${PSQL}

.PHONY: yarn-install
yarn-install:
	cd ${FRONTEND_ROOT} && yarn install

.PHONY: yarn-dev
yarn-dev:
	cd ${FRONTEND_ROOT} && yarn dev:watch:js

.PHONY: yarn-prettier
yarn-prettier:
	cd ${FRONTEND_ROOT} && yarn prettier

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

.PHONY: test-book-parsing
test-book-parsing: OPTS ?=
test-book-parsing:
	@${MAKE} --no-print-directory django-manage \
	 	CMD="test_book_parsing '${SQLITE_DB_PATH}' ${OPTS}"
