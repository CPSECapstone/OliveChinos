# server.py
import sys
import configparser
import json
from flask import Flask, render_template, request, abort, jsonify

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
region = ""
config = configparser.ConfigParser()
config.read('config.ini')
if config['DEFAULT']:
    pubKey = config['DEFAULT']['publicKey']
    privateKey = config['DEFAULT']['privateKey']
    region = config['DEFAULT']['region']

credentials = {'aws_access_key_id': pubKey, 'aws_secret_access_key': privateKey, 'region_name': region}
print (credentials, file=sys.stderr)

def convertDatetimeToString(dTime):
    return dTime.strftime('%Y/%m/%d_%H:%M:%S')

def createCaptureName(dbName, formattedTime):
    return 'C_' + dbName + '_' + formattedTime

def createReplayName(dbName, formattedTime):
    return 'R_' + dbName + '_' + formattedTime

@application.route("/")
def index():
    return render_template("index.html")

@application.route("/test")
def rest_test():
    return "Test REST endpoint."


@application.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    pubKey = data["publicKey"] 
    privateKey = data["privateKey"] 
    if pubKey is None or privateKey is None:
        abort(400)
    if verify_login(pubKey, privateKey):
        return ('', 204)
    else: 
        abort(401) 

@application.route("/databaseInstances", methods=["GET"])
def databaseInstances():
    headers = request.headers
    #TODO. Temporary: if public and private Key are not passed in headers, 
    # default to config.ini values
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pKey is None or priKey is None:
        abort(400)
    if verify_login(pKey, priKey):
        db_instances = list_databases(credentials)
        db_instances = list(db_instances.keys())
        return jsonify({
            "databases" : db_instances
        })
    else: 
        abort(401) 

@application.route("/capture/list", methods=["GET"])
def captureList():
    headers = request.headers
    #TODO. Temporary: if public and private Key are not passed in headers, 
    # default to config.ini values
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pKey is None or priKey is None:
        abort(400)
    if verify_login(pKey, priKey):
        capture_list = get_capture_list(credentials)
        return jsonify({
            "captures" : capture_list
        })
    else: 
        abort(401) 

@application.route("/capture/replayList", methods=["GET"])
def replayListForSpecificCapture():
    headers = request.headers
    capture_name = request.args.get("captureName")
    #TODO. Temporary: if public and private Key are not passed in headers, 
    # default to config.ini values
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pKey is None or priKey is None:
        abort(400)
    if verify_login(pKey, priKey):
        replay_list = get_replays_for_capture(credentials, capture_name)
        return jsonify({
            "captureName": capture_name,
            "replays" : replay_list
        })
    else: 
        abort(401) 

@application.route("/capture/start", methods=["POST"])
def capture_start():
    data = request.get_json()
    db_name = data['db'] 
    start_time = data.get('startTime', convertDatetimeToString(datetime.utcnow()))
    
    #TODO verify that capture name is unique. return 403? if not.
    capture_name = data.get('captureName', createCaptureName(db_name, start_time))
    
    end_time = data.get('endTime', 'No end time..')
    
    start_capture(credentials, db_name)
    return jsonify({
        "status": "started",
        "db": db_name,
        "captureName": capture_name,
        "startTime": start_time,
        "endTime": end_time
    })

@application.route("/capture/end", methods=["POST"])
def capture_end():
    data = request.get_json()
    db_name = data['db'] 
    capture_name = data['captureName']
    end_time = convertDatetimeToString(datetime.utcnow())
    
    capture_details, start_time = end_capture(credentials, capture_name, db_name)

    return jsonify({
        "status": "ended",
        "db": db_name,
        "captureName": capture_name,
        "captureDetails": capture_details,
        "startTime": start_time,
        "endTime": end_time
    })

@application.route("/capture/executeQuery", methods=["POST"])
def query_execute():
    query = request.get_json()['query']
    print()
    try:
        execute_query(query)
        return jsonify({
                "status": "success",
                "query" : query
            })
    except:
        return jsonify({
                "status": "failure",
                "query" : query
            })

@application.route("/replay", methods=["POST"])
def replay():
    data = request.get_json()
    db_name = data['db'] 
    start_time = data.get('startTime', convertDatetimeToString(datetime.utcnow()))

    replay_name = data.get('replayName', createReplayName(db_name, start_time))
    capture_name = data['captureName']
    fast_mode = data.get('fastMode', False)
    restore_db = data.get('restoreDb', False)
    
    execute_replay(credentials)
    return jsonify({
        "status": "started",
        "db": db_name,
        "replayName": replay_name,
        "fastMode": fast_mode,
        "restoreDb": restore_db,
        "startTime": start_time
    })

@application.route("/analytics", methods=["GET"])
def analytics():
    #analyticsNumber = request.args.get('id')
    print('THIS IS THE CREDENTIALS FROM THE FILLEEEE', file=sys.stderr)
    print(credentials, file=sys.stderr)
    metrics = get_analytics(credentials)
    return jsonify(metrics)



if __name__ == "__main__":
    application.run(debug=True, host='0.0.0.0')
