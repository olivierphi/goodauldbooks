PYTHON_BINS ?= ${PWD}/.venv/bin
PYTHON ?= ${PYTHON_BINS}/python
PYTHONPATH ?= ${PWD}/src
DJANGO_SETTINGS_MODULE ?= project.settings.development

PROJECT_GUTENBERG_TRANSITIONAL_DB_PATH ?= $(PWD)/db/project_gutenberg_raw_books.db

dev:
	@PYTHONPATH=${PYTHONPATH} DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE} \
		${PYTHON} src/manage.py runserver

.PHONY: code-quality/all
code-quality/all: code-quality/black code-quality/isort code-quality/mypy  ## Run all our code quality tools

.PHONY: code-quality/black
code-quality/black: opts ?=
code-quality/black: ## Automated 'a la Prettier' code formatting
# @link https://black.readthedocs.io/en/stable/
	@${PYTHON_BINS}/black ${opts} src/ tests/

.PHONY: code-quality/isort
code-quality/isort: opts ?=
code-quality/isort: ## Automated Python imports formatting
	@${PYTHON_BINS}/isort --settings-file=pyproject.toml ${opts} src/ tests/

.PHONY: code-quality/mypy
code-quality/mypy: opts ?=
code-quality/mypy: ## Python's equivalent of TypeScript
# @link https://mypy.readthedocs.io/en/stable/
	@PYTHONPATH=${PYTHONPATH} ${PYTHON_BINS}/mypy src/



.PHONY: project-gutenberg/store-raw-library-in-transitional-db
project-gutenberg/store-raw-library-in-transitional-db: generated_collection_path ?= ~/gutenberg-epub/
project-gutenberg/store-raw-library-in-transitional-db: traversal_limit ?= 0
project-gutenberg/store-raw-library-in-transitional-db: create_zip ?= 0
project-gutenberg/store-raw-library-in-transitional-db:
	@PYTHONPATH=${PYTHONPATH} DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE} \
		${PYTHON} src/manage.py store_pg_rsynced_library_in_transitional_db \
		${generated_collection_path} ${PROJECT_GUTENBERG_TRANSITIONAL_DB_PATH} --traversal-limit=${traversal_limit}
		@if [ "${create_zip}" = "1" ]; then \
			zip -9 '${PROJECT_GUTENBERG_TRANSITIONAL_DB_PATH}.zip' ${PROJECT_GUTENBERG_TRANSITIONAL_DB_PATH};\
		fi
	
.PHONY: project-gutenberg/inject-transitional-db-into-library-db
project-gutenberg/inject-transitional-db-into-library-db: traversal_limit ?= 0
project-gutenberg/inject-transitional-db-into-library-db: db_truncate_first ?= 0
project-gutenberg/inject-transitional-db-into-library-db:
	@PYTHONPATH=${PYTHONPATH} DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE} \
		${PYTHON} src/manage.py inject_pg_transitional_db_into_library_db \
		${PROJECT_GUTENBERG_TRANSITIONAL_DB_PATH} --traversal-limit=${traversal_limit} \
		$$(if [ "${db_truncate_first}" = "1" ]; then echo "--db-truncate-first"; else echo ""; fi)
