PYTHON_BINS ?= ${PWD}/.venv/bin
PYTHON ?= ${PYTHON_BINS}/python
PYTHONPATH ?= ${PWD}/src

dev:
	@PYTHONPATH=${PYTHONPATH} ${PYTHON_BINS}/uvicorn server:app --reload

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
