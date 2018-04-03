NODE_ENV?=development

NODE_BIN?=./node_modules/.bin

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
	${NODE_BIN}/prettier --write "{,!(node_modules|dist)/**/}*.{js,json,md}"
	${NODE_BIN}/tslint -c tslint.json --fix 'src/**/*.{ts,tsx}'

start_dev: copy_assets
	${NODE_BIN}/concurrently --names "js,css" \
		"${NODE_BIN}/webpack-dev-server  --mode ${NODE_ENV}" \
		"${NODE_BIN}/webpack-cli --watch --mode ${NODE_ENV} --config webpack.config.scss.js"

copy_assets:
	cp index.html dist/index.html