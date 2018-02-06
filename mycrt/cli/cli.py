import click
import traceback
from datetime import datetime
import requests #rest api


'''
pubKey=''
privateKey=''
region=''
config=configparser.ConfigParser()
config.read('config.ini')
if config['DEFAULT']:
    default=config['DEFAULT']
    pubKey=default['publicKey']
    privateKey=default['privateKey']
    region=default['region']

credentials= {'aws_access_key_id': pubKey, 
              'aws_secret_access_key': privateKey, 
              'region_name': region
}
'''

@click.group()
def cli(): 
    """Tool to analyze database workloads"""
    pass

def _get_default_name(category, db_name, date_time): 
    #todo: check if capture name exists
    return (category + '_' + db_name + "_" + date_time)


'''-------------CAPTURE-------------'''
def _start_capture(db_instance, capture_name): 

    date_time=datetime.utcnow().strftime('%b/%d/%Y_%H:%M:%S')
    start_time=date_time.split('_')[1]

    if not capture_name: #use default
        capture_name = _get_default_name('capture', db_instance, start_time)

    task = {"status": "started", 
            "db": db_instance, 
            "captureName": capture_name, 
            "startTime": start_time
    }

    resp = requests.post('http://localhost:5000/capture/start', json=task)

    if resp.status_code != 201:
        raise requests.HTTPError('POST /tasks/ {}'.format(resp.status_code))


'''def _stop_capture(db_instance, capture_name): 

    end_time = datetime.utcnow()

    capture_detials, start_time = end_capture(credentials)

    task = {"status": "ended", 
            "db": db_instance, 
            "captureName": capture_name, 
            "captureDetails": capture_details, #todo: get these from end_capture
            "startTime": start_time, #todo: also get this from end_capture
            "endTime": end_time
    }

    resp = requests.post('http://localhost:5000/capture/end', json=task)

    if resp.status_code != 201: 
        raise requests.HTTPError('POST /tasks/ {}'.format(resp.status_code))
    '''

@cli.command()
@click.argument('db-instance')
@click.option('--capture-name', 
        help='nickname for capture')
@click.option('-i', '--interactive', is_flag=True,
        help='start capture in interactive mode, stop capture with "--stop" command')
@click.option('-s', '--schedule', nargs=2, 
        help='schedule capture to start at specified time; input: start_time stop_time')
@click.option('--view-captures', is_flag=True, 
        help='view previously scheduled captures')
@click.option('--stop', is_flag=True,
        help='stop specified capture in interactive mode; input: capture_name')
def capture(db_instance, capture_name, interactive, schedule, view_captures, stop): 
    """-capture a database workload"""
    #todo: validate capture name and db instance
    if stop: 
        _stop_capture(db_instance, capture_name)
        click.echo('stopped capture ' + capture_name)

    elif view_captures: 
        click.echo('viewing captures')

    else: 
        _start_capture(db_instance, capture_name)
        click.echo('started catpure ' + capture_name)



'''-------------REPLAY-------------'''
@cli.command()
@click.argument('db-instance')
@click.option('--replay-name', 
        help='nickname for replay')
@click.option('--capture-name', 
        help='name of capture to replay')
@click.option('-f', '--fast-mode', is_flag=True,
        help='skip over time periods with low activity while replaying')
@click.option('--restore', is_flag=True,
        help='restore initial database state upon replay completion')
#default = database_name + date/time started 
def replay(db_instance, replay_name, capture_name, fast_mode, restore): 
    """-replay a database workload"""
    if fast_mode: #remove periods of inactivity 
        click.echo('replaying fast mode')

    else: #raw mode
        click.echo('replaying raw mode')

    if restore: 
        click.echo('restoring db')
        #restore database to initial state


'''-------------ANALYZE-------------'''
# Compute the average of all the average metric data points 
def get_average(metric_list): 
    average = 0
    for metric in metric_list: 
        data_point = metric['Average']
        average += data_point

    return average / len(metric_list)


@cli.command() 
@click.option('--replay-name', multiple=True, 
        help='replay nickname to analyze')
@click.option('--include-metric', multiple=True, 
        help='metric to calculate')
@click.option('--time-frame', type=(int, int), 
        default=(0,0),
        help='specify time frame to analyze')
@click.option('--output-file', 
        help='file to export graph to')
@click.option('--raw', '-r', is_flag = True,
        help='get raw json format')
def analyze(replay_name, include_metric, time_frame, output_file, raw):
    """-analyze database performance from historic replay"""

    analytics = requests.get('http://localhost:5000/analytics')
    if analytics.status_code != 200: #there was an error
        raise ApiError('GET /analytics/ {}'.format(analytics.status_code))

    json_input = analytics.json()
    if raw: 
        click.echo(json_input)
    else :
        try:
            '''Current bucket structure:
               capture
               |--> replay
               |--> replay
               ...
            '''
            #Average of data points
            for folder in json_input: 
                for replay_id in json_input[folder]: 
                    replay = json_input[folder][replay_id]
                    cpu_util = get_average(replay['CPUUtilization'])
                    freeable_mem = get_average(replay['FreeableMemory'])
                    read_iops = get_average(replay['ReadIOPS'])
                    write_iops = get_average(replay['WriteIOPS'])

                    click.echo('Start Time: ' + str(replay['start_time']))
                    click.echo('End Time: ' + str(replay['end_time']))
                    click.echo('---METRIC AVERAGES---')
                    click.echo('CPU Utilization (%): ' + str(cpu_util))
                    click.echo('Freeable Memory (bytes): ' + str(freeable_mem))
                    click.echo('Read IOPS (count/sec): ' + str(read_iops))
                    click.echo('Write IOPS (count/sec): ' + str(write_iops))

        except (ValueError, KeyError, TypeError): 
            traceback.print_exc() 
