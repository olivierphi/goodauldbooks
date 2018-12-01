NODE_ENV?=development

ROOT ?= ../../..
NODE_BIN ?= ./node_modules/.bin
NODE_BIN_ROOT ?= ${ROOT}/node_modules/.bin

clean:
	@rm -rf js/ || true
	@mkdir -p js/

install:
	yarn install
	rm -rf rm node_modules/@goodauldbooks/library && ln -s ../../../library node_modules/@goodauldbooks/library

build:
	@${MAKE} --no-print-directory clean
	@${MAKE} --no-print-directory build_js

build_js:
	@${NODE_BIN_ROOT}/tsc
	@chmod +x ./js/cli/*.js

lint:
# @link https://github.com/prettier/prettier/issues/1358#issuecomment-295669193 :-)
	@${NODE_BIN_ROOT}/prettier --config ${ROOT}/prettier.config.js --write "{,!(node_modules|dist)/**/}*.{js,ts,json,md}"
	@${NODE_BIN_ROOT}/tslint --fix 'packages/@goodauldbooks/import/src/**/*.ts'
