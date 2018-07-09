GUTENBERG_GENERATED_COLLECTION_PATH?=~/gutenberg-mirror/generated-collection
PSQL?=docker-compose run --rm --no-deps --user $$(id -u):$$(id -g) db-cli -v ON_ERROR_STOP=1
# @link http://petereisentraut.blogspot.co.uk/2010/03/running-sql-scripts-with-psql.html
PSQL_QUIET?=docker-compose run --rm --no-deps --user $$(id -u):$$(id -g) -e PGOPTIONS='--client-min-messages=warning' db-cli -v ON_ERROR_STOP=1

.phony: reset_db_and_import_gutenberg_books import_gutenberg_books build_api_admin dump_data_to_import_db start_dev_api_admin psql
.phony: db_update_schema start_api_public pg_dump_raw_gutenberg_data pg_restore_raw_gutenberg_data

reset_db_and_import_gutenberg_books:
	docker-compose up -d db && sleep 2
	@echo "\033[36mWiping and re-setting the database...\033[0m"
	@${MAKE} db_update_schema
	@[ -f ./gutenberg_raw_data.sql ] && (\
		echo "\033[36mFound a SQL dump for table 'gutenberg_raw_data.sql'. Using that data instead of re-scanning everything...\033[0m" && \
		${MAKE} pg_restore_raw_gutenberg_data \
	) || (\
		echo "\033[36mScanning rsynced PG collection and copy the raw data in in the 'gutenberg_raw_data' table...\033[0m" && \
		${MAKE} build_api_admin && \
		${MAKE} dump_data_to_import_db_python \
	) || exit 1
	@echo "\033[36mNow converting this raw data from Project Gutenberg into normalised data...\033[0m"
	@${MAKE} import_gutenberg_books
	@echo "\033[36mEditorial pass...\033[0m"
	@${MAKE} editorial_pass
	@echo "\033[36mLast but not least, we project this normalised data into some materialized views...\033[0m"
	@${MAKE} refresh_materialized_views

import_gutenberg_books: VERBOSITY?=1
import_gutenberg_books:
	@echo "\033[36mPopulating 'library' tables from 'import.gutenberg_raw_data' content...\033[0m"
	time ${PSQL} --no-psqlrc \
		-c  "select * from import.create_books_from_raw_rdfs(wipe_previsous_books => true, verbosity => ${VERBOSITY}::integer);"

refresh_materialized_views: VIEWS=library_view.book_with_related_data library_view.genre_with_related_data library_view.book_additional_data
refresh_materialized_views:
	@echo "\033[36mRefreshing related materilized views...\033[0m"
	@$(foreach materialized_view,$(VIEWS),\
		(echo "\033[36m*******\nRefreshing '$(materialized_view)'...\n*******\033[0m" && \
		time ${PSQL} --no-psqlrc -q -b -c "refresh materialized view concurrently $(materialized_view);") || exit 1; \
	)

editorial_pass:
	${PSQL_QUIET} --no-psqlrc -q -b -f /host/db/editing.sql

build_api_admin:
	cd api-admin/ && \
		make install && \
		make build

dump_data_to_import_db_nodejs:
	time ./api-admin/dist/cli/store-rsynced-generated-collection-in-db-imports.js ${GUTENBERG_GENERATED_COLLECTION_PATH}

dump_data_to_import_db_python:
	cd pg-rdfs-indexing && \
		time docker-compose run --rm --entrypoint python --user $(id -u):$(id -g) \
			-v ${GUTENBERG_GENERATED_COLLECTION_PATH}:/gutenberg-mirror/generated-collection \
			python \
				/app/bin/store-rsynced-generated-collection-in-db-imports.py /gutenberg-mirror/generated-collection

start_dev_api_admin:
	cd api-admin && make start_dev

psql: .psql-history
	${PSQL}

db_update_schema: SQL_FILES=schema/utils.sql schema/library.sql schema/library_view.sql schema/import.sql schema/webapp.sql schema/api_public.sql
db_update_schema: .psql-history
# We could have launched all those SQL files in a single pass via multiple "-f" args to psql,
# but we want to stop as soon as one of the file fails for any reason.
	@$(foreach sql_file,$(SQL_FILES),\
		(echo "\033[36m*******\nRunning SQL file '$(sql_file)'...\n*******\033[0m" && \
		${PSQL_QUIET} --no-psqlrc -q -b -f /host/db/$(sql_file)) || exit 1; \
	)

start_api_public:
	docker-compose up -d nginx

pg_dump_raw_gutenberg_data:
	docker-compose run --rm --entrypoint pg_dump db-cli \
		--data-only \
		-t 'import.gutenberg_raw_data' \
		--format=plain \
		--file=/host/gutenberg_raw_data.sql

pg_restore_raw_gutenberg_data:
	${PSQL} --no-psqlrc -q -b \
		-f /host/gutenberg_raw_data.sql

export_books_langs:
	${PSQL} --no-psqlrc \
		-f /host/db/scripts/books-langs.sql \
		| jq '.' --monochrome-output \
		> ../client/generated/data/books-langs.json
	echo "export const json = $$(cat ../client/generated/data/books-langs.json);" > ../client/generated/data/books-langs.json.ts
	rm ../client/generated/data/books-langs.json
	@echo "Books languages exported to '\033[36mclient/generated/data/books-langs.json.ts\033[0m'."

.psql-history:
	touch .psql-history && chmod 777 .psql-history
