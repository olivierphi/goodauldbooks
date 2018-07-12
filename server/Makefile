GUTENBERG_GENERATED_COLLECTION_PATH ?= ~/gutenberg-mirror/generated-collection
DC_RUN ?= docker-compose run --rm --user $$(id -u):$$(id -g)
PSQL ?= docker-compose run --rm --no-deps --user $$(id -u):$$(id -g) db-cli -v ON_ERROR_STOP=1
# @link http://petereisentraut.blogspot.co.uk/2010/03/running-sql-scripts-with-psql.html
PSQL_QUIET ?= docker-compose run --rm --no-deps --user $$(id -u):$$(id -g) -e PGOPTIONS='--client-min-messages=warning' db-cli -v ON_ERROR_STOP=1
PYTHON_DC_PREFIX ?= ${DC_RUN} --entrypoint python -e PYTHONPATH=/app/src

.phony: reset_db_and_import_gutenberg_books
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

.phony: import_gutenberg_books
import_gutenberg_books: VERBOSITY?=1
import_gutenberg_books:
	@echo "\033[36mPopulating 'library' tables from 'import.gutenberg_raw_data' content...\033[0m"
	time ${PSQL} --no-psqlrc \
		-c  "select * from import.create_books_from_raw_rdfs(wipe_previsous_books => true, verbosity => ${VERBOSITY}::integer);"

.phony: refresh_materialized_views
refresh_materialized_views: VIEWS=library_view.book_with_related_data library_view.genre_with_related_data library_view.book_additional_data
refresh_materialized_views:
	@echo "\033[36mRefreshing related materilized views...\033[0m"
	@$(foreach materialized_view,$(VIEWS),\
		(echo "\033[36m*******\nRefreshing '$(materialized_view)'...\n*******\033[0m" && \
		time ${PSQL} --no-psqlrc -q -b -c "refresh materialized view concurrently $(materialized_view);") || exit 1; \
	)

.phony: editorial_pass
editorial_pass:
	${PSQL_QUIET} --no-psqlrc -q -b -f /host/db/editing.sql

.phony: build_api_admin
build_api_admin:
	cd api-admin/ && \
		make install && \
		make build

.phony: dump_data_to_import_db_nodejs
dump_data_to_import_db_nodejs:
	time ./api-admin/dist/cli/store-rsynced-generated-collection-in-db-imports.js ${GUTENBERG_GENERATED_COLLECTION_PATH}

.phony: dump_data_to_import_db_python
dump_data_to_import_db_python:
	${PYTHON_DC_PREFIX} \
		-v ${GUTENBERG_GENERATED_COLLECTION_PATH}:/gutenberg-mirror/generated-collection \
		python \
		bin/import-books-data.py /gutenberg-mirror/generated-collection

.phony: rsync_and_import_book
rsync_and_import_book: OPTS=
rsync_and_import_book:
	${PYTHON_DC_PREFIX} \
		-v ${GUTENBERG_GENERATED_COLLECTION_PATH}:/gutenberg-mirror/generated-collection \
		python \
		bin/rsync-and-import-book.py ${PG_BOOK_ID} /gutenberg-mirror/generated-collection ${OPTS}

.phony: start_dev_api_admin
start_dev_api_admin:
	cd api-admin && make start_dev

.phony: psql
psql: .psql-history
	${PSQL}

.phony: db_update_schema
db_update_schema: SQL_FILES=schema/utils.sql schema/library.sql schema/library_view.sql schema/import.sql schema/webapp.sql schema/api_public.sql
db_update_schema: .psql-history
# We could have launched all those SQL files in a single pass via multiple "-f" args to psql,
# but we want to stop as soon as one of the file fails for any reason.
	@$(foreach sql_file,$(SQL_FILES),\
		(echo "\033[36m*******\nRunning SQL file '$(sql_file)'...\n*******\033[0m" && \
		${PSQL_QUIET} --no-psqlrc -q -b -f /host/db/$(sql_file)) || exit 1; \
	)

python_shell:
	${DC_RUN} --entrypoint sh -e PYTHONPATH=/app/src -w /app/django python

python_install:
	${DC_RUN} --entrypoint pip python install --user ${PKG}

django_manage:
	${DC_RUN} --entrypoint python -e TERM=xterm-256color -w /app/django -p 9000:8000 python manage.py ${MANAGE_CMD}

django_shell:
	${MAKE} django_manage MANAGE_CMD='shell'

django_runserver:
	${MAKE} django_manage MANAGE_CMD='runserver 0:8000'

.phony: start_api_public
start_api_public:
	docker-compose up -d nginx

.phony: pg_dump_raw_gutenberg_data
pg_dump_raw_gutenberg_data:
	docker-compose run --rm --user $$(id -u):$$(id -g) --entrypoint pg_dump db-cli \
		--data-only \
		-t 'import.gutenberg_raw_data' \
		--format=plain \
		--file=/host/gutenberg_raw_data.sql

.phony: pg_restore_raw_gutenberg_data
pg_restore_raw_gutenberg_data:
	${PSQL} --no-psqlrc -q -b \
		-f /host/gutenberg_raw_data.sql

.phony: export_books_langs
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
