from flask import Blueprint
from flask.blueprints import BlueprintSetupState

blueprint = Blueprint("library", __name__)

def load_models(state:BlueprintSetupState):
    from . import models
blueprint.record_once(load_models)

