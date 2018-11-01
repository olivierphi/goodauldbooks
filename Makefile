GENERATED_COLLECTION_PATH ?= ~/gutenberg-mirror/generated-collection/
DC_RUN = docker-compose run --rm --user $$(id -u):$(id -g)
REDIS_HOST ?= localhost
REDIS_PORT ?= 16379
REDIS ?= redis-cli -h '${REDIS_HOST}' -p ${REDIS_PORT}

.PHONY: import-library
import-library:
	@${DC_RUN} --entrypoint pipenv \
		-v ${GENERATED_COLLECTION_PATH}:/collection \
	 	python run python \
	 	bin/parse-gutenberg-library.py /collection

.PHONY: db-flush
db-flush:
	@${REDIS} flushdb

.PHONY: test-autocomplete
test-autocomplete: PATTERN ?=
test-autocomplete:
	@[ "${PATTERN}" ] || ( echo "\033[41m! Make variable PATTERN is not set\033[0m"; exit 1 )
	@${DC_RUN} --entrypoint pipenv --no-deps \
	 	python run python \
		bin/search_autocomplete.py '${PATTERN}'

.PHONY: redis-get-book
redis-get-book: BOOK_ID ?=
redis-get-book:
	@[ "${BOOK_ID}" ] || ( echo "\033[41m! Make variable BOOK_ID is not set\033[0m"; exit 1 )
	@${REDIS} --raw get book:pg:${BOOK_ID} | jq

.PHONY: redis-get-nb-genres
redis-get-nb-genres:
	@${REDIS} --raw hlen genres:hashes_mapping

.PHONY: redis-get-genre-hash
redis-get-genre-hash: GENRE ?=
redis-get-genre-hash:
	@[ "${GENRE}" ] || ( echo "\033[41m! Make variable GENRE is not set\033[0m"; exit 1 )
	@${REDIS} --raw hget genres:hashes_mapping_reversed '${GENRE}'

.PHONY: redis-get-genre-stats
redis-get-genre-stats: GENRE_HASH ?=
redis-get-genre-stats:
	@[ "${GENRE_HASH}" ] || ( echo "\033[41m! Make variable GENRE_HASH is not set\033[0m"; exit 1 )
	@echo "Genre \033[93m$$(${REDIS} hget genres:hashes_mapping '${GENRE_HASH}')\033[0m"
	@echo "Number of books per language:"
	@${REDIS} --csv hgetall 'genres:stats:books_by_lang:${GENRE_HASH}'

.PHONY: black
black:
	@${DC_RUN} --entrypoint pipenv \
	 	python run black src/ bin/
