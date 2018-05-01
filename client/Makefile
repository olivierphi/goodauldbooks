NODE_ENV?=development

NODE_BIN?=./node_modules/.bin
NODE_BIN_ROOT?=../node_modules/.bin

clean:
	rm -rf dist/
	mkdir -p dist/

build:
	${MAKE} clean
	${MAKE} copy_assets
	${NODE_BIN}/concurrently --names "js,css" \
		"${MAKE} build_js" \
		"${MAKE} build_css"

build_js:
	${NODE_BIN}/webpack-cli --mode ${NODE_ENV}

build_css:
	${NODE_BIN}/webpack-cli --mode ${NODE_ENV} --config webpack.config.scss.js

lint:
# @link https://github.com/prettier/prettier/issues/1358#issuecomment-295669193 :-)
	${NODE_BIN_ROOT}/prettier --config ../prettier.config.js --write "{,!(node_modules|dist)/**/}*.{js,ts,tsx,json,md}"
	${NODE_BIN_ROOT}/tslint --fix 'src/**/*.{ts,tsx}'

start_dev: copy_assets
	${NODE_BIN}/concurrently --names "js,css" \
		"${NODE_BIN}/webpack-dev-server  --mode ${NODE_ENV}" \
		"${NODE_BIN}/webpack-cli --watch --mode ${NODE_ENV} --config webpack.config.scss.js"

copy_assets:
	cp index.html dist/index.html
