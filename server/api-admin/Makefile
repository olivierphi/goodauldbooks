NODE_ENV?=development

NODE_BIN?=./node_modules/.bin
NODE_BIN_ROOT?=../../node_modules/.bin

clean:
	rm -rf dist/ || true
	mkdir -p dist/

install:
	yarn install

build:
	${MAKE} clean
	${MAKE} build_js

build_js:
	${NODE_BIN}/tsc
	chmod +x ./dist/cli/*.js

lint:
# @link https://github.com/prettier/prettier/issues/1358#issuecomment-295669193 :-)
	${NODE_BIN_ROOT}/prettier --config ../../prettier.config.js --write "{,!(node_modules|dist)/**/}*.{js,json,md}"
	${NODE_BIN_ROOT}/tslint --fix 'src/**/*.ts'

start_dev: clean start_db
	${NODE_BIN}/tsc --watch

copy_assets:
	cp index.html dist/index.html

start_db:
	cd ../ && make db_update_schema
