from pathlib import Path

import typer

from apps.books_sources.project_gutenberg.mutations import index_collection_in_db

app = typer.Typer()


@app.command()
def index_generated_collection(
    collection_path: Path = typer.Argument(..., exists=True, file_okay=False, dir_okay=True, readable=True)
):
    typer.echo(f"Indexing collection: {collection_path}")
    index_collection_in_db(
        collection_path=collection_path,
        traversal_limit=4,
        db_create_schema=True,
        db_destroy_schema_first=True,
    )


if __name__ == "__main__":
    app()
