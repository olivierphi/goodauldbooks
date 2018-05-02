GUTENBERG_GENERATED_COLLECTION_PATH?=~/gutenberg-mirror/generated-collection
PSQL?=docker-compose run --rm db-cli

reset_db_and_import_gutenberg_books:
	docker-compose up -d db && sleep 2
	${MAKE} db_update_schema
	${MAKE} build_api_admin
	${MAKE} dump_data_to_import_db
	${MAKE} import_gutenberg_books

import_gutenberg_books: VERBOSITY?=1
import_gutenberg_books:
	time ${PSQL} -c \
		"select * from import.create_books_from_raw_rdfs(wipe_previsous_books => true, verbosity => ${VERBOSITY}::integer);"

build_api_admin:
	cd api-admin/ && \
		make install && \
		make build

dump_data_to_import_db:
	time ./api-admin/dist/cli/store-rsynced-generated-collection-in-db-imports.js ${GUTENBERG_GENERATED_COLLECTION_PATH}

start_dev_api_admin:
	cd api-admin && make start_dev

psql:
	${PSQL}

db_update_schema:
	docker-compose run --rm db-cli \
		-f /host/db/schema/utils.sql \
		-f /host/db/schema/library.sql \
		-f /host/db/schema/import.sql \
		-f /host/db/schema/webapp.sql \
		-f /host/db/schema/api_public.sql

start_api_public:
	docker-compose up -d postgrest

pg_dump_raw_gutenberg_data:
	docker-compose run --rm --entrypoint pg_dump db-cli \
		--data-only \
		-t 'import.gutenberg_raw_data' \
		--format=plain \
		--file=/host/gutenberg_raw_data.sql

pg_restore_raw_gutenberg_data:
	${PSQL} -f /host/gutenberg_raw_data.sql
