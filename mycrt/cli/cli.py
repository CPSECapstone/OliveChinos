import click
import traceback
from datetime import datetime
import requests #rest api
import json


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
    captures = requests.get('http://localhost:5000/capture/'+endpoint)

    if captures.status_code != 200: #there was an error
        raise requests.HTTPError('GET /captures/ {}'.format(captures.status_code))

    return format_json(captures.json())

@capture.command(short_help='-start capturing a database workload')
@click.argument('db-instance')
@click.option('-n', '--capture-name', 
        help='-a unique name for the capture')
@click.option('-s', '--start-time',
        help='-time to start a scheduled capture, format: YYYY/MM/DD_HH:MM:SS')
@click.option('-e', '--end-time',
        help='-time to end a scheduled capture, format: YYYY/MM/DD_HH:MM:SS')
def start(db_instance, capture_name, start_time, end_time): 
    '''-start capturing a database workload 
        
        To start an interactive capture, specify an Amazon RDS instance identifier
        and a name (optional). End this capture using the "end" command.

        To schedule a capture in the future, include the -s and -e flags to 
        set the start and end times of the capture. Note you must include both 
        a start and end time if you desire to schedule a capture.
    '''

    if not start_time: #interactive capture
        click.echo('got here')
        date_time=datetime.utcnow().strftime('%b/%d/%Y_%H:%M:%S')
        start_time=date_time.split('_')[1]

    task = {'db': db_instance, 
            'captureName': capture_name,
            'startTime': [start_time], 
            'endTime': [end_time]
    }

    resp = requests.post('http://localhost:5000/capture/start', json=task)

    if resp.status_code != 200:
        raise requests.HTTPError('POST /tasks/ {}'.format(resp.status_code))

    click.echo('Capture \'' + capture_name + '\' on database \'' + db_instance + '\' was scheduled or started.')


@capture.command(short_help='-end an ongoing capture')
@click.argument('db-instance')
@click.argument('capture-name')
def end(db_instance, capture_name): 
    '''-end an ongoing capture

    Note the specified capture must currently be in progress in order to end it. 
    '''
    #TODO we might need to add the db_name in here
    task = {'captureName': capture_name,
            'db': db_instance}

    resp = requests.post('http://localhost:5000/capture/end', json=task)

    if resp.status_code != 200: 
        click.echo('There was an error.')
        click.echo('Please make sure your capture name and db instance are correct.')
        #raise requests.HTTPError('POST /tasks/ {}'.format(resp.status_code))

    click.echo('Capture \'' + capture_name + '\' on database \'' + db_instance + '\' was ended.')

@capture.command(short_help='-cancel a capture')
@click.argument('capture-name')
def cancel(capture_name): 
    """-cancel a capture 

    Cancelling a capture will prevent the system from processing the 
    capture details. No record of the capture will be stored. 

    This is especially useful in the case that an interactive capture is started 
    and forgotten about (accumulating many unintended hours/days of data). It can 
    also be used to cancel an upcoming scheduled capture or a scheduled capture 
    that is currently in progress.
    """
    #TODO hook up the endpoint
    pass

@capture.command(short_help='-delete a completed capture')
@click.argument('capture-name')
def delete(capture_name):
    '''-delete a completed capture 
    
    This will remove any record of the capture. 
    '''
    #NOTE did we decide that deleting a capture will also remove all replays associated with it? 
    task={'capture': capture_name}

    resp = requests.delete('http://localhost:5000/capture/delete', json=task)

    if resp.status_code != 200: 
        raise requests.HTTPError('DELETE /capture/delete/ {}'.format(resp.status_code))

    click.echo('Capture ' + capture_name + ' was deleted.')

'''-------------REPLAY-------------'''
@cli.group()
def replay(): 
    '''-replay a database workload'''
    pass

@replay.command()
@click.argument('capture-name')
@click.argument('db-instance')
@click.option('-n', '--name', 
        help='-name for the replay; default name will be given if not specified')
@click.option('-f', '--fast-mode', is_flag=True,
        help='-skip over time periods with low activity while replaying')
@click.option('-r', '--restore', is_flag=True,
        help='-restore initial database state upon replay completion')
