GUTENBERG_GENERATED_COLLECTION_PATH?=~/gutenberg-mirror/generated-collection
PSQL?=docker-compose run --rm psql

reset_db_and_import_gutenberg_books:
	docker-compose up -d db
	${MAKE} db_update_schema
	${MAKE} build_api_admin
	${MAKE} import_gutenberg_books

import_gutenberg_books:
	time ${PSQL} -c 'select * from import.create_books_from_raw_rdfs(false);'

build_api_admin:
	cd api-admin/ && \
		make install && \
		make build && \
		time ./dist/cli/store-rsynced-generated-collection-in-db-imports.js ${GUTENBERG_GENERATED_COLLECTION_PATH}

start_dev_api_admin:
	cd api-admin && make start_dev

psql:
	${PSQL}

db_update_schema:
	docker-compose run --rm psql \
		-f /host/db/schema/utils.sql \
		-f /host/db/schema/library.sql \
		-f /host/db/schema/import.sql \
		-f /host/db/schema/api_public.sql

start_api_public:
	docker-compose up -d postgrest
