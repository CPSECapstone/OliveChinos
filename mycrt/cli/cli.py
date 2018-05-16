import click
import traceback
from datetime import datetime, timedelta
import calendar
import time
import requests #rest api
import json

web_address = 'http://ec2-52-206-116-140.compute-1.amazonaws.com:5000/'

@click.group()
def cli(): 
    '''Tool to analyze database workloads'''
    pass


'''-------------CAPTURE-------------'''
@cli.group()
def capture(): 
    '''-capture a database workload'''
    pass

@capture.command(short_help='-view capture information')
@click.option('-c', '--completed', is_flag=True, 
        help='-show captures that have completed')
@click.option('-o', '--ongoing', is_flag=True, 
        help='-show captures occuring right now')
@click.option('-s', '--scheduled', is_flag=True, 
        help='-show captures scheduled for an upcoming time')
def view(completed, ongoing, scheduled):
    '''-view capture information
    If no options are given, all captures will be displayed organized by status
    '''
    if completed: 
        click.echo('---Completed Captures---\n'+_get_capture_list('completed'))
    if ongoing: 
        click.echo('---Ongoing Captures---\n'+_get_capture_list('ongoing'))
    if scheduled: 
        click.echo('---Scheduled Captures---\n'+_get_capture_list('scheduled'))

    if not completed and not ongoing and not scheduled: 
        click.echo('---Completed Captures---\n'+_get_capture_list('completed'))
        click.echo('---Ongoing Captures---\n'+_get_capture_list('ongoing'))
        click.echo('---Scheduled Captures---\n'+_get_capture_list('scheduled'))

def _get_capture_list(status): 
    endpoint='list_' + status
    captures = requests.get(web_address + 'capture/'+endpoint)

    if captures.status_code != 200: #there was an error
        click.echo('''There was an error connecting to your database.''')
        return

    return format_json(captures.json())

@capture.command(short_help='-start capturing a database workload')
@click.argument('credentials-file', type=click.File('rb'))
@click.option('-n', '--capture-name', type=str, 
        help='-a unique name for the capture')
@click.option('-s', '--start-time',
        help='-time to start a scheduled capture, format: YYYY-MM-DDTHH:MM:SS.xZ')
@click.option('-e', '--end-time',
        help='-time to end a scheduled capture, format: YYYY-MM-DDTHH:MM:SS.xZ')
def start(credentials_file, capture_name, start_time, end_time): 
    '''-start capturing a database workload 
        
        To start an interactive capture, specify an Amazon RDS instance identifier
        and a name (optional). End this capture using the "end" command.

        To schedule a capture in the future, include the -s and -e flags to 
        set the start and end times of the capture. Note you must include both 
        a start and end time if you desire to schedule a capture.
    '''

    credential_dict = None
    try: 
        credential_dict = json.load(credentials_file)

    except JSONDecodeError: 
        click.echo("Please check the format of the given credentials file.")
        return

    if not start_time: #interactive capture
        date_time=datetime.utcnow().strftime('%b/%d/%Y_%H:%M:%S')
        start_time=date_time.split('_')[1]

    else: 
        if bool(start_time) ^ bool(end_time): 
            click.echo('''You must provide a start and end time for a scheduled capture.''')
            return

        try: #make the times GMT to handle compatibility issue on back-end 
            start_time = _make_compatible(start_time)
            end_time = _make_compatible(end_time)
        except ValueError: 
            click.echo('''The input start and/or end times do not match the specified format. See \'help\' for example.''')
            return

    task = {'db': credential_dict['db-name'], 
            'rds': credential_dict['rds-instance'],
            'username': credential_dict['username'],
            'password': credential_dict['password'],
            'captureName': capture_name,
            'startTime': [start_time], 
            'endTime': [end_time]
    }

    resp = requests.post(web_address + 'capture/start', json=task)

    if resp.status_code != 200:
        if resp.status_code == 400: #capture name must be unique
            click.echo('The name \'' + capture_name + '\' has already been used.')
            return

        click.echo('''There was an error. Please make sure all parameters were given.''')
        return

    click.echo('Capture \'' + capture_name + '\' on database \'' + 
            credential_dict['db-name'] + '\' was scheduled or started.')

