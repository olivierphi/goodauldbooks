TS_NODE ?= ./node_modules/.bin/ts-node -P tsnode.tsconfig.json -r tsconfig-paths/register

.PHONY: import-pg-parse-book-from-rdf
import-pg-parse-book-from-rdf: RDF_PATH ?= # mandatory
import-pg-parse-book-from-rdf: 
	@[ "${RDF_PATH}" ] || ( echo "\033[41m! Make variable RDF_PATH is not set\033[0m"; exit 1 )
	@${TS_NODE} bin/import/pg-parse-book-from-rdf.ts ${RDF_PATH}

.PHONY: import-pg-store-raw-gutenberg-library-in-transitional-db
import-pg-store-raw-gutenberg-library-in-transitional-db: COLLECTION_PATH ?= # mandatory
import-pg-store-raw-gutenberg-library-in-transitional-db: DB_PATH ?= # mandatory
import-pg-store-raw-gutenberg-library-in-transitional-db: 
	@[ "${COLLECTION_PATH}" ] || ( echo "\033[41m! Make variable COLLECTION_PATH is not set\033[0m"; exit 1 )
	@[ "${DB_PATH}" ] || ( echo "\033[41m! Make variable DB_PATH is not set\033[0m"; exit 1 )
	@${TS_NODE} bin/import/pg-store-raw-gutenberg-library-in-transitional-db.ts ${COLLECTION_PATH} ${DB_PATH}

.PHONY: import-pg-populate-redis-data-from-transitional-db
import-pg-populate-redis-data-from-transitional-db: DB_PATH ?= # mandatory
import-pg-populate-redis-data-from-transitional-db: 
	@[ "${DB_PATH}" ] || ( echo "\033[41m! Make variable DB_PATH is not set\033[0m"; exit 1 )
	@${TS_NODE} bin/import/pg-populate-redis-data-from-transitional-db.ts ${DB_PATH}
