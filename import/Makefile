NODE_ENV?=development

NODE_BIN?=../node_modules/.bin

clean:
	@rm -rf js/ || true
	@mkdir -p js/

install:
	yarn install

build:
	@${MAKE} --no-print-directory clean
	@${MAKE} --no-print-directory build_js

build_js:
	@${NODE_BIN}/tsc
	@chmod +x ./js/cli/*.js

lint:
# @link https://github.com/prettier/prettier/issues/1358#issuecomment-295669193 :-)
	@${NODE_BIN}/prettier --config ../prettier.config.js --write "{,!(node_modules|dist)/**/}*.{js,ts,json,md}"
	@${NODE_BIN}/tslint --fix 'src/**/*.ts'