def _make_compatible(raw_time): 
    '''Function to make a time in the format YYYY-MM-DDTHH:MM:SS.XZ into 
    compatible GMT time 
    - Throws ValueError in the case that the input raw_time does not match the 
    format given above 
    '''
    dt_obj = datetime.strptime(raw_time, '%Y-%m-%dT%H:%M:%S.%fZ')
    time_zone_offset = timedelta(hours=7).total_seconds()
    gmt_time = time.mktime(dt_obj.timetuple()) + time_zone_offset 
    formatted_gmt = datetime.fromtimestamp(gmt_time).isoformat() + '.0Z'
    return formatted_gmt


@capture.command(short_help='-end an ongoing capture')
@click.argument('credentials-file', type=click.File('rb'))
@click.argument('capture-name')
def end(credentials_file, capture_name): 
    '''-end an ongoing capture

    Note the specified capture must currently be in progress in order to end it. 
    '''
    credential_dict = None
    try: 
        credential_dict = json.load(credentials_file)

    except JSONDecodeError: 
        click.echo("Please check the format of the given credentials file.")
        return

    task = {'captureName': capture_name,
            'db': credential_dict['db-name']}

    resp = requests.post(web_address + 'capture/end', json=task)

    #TODO may need to add more checking here - capture exists 
    if resp.status_code != 200: 
        click.echo('There was an error.')
        click.echo('''Please make sure the capture name and db instance are correct and that the capture is ongoing.''')
        return

    click.echo('Capture \'' + capture_name + '\' on database \'' + credential_dict['db-name'] + '\' was ended.')

@capture.command(short_help='-cancel an ongoing capture')
@click.argument('capture-name')
def cancel(capture_name): 
    """-cancel an ongoing capture 

    Cancelling a capture will prevent the system from processing the 
    capture details. No record of the capture will be stored. 

    This is especially useful in the case that an interactive capture is started 
    and forgotten about (accumulating many unintended hours/days of data). It can 
    also be used to cancel an upcoming scheduled capture or a scheduled capture 
    that is currently in progress.
    """
    task = {'captureName': capture_name}

    resp = requests.post(web_address + 'capture/cancel', json=task)
     
    #Check if the capture exists 
    if resp.status_code != 200: 
        click.echo('''There was an error. Please make sure the capture name is correct and is ongoing.''')
        return

    else:   
        click.echo('Capture ' + capture_name + ' was cancelled.')

@capture.command(short_help='-delete a completed capture')
@click.argument('capture-name')
def delete(capture_name):
    '''-delete a completed capture 
    
    This will remove any record of the capture. 
    '''
    #NOTE did we decide that deleting a capture will also remove all replays associated with it? 
    task={'capture': capture_name}

    resp = requests.delete(web_address + 'capture/delete', json=task)

    if resp.status_code != 200: 
        click.echo('''There was an error. Please make sure the capture name is correct and that the specified capture has completed.''')
        return

    click.echo('Capture ' + capture_name + ' was deleted.')

'''-------------REPLAY-------------'''
@cli.group()
def replay(): 
    '''-replay a database workload'''
    pass

@replay.command()
@click.argument('credentials-file', type=click.File('rb'))
@click.argument('capture-name')
@click.option('-n', '--replay-name', 
        help='-name for the replay; default name will be given if not specified')
@click.option('-f', '--fast-mode', is_flag=True,
        help='-skip over time periods with low activity while replaying')
@click.option('-r', '--restore', is_flag=True,
        help='-restore initial database state upon replay completion')
