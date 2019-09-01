FROM ruby:2.6

RUN apt update && apt install -y \
    curl \
    libpq-dev \
    vim \
    sqlite3
# - vim is needed for `rails credentials:edit`
# - sqlite3 is needed for the gem "sqlite3"

# Install Node.js
RUN curl 'https://nodejs.org/dist/v10.15.2/node-v10.15.2-linux-x64.tar.xz' \
    | tar --file=- --extract --xz --directory /usr/local/ --strip-components=1
RUN npm i -g yarn

# Let's fix some encoding issues in IRB:
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-6
