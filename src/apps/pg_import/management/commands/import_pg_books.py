from pathlib import Path

from django.core.management.base import BaseCommand, CommandError

from pg_import.library_generation_from_raw_data import (
    generate_library_from_raw_gutenberg_data,
)
from ...books_processing import find_and_process_pg_books
from ...db import truncate_gutenberg_raw_data


class Command(BaseCommand):
    help = "Import books from a mirrored Project Gutenberg 'generated' collection"

    def add_arguments(self, parser):
        parser.add_argument("directory", type=str)
        parser.add_argument(
            "--truncate-raw-data",
            action="store_true",
            dest="truncate-raw-data",
            help="Truncates the 'gutenberg_raw_data' table first",
        )
        parser.add_argument(
            "--generate-library",
            action="store_true",
            dest="generate-library",
            help='Generate library entities (books, authors, genre) after having populated the "gutenberg_raw_data" table',
        )
        parser.add_argument(
            "--skip-import",
            action="store_true",
            dest="skip-import",
            help='Skip the import phase (to be used with "--generate-library")',
        )

    def handle(self, *args, **options):
        if not options.get("skip-import"):
            books_directory = options["directory"]
            truncate_first = bool(options.get("truncate-raw-data"))
            self._import_books(books_directory, truncate_first=truncate_first)

        if options["generate-library"]:
            self._generate_library()

    def _import_books(self, directory: str, truncate_first: bool):

        if truncate_first:
            self.stdout.write("Truncating the 'gutenberg_raw_data' table...")
            truncate_gutenberg_raw_data()
            self.stdout.write("Truncated.")

        books_directory = Path(directory)
        if not books_directory.is_dir():
            raise CommandError(
                f"Books directory '{books_directory}' does not exist or is not a directory"
            )

        self.stdout.write(
            "Populating the 'gutenberg_raw_data' table with data from Project Gutenberg files... (mainly the RDF ones)"
        )
        nb_books_processed = find_and_process_pg_books(
            books_directory, log=self.stdout.write
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully imported {nb_books_processed} books into the 'gutenberg_raw_data' table."
            )
        )

    def _generate_library(self):
        self.stdout.write(
            "Now generating library entities (books, authors, genre) from that 'gutenberg_raw_data' table..."
        )
        self.stdout.write("(can take a while ☕)")
        nb_books_created = generate_library_from_raw_gutenberg_data()
        self.stdout.write(
            self.style.SUCCESS(
                f"Library entities generated. (including {nb_books_created} books)"
            )
        )