def start(credentials_file, capture_name, replay_name, fast_mode, restore): 
    '''-start a new replay immediately
    
    Scheduled replays are not currently supported.
    '''

    credential_dict = None
    try: 
        credential_dict = json.load(credentials_file)

    except JSONDecodeError: 
        click.echo('''There was an error. Please check the format of the given credentials file.''')
        return

    date_time=datetime.utcnow().strftime('%b/%d/%Y_%H:%M:%S')
    start_time=date_time.split('_')[1]

    task={'db': credential_dict['db-name'], 
            'rds': credential_dict['rds-instance'],
            'username': credential_dict['username'],
            'password': credential_dict['password'],
            'captureName': capture_name,
            'fastMode': fast_mode,
            'restoreDb': restore,
            'startTime': start_time,
            'replayName': (replay_name if replay_name else '') 
    }

    resp = requests.post(web_address + 'replay', json=task)

    if resp.status_code != 200: #TODO will this error out if replay name not unique?
        click.echo('''There was an error. Please make sure the specified capture name exists and check the database credentials.''')
        return

    else: 
        click.echo('Replay ' + replay_name + ' on ' + credential_dict['db-name'] 
                + ' was started.')

@replay.command(short_help='-delete a completed replay')
@click.argument('capture-name')
@click.argument('replay-name')
def delete(capture_name, replay_name): 
    '''-delete a completed replay 
    
    Deleting a replay will delete all data affiliated with it
    '''
    task={'capture': capture_name, 
            'replay': replay_name
    }
    resp = requests.delete(web_address + 'replay/delete', json=task)

    if resp.status_code != 200:
        click.echo('Please make sure the capture and replay names are correct.')
        return
    else: 
        click.echo('Replay \'' + replay_name + '\' of capture \'' + capture_name + 
                '\' was deleted.')


@replay.command()
@click.option('-o', '--ongoing', is_flag=True, 
        help='list ongoing replays')
@click.option('-c', '--completed', is_flag=True, 
        help='list completed replays')
def view(ongoing, completed): 
    '''-view ongoing and completed replays'''
    if ongoing: 
        click.echo('---Ongoing Replays---')
        _echo_replay_list(True)

    if completed: 
        click.echo('---Completed Replays---')
        _echo_replay_list(False)

    if not completed and not ongoing: 
        click.echo('---Ongoing Replays---')
        _echo_replay_list(True)
        click.echo('---Completed Replays---')
        _echo_replay_list(False)

def _echo_replay_list(is_ongoing): 
    path = 'list'
    if is_ongoing: 
        path = 'active_' + path
    replay_list = requests.get(web_address + 'replay/' + path)
    if replay_list.status_code != 200: 
        click.echo('''There was an error connecting to the server. Check your credentials.''')
        return
    click.echo(format_json(replay_list.json()))

'''-------------ANALYZE-------------'''
@cli.group()
def analyze(): 
    '''-view database performance from a replay'''
    pass

@analyze.command(name='list-metrics')
def list_metrics(): 
    '''-list the metrics available to analyze'''
    metric_options = '-CPUUtilization\n-FreeableMemory\n-ReadIOPS\n-WriteIOPS'
    click.echo('Available Metrics:\n' + metric_options)

@analyze.command()
@click.argument('capture-name', nargs=1)
@click.argument('replay-names', nargs=-1, required=True)
@click.option('-m', '--metric-name', multiple=True, 
        help='-the name of the metric; use command "list-metrics" to see supported options')
@click.option('-s', '--start-time', 
        help='-grab all metrics after this time; format: YYYY-MM-DDTHH:MM:SS')
@click.option('-e', '--end-time', 
        help='-grab all metrics until this time; format: YYYY-MM-DDTHH:MM:SS')
@click.option('-r', '--raw', is_flag = True,
        help='-get raw json format')
def view(capture_name, replay_names, metric_name, start_time, end_time, raw):
    '''-view metrics for any number of replays'''

    analytics = requests.get(web_address + 'analytics')
    if analytics.status_code != 200: #there was an error
        click.echo('''There was an error connecting to the server. Check your credentials.''')
        return

    json_input = analytics.json()

    if start_time: 
        start_time = _convert_to_datetime(start_time)
    if end_time: 
        end_time = _convert_to_datetime(end_time)

    if raw: #print metrics in json format
        _print_json_metrics(json_input, capture_name, replay_names, metric_name, start_time, end_time)

    else : #compute metric averages for each replay
        try:
            '''Current bucket structure:
               capture
               |--> replay
               |--> replay
               ...
            '''
            #Average of data points
            capture_folder = json_input[capture_name]
            metric_names = metric_name if metric_name else ['CPUUtilization', 
                    'FreeableMemory', 'ReadIOPS', 'WriteIOPS']
            for replay in replay_names: 
                click.echo('\nMetric Data for \'' + str(replay) + '\'') 
                replay_data_points = capture_folder[replay]
                _print_metric_averages(replay_data_points, metric_names, start_time, end_time)

        except (ValueError, KeyError, TypeError): 
            click.echo('''One or more of the specified replay names do not exist. Please try again.''')
            return

