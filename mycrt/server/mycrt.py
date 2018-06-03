# server.py
import sys
import configparser
import json
import pprint
from flask import Flask, render_template, request, abort, jsonify
from flask_mail import Mail, Message

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
    from .utility.communications import *
except:
    from utility.communications import *
    from utility.capture import *
    from utility.analytics import *
    from utility.replay import *
    from utility.login import *
    from utility.scheduler import *

application = Flask(__name__, static_folder="../static/dist", template_folder="../static")

application.config.update(
    MAIL_SERVER='smtp.gmail.com',
    MAIL_PORT=465,
    MAIL_USE_SSL=True,
    MAIL_USERNAME = 'olivechinosmycrt@gmail.com',
    MAIL_PASSWORD = 'alexsjawline',
    MAIL_DEFAULT_SENDER = 'olivechinosmycrt@gmail.com'
)

mail = Mail(application)
mail.init_app(application)

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
elif config["REGION_ONLY"]:
    region = config["REGION_ONLY"]['region']
    credentials = {'region_name' : region}
else:
    raise Exception("config.ini File must be in either the DEFAULT or REGION_ONLY configuration.")

utilitydb = configparser.ConfigParser()
utilitydb.read('utilitydb.ini')
print(utilitydb)
if utilitydb['DEFAULT']:
    util_s3 = utilitydb['DEFAULT']['S3name']
else:
    raise Exception("utilitydb.ini File must be in the DEFAULT configuration.")


print(credentials)

ComManager.util_db = 'util.db'
ComManager.credentials = credentials.copy()
ComManager.S3name = util_s3
cm = ComManager()

'''
Functions to create unique capture and replay names if none provided
'''
def _convertDatetimeToString(dTime):
    return dTime.strftime('%Y-%m-%d_%H:%M:%S')

def _createCaptureName(dbName, formattedTime):
    return 'C_' + dbName + '_' + formattedTime

def _createReplayName(dbName, formattedTime):
    return 'R_' + dbName + '_' + formattedTime

'''
TESTING OUT WEBSOCKETS
'''

from flask_socketio import SocketIO, send, emit

socketio = SocketIO(application)

@socketio.on('connect')
def _handle_client_connect_event():
    print('----------CLIENT CONNECTED ---------', file=sys.stderr)

    #print('received json: {0}'.format(str(json)), file=sys.stderr)

@socketio.on('disconnect')
def _handle_client_disconnect_event():
    print('----------CLIENT DISCONNECTED ---------', file=sys.stderr)



@socketio.on('get_capture_replay_number')
def handle_alert_event(json):
    ''' Called when the client needs the websocket to update the ongoing capture and replay count. Issued with a websocketio request to 'get_capture_replay_number'
    '''
    global cm
    capture_count = get_capture_number(cm)
    replay_count = get_replay_number()
    emit('replayNumber', replay_count)
    emit('captureNumber', capture_count)

@application.route('/update_capture_count', methods=["GET"])
def update_capture_count_http():
    ''' Updates the ongoing capture count to the client. Issued with a GET request to '/update_capture_count'
    '''
    global cm
    capture_count = get_capture_number(cm)
    print("CAPTURE COUNT: ", capture_count, file=sys.stderr)
    socketio.emit('captureNumber', capture_count)
    return ('', 200) 

@application.route('/update_replay_count', methods=["GET"])
def update_replay_count_http():
    ''' Updates the ongoing replay count to the client. Issued with a GET request to '/update_replay_count'
    '''
    replay_count = get_replay_number() 
    print("REPLAY COUNT: ", replay_count, file=sys.stderr)
    socketio.emit('replayNumber', replay_count)
    return ('', 200) 

@application.route('/update_analytics', methods=["GET"])
def update_analytics_http():
    ''' Updates the list of analytics objects to the client. Issued with a GET request to '/update_analytics'
    '''
    socketio.emit('analytics', True)
    return ('', 200) 

'''
Runs before each test and checks that the public and private keys
were passed in and valid for the user. 
'''
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

'''
Render the home page and React app 
'''
@application.route("/")
def index():
    ''' Returns the home page. By default, this is the login page for the front-end. Issued by a generic REST call to '/'
    '''
    return render_template("index.html")

