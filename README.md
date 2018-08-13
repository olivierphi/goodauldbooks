# Good Auld Books

A modern Web interface for the [Project Gutenberg](http://gutenberg.org) public domain books collection, powered by React and a (Python) GraphQL API.

_N.B.: This project is not endorsed by the Project Gutenberg: I only used the RDF data that comes with each of their book, from an rsync-ed copy of their collection, and then built everything myself from scratch._

## Technologies

This project is based on the following technologies:

- Backend:

  - [PostgreSQL](https://www.postgresql.org/) (does most of the work, from RDF parsing to search, thanks to custom SQL functions)
  - [Python](https://www.python.org/)
  - [Django](https://www.djangoproject.com/)
  - [Graphene Python](http://graphene-python.org/) (for the GraphQL API layer)

- Frontend:
  - [React](https://www.typescriptlang.org/)
  - [TypeScript](https://www.typescriptlang.org/)
  - [Redux](https://redux.js.org/)

The local dev backend environement is entirely based on Docker and Docker Compose.

## Install

### Make a copy of the Project Gutenberg books collection

```bash
$ rsync -av --progress \
    --exclude-from=$PWD/server/gutenberg-rsync-excludes.txt \
    aleph.gutenberg.org::gutenberg-epub \
    ~/gutenberg-mirror/generated-collection
```

You can go for a walk, the rsync repository is rather huge so this process will likely take a few hours :-)

### Backend

```bash
$ cd server
$ make python_install
$ make reset_db_and_import_gutenberg_books GUTENBERG_GENERATED_COLLECTION_PATH=~/gutenberg-mirror/generated-collection
$ make export_books_langs
```

### Frontend

```bash
$ cd client
$ yarn install
$ make build NODE_ENV=development
```

## Run

### Backend

```bash
$ cd client
$ make start_dev
```

### Frontend

```bash
$ cd server
$ make start_graphql_api
```

## Acknowledgements

Thank you to Dimitri Fontaine for his great book [Mastering PostgreSQL in Application Development](https://masteringpostgresql.com/); go and buy it if you want to unleash the true power of PostgreSQL as an application developer! :-)

And a huge shout-out of course to all the volunteers who contributed to the creation of the Project Gutenberg public domain books collection.

## License

(The MIT License)

Copyright (c) 2018 Olivier Philippon https://github.com/DrBenton

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
