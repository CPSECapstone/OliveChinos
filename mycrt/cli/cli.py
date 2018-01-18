import click

default_capture_name='capture_1'
default_replay_name='replay_1'

@click.group()
def cli(): 
    pass

@cli.command()
@click.option('--capture-name', default=default_capture_name,
        help='nickname for capture')
@click.argument('db-instance')
@click.option('-i', '--interactive', is_flag=True)
@click.option('-s', '--schedule', prompt='Please enter <start_time,end_time>')
@click.option('--view-captures', is_flag=True)
def capture(capture_name, db_instance, i_flag, s_flag, view): 
    click.echo('capturing')

@cli.command()
def replay(): 
    click.echo('replaying')

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
    click.echo('analyzing')
