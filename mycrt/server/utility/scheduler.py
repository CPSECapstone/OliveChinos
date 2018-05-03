import sched, time
from datetime import datetime, timedelta
import multiprocessing 
import os
import signal

from .communications import ComManager
from .capture import *

SUCCESS = 0

manager = None
capture_scheduler_pids = None

def init_scheduler():
    global manager
    manager = multiprocessing.Manager()

    '''Dictionary to store pids for scheduler processes
        
    Each scheduled capture has a scheduler object which is responsible for calling the
    start- and end-capture functions at the specified start and end times. 

    To cancel a capture, simply kill the process responsible for calling these 
    functions.

        Key: capture_name (STRING)
        Value: scheduler_pid (INT)
    '''
    global capture_scheduler_pids
    capture_scheduler_pids = manager.dict()


def new_capture_process(is_scheduled, credentials, capture_name, 
                            db_name, start_time, end_time, rds_name, username, password, cm): 
    """Initiate a capture event. 
    If capture is interactive, a start-capture process will be started immediately.
    If capture is scheduled, an event will be scheduled to run at the specified 
    time. This event will create a start- and end-capture process. 

    All process and schedule identifiers are stored for use in case the user wants 
    to terminate a capture before the specified end time. 

    Args: 
        is_scheduled: a flag representing the capture mode: scheduled/interactive
        credentials: aws login credentials
        capture_name: unique name of the capture 
        db_name: Amazon RDS instance name 
        start_time: specified time to start the capture
        end_time: specified time to end the capture

    Returns: 
        SUCCESS (0) upon completion.
        
    """

    if not is_scheduled: #interactive capture
        start_capture(capture_name, rds_name, db_name, start_time, username, password, cm)

    else: #scheduled capture
        '''scheduler = sched.scheduler(time.time, time.sleep)

        _create_scheduled_event(scheduler, start_capture, 
                (capture_name, rds_name, db_name, start_time, username, password), start_time)

        _create_scheduled_event(scheduler, end_capture, 
                (credentials, capture_name, db_name), end_time)

        #remove capture from scheduled captures when end_capture is called
        _create_scheduled_event(scheduler, _remove_from_scheduled_captures, 
                (capture_name,), end_time)
        '''

        #TODO test to make sure no delay from start time to actual run time
        schedule_process = multiprocessing.Process(target=create_and_run_scheduler, 
            args=(credentials, capture_name, rds_name, db_name, start_time, end_time, username, password, ComManager()))
        schedule_process.start()
        

        #add to dictionary in case user wants to cancel scheduled event
        _add_to_scheduled_captures(capture_name, schedule_process.pid)

        #add to db for front-end
        schedule_capture(capture_name, db_name, start_time, end_time, rds_name, username, password, cm)
          

        return SUCCESS

def create_and_run_scheduler(credentials, capture_name, rds_name, db_name, start_time, end_time, username, password, cm):
    scheduler = sched.scheduler(time.time, time.sleep)

    _create_scheduled_event(scheduler, start_capture, 
            (capture_name, rds_name, db_name, start_time, username, password, cm), start_time)

    _create_scheduled_event(scheduler, end_capture, 
            (credentials, capture_name, db_name, cm), end_time)

    #remove capture from scheduled captures when end_capture is called
    _create_scheduled_event(scheduler, _remove_from_scheduled_captures, 
            (capture_name,), end_time)

    scheduler.run()


def _remove_from_scheduled_captures(capture_name): 
    del capture_scheduler_pids[capture_name]

def _add_to_scheduled_captures(capture_name, scheduler_process_id): 
    capture_scheduler_pids[capture_name] = scheduler_process_id

def _create_scheduled_event(scheduler, func, args, unformatted_time): 
    time_to_run = _get_epoch_time(unformatted_time)

    priority = 1
    return scheduler.enterabs(time_to_run, priority, func, args)


#currently unused, useful later on
def cancel_capture_process(capture_name, cm): 
    """ Unschedule or terminate a capture process.

    Since no work happens for the capture until end_capture, all we have to 
    do is kill the scheduler process which is responsible for calling start-
    and end-capture.

        Args: 
        capture_name: unique name of the capture to be cancelled
    """
    #kill scheduler process
    scheduler_pid = capture_scheduler_pids[capture_name]
    os.kill(scheduler_pid, signal.SIGTERM)

    #remove record from utility db
    cancel_capture(capture_name, cm)

def _get_epoch_time(raw_time): 
    """ convert datetime string to seconds since epoch given a date and time

        Args: 
            raw_time: date and time; format: '2018-03-01T00:09.123Z'

        Returns: 
            seconds since epoch
    """
    if "T" in raw_time:
        dt_obj = datetime.strptime(raw_time, '%Y-%m-%dT%H:%M:%S.%fZ')
    else:
        dt_obj = datetime.strptime(raw_time, '%Y/%m/%d %H:%M:%S')
    #NOTE epoch time does not take into account daylight savings time
    #TODO in the future, update per time zone 
    eight_hours = timedelta(hours=7).total_seconds()
    return time.mktime(dt_obj.timetuple()) 

def start_orphaned_captures(credentials, cm):
    """ Ran at start of program to start previously scheduled captures from last runtime.

    Args:
        credentials: A credentials dictionary #not used anymore, kept around until we refactor
        cm: A ComManager object
    """

    captures_to_start = cm.execute_query("SELECT * FROM Captures WHERE status = 'scheduled'")
    cm.execute_query("DELETE FROM Captures WHERE status = 'scheduled'")
    for (db_name, capture_name, start_time, end_time, status, rds_name, username, password) in captures_to_start:
        print(capture_name, file=sys.stderr)
        new_capture_process(True, credentials, capture_name, 
                            db_name, start_time, end_time, rds_name, username, password, cm)
