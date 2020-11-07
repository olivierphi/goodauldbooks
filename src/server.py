from flask import Flask

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, World!"


# Settings are hard-coded for now - won't be like this for too long :-)
from logging.config import dictConfig
from project.settings.logging import dev_logging_config

dictConfig(dev_logging_config.LOGGING)

# Let's register our Blueprints:
from apps.book_sources.project_gutenberg.blueprint import (
    blueprint as project_gutenberg_blueprint,
)

app.register_blueprint(project_gutenberg_blueprint)
