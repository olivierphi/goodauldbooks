.PHONY: install install_dev python_shell mypy

PYTHON ?= docker-compose -f ../docker-compose.yml run --rm --entrypoint python --user $$(id -u):$$(id -g) python
PYTHON_SHELL ?= docker-compose -f ../docker-compose.yml run --rm --entrypoint bash --user $$(id -u):$$(id -g) python
PIP ?= docker-compose -f ../docker-compose.yml run --rm --entrypoint pip --user $$(id -u):$$(id -g) python

install:
	${PIP} install --user -r requirements.txt

install_dev: install
	${PIP} install --user -r requirements-dev.txt

python_shell:
	${PYTHON_SHELL}

mypy:
	${PYTHON} -m mypy bin/
