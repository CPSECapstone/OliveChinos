# server.py
from flask import Flask, render_template

try:
    from .utility.analytics import *
except SystemError:
    from utility.analytics import *

application = Flask(__name__, static_folder="../static/dist", template_folder="../static")

@application.route("/")
def index():
    return render_template("index.html")


# this is an example of a route to get data from functions in the python files
# and send it to the user interface


@application.route("/login", methods=["POST"])
def login():
	pubKey = flask.request.values.get('pubKey') # Your form's
    privateKey = flask.request.values.get('privateKey') # input names
    return check_login(pubKey, privateKey)

@application.route("/capture/start", methods=["POST"])
def capture():
    db_name = flask.request.values.get('db') 
    return start_capture()

@application.route("/capture/end", methods=["POST"])
def capture():
    db_name = flask.request.values.get('db') 
    return end_capture()

@application.route("/replay", methods=["POST"])
def replay():
    db_name = flask.request.values.get('db') 
    return start_replay()

@application.route("/analytics", methods=["GET"])
def analytics():
	analyticsNumber = flask.request.args.get('id')
    return get_analytics()



if __name__ == "__main__":
    application.run(host='0.0.0.0')
