PYTHON ?= python3.8
PYTHONPATH ?= ${PWD}/src
PYTHON_W_PATH ?= PYTHONPATH=${PYTHONPATH} ${PYTHON}
FLASK_ENV ?= development
FLASK_APP ?= server
FLASK_SETTINGS_MODULE ?= project.settings.development
FLASK_PREAMBLE = PYTHONPATH=${PYTHONPATH} FLASK_ENV=${FLASK_ENV} FLASK_APP=${FLASK_APP} FLASK_SETTINGS_MODULE=${FLASK_SETTINGS_MODULE}
DATABASE_URL ?= postgresql://goodauldbooks:goodauldbooks@localhost:5433/goodauldbooks

SQLITE_TRANSITIONAL_DB_PATH ?= ${PWD}/raw_books.db

# @link https://gutenberg.org/help/mirroring.html
PROJECT_GUTENBERG_GENERATED_COLLECTION_PATH ?= ~/gutenberg-mirror/generated-collection/
PROJECT_GUTENBERG_RSYNC_EXCLUDED_FILE_PATH ?= ${PWD}/src/apps/book_sources/project_gutenberg/data/project-gutenberg-rsync-excludes.txt

FRONTEND_ROOT ?= src/app/website/css_js_src

.PHONY: install
install: python-install


.PHONY: dev
dev: OPTS ?= --eager-loading
dev:
	${FLASK_PREAMBLE} flask run ${OPTS}

.PHONY: shell
shell:
	${FLASK_PREAMBLE} flask shell

.PHONY: python-install
python-install: .venv
	@${PYTHON} -m venv .venv
	poetry install

.PHONY: python-black
python-black:
	@black src/ --exclude node_modules

.PHONY: python-pylint
python-pylint:
	@pylint project apps

.PHONY: psql
psql:
	psql '${DATABASE_URL}' -v ON_ERROR_STOP=1

.PHONY: yarn-install
yarn-install:
	cd ${FRONTEND_ROOT} && yarn install

.PHONY: yarn-dev
yarn-dev:
	cd ${FRONTEND_ROOT} && yarn dev:watch:js

.PHONY: yarn-prettier
yarn-prettier:
	cd ${FRONTEND_ROOT} && yarn prettier

.PHONY: rsync-project-gutenberg-generated-collection
rsync-project-gutenberg-generated-collection:
	rsync -av --progress \
		--exclude-from=${PROJECT_GUTENBERG_RSYNC_EXCLUDED_FILE_PATH} \
		aleph.gutenberg.org::gutenberg-epub \
		${PROJECT_GUTENBERG_GENERATED_COLLECTION_PATH}

.PHONY: rsync-project-gutenberg-book
rsync-project-gutenberg-book: _guard-BOOK_ID
	rsync -av --progress \
		--exclude-from=${PROJECT_GUTENBERG_RSYNC_EXCLUDED_FILE_PATH} \
		aleph.gutenberg.org::gutenberg-epub/${BOOK_ID} \
		${PROJECT_GUTENBERG_GENERATED_COLLECTION_PATH}

.PHONY: store-raw-gutenberg-library-in-transitional-db
store-raw-gutenberg-library-in-transitional-db: OPTS ?=
store-raw-gutenberg-library-in-transitional-db:
	${FLASK_PREAMBLE} flask \
		import store_rsynced_library_in_transitional_db \
		${PROJECT_GUTENBERG_GENERATED_COLLECTION_PATH} \
		${SQLITE_TRANSITIONAL_DB_PATH} \
		${OPTS}

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

_guard-%:
# @link https://dev.to/rlespinasse/how-to-check-a-mandatory-variable-in-a-makefile-1k9n
	@if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi
