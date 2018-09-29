DC_RUN ?= docker-compose run --rm --user $$(id -u):$$(id -g)
PSQL ?= psql 'postgresql://goodauldbooks:localdev@localhost:5433/goodauldbooks' -v ON_ERROR_STOP=1
# @link http://petereisentraut.blogspot.co.uk/2010/03/running-sql-scripts-with-psql.html
PSQL_QUIET ?= PGOPTIONS='--client-min-messages=warning' ${PSQL}
PYTHON_DC_PREFIX ?= ${DC_RUN} --entrypoint python -e PYTHONPATH=/app/src
PIPENV_DC_PREFIX ?= ${DC_RUN} --entrypoint pipenv -e PYTHONPATH=/app/src -e TERM=xterm-256color  -e PIPENV_DONT_LOAD_ENV=1  -e PIPENV_CACHE_DIR=/app/pipenv/.pipenv-cache -e PIPENV_SHELL=/bin/bash
DJANGO_PORT ?= 9000

.PHONY: python-shell
python-shell:
	${DC_RUN} --entrypoint bash python

.PHONY: python-pipenv-shell
python-pipenv-shell:
	${PIPENV_DC_PREFIX} python \
		shell

.PHONY: python-django-runserver
python-django-runserver:
	${PIPENV_DC_PREFIX} -p ${DJANGO_PORT}:8000 -w /app/src python \
		run python manage.py runserver 0:8000

.PHONY: python-django-manage
python-django-manage:
	@[ "${CMD}" ] || ( echo "! Make variable CMD is not set"; exit 1 )
	${PIPENV_DC_PREFIX} -w /app/src python \
		run python manage.py ${CMD}

.PHONY: psql
psql:
	${PSQL}
