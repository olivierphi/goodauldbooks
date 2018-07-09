.PHONY: install

PYTHON ?= docker-compose run --rm --entrypoint python --user $$(id -u):$$(id -g) python
PYTHON_SHELL ?= docker-compose run --rm --entrypoint bash --user $$(id -u):$$(id -g) python
PIP ?= docker-compose run --rm --entrypoint pip --user $$(id -u):$$(id -g) python

install:
	${PIP} install -r requirements.txt

python_shell:
	${PYTHON_SHELL}

mypy:
	${PYTHON} -m mypy bin/
