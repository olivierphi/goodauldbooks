import typer

app = typer.Typer()

from apps.books_sources.project_gutenberg.cli import main as books_sources_project_gutenberg

app.add_typer(books_sources_project_gutenberg.app, name="pg")

if __name__ == "__main__":
    app()
