PYTHON_BIN_FOLDER ?= ./.venv/bin/
PYTHON ?= ${PYTHON_BIN_FOLDER}python
PYTHON_W_PATH ?= PYTHONPATH=${PWD}/src ${PYTHON}
DJANGO_SETTINGS ?= project.settings.development
DJANGO_PORT ?= 9000
MAKE_NO_PRINT = ${MAKE} --no-print-directory

# Recommended shell aliases to work on this project:
# alias venv='source ./.venv/bin/activate'
# alias djm='DJANGO_SETTINGS_MODULE=project.settings.development python src/manage.py'

install: .venv/ poetry
	poetry install

.PHONY: start
start: .venv/
	@${MAKE_NO_PRINT} django-manage CMD="runserver 127.0.0.1:${DJANGO_PORT}"

.PHONY: django-manage
django-manage: .venv/
	@[ "${CMD}" ] || ( echo "! Make variable CMD is not set"; exit 1 )
	@DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS} DEBUG=1 ${PYTHON_W_PATH} src/manage.py ${CMD}

.PHONY: python-pytest
python-pytest: ARGS ?= --cov=src --cov-config=.coveragerc --cov-report html -x
python-pytest: .venv/
	@DEBUG=1 ${PYTHON_W_PATH} -m pytest ${ARGS}

.PHONY: python-black
python-black: OPTS ?=
python-black: .venv/
	@${PYTHON_W_PATH} -m black ${OPTS} src/ tests/

.PHONY: python-mypy
python-mypy: .venv/
	@MYPYPATH=${PYTHONPATH} ${PYTHON_W_PATH} -m mypy src/

.PHONY: python-isort
python-isort: OPTS ?=
python-isort: .venv/
	@${PYTHON_W_PATH} -m isort ${OPTS} src/ tests/

.PHONY: python-code-quality
python-code-quality:
# Bash-Fu is my greatest passion. (NO)
	@exit_codes=0 ; \
		${MAKE_NO_PRINT} python-black ; exit_codes=$$(( $$exit_codes + $$? )) ; \
		${MAKE_NO_PRINT} python-isort; exit_codes=$$(( $$exit_codes + $$? )) ; \
		${MAKE_NO_PRINT} python-mypy; exit_codes=$$(( $$exit_codes + $$? )) ; \
		exit $$exit_codes

.venv/: SHELL := /bin/bash
.venv/:
	@if [[ "$$(python -V)" != "Python $$(cat .python-version)" ]]; then \
		echo "Place install and activate Python $$(cat .python-version) first."; \
		exit 1; \
	fi
	python -m venv .venv

.PHONY: poetry
poetry: SHELL := /bin/bash
poetry:
	@if [ "$$(which poetry)" == "" ]; then echo "Please install Poetry. `which poetry`" && exit 1; fi

