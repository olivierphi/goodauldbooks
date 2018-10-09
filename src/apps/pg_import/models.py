from django.contrib.postgres.fields import JSONField
from django.db import models


class GutenbergRawData(models.Model):
    """"
    Stores raw data (barely processed) about books.
    """

    gutenberg_id = models.PositiveIntegerField(primary_key=True)
    rdf_content = models.TextField()
    assets = JSONField()
    intro = models.TextField(null=True)
    imported_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "gutenberg_raw_data"
