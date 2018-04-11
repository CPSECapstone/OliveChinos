# server.py
import sys
import configparser
import json
from flask import Flask, render_template, request, abort, jsonify

'''
Importing packages differs on Windows/Mac/Linux.
This is the best way to ensure that all packages are imported
'''
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

'''
Creation of Flask application
'''
application = Flask(__name__, static_folder="../static/dist", template_folder="../static")

'''
Default authentication keys for testing until Instance Profiling 
on AWS is complete 
'''
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

'''
Functions to create unique capture and replay names if none provided
'''
def convertDatetimeToString(dTime):
    return dTime.strftime('%Y-%m-%d_%H:%M:%S')

def createCaptureName(dbName, formattedTime):
    return 'C_' + dbName + '_' + formattedTime

def createReplayName(dbName, formattedTime):
    return 'R_' + dbName + '_' + formattedTime

'''
Runs before each test and checks that the public and private keys
were passed in and valid for the user. 
'''
@application.before_request 
def authenticate_each_request():
    headers = request.headers
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pKey is None or priKey is None:
        abort(400)
    if not verify_login(pKey, priKey):
        abort(401)

'''
Render the home page and React app 
'''
@application.route("/")
def index():
    return render_template("index.html")

'''
Checks login of application
'''
@application.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    given_username = data['username']
    given_password = data['password']
    
    if given_username is None or given_password is None:
        abort(400)
    if global_username == given_username and global_password == given_password:
        return ('', 204)
    else: 
        abort(401) 

'''
Retrieves all database instances for a user 
'''
@application.route("/databaseInstances", methods=["GET"])
def databaseInstances():
    db_instances = list_databases(credentials)
    #convert dictionary to a list of strings
    db_instances = list(db_instances.keys())
    return jsonify({
        "databases" : db_instances
    })
    
'''
--------------CAPTURE ENDPOINTS--------------
'''
'''
Returns list of ongoing captures for a user 
'''
@application.route("/capture/list_ongoing", methods=["GET"])
def captureListOngoing():
    capture_list = get_all_ongoing_capture_details()
    return jsonify({
        "captures" : capture_list
    })


'''
Returns a list of all completed captures for a user 
'''
@application.route("/capture/list_completed", methods=["GET"])
def captureListCompleted():
    capture_names = get_capture_list(credentials)
    capture_list = [get_capture_details(name) for name in capture_names]
    return jsonify({
        "captures" : capture_list
    })

'''
Returns a list of completed captures 
'''
@application.route("/capture/completed_list", methods=["GET"])
def get_all_captures_http():
  captures = get_capture_list(credentials)    
  return jsonify(captures)

'''
Returns a list of all scheduled captures for a user that have 
not run yet. 
'''
@application.route("/capture/list_scheduled", methods=["GET"])
def captureListScheduled():
    capture_list = get_all_scheduled_capture_details()
    return jsonify({
        "captures" : capture_list
    })
    
'''
Returns all replays associated with the specified capture 
'''
@application.route("/capture/replayList", methods=["GET"])
def replayListForSpecificCapture():
    capture_name = request.args.get("captureName")
    replay_list = get_replays_for_capture(credentials, capture_name)
    return jsonify({
        "captureName": capture_name,
        "replays" : replay_list
    })

'''
Starts a capture.
If a starttime and endtime are provided, then the capture will 
be scheduled to run at a certain time.
'''
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
    
    capture_name = data.get('captureName', createCaptureName(rds_name + "_" + db_name, start_time))
    if capture_name == "":
      capture_name = createCaptureName(rds_name + "_" + db_name, start_time)

    if not check_if_capture_name_is_unique(capture_name):
      abort(400)

    end_time = data.get('endTime', [None])
    end_time = end_time[0]
    is_scheduled = end_time is not None

    new_capture_process(is_scheduled, credentials, capture_name, 
                            db_name, start_time, end_time, rds_name, username, password)
   
    return jsonify({
        "status": "started",
        "db": db_name,
        "captureName": capture_name,
        "startTime": start_time,
        "endTime": end_time
    })

