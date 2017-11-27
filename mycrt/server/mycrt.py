# server.py
from flask import Flask, render_template, request

try:
    from .utility.capture import *
    from .utility.analytics import *
    from .utility.replay import *
    from .utility.login import *
except:
    
    from utility.capture import *
    from utility.analytics import *
    from utility.replay import *
    from utility.login import *


application = Flask(__name__, static_folder="../static/dist", template_folder="../static")

pubKey = "abc"
privateKey = "123"
credentials = {'aws_access_key_id': pubKey, 'aws_secret_access_key': privateKey}

@application.route("/")
def index():
    return render_template("index.html")


# this is an example of a route to get data from functions in the python files
# and send it to the user interface


@application.route("/login", methods=["POST"])
def login():
    pubKey = request.values.get('pubKey') # Your form's
    privateKey = request.values.get('privateKey') # input names
    return verify_login(pubKey, privateKey)

@application.route("/capture/start", methods=["POST"])
def capture_start():
    #db_name = request.values.get('db') 
    return start_capture(credentials)

@application.route("/capture/end", methods=["POST"])
def capture_end():
    #db_name = request.values.get('db') 
    return end_capture(credentials)

@application.route("/replay", methods=["POST"])
def replay():
    #db_name = request.values.get('db') 
    return execute_replay(credentials)

@application.route("/analytics", methods=["GET"])
def analytics():
    #analyticsNumber = request.args.get('id')
    return get_analytics()



if __name__ == "__main__":
    application.run(host='0.0.0.0')
