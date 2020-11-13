import importlib
import os
import typing as t

from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object(os.getenv('FLASK_SETTINGS_MODULE', 'project.settings.production'))# a la Django

db = SQLAlchemy(app)

@app.route("/")
def hello_world():
    return "Hello, World!"


# Settings are hard-coded for now - won't be like this for too long :-)
from logging.config import dictConfig
from project.settings.logging import dev_logging_config

dictConfig(dev_logging_config.LOGGING)

# Let's register our Blueprints:
blueprint_module_paths: t.Tuple[str, ...] = (
    "apps.library.blueprint",
    "apps.book_sources.project_gutenberg.blueprint",
)
for module_path in blueprint_module_paths:
    blueprint_module = importlib.import_module(module_path)
    app.register_blueprint(blueprint_module.blueprint)
