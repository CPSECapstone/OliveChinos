import sched, time
from datetime import datetime, timedelta
import multiprocessing 
import heapq

from .capture import *

SUCCESS = 0

manager = multiprocessing.Manager()

"""
Each capture event is created as a process.

Key: capture_name
Value: start_process_id
"""
capture_processes = manager.dict()

"""
If a capture is interactive, both scheduler object and end_capture_schedule_id 
will be None

Key: capture_name
Value: (scheduler object, 
        start_capture_schedule_id, 
        end_capture_schedule_id)
"""
capture_scheduler = manager.dict()

scheduled_captures = manager.list()


def new_capture_process(is_scheduled, credentials, capture_name, 
                            db_name, start_time, end_time): 
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
        start_capture_process = multiprocessing.Process(target=start_capture, 
                args=(capture_name, db_name, start_time))
        start_capture_process.start()

        capture_processes[capture_name] = start_capture_process


        #TODO remove this once tested
        if start_capture_process.is_alive():
            print('new interactive capture started: ' + capture_name, file=sys.stderr)

    else: #scheduled capture
        print('scheduled capture', file=sys.stderr)
        scheduler = sched.scheduler(time.time, time.sleep)

        start_time_in_seconds = _get_epoch_time(start_time)
        print(start_time_in_seconds, file=sys.stderr)
        start_priority = 1
        start_capture_sched_id = scheduler.enterabs(start_time_in_seconds, 
                                    start_priority, 
                                    _run_start_capture, 
                                    (capture_name, db_name, start_time, 
                                        capture_processes))

        end_time_in_seconds = _get_epoch_time(end_time)
        end_priority = 1
        end_capture_sched_id = scheduler.enterabs(end_time_in_seconds, 
                                    end_priority, 
                                    _run_end_capture,
                                    (credentials, capture_name, db_name, 
                                        capture_processes, 
                                        scheduled_captures))

        #TODO test to make sure no delay from start time to actual run time
        schedule_process = multiprocessing.Process(target=scheduler.run) 
        schedule_process.start()

        #add to dictionary in case user wants to cancel scheduled event
        _add_to_scheduler(capture_name, scheduler, start_capture_sched_id, 
                            end_capture_sched_id)
        #add to dict for front-end
        _add_to_scheduled_captures(capture_name, db_name, start_time, end_time)
          
        return SUCCESS

def _add_to_scheduler(capture_name, scheduler, start_capture_sched_id, 
                        end_capture_sched_id): 
    capture_scheduler[capture_name] = (scheduler, 
                                        start_capture_sched_id,
                                        end_capture_sched_id)
    print('\n\n'+type(capture_scheduler) + '\n\n\n\n', file=sys.stderr)

def _run_start_capture(capture_name, db_name, start_time, process_dict): 
    """Initiate creation of process to run start_capture 

    Args: 
        capture_name: unique name of the capture 
        db_name: Amazon RDS instance name 
        start_time: specified time to start the capture

    Returns: 
        SUCCUSS (0) upon completion 
    """
    # capture must start before it can end so safe to set end_capture_id=None
    start_process_id = _run_process(start_capture, (capture_name, 
                                                    db_name, 
                                                    start_time))
    process_dict[capture_name] = start_process_id
    return start_process_id

def _run_end_capture(credentials, capture_name, db_name, process_dict, scheduled_list): 
    """Initiate creation of process to run end_capture
    
    Args: 
        credentials: AWS login credentials
        capture_name: unique name of the capture
        db_name: Amazon RDS instance name

    Returns: 
        SUCCESS (0) upon completion of initiating the process
    """
    # don't overwrite start_capture_id
    end_process_id = _run_process(end_capture, (credentials, 
                                                capture_name, 
                                                db_name))
    #remove capture from in-progress/scheduled captures since it is done
    del process_dict[capture_name] 

    #remove capture from list of scheduled upcoming captures
    del scheduled_list[0]

    return SUCCESS

def _run_process(function_to_run, args): 
    """ Create a process to run the input function to utilize multiprocessing

    Args: 
        function_to_run: the function to run 
        args: required args for the function_to_run

    Returns: 
        the process id of the process running the function
    """
    process = multiprocessing.Process(target=function_to_run, args=args)
    process.start()
    return process

#currently unused, useful later on
def cancel_capture_process(capture_name): 
    """ Unschedule or terminate a capture process.

    If the capture is scheduled and has not begun, the scheduled events to run
    the start- and end-capture functionality will be cancelled. 
    If the capture is already in progress, the end_capture functionality (where
    the real work happens) will be eliminated to eliminate unnecessary resource
    use. 

    Args: 
        capture_name: unique name of the capture to be cancelled

    Returns: 
        SUCCESS (0) upon successful cancellation of the specified capture
    """
    #TODO check if the capture was scheduled
    capture_module = capture_processes[capture_name]
    scheduler = capture_module[0]

    #cancel start_capture
    start_capture_process = capture_module[1]
    start_capture_schedule_id = capture_module[3]

    try: 
        scheduler.cancel(start_capture_schedule_id)
    except ValueError: 
        #log: start has already started running
        pass

    if start_capture_process.is_alive():
        start_capture_process.terminate()


    #cancel end_capture
    end_capture_process = capture_module[2]
    end_capture_schedule_id = capture_module[4]
    try: 
        scheduler.cancel(end_capture_process_id)
    except ValueError: 
        #log: event has already started; terminate should take care of it
        pass
    if end_capture_process.is_alive():
        end_capture_process.terminate()
        #TODO handle other interrupt stuff


    #delete dictionary entry
    del capture_processes[capture_name]

def _get_epoch_time(raw_time): 
    """ convert datetime string to seconds since epoch given a date and time

        Args: 
            raw_time: date and time; format: '2018-03-01T00:09.123Z'

        Returns: 
            seconds since epoch
    """
    dt_obj = datetime.strptime(raw_time, '%Y-%m-%dT%H:%M:%S.%fZ')
    eight_hours = timedelta(hours=8).total_seconds()
    return time.mktime(dt_obj.timetuple()) - eight_hours

def _add_to_scheduled_captures(capture_name, db_name, start_time, end_time): 
    """ add the newly scheduled capture to the list of scheduled captures
        
        This method utilizes Python's built-in heap data structure to sort the 
        list of scheduled captures by increasing start-time

        Args: 
            capture_name: unique name of the newly scheduled capture
            db_name: Amazon RDS instance name
            start_time: date and time the capture will start; 
            end_time: date and time the capture will end

        NOTE: format for start and end-time '2019-03-01T00:09.123Z'
    """
    capture_details = {"captureName": capture_name, 
                        "db": db_name, 
                        "endTime": end_time,
                        "startTime": start_time, 
                        "status": "scheduled"}

    epoch_start_time = _get_epoch_time(start_time)
    plain_list = list(scheduled_captures)
    heapq.heappush(plain_list, (epoch_start_time, 
                                capture_details))
    scheduled_captures=manager.list(plain_list)

def _get_scheduled_captures(): 
    """get the list of upcoming scheduled captures
        
        Takes the existing list of tuples (epoch_start_time, capture_detail_dict)
        and strips the epoch time to return a list of just capture-detail 
        dictionaries

        Returns: 
            list of dictionaries representing a capture and its details
    """
    return list(map(lambda c : c[1], list(scheduled_captures)))
