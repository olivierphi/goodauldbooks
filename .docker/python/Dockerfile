FROM python:3.7

RUN pip install --upgrade pip
RUN pip install poetry

# Psycopg2 requirements:
RUN apt update && apt install -y build-essential libpq-dev

ENV PATH "/usr/local/bin/:${PATH}"

ENTRYPOINT ["python"]
