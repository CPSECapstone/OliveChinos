# server.py
import sys
import configparser
import json
import pprint
from flask import Flask, render_template, request, abort, jsonify
from flask_mail import Mail, Message

application = Flask(__name__)

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

utilitydb = configparser.ConfigParser()
utilitydb.read('utilitydb.ini')
print(utilitydb)
if utilitydb['DEFAULT']:
    util_s3 = utilitydb['DEFAULT']['S3name']


print(credentials)

ComManager.util_db = 'util.db'
ComManager.credentials = credentials.copy()
ComManager.S3name = util_s3
cm = ComManager()

def convertDatetimeToString(dTime):
    return dTime.strftime('%Y-%m-%d_%H:%M:%S')

def createCaptureName(dbName, formattedTime):
    return 'C_' + dbName + '_' + formattedTime

def createReplayName(dbName, formattedTime):
    return 'R_' + dbName + '_' + formattedTime

@application.route("/")
def index():
    return render_template("index.html")

@application.route("/issueReport", methods=["POST"])
def sendIssueReport():
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
def rest_test():
    return "Test REST endpoint."


@application.route("/login", methods=["POST"])
def login():
    global global_username
    global global_password
    data = request.get_json()
    given_username = data['username']
    given_password = data['password']
    #pubKey = data["publicKey"] 
    #privateKey = data["privateKey"] 
    #if pubKey is None or privateKey is None:
    if given_username is None or given_password is None:
        abort(400)
    #if verify_login(pubKey, privateKey):
    if global_username == given_username and global_password == given_password:
        return ('', 204)
    else: 
        abort(401) 

@application.route("/databaseInstances", methods=["GET"])
def databaseInstances():
    global cm
    headers = request.headers
    #TODO. Temporary: if public and private Key are not passed in headers, 
    # default to config.ini values
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pKey is None or priKey is None:
        abort(400)
    if verify_login(pKey, priKey):
        db_instances = list_databases(cm)
        db_instances = list(db_instances.keys())
        return jsonify({
            "databases" : db_instances
        })
    else: 
        abort(401) 

@application.route("/capture/list_ongoing", methods=["GET"])
def captureListOngoing():
    global cm
    headers = request.headers
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pubKey is None or privateKey is None:
        abort(400)
    if verify_login(pubKey, privateKey):
        #capture_names_list = get_capture_list(credentials)
        capture_list = get_all_ongoing_capture_details(cm)
        #capture_list = [get_capture_details(name) for name in capture_names_list]

        return jsonify({
            "captures" : capture_list
        })
    else:
        abort(401)

@application.route("/capture/list_completed", methods=["GET"])
def captureListCompleted():
    global cm
    headers = request.headers
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pubKey is None or privateKey is None:
        abort(400)
    if verify_login(pubKey, privateKey):
#        capture_names = get_capture_list(credentials, cm)
#        capture_list = [get_capture_details(name, cm) for name in capture_names]
        capture_list = get_all_completed_capture_details(cm)
        return jsonify({
            "captures" : capture_list
        })
    else:
        abort(401)

@application.route("/capture/list_scheduled", methods=["GET"])
def captureListScheduled():
    global cm
    headers = request.headers
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pubKey is None or privateKey is None:
        abort(400)
    if verify_login(pubKey, privateKey):
        capture_list = get_all_scheduled_capture_details(cm)

        return jsonify({
            "captures" : capture_list
        })
    else:
        abort(401)

@application.route("/capture/replayList", methods=["GET"])
def replayListForSpecificCapture():
    global cm
    headers = request.headers
    capture_name = request.args.get("captureName")
    #TODO. Temporary: if public and private Key are not passed in headers, 
    # default to config.ini values
    pKey = headers.get("publicKey", pubKey)
    priKey = headers.get("privateKey", privateKey)
    if pKey is None or priKey is None:
        abort(400)
    if verify_login(pKey, priKey):
        replay_list = get_replays_for_capture(credentials, capture_name, cm)
        return jsonify({
            "captureName": capture_name,
            "replays" : replay_list
        })
    else: 
        abort(401) 

