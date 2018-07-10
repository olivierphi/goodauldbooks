# This is a raw copy-paste from https://github.com/begriffs/postgrest/blob/master/docker/Dockerfile
# The only difference is that I don't COPY the postgrest.conf into the container.

FROM debian:jessie

# Install libpq5
RUN apt-get -qq update && \
    apt-get -qq install -y --no-install-recommends libpq5 && \
    apt-get -qq clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ARG POSTGREST_VERSION=v0.4.4.0

# Install postgrest
RUN BUILD_DEPS="curl ca-certificates xz-utils" && \
    apt-get -qq update && \
    apt-get -qq install -y --no-install-recommends $BUILD_DEPS && \
    cd /tmp && \
    curl -SLO https://github.com/begriffs/postgrest/releases/download/${POSTGREST_VERSION}/postgrest-${POSTGREST_VERSION}-ubuntu.tar.xz && \
    tar -xJvf postgrest-${POSTGREST_VERSION}-ubuntu.tar.xz && \
    mv postgrest /usr/local/bin/postgrest && \
    cd / && \
    apt-get -qq purge --auto-remove -y $BUILD_DEPS && \
    apt-get -qq clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# PostgREST reads /etc/postgrest.conf so map the configuration
# file in when you run this container
CMD exec postgrest /etc/postgrest.conf

EXPOSE 3000
