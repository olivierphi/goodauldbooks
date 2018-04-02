NODE_ENV?=development

NODE_BIN?=./node_modules/.bin

build: copy_assets
	${NODE_BIN}/webpack-cli --mode ${NODE_ENV}

lint:
# @link https://github.com/prettier/prettier/issues/1358#issuecomment-295669193 :-)
	${NODE_BIN}/prettier --write "{,!(node_modules|dist)/**/}*.{js,json,md}"
	${NODE_BIN}/tslint -c tslint.json --fix 'src/**/*.{ts,tsx}'

start_dev: copy_assets
	${NODE_BIN}/webpack-dev-server  --mode ${NODE_ENV}

copy_assets:
	cp index.html dist/index.html