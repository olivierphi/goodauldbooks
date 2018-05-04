GUTENBERG_GENERATED_COLLECTION_PATH?=~/gutenberg-mirror/generated-collection
PSQL?=docker-compose run --rm db-cli

.phony: reset_db_and_import_gutenberg_books import_gutenberg_books build_api_admin dump_data_to_import_db start_dev_api_admin psql
.phony: db_update_schema start_api_public pg_dump_raw_gutenberg_data pg_restore_raw_gutenberg_data

reset_db_and_import_gutenberg_books:
	docker-compose up -d db && sleep 2
	@echo "\033[36mWiping and re-setting the database...\033[0m"
	@${MAKE} db_update_schema || exit 1
	@[ -f ./gutenberg_raw_data.sql ] && (\
		echo "\033[36mFound a SQL dump for table 'gutenberg_raw_data.sql'. Using that data instead of re-scanning everything...\033[0m" && \
		${MAKE} pg_restore_raw_gutenberg_data \
	) || (\
		echo "\033[36mScanning rsynced PG collection and copy the raw data in in the 'gutenberg_raw_data' table...\033[0m" && \
		${MAKE} build_api_admin && \
		${MAKE} dump_data_to_import_db \
	) || exit 1
	@echo "\033[36mNow converting this raw data from Project Gutenberg into normalised data...\033[0m"
	@${MAKE} import_gutenberg_books

import_gutenberg_books: VERBOSITY?=1
import_gutenberg_books:
	${PSQL} --no-psqlrc \
		-c  "select * from import.create_books_from_raw_rdfs(wipe_previsous_books => true, verbosity => ${VERBOSITY}::integer);"

build_api_admin:
	cd api-admin/ && \
		make install && \
		make build

dump_data_to_import_db:
	time ./api-admin/dist/cli/store-rsynced-generated-collection-in-db-imports.js ${GUTENBERG_GENERATED_COLLECTION_PATH}

start_dev_api_admin:
	cd api-admin && make start_dev

psql: .psql-history
	${PSQL}

db_update_schema: SQL_FILES=schema/utils.sql schema/library.sql schema/import.sql schema/webapp.sql schema/api_public.sql
db_update_schema: .psql-history
# We could have launched all those SQL files in a single pass via multiple "-f" args to psql,
# but we want to stop as soon as one of the file fails for any reason.
	@$(foreach sql_file,$(SQL_FILES),\
		(echo "\033[36mRunning SQL file '$(sql_file)'...\033[0m" && \
		${PSQL} --no-psqlrc -q -b -f /host/db/$(sql_file)) || exit 1; \
	)

start_api_public:
	docker-compose up -d postgrest

pg_dump_raw_gutenberg_data:
	docker-compose run --rm --entrypoint pg_dump db-cli \
		--data-only \
		-t 'import.gutenberg_raw_data' \
		--format=plain \
		--file=/host/gutenberg_raw_data.sql

pg_restore_raw_gutenberg_data:
	${PSQL} --no-psqlrc -q -b \
		-f /host/gutenberg_raw_data.sql

.psql-history:
	touch .psql-history && chmod 777 .psql-history
