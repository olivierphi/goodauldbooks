GENERATED_COLLECTION_PATH ?= ~/gutenberg-mirror/generated-collection/
DC_RUN = docker-compose run --rm --user $$(id -u):$(id -g)
PIPENV_RUN_PREFIX = ${DC_RUN} -e PYTHONPATH=/app/src --entrypoint pipenv
SQLITE_DB_PATH ?= /app/raw_books.db
REDIS_HOST ?= localhost
REDIS_PORT ?= 16379
REDIS ?= redis-cli -h '${REDIS_HOST}' -p ${REDIS_PORT}

.PHONY: store-raw-gutenberg-library-in-transitional-db
store-raw-gutenberg-library-in-transitional-db:
	@${PIPENV_RUN_PREFIX} \
		-v ${GENERATED_COLLECTION_PATH}:/collection \
	 	python run python \
	 	bin/store-raw-gutenberg-library-in-transitional-db.py /collection '${SQLITE_DB_PATH}'

.PHONY: populate-redis-data-from-transitional-db
populate-redis-data-from-transitional-db:
	@${PIPENV_RUN_PREFIX} \
	 	python run python \
	 	bin/populate-redis-data-from-transitional-db.py '${SQLITE_DB_PATH}'

.PHONY: redis-cli
redis-cli: ARGS ?=
redis-cli:
	@${REDIS} ${ARGS}

.PHONY: redis-flush
redis-flush:
	@${REDIS} flushdb

.PHONY: redis-get-book
redis-get-book: BOOK_ID ?=
redis-get-book:
	@[ "${BOOK_ID}" ] || ( echo "\033[41m! Make variable BOOK_ID is not set\033[0m"; exit 1 )
	@${REDIS} --raw hgetall book:pg:${BOOK_ID}

.PHONY: redis-get-author
redis-get-author: AUTHOR_ID ?=
redis-get-author:
	@[ "${AUTHOR_ID}" ] || ( echo "\033[41m! Make variable AUTHOR_ID is not set\033[0m"; exit 1 )
	@${REDIS} --raw hgetall author:pg:${AUTHOR_ID}

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

.PHONY: test
test: ARGS ?=
test:
	@${PIPENV_RUN_PREFIX} \
	 	python run pytest ${ARGS}

.PHONY: dev-test-autocomplete
dev-test-autocomplete: PATTERN ?=
dev-test-autocomplete:
	@[ "${PATTERN}" ] || ( echo "\033[41m! Make variable PATTERN is not set\033[0m"; exit 1 )
	@${PIPENV_RUN_PREFIX} --no-deps \
	 	python run python \
		bin/dev/test-autocomplete.py '${PATTERN}'

.PHONY: dev-get-book
dev-get-book: ID ?=
dev-get-book:
	@[ "${ID}" ] || ( echo "\033[41m! Make variable ID is not set\033[0m"; exit 1 )
	@${PIPENV_RUN_PREFIX} --no-deps \
	 	python run python \
		bin/dev/get-book.py '${ID}'

.PHONY: dev-test-get-books-by-genre
dev-test-get-books-by-genre: GENRE ?=
dev-test-get-books-by-genre: LNG ?= _all_
dev-test-get-books-by-genre: START ?= 0
dev-test-get-books-by-genre: LIMIT ?= 3
dev-test-get-books-by-genre:
	@[ "${GENRE}" ] || ( echo "\033[41m! Make variable GENRE is not set\033[0m"; exit 1 )
	@${PIPENV_RUN_PREFIX} --no-deps \
	 	python run python \
		bin/dev/test-get-books-by-genre.py '${GENRE}' ${LNG} ${START} ${LIMIT}

.PHONY: dev-test-get-books-by-author
dev-test-get-books-by-author: AUTHOR_ID ?=
dev-test-get-books-by-author: LNG ?= _all_
dev-test-get-books-by-author: START ?= 0
dev-test-get-books-by-author: LIMIT ?= 3
dev-test-get-books-by-author:
	@[ "${AUTHOR_ID}" ] || ( echo "\033[41m! Make variable AUTHOR_ID is not set\033[0m"; exit 1 )
	@${PIPENV_RUN_PREFIX} --no-deps \
	 	python run python \
		bin/dev/test-get-books-by-author.py '${AUTHOR_ID}' ${LNG} ${START} ${LIMIT}
