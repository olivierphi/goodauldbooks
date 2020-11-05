from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'

# Let's register our Blueprints:
from apps.import_ import apps
app.register_blueprint(apps.blueprint)