@application.route("/issueReport", methods=["POST"])
def sendIssueReport():
    ''' Emails an issue the user may have with the tool to the authors. Issued by a POST call to '/issueReport'

    Header:
        {
            "title" : String,
            "version" : String,
            "priority" : String,
            "type" : String,
            "description" : String
        }
    '''
    data = request.get_json()
    msg = Message(data['title'],
                  sender="olivechinosmycrt@gmail.com",
                  recipients=["to@example.com"])

    msg.recipients = ["smithygirl@gmail.com", "jakepickett67@gmail.com", "andrewcofano@gmail.com", "alex.jboyd@yahoo.com", "yengkerngtan@gmail.com", "costinpirvu64@gmail.com", "c.leigh.b@gmail.com"]
    print(pprint.pprint(data), file = sys.stderr)
    msg.body = 'Version: %s\nType: %s\nPriority: %s\nDescription: %s\n'%(data['version'], data['type'], data['priority'], data['description'])
    mail.send(msg)
    return "Success"

@application.route("/test")
def _rest_test():
    return "Test REST endpoint."


@application.route("/login", methods=["POST"])
def login():
    ''' Checks login of application with a username and password defined on startup. Issued by a POST request to '/login'

    Header:
        {
            "username" : String,
            "password" : String
        }
    '''
    global global_username
    global global_password
    data = request.get_json()
    given_username = data['username']
    given_password = data['password']
    
    if given_username is None or given_password is None:
        abort(400)
    if global_username == given_username and global_password == given_password:
        return ('', 204)
    else: 
        abort(401) 

@application.route("/databaseInstances", methods=["GET"])
def databaseInstances():
    ''' Retrieve all RDS instances that is available to the user's credentials. Issued by a GET request to '/databaseInstances'
    '''
    global cm
    db_instances = cm.list_databases()
    db_instances = list(db_instances.keys())
    return jsonify({
        "databases" : db_instances
    })
    
'''
--------------CAPTURE ENDPOINTS--------------
'''
@application.route("/capture/list_ongoing", methods=["GET"])
def captureListOngoing():
    ''' Returns a list of all ongoing captures. Issued by a GET request to '/capture/list_ongoing'

    Returns:
        {
            "captures" : [{
                "captureName" : String,
                "db" : String,
                "endTime" : None,
                "startTime" : String,
                "status" : String,
                "rds" : String
                }, ...]
        }
    '''
    global cm
    capture_list = get_all_ongoing_capture_details(cm)
    return jsonify({
        "captures" : capture_list
    })
    
@application.route("/capture/list_completed", methods=["GET"])
def captureListCompleted():
    ''' Returns a list of all completed captures. Issued by a GET request to '/capture/list_completed'

    Returns:
        {
            "captures" : [{
                "captureName" : String,
                "db" : String,
                "endTime" : None,
                "startTime" : String,
                "status" : String,
                "rds" : String
                }, ...]
        }
    '''    
    global cm
    capture_list = get_all_completed_capture_details(cm)
    return jsonify({
        "captures" : capture_list
    })
    
'''
Returns a list of all scheduled captures for a user that have 
not run yet. 
'''
@application.route("/capture/list_scheduled", methods=["GET"])
def captureListScheduled():
    ''' Returns a list of all captures that are currently scheduled, but have not started yet. Issued by a GET request to '/capture/list_scheduled'

    Returns:
        {
            "captures" : [{
                "captureName" : String,
                "db" : String,
                "endTime" : None,
                "startTime" : String,
                "status" : String,
                "rds" : String
                }, ...]
        }
    '''
    global cm
    capture_list = get_all_scheduled_capture_details(cm)
    return jsonify({
        "captures" : capture_list
    })
    
