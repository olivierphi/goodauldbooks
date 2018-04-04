NODE_ENV?=development

NODE_BIN?=./node_modules/.bin

build:
	cd client && make build
	cd server && make build

lint:
	cd client && make lint
	cd server && make lint
