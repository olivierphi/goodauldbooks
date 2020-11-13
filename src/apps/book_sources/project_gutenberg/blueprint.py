import click
from flask import Blueprint

from . import cli_commands

blueprint = Blueprint("book_sources_project_gutenberg", __name__)


blueprint.cli.command("store_rsynced_library_in_transitional_db")(
    cli_commands.store_rsynced_library_in_transitional_db
)
