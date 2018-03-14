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
    from .utility.scheduler import *
except:
    
    from utility.capture import *
    from utility.analytics import *
    from utility.replay import *
    from utility.login import * 
    from utility.scheduler import *


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
    return dTime.strftime('%Y-%m-%d_%H:%M:%S')

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

@application.route("/capture/list_ongoing", methods=["GET"])
def captureListOngoing():
    headers = request.headers
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pubKey is None or privateKey is None:
        abort(400)
    if verify_login(pubKey, privateKey):
        #capture_names_list = get_capture_list(credentials)
        capture_list = get_all_ongoing_capture_details()
        #capture_list = [get_capture_details(name) for name in capture_names_list]

        return jsonify({
            "captures" : capture_list
        })
    else:
        abort(401)


@application.route("/capture/list_completed", methods=["GET"])
def captureListCompleted():
    headers = request.headers
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pubKey is None or privateKey is None:
        abort(400)
    if verify_login(pubKey, privateKey):
        capture_names = get_capture_list(credentials)
        capture_list = [get_capture_details(name) for name in capture_names]
        return jsonify({
            "captures" : capture_list
        })
    else:
        abort(401)


@application.route("/capture/list_scheduled", methods=["GET"])
def captureListScheduled():
    headers = request.headers
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pubKey is None or privateKey is None:
        abort(400)
    if verify_login(pubKey, privateKey):
        capture_list = get_all_scheduled_capture_details()

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
    rds_name = data['rds']
    username = data['username']
    password = data['password']

    now = [convertDatetimeToString(datetime.utcnow())]
    start_time = data.get('startTime', now)
    start_time = start_time[0]
    
    #TODO verify that capture name is unique. return 403? if not.
    capture_name = data.get('captureName', createCaptureName(rds_name + "_" + db_name, start_time))
    if capture_name == "":
      capture_name = createCaptureName(rds_name + "_" + db_name, start_time)

    if not check_if_capture_name_is_unique(capture_name):
      abort(400)

    

    end_time = data.get('endTime', [None])
    end_time = end_time[0]
    is_scheduled = end_time is not None

    print("==============", file = sys.stderr)
    print(capture_name, file = sys.stderr)
    print(password, file = sys.stderr)
    print(username, file = sys.stderr)
    print(rds_name, file = sys.stderr)
    print(db_name, file = sys.stderr)
    print(start_time, file = sys.stderr)
    print(end_time, file = sys.stderr)
    print("--------------", file = sys.stderr)


    new_capture_process(is_scheduled, credentials, capture_name, 
                            db_name, start_time, end_time, rds_name, username, password)
   
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
    
    #if capture was scheduled, make sure to end process
    #start up a new process for end capture rather than just running function
    capture_details, start_time = end_capture(credentials, capture_name, db_name)

    return jsonify({
        "status": "ended",
        "db": db_name,
        "captureName": capture_name,
        "captureDetails": capture_details,
        "startTime": start_time,
        "endTime": end_time
    })

@application.route("/capture/cancel", methods=["POST"])
def cancel_capture_http():
    data = request.get_json()
    capture_name = data['captureName'] 
    
    cancel_capture_process(capture_name)
    return jsonify({'status': 'complete'})

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

@application.route("/capture/completed_list", methods=["GET"])
def get_all_captures():
  captures = get_capture_list(credentials)    
  return jsonify(captures)

@application.route("/replay", methods=["POST"])
def replay():
    data = request.get_json()
    db_name = data['db'] 
    start_time = data.get('startTime', convertDatetimeToString(datetime.utcnow()))

    replay_name = data.get('replayName', createReplayName(db_name, start_time))
    if replay_name == "":
        replay_name = createReplayName(db_name, start_time)


    capture_name = data['captureName']
    fast_mode = data.get('fastMode', False)
    restore_db = data.get('restoreDb', False)
    
    execute_replay(credentials, db_name, replay_name, capture_name, fast_mode, restore_db)
    return jsonify({
        "status": "started",
        "db": db_name,
        "replayName": replay_name,
        "fastMode": fast_mode,
        "restoreDb": restore_db,
        "startTime": start_time
    })

@application.route("/replay/list", methods=["GET"])
def get_all_replays():
    #capture_replays = get_capture_replay_list(credentials)    
    capture_replays = get_replays_from_table()
    return jsonify(capture_replays)

@application.route("/replay/active_list", methods=["GET"])
def get_active_replays():
    replays = get_active_replays()
    return jsonify(replays)

@application.route("/replay/delete", methods=["DELETE"])
def delete_replay_http():
    #Need a capture name and replay name in order to delete replay
    data = request.get_json()
    capture_name = data['capture'] 
    replay_name = data['replay']
    delete_replay(credentials, capture_name, replay_name)
    return jsonify({'status': 'complete'})

@application.route("/capture/delete", methods=["DELETE"])
def delete_capture_http():
    data = request.get_json()
    capture_name = data['capture'] 
    
    delete_capture(credentials, capture_name)
    return jsonify({'status': 'complete'})

@application.route("/capture/get_past", methods=["GET"])

@application.route("/analytics", methods=["GET"])
def analytics():
    #analyticsNumber = request.args.get('id')
    #print('THIS IS THE CREDENTIALS FROM THE FILLEEEE', file=sys.stderr)
    #print(credentials, file=sys.stderr)
    metrics = get_analytics(credentials)
    return jsonify(metrics)

@application.before_first_request
def _run_on_start():
    init_replay()
    init_scheduler()


if __name__ == "__main__":
    application.run(debug=True, host='0.0.0.0')
