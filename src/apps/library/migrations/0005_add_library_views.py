# pylint: skip-file

from django.db import migrations
from pathlib import Path

sql_folder = Path(__file__).parent / "sql"
with open(sql_folder / "0005_add_library_views.sql") as forward:
    FORWARD_SQL = forward.read()
with open(sql_folder / "0005_add_library_views.reverse.sql") as reverse:
    REVERSE_SQL = reverse.read()


class Migration(migrations.Migration):
    dependencies = [("library", "0004_add_unique_index_on_bookasset")]

    operations = [migrations.RunSQL(FORWARD_SQL, reverse_sql=REVERSE_SQL)]
