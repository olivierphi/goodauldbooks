DOCKER_COMPOSE_OPTS ?=
DC_RUN_ROOT ?= docker-compose run --rm ${DOCKER_COMPOSE_OPTS}
DC_RUN ?= docker-compose run --rm --user $$(id -u):$$(id -g) ${DOCKER_COMPOSE_OPTS}
PSQL ?= psql 'postgresql://goodauldbooks:goodauldbooks@localhost:5433/goodauldbooks' -v ON_ERROR_STOP=1

.PHONY: install
install:
	${DC_RUN} --entrypoint bundle rails install
	${DC_RUN} --entrypoint rails rails webpacker:install

.PHONY: start
start:
	${DC_RUN} --entrypoint rails --service-ports rails server --binding=0.0.0.0

.PHONY: rails
rails: CMD =
rails:
	@[ "${CMD}" ] || ( echo "! Make variable CMD is not set"; exit 1 )
	${DC_RUN} --entrypoint rails rails ${CMD}

.PHONY: psql
psql:
	${PSQL}

.PHONY: credentials-edit
credentials-edit:
	${DC_RUN} --entrypoint rails -e EDITOR="vim" rails credentials:edit
