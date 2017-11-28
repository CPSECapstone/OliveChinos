# server.py
import sys
import configparser
from flask import Flask, render_template, request, abort

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

pubKey = ""
privateKey = ""
config = configparser.ConfigParser()
config.read('config.ini')
if config['DEFAULT']:
    pubKey = config['DEFAULT']['publicKey']
    privateKey = config['DEFAULT']['privateKey']

credentials = {'aws_access_key_id': pubKey, 'aws_secret_access_key': privateKey}
print (credentials, file=sys.stderr)

@application.route("/")
def index():
    return render_template("index.html")


@application.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    pubKey = data["publicKey"] 
    privateKey = data["privateKey"] 
    if pubKey == None or privateKey == None:
        abort(400)
    if verify_login(pubKey, privateKey):
        return ('', 204)
    else: 
        abort(401) 

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
    application.run(debug=False, host='0.0.0.0')