def _print_metric_averages(metric_data_points, metric_names, start_time, end_time): 
    '''Dict containing tuple with string for printing and aggregate average of 
    the metric'''
    metric_string = {
            'CPUUtilization': 'CPU Utilization (%): ', 
            'FreeableMemory': 'Freeable Memory (bytes): ', 
            'ReadIOPS': 'Read IOPS (count/sec): ', 
            'WriteIOPS': 'Write IOPS (count/sec): '
    }

    start_time = start_time if start_time else metric_data_points['start_time']
    end_time = end_time if end_time else metric_data_points['end_time']

    click.echo('Start Time: ' + str(start_time))
    click.echo('End Time: ' + str(end_time))
    click.echo('---METRIC AVERAGES---')

    for metric in metric_names: 
        data_points = metric_data_points[metric]
        data_points = _filter_metrics_in_timeframe(data_points, start_time, end_time)
        average = get_average(data_points)
        click.echo(metric_string[metric] + str(average))

    click.echo()

def _print_json_metrics(raw_json, capture_name, replay_names, metric_names, start_time, end_time):     
    '''Get the specified metrics for the specified replay under the given capture 
    name. If no metric_names are specified, get all the metrics.
    '''
    replay_metrics = {}

    for replay in replay_names: 
        if len(metric_names)==0: #no metric specified - display all
            metric_names = ['CPUUtilization', 'FreeableMemory', 'ReadIOPS', 'WriteIOPS']
            #all_datapoints = raw_json[capture_name][replay]
            #replay_metrics[replay] = _filter_metrics_in_timeframe(all_datapoints, start_time, end_time)
        #else: #print only specified metrics
        metrics = {}
        for metric in metric_names: 
            all_datapoints = raw_json[capture_name][replay][metric]
            metrics[metric] = _filter_metrics_in_timeframe(all_datapoints, start_time, end_time)
        replay_metrics[replay] = metrics
    click.echo(format_json(replay_metrics))

def _filter_metrics_in_timeframe(metric_list, start_time, end_time): 
    '''Expects list of JSON objects of metrics only - no preceeding tags. 
    start_time and end_time must be in datetime format
    '''
    if not start_time and not end_time: #no filtering to be done
        return metric_list
    else: 
        start_time = start_time if start_time else datetime.min
        end_time = end_time if end_time else datetime.max
        metrics = []
        for metric in metric_list: 
            timestamp = _convert_metric_time_string(metric['Timestamp'])
            if start_time < timestamp < end_time : 
                metrics.append(metric)

        return metrics

def _convert_metric_time_string(metric_time_string): 
    #sample string: "Thu, 15 Mar 2018 06:00:00 GMT"
    split_string = metric_time_string.split(',')[1].split(' ')
    day = int(split_string[1])
    month_abbr = split_string[2]
    month = list(calendar.month_abbr).index(month_abbr)
    year = int(split_string[3])

    time = split_string[4].split(':')
    hour = int(time[0])
    minute = int(time[1])
    second = int(time[2])

    return datetime(year, month, day, hour, minute, second)

def _convert_to_datetime(input_time): 
    #sample user input: YYYY-MM-DDTHH:MM:SS
    split_string = input_time.split('T')

    date = split_string[0].split('-')
    year, month, day = int(date[0])

    time = split_string[1].split(':')
    hour, minute, second = int(time[0])

    return datetime(year, month, day, hour, minute, second)


# Compute the average of all the average metric data points 
def get_average(metric_list): 
    average = 0
    for metric in metric_list: 
        data_point = metric['Average']
        average += data_point

    return average / len(metric_list)

def format_json(json_input): 
    return json.dumps(json_input, indent=4, sort_keys=True)
