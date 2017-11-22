# server.py
from flask import Flask, render_template
from Analytics import *

application = Flask(__name__, static_folder="../static/dist", template_folder="../static")

@application.route("/")
def index():
    return render_template("index.html")


# this is an example of a route to get data from functions in the python files
# and send it to the user interface


@application.route("/analytics")
def analytics():
    return get_analytics()

if __name__ == "__main__":
    application.run(host='0.0.0.0')
