from pathlib import Path
import typing as t

import click
from flask import Blueprint

blueprint = Blueprint("import", __name__)

@blueprint.cli.command('store_rsynced_library_in_transitional_db')
@click.argument("pg_collection_path", type=click.Path(exists=True, file_okay=False))
@click.argument("sqlite_db_path", type=click.Path(dir_okay=False))
@click.option("--limit", type=click.INT)
def store_rsynced_library_in_transitional_db(*, pg_collection_path: str, sqlite_db_path: str, limit: t.Optional[int]):
    print("iop")
    print(Path(pg_collection_path), sqlite_db_path)
