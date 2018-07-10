.PHONY: install install_dev python_shell mypy

DC ?= docker-compose -f ../docker-compose.yml run --rm --user $$(id -u):$$(id -g)
PYTHON ?= ${DC} --entrypoint python -e PYTHONPATH=/app/src python
PYTHON_SHELL ?=  ${DC} --entrypoint sh -e PYTHONPATH=/app/src python
PIP ?= ${DC} --entrypoint pip python

install:
	${PIP} install --user -r requirements.txt

install_dev: install
	${PIP} install --user -r requirements-dev.txt

python_shell:
	${PYTHON_SHELL}

mypy:
	${DC} --entrypoint python -e PYTHONPATH=/app/src -e MYPYPATH=/app/src python -m mypy bin/ src/