@application.route("/capture/replayList", methods=["GET"])
def replayListForSpecificCapture():
    ''' Returns all names of replays associated with the specified capture. Issued by a GET request to '/capture/replayList'

    Header:
        {
            "captureName" : String            
        } 

    Returns:
        {
            "captureName" : String,
            "replays" : [String, String, ...]
        }
    '''
    global cm
    capture_name = request.args.get("captureName")
    replay_list = get_replays_for_capture(credentials, capture_name, cm)
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
    ''' Starts a capture. If a start and endtime are provided, then the capture will be scheduled. If not, it will run immediately. Issued by a POST request to '/capture/start'

    Header:
        {
            'db' : String,
            'rds' : String,
            'customEndpoint' : String,
            'username' : String,
            'password' : String,
            'startTime' : DateTime,
            'endTime' : DateTime
        }
    '''
    global cm
    data = request.get_json()
    db_name = data['db']
    rds_name = data['rds']
    endpoint = data['customEndpoint']
    username = data['username']
    password = data['password']
    filters = data.get("filters", "")

    endpoint = cm.process_endpoint(rds_name, endpoint)

    now = [_convertDatetimeToString(datetime.utcnow())]
    start_time = data.get('startTime', now)
    start_time = start_time[0]
    
    capture_name = data.get('captureName', _createCaptureName(endpoint.split(".")[0] + "_" + db_name, start_time))
    if capture_name == "":
      capture_name = _createCaptureName(endpoint.split(".")[0] + "_" + db_name, start_time)

    if not check_if_capture_name_is_unique(capture_name, cm):
      abort(400)

    if not cm.valid_database_credentials(db_name, endpoint, username, password):
      abort(403)

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
                            db_name, start_time, end_time, endpoint, rds_name, username, password, filters, cm)
   
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
    ''' Ends an ongoing capture. Issued by a POST request to '/capture/end'

    Header:
        {
            'db' : String,
            'captureName' : String
        }

    Returns:
        {
            'status' : 'ended',
            'db' : String,
            'captureName' : String,
            'captureDetails' : DateTime,
            'startTime' : DateTime,
            'endTime' : DateTime
        }
    '''
    global cm
    data = request.get_json()
    db_name = data['db'] 
    capture_name = data['captureName']
    end_time = _convertDatetimeToString(datetime.utcnow())
    
    #if capture was scheduled, make sure to end process
    #start up a new process for end capture rather than just running function
    start_time = end_capture(credentials, capture_name, db_name, cm)

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
    ''' Cancels a scheduled capture that has not started yet. Issued by a POST request to '/capture/cancel'

    Header:
        {
            'captureName' : String
        }

    Returns:
        {
            'status' : String
        }
    '''
    global cm
    data = request.get_json()
    capture_name = data['captureName'] 
    
    cancel_capture_process(capture_name, cm)
    return jsonify({'status': 'complete'})

'''
Deletes a completed capture from the utility database 
'''
@application.route("/capture/delete", methods=["DELETE"])
def delete_capture_http():
    ''' Deletes a completed capture. Issued by a DELETE request to '/capture/delete'

    Header:
        {
            'capture' : String
        }

    Returns:
        {
            'status' : String
        }
    '''
    global cm
    data = request.get_json()
    capture_name = data['capture'] 
    
    delete_capture(credentials, capture_name, cm)
    return jsonify({'status': 'complete'})

@application.route("/capture/number", methods=["GET"])
def get_capture_number_http():
    ''' Returns the number of currently active captures. Issued by a GET request to '/capture/number'

    Returns:
        {
            'numberOfCaptures' : Integer
        } 
    '''
    global cm
    capture_number = get_capture_number(cm)
    return jsonify({'numberOfCaptures': capture_number})

@application.route("/capture/completed_list", methods=["GET"])
def get_all_captures():
    ''' Returns a list of all completed captures. Deprecated. Use captureListCompleted() instead. Issued by a GET call to '/capture/completed_list'

    '''
    global cm
    captures = get_capture_list(credentials, cm)    
    return jsonify(captures)

''' 
----------------REPLAY ENDPOINTS-------------------
'''
'''
Creates a new replay.
Must specify the db, rds, username, and password to connect to the database
'''
@application.route("/replay", methods=["POST"])
def replay():
    ''' Starts a new replay. Issued by a POST request to '/replay'

    Header:
        {
            'db' : String,
            'rds' : String,
            'username' : String,
            'password' : String,
            'replayName' : String,
            'captureName' : String,
            'fastMode' : Boolean,
            'restoreDB' : Boolean
        }

    '''
    global cm
    data = request.get_json()
    db_name = data['db'] 
    rds_name = data['rds']
    endpoint = cm.process_endpoint(rds_name, "")
    username = data['username']
    password = data['password']
    filters = data.get("filters", "")

    start_time = data.get('startTime', _convertDatetimeToString(datetime.utcnow()))

    replay_name = data.get('replayName', _createReplayName(db_name, start_time))
    if replay_name == "":
        replay_name = _createReplayName(db_name, start_time)

    capture_name = data['captureName'] # odd bug where capture_name sometimes is a list of length 1
    if isinstance(capture_name, list):
        capture_name = capture_name[0]

    if not check_if_replay_name_is_unique(capture_name, replay_name, cm):
        abort(400)

    if not cm.valid_database_credentials(db_name, endpoint, username, password):
        abort(403)

    fast_mode = data.get('fastMode', False)
    restore_db = data.get('restoreDb', False)
    
    execute_replay(credentials, db_name, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, filters, cm)
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
def get_all_replays():
    ''' Returns a list of all completed replays. Issued by a GET request to '/replay/list'

    Returns:
        [
            {
                "replay" : String, 
                "capture" : String, 
                "db" : String, 
                "mode" : String, 
                "rds": String
            }, ...
        ]
    '''
    global cm
    #capture_replays = get_capture_replay_list(credentials)    
    capture_replays = get_replays_from_table(cm)
    return jsonify(capture_replays)

