import click
import requests #rest api

default_capture_name='capture_1'
default_replay_name='replay_1'

@click.group()
def cli(): 
    """Tool to analyze database workloads"""
    pass


@cli.command()
@click.argument('db-instance')
@click.option('--capture-name', default=default_capture_name,
        help='nickname for capture')
@click.option('-i', '--interactive', is_flag=True)
@click.option('-s', '--schedule', prompt='Please enter <start_time,end_time>')
@click.option('--view-captures', is_flag=True)
def capture(db_instance, capture_name, i_flag, s_flag, view): 
    """-capture a database workload"""
    click.echo('capturing')


@cli.command()
@click.argument('db-instance')
@click.option('--replay-name', default=default_replay_name,
        help='nickname for replay')
@click.option('--capture-name', 
        help='name of capture to replay')
@click.option('-f', '--fast-mode', is_flag=True,
        help='skip over time periods with low activity while replaying')
@click.option('-r', '--raw-mode', is_flag=True,
        help='play capture as recorded')
@click.option('--restore', is_flag=True,
        help='restore initial database state upon replay completion')
#default = database_name + date/time started 
def replay(db_instance, replay_name, capture_name): 
    """-replay a database workload"""
    click.echo('replaying')


# Compute the average of all the average metric data points 
def get_average(metric_list): 
    average = 0
    for metric in metric_list: 
        data_point = metric['Average']
        average += data_point

    return average / len(metric_list)

METRIC_NAMES = ['CPUUtilization', 'FreeableMemory', 'ReadIOPS', 'WriteIOPS']

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
def analyze(replay_name, include_metric, time_frame, output_file):
    """-analyze database performance from historic replay"""

    click.echo('analyzing')
    analytics = requests.get('http://localhost:5000/analytics')
    if analytics.status_code != 200:
        #error
        raise ApiError('GET /analytics/ {}'.format(analytics.status_code))
    #print(analytics.json())
    json_input = analytics.json()
    try:
        for metric_name in json_input: 
            if metric_name in METRIC_NAMES: 
                metric_list = json_input[metric_name]
                average_metric = get_average(metric_list)
                formatted_output = metric_name + ': ' + str(average_metric)
                click.echo(formatted_output)
            if metric_name not in METRIC_NAMES: 
                click.echo(metric_name + ': ' + str(json_input[metric_name]))

    except (ValueError, KeyError, TypeError): 
        print('JSON format error')
         

