#!/bin/bash
API_URL='https://goodauldbooks-django-api.herokuapp.com/graphql'
BOOK_COVERS_URL='http://www.gutenberg.org/cache/epub'

set -e

cd $(dirname "$0")/../client

sed -i "s~http://localhost:8080/graphql~${API_URL}~" src/app-config.ts
sed -i "s~http://localhost:8080/library/cover~${BOOK_COVERS_URL}~" src/app-config.ts

yarn install
make build NODE_ENV=production