'''
Ends a specified capture.
'''
@application.route("/capture/end", methods=["POST"])
def capture_end():
    data = request.get_json()
    db_name = data['db'] 
    capture_name = data['captureName']
    end_time = convertDatetimeToString(datetime.utcnow())
    
    #if capture was scheduled, make sure to end process
    #start up a new process for end capture rather than just running function
    start_time = end_capture(credentials, capture_name, db_name)

    return jsonify({
        "status": "ended",
        "db": db_name,
        "captureName": capture_name,
        "captureDetails": start_time,
        "startTime": start_time,
        "endTime": end_time
    })
'''
Cancels a scheduled capture from ever running
'''
@application.route("/capture/cancel", methods=["POST"])
def cancel_capture_http():
    data = request.get_json()
    capture_name = data['captureName'] 
    
    cancel_capture_process(capture_name)
    return jsonify({'status': 'complete'})

'''
Deletes a completed capture from the utility database 
'''
@application.route("/capture/delete", methods=["DELETE"])
def delete_capture_http():
    data = request.get_json()
    capture_name = data['capture'] 
    
    delete_capture(credentials, capture_name)
    return jsonify({'status': 'complete'})

'''
Returns the number of currently active captures 
'''
@application.route("/capture/number", methods=["GET"])
def get_capture_number_http():
    capture_number = get_capture_number()
    return jsonify({'numberOfCaptures': capture_number})

'''
----------------REPLAY ENDPOINTS-------------------
'''
'''
Creates a new replay.
Must specify the db, rds, username, and password to connect to the database
'''
@application.route("/replay", methods=["POST"])
def replay_http():
    data = request.get_json()
    db_name = data['db'] 
    rds_name = data['rds']
    username = data['username']
    password = data['password']

    start_time = data.get('startTime', convertDatetimeToString(datetime.utcnow()))

    replay_name = data.get('replayName', createReplayName(db_name, start_time))
    if replay_name == "":
        replay_name = createReplayName(db_name, start_time)

    if check_replay_name_is_unique(capture_name, replay_name):
        abort(400)

    capture_name = data['captureName']
    fast_mode = data.get('fastMode', False)
    restore_db = data.get('restoreDb', False)
    
    execute_replay(credentials, db_name, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password)
    return jsonify({
        "status": "started",
        "db": db_name,
        "replayName": replay_name,
        "fastMode": fast_mode,
        "restoreDb": restore_db,
        "startTime": start_time
    })

'''
Returns a list of all replays
'''
@application.route("/replay/list", methods=["GET"])
def get_all_replays_http():
    capture_replays = get_replays_from_table()
    return jsonify(capture_replays)

'''
Returns a list of all currently active replays 
'''
@application.route("/replay/active_list", methods=["GET"])
def get_active_replays_http():
    replays = get_active_replays()
    return jsonify(replays)

'''
Returns the number of currently active replays 
'''
@application.route("/replay/number", methods=["GET"])
def get_replay_number_http():
    replays = get_active_replays()
    return jsonify(replays)

'''
Deletes a completed replay from the utility database 
'''
@application.route("/replay/delete", methods=["DELETE"])
def delete_replay_http():
    data = request.get_json()
    capture_name = data['capture'] 
    replay_name = data['replay']
    delete_replay(credentials, capture_name, replay_name)
    return jsonify({'status': 'complete'})


'''
---------------ANALYTICS ENDPOINT--------------
'''
'''
Returns all analytics for a user 
'''
@application.route("/analytics", methods=["GET"])
def analytics():
    metrics = get_analytics(credentials)
    return jsonify(metrics)

'''
Function needed to start Multiprocessing code after application 
bootstraps but before any requests to the API have been made
'''
@application.before_first_request
def _run_on_start():
    init_replay()
    init_scheduler()

'''
Default username and password for testing if none are given 
'''
global_username = "abc"
global_password = "123"

'''
Code to run application
'''
if __name__ == "__main__":
    try:
        global_username, global_password = sys.argv[1:3]
    except Exception:
        pass
    application.run(debug=True, host='0.0.0.0')
