DC_RUN ?= docker-compose run --rm --user $$(id -u):$$(id -g)
PSQL ?= psql 'postgresql://goodauldbooks:localdev@localhost:5433/goodauldbooks' -v ON_ERROR_STOP=1
# @link http://petereisentraut.blogspot.co.uk/2010/03/running-sql-scripts-with-psql.html
PSQL_QUIET ?= PGOPTIONS='--client-min-messages=warning' ${PSQL}
PYTHON_DC_PREFIX ?= ${DC_RUN} --entrypoint python -e PYTHONPATH=/app/src
PIPENV_DC_PREFIX ?= ${DC_RUN} --entrypoint pipenv -e PYTHONPATH=/app/src:/app/src/apps -e TERM=xterm-256color  -e PIPENV_DONT_LOAD_ENV=1  -e PIPENV_CACHE_DIR=/app/pipenv/.pipenv-cache -e PIPENV_SHELL=/bin/bash
DJANGO_PORT ?= 9000

.PHONY: install
install:
	@${MAKE} python-install
	@${MAKE} db-refresh-materialized-views
	@${MAKE} db-update-computed-data-tables

.PHONY: python-install
python-install:
	@${PIPENV_DC_PREFIX} python \
		install

.PHONY: python-shell
python-shell:
	@${DC_RUN} --entrypoint bash python

.PHONY: python-pipenv-shell
python-pipenv-shell:
	@${PIPENV_DC_PREFIX} python \
		shell

.PHONY: python-django-runserver
python-django-runserver:
	@${PIPENV_DC_PREFIX} -p ${DJANGO_PORT}:8000 -w /app/src python \
		run python manage.py runserver 0:8000

.PHONY: python-django-manage
python-django-manage:
	@[ "${CMD}" ] || ( echo "! Make variable CMD is not set"; exit 1 )
	@${PIPENV_DC_PREFIX} -w /app/src python \
		run python manage.py ${CMD}

.PHONY: python-django-shell
python-django-shell:
	@${MAKE} python-django-manage CMD=shell

.PHONY: python-pytest
python-pytest: ARGS ?=
python-pytest:
	@${PIPENV_DC_PREFIX} python \
		run pytest ${ARGS}

.PHONY: python-code-quality
python-code-quality:
# Bash-Fu is my greatest passion. (NO)
	@exit_codes=0 ; \
		${MAKE} python-black ; exit_codes=$$(( $$exit_codes + $$? )) ; \
		${MAKE} python-pylint ; exit_codes=$$(( $$exit_codes + $$? )) ; \
		${MAKE} python-mypy ; exit_codes=$$(( $$exit_codes + $$? )) ; \
		exit $$exit_codes

.PHONY: python-black
python-black:
	@${PIPENV_DC_PREFIX} python \
		run black src/

.PHONY: python-pylint
python-pylint:
	@${PIPENV_DC_PREFIX} python \
		run pylint project library

.PHONY: python-mypy
python-mypy:
	@${PIPENV_DC_PREFIX} -e MYPYPATH=/app/src:/app/src/apps python \
		run mypy --config-file=mypy.ini \
		-p library \
		-p public_api \
		-p pg_import


.PHONY: python-add-package
python-add-package: PKG ?=
python-add-package:
	@[ "${PKG}" ] || ( echo "! variable PKG is not set"; exit 1 )
	@${PIPENV_DC_PREFIX} python \
		install ${PKG}

.PHONY: python-add-package-dev
python-add-package-dev: PKG ?=
python-add-package-dev:
	@[ "${PKG}" ] || ( echo "! variable PKG is not set"; exit 1 )
	@${PIPENV_DC_PREFIX} python \
		install --dev ${PKG}

.PHONY: pg-import-books
pg-import-books: ARGS ?= --generate-library
pg-import-books:
	@[ "${DIR}" ] || ( echo "! variable DIR is not set"; exit 1 )
	@${PIPENV_DC_PREFIX} -w /app/src \
		-v ${DIR}:/gutenberg-mirror/generated-collection \
		python \
		run python manage.py import_pg_books /gutenberg-mirror/generated-collection ${ARGS}

.phony: db-refresh-materialized-views
db-refresh-materialized-views: VIEWS=library_view_genre_with_related_data
db-refresh-materialized-views:
	@echo "\033[36mRefreshing library materialized views...\033[0m"
	@$(foreach materialized_view,$(VIEWS),\
		(echo "\033[36m*******\nRefreshing '$(materialized_view)'...\n*******\033[0m" && \
		${PSQL} --no-psqlrc -q -b -c "refresh materialized view concurrently $(materialized_view);") || exit 1; \
	)


.phony: db-update-computed-data-tables
db-update-computed-data-tables: PG_FUNCTIONS=library_view_update_all_books_computed_data library_view_update_all_authors_computed_data
db-update-computed-data-tables:
	@echo "\033[36mUpdating computed data tables via our custom Postgres functions...\033[0m"
	@$(foreach function,$(PG_FUNCTIONS),\
		(echo "\033[36m*******\nCalling function '$(function)'...\n*******\033[0m" && \
		${PSQL} --no-psqlrc -q -b -c "select * from $(function)();") || exit 1; \
	)

.PHONY: psql
psql:
	${PSQL}
