FROM python:3.7-slim-stretch

RUN apt update && \
    apt install -y rsync

RUN ln -s /usr/local/bin/python /usr/bin/python && \
    ln -s /usr/local/bin/pip /usr/bin/pip

RUN pip install pipenv
