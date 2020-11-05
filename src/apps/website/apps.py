from django.apps import AppConfig


class WebsiteConfig(AppConfig):
    name = "app.website"
    label = "website"

    def ready(self):
        from django.template import engines
        from jinja2.environment import Environment
        from .templating import filters

        jinja_env: Environment = engines["jinja2"].env
        jinja_env.filters["author_full_name"] = filters.author_full_name
