import typing as t

from django.contrib import admin
from django import forms

from . import models


class BookAdminForm(forms.ModelForm):
    subtitle = forms.CharField(max_length=255, required=False)
    size = forms.IntegerField(min_value=0, required=False)

    def clean_subtitle(self):
        if self.cleaned_data["subtitle"] == "":
            return None
        return self.cleaned_data["subtitle"]

    class Meta:
        model = models.Book
        fields = "__all__"


@admin.register(models.Book)
class BookAdmin(admin.ModelAdmin):
    form = BookAdminForm
    list_display = ("public_id", "lang", "title", "subtitle", "highlight", "weight")
    list_display_links = ("public_id", "title")
    search_fields = ("public_id", "title")
    autocomplete_fields = ("authors", "genres")
    readonly_fields = ("public_id", "slug", "size")
    list_filter = ("highlight",)
    list_per_page = 30

    def weight(self, obj: models.Book) -> t.Optional[str]:
        if obj.size is None:
            return None
        return f"{round(obj.size / 1024):,}K"

    weight.admin_order_field = "size"


@admin.register(models.Author)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ("public_id", "first_name", "last_name")
    search_fields = ("public_id", "first_name", "last_name")
    readonly_fields = ("public_id", "slug")
    list_per_page = 30


@admin.register(models.Genre)
class GenreAdmin(admin.ModelAdmin):
    search_fields = ("name",)
    readonly_fields = ("id", "slug")
    list_per_page = 30