def start(replay_name, db_instance, capture_name, fast_mode, restore): 
    '''-start a new replay immediately'''
    date_time=datetime.utcnow().strftime('%b/%d/%Y_%H:%M:%S')
    start_time=date_time.split('_')[1]

    task={'db': db_instance, 
            'captureName': capture_name,
            'fastMode': fast_mode,
            'restoreDb': restore,
            'startTime': start_time,
            'replayName':''
    }

    if replay_name: 
        task['replayName'] = replay_name

    resp = requests.post('http://localhost:5000/replay', json=task)

    if resp.status_code != 200:
        raise requests.HTTPError('POST /tasks/ {}'.format(resp.status_code))

@replay.command(short_help='-delete a completed replay')
@click.argument('capture-name')
@click.argument('replay-name')
def delete(capture_name, replay_name): 
    '''-delete a completed replay 
    
    Deleting a replay will delete all data affiliated with it
    '''
    task={'captureName': capture_name, 
            'replayName': replay_name
    }
    resp = requests.delete('http://localhost:5000/replay/delete', json=task)

    if resp.status_code != 200:
        click.echo('Please make sure the capture name is correct.')
        #raise requests.HTTPError('POST /tasks/ {}'.format(resp.status_code))


@replay.command()
def view(): 
    '''-view ongoing replays'''
    replays = requests.get('http://localhost:5000/replay/list')

    if replays.status_code != 200: #there was an error
        raise requests.HTTPError('GET /replay/list {}'.format(captures.status_code))

    click.echo(format_json(replays.json()))

'''-------------ANALYZE-------------'''
@cli.group()
def analyze(): 
    '''-view database performance from a replay'''
    pass

@analyze.command(name='list-metrics')
def list_metrics(): 
    '''-list the metrics available to analyze'''
    metric_options = 'CPUUtilization\nFreeableMemory\nReadIOPS\nWriteIOPS'
    click.echo('Available Metrics:\n' + metric_options)

@analyze.command()
@click.argument('capture-name', nargs=1)
@click.argument('replay-names', nargs=-1)
@click.option('-m', '--metric-name', multiple=True, 
        help='-the name of the metric; use command "list-metrics to see supported options"')
@click.option('-r', '--raw', is_flag = True,
        help='-get raw json format')
def view(capture_name, replay_names, metric_name, raw):
    '''-view metrics for any number of replays'''

    analytics = requests.get('http://localhost:5000/analytics')
    if analytics.status_code != 200: #there was an error
        raise ApiError('GET /analytics/ {}'.format(analytics.status_code))

    json_input = analytics.json()
    if raw: 
        for replay in replay_names: 
            click.echo('\nMetric data for \'' + str(replay) + '\'')
            click.echo(format_json(json_input[capture_name][replay]))
        click.echo()
    else :
        try:
            '''Current bucket structure:
               capture
               |--> replay
               |--> replay
               ...
            '''
            #Average of data points
            capture_folder = json_input[capture_name]
            for replay in replay_names: 
                click.echo('\nMetric Data for \'' + str(replay) + '\'') 
                metrics = capture_folder[replay]
                cpu_util = get_average(metrics['CPUUtilization'])
                freeable_mem = get_average(metrics['FreeableMemory'])
                read_iops = get_average(metrics['ReadIOPS'])
                write_iops = get_average(metrics['WriteIOPS'])

                click.echo('Start Time: ' + str(metrics['start_time']))
                click.echo('End Time: ' + str(metrics['end_time']))
                click.echo('---METRIC AVERAGES---')
                click.echo('CPU Utilization (%): ' + str(cpu_util))
                click.echo('Freeable Memory (bytes): ' + str(freeable_mem))
                click.echo('Read IOPS (count/sec): ' + str(read_iops))
                click.echo('Write IOPS (count/sec): ' + str(write_iops))

            click.echo()

        except (ValueError, KeyError, TypeError): 
            traceback.print_exc() 

# Compute the average of all the average metric data points 
def get_average(metric_list): 
    average = 0
    for metric in metric_list: 
        data_point = metric['Average']
        average += data_point

    return average / len(metric_list)

def format_json(json_input): 
    return json.dumps(json_input, indent=4, sort_keys=True)