@application.route("/capture/start", methods=["POST"])
def capture_start():
    global cm
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

    if not check_if_capture_name_is_unique(capture_name, cm):
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
                            db_name, start_time, end_time, rds_name, username, password, cm)
   
    return jsonify({
        "status": "started",
        "db": db_name,
        "captureName": capture_name,
        "startTime": start_time,
        "endTime": end_time
    })

@application.route("/capture/end", methods=["POST"])
def capture_end():
    global cm
    data = request.get_json()
    db_name = data['db'] 
    capture_name = data['captureName']
    end_time = convertDatetimeToString(datetime.utcnow())
    
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

@application.route("/capture/cancel", methods=["POST"])
def cancel_capture_http():
    global cm
    data = request.get_json()
    capture_name = data['captureName'] 
    
    cancel_capture_process(capture_name, cm)
    return jsonify({'status': 'complete'})

@application.route("/capture/executeQuery", methods=["POST"])
def query_execute():
    global cm
    query = request.get_json()['query']
    print()
    try:
        cm.execute_query(query)
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
    global cm
    captures = get_capture_list(credentials, cm)    
    return jsonify(captures)

@application.route("/replay", methods=["POST"])
def replay():
    global cm
    data = request.get_json()
    db_name = data['db'] 
    rds_name = data['rds']
    username = data['username']
    password = data['password']

    start_time = data.get('startTime', convertDatetimeToString(datetime.utcnow()))

    replay_name = data.get('replayName', createReplayName(db_name, start_time))
    if replay_name == "":
        replay_name = createReplayName(db_name, start_time)

    capture_name = data['captureName']

    if not check_if_replay_name_is_unique(capture_name, replay_name, cm):
        abort(400)


    fast_mode = data.get('fastMode', False)
    restore_db = data.get('restoreDb', False)
    
    execute_replay(credentials, db_name, replay_name, capture_name, fast_mode, restore_db, rds_name, username, password, cm)
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
    global cm
    #capture_replays = get_capture_replay_list(credentials)    
    capture_replays = get_replays_from_table(cm)
    return jsonify(capture_replays)

@application.route("/replay/active_list", methods=["GET"])
def get_active_replays_http():
    replays = get_active_replays()
    return jsonify(replays)

@application.route("/replay/number", methods=["GET"])
def get_replay_number_http():
    replays = get_active_replays()
    return jsonify(replays)

@application.route("/capture/number", methods=["GET"])
def get_capture_number_http():
    global cm
    capture_number = get_capture_number(cm)
    return jsonify({'numberOfCaptures': capture_number})

@application.route("/replay/delete", methods=["DELETE"])
def delete_replay_http():
    global cm
    #Need a capture name and replay name in order to delete replay
    data = request.get_json()
    capture_name = data['capture'] 
    replay_name = data['replay']
    delete_replay(credentials, capture_name, replay_name, cm)
    return jsonify({'status': 'complete'})

@application.route("/capture/delete", methods=["DELETE"])
def delete_capture_http():
    global cm
    data = request.get_json()
    capture_name = data['capture'] 
    
    delete_capture(credentials, capture_name, cm)
    return jsonify({'status': 'complete'})



@application.route("/capture/get_past", methods=["GET"])

@application.route("/analytics", methods=["GET"])
def analytics():
    global cm
    metrics = get_analytics(credentials, cm)
    return jsonify(metrics)


@application.before_first_request
def _run_on_start():
    init_replay()
    init_scheduler()



global_username = "abc"
global_password = "123"

if __name__ == "__main__":
    cm.setup_utility_database()
    try:
        global_username, global_password = sys.argv[1:3]
    except Exception:
        pass
    application.run(debug=True, host='0.0.0.0')
