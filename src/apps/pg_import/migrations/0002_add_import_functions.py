# pylint: skip-file

from pathlib import Path

from django.db import migrations

sql_folder = Path(__file__).parent / "sql"
with open(sql_folder / "0002_add_import_functions.sql") as forward:
    FORWARD_SQL = forward.read()
with open(sql_folder / "0002_add_import_functions.reverse.sql") as reverse:
    REVERSE_SQL = reverse.read()


class Migration(migrations.Migration):
    dependencies = [("pg_import", "0001_initial")]

    operations = [migrations.RunSQL(FORWARD_SQL, reverse_sql=REVERSE_SQL)]