'''
Returns a list of all currently active replays 
'''
@application.route("/replay/active_list", methods=["GET"])
def get_active_replays_http():
    ''' Returns a list of all ongoing replays. Issued by a GET request to '/replay/active_list'

    Returns:
        [
            {
                "replay" : String, 
                "capture" : String, 
                "db" : String, 
                "mode" : String, 
                "rds": String
            }, ...
        ]
    '''
    replays = get_active_replays()
    return jsonify(replays)

'''
Returns the number of currently active replays 
'''
@application.route("/replay/number", methods=["GET"])
def get_replay_number_http():
    ''' Returns the number of currently active replays. Issued by a GET request to '/replay/number'

    Returns:
        Integer
    '''
    return get_replay_number()

'''
Deletes a completed replay from the utility database 
'''
@application.route("/replay/delete", methods=["DELETE"])
def delete_replay_http():
    ''' Delete a completed replay. Issued by a DELETE request to '/replay/delete'

    Header:
        {
            'capture' : String,
            'replay' : String
        }

    Returns:
        {
            'status' : String
        }
    '''
    global cm
    #Need a capture name and replay name in order to delete replay
    data = request.get_json()
    capture_name = data['capture'] 
    replay_name = data['replay']
    delete_replay(credentials, capture_name, replay_name, cm)
    return jsonify({'status': 'complete'})

'''
Stops an active capture.
'''
@application.route("/replay/active", methods=["DELETE"])
def stop_active_replay_http():
    ''' Stops an active replay. Issued by a DELETE call to '/replay/active'

    Header:
        {
            'capture' : String,
            'replay' : String
        }

    Returns:
        {
            'status' : String
        }
    '''
    global cm
    #Need a capture name and replay name in order to stop replay
    data = request.get_json()
    capture_name = data['capture'] 
    replay_name = data['replay']
    stop_replay(credentials, capture_name, replay_name, cm)
    return jsonify({'status': 'complete'})

'''
---------------ANALYTICS ENDPOINT--------------
'''
'''
Returns all analytics for a user 
'''
@application.route("/analytics", methods=["GET"])
def analytics():
    ''' Returns all analytics. Issued by a GET call to '/analytics'

    Returns:
        {
            capture_name_1 : {
                "replays" : {
                    replay_name_1 : {
                        'CPUUtilization' : [{'timestamp' : String, 'average' : Float}, ...],
                        'FreeableMemory' : [...],
                        'ReadIOPS' : [...],
                        'WriteIOPS' : [...],
                        'start_time' : String,
                        'end_time' : String,
                        'period' : String,
                        'db_id' : String
                        },
                    replay_name_2 : {...},
                    ...
                    },
                "capture_analytics" : Boolean -OR- {capture_name : {<similar to replay_name_1 above>}}
                },
            capture_name_2 : {...},
            ...
        }

    '''
    global cm
    metrics = get_analytics(credentials, cm)
    return jsonify(metrics)

'''
Function needed to start Multiprocessing code after application 
bootstraps but before any requests to the API have been made
'''
@application.before_first_request
def _run_on_start():
    init_replay()
    init_scheduler()    
    cm.setup_utility_database()
    start_orphaned_captures(credentials, cm)


'''
Default username and password for testing if none are given 
'''
global_username = "abc"
global_password = "123"

if __name__ == "__main__":
    try:
        global_username, global_password = sys.argv[1:3]
    except Exception:
        pass
    #application.run(debug=True, host='0.0.0.0')
    socketio.run(application, debug=True, host='0.0.0.0', log_output=True)