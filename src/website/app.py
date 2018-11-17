from api.graphql.schema import schema as api_schema
from flask import Flask, render_template
from werkzeug.exceptions import InternalServerError

app = Flask(__name__)


@app.route("/")
def hello():
    graphql_query = """
    query {
        homepageBooks {
            title
        }
    }
    """
    books = api_schema.execute(graphql_query)
    if books.errors:
        raise InternalServerError(description=books.errors)

    return render_template("homepage.html", books=books.data["homepageBooks"])
