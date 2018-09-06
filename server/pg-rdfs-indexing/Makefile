.PHONY: install install_dev python_shell mypy

DC ?= docker-compose -f ../docker-compose.yml run --rm --user $$(id -u):$$(id -g)
PYTHON ?= ${DC} --entrypoint python -e PYTHONPATH=/app/src pg_rdf_indexing
PYTHON_SHELL ?=  ${DC} --entrypoint sh -e PYTHONPATH=/app/src pg_rdf_indexing
PIP ?= ${DC} --entrypoint pip pg_rdf_indexing

install:
	${PIP} install --user -r requirements.txt

install_dev: install
	${PIP} install --user -r requirements-dev.txt

python_shell:
	${PYTHON_SHELL}

mypy:
	@${DC} --entrypoint python \
		-e PYTHONPATH=/pg-rdfs-indexing/src -e MYPYPATH=/pg-rdfs-indexing/src \
		pg_rdf_indexing \
		-m mypy bin/ src/
