import sched, time
from datetime import datetime, timedelta
import multiprocessing 

from .capture import *

"""
Each capture is created as a process.
Scheduled captures also have a scheduler to run them at their specified start time.

capture_processes holds all of the capture processes
Key: capture_name
Value: (start_process_id, 
        end_process_id)
"""
capture_processes = {}


"""
capture_scheduler holds the scheduler and start/end id's for each capture
note if the capture is interactive, both scheduler object and 
end_capture_schedule_id will be None

Key: capture_name
Value: (scheduler object, 
        start_capture_schedule_id, 
        end_capture_schedule_id)
"""
capture_scheduler = {}

# this handles initiating the capture, creating the process for a schedulerd
# assumes if no end time specified, capture is interactive 
def new_capture_process(credentials, capture_name, db_name, start_time, end_time): 

    start_capture_schedule_id = None
    start_capture_process = None
    end_capture_schedule_id = None
    end_capture_process = None


    if end_time == 'No end time..': #interactive capture
        start_capture_process = multiprocessing.Process(target=start_capture, 
                args=(capture_name, db_name, start_time))
        start_capture_process.start()
        start_capture_process.join()

        capture_processes[capture_name] = (start_capture_process, None)


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
                                    (capture_name, db_name, start_time))

        end_time_in_seconds = _get_epoch_time(end_time)
        end_priority = 1
        end_capture_sched_id = scheduler.enterabs(end_time_in_seconds, 
                                    end_priority, 
                                    _run_end_capture,
                                    (credentials, capture_name, db_name))

        #TODO test to make sure no delay from start time to actual run time
        schedule_process = multiprocessing.Process(target=scheduler.run) 
        schedule_process.start()
        schedule_process.join()

        #add to dictionary in case user wants to cancel scheduled event
        capture_scheduler[capture_name] = (scheduler, 
                                            start_capture_sched_id,
                                            end_capture_sched_id)

def _run_start_capture(capture_name, db_name, start_time): 
    # a capture must start before it can end so safe to set end_capture_id=None
    start_process_id = _run_process(start_capture, (capture_name, db_name, start_time))
    capture_processes[capture_name] = (start_process_id, None)

def _run_end_capture(credentials, capture_name, db_name): 
    # don't want to overwrite start_capture_id
    start_process_id = capture_processes[capture_name][0]
    end_process_id = _run_process(end_capture, (credentials, 
                                                capture_name, 
                                                db_name))

    capture_processes[capture_name] = (start_process_id, 
                                        end_process_id)

def _run_process(function_to_run, args): 
    print('running process', file=sys.stderr)
    process = multiprocessing.Process(target=function_to_run, args=args)
    process.start()
    process.join()
    return process

"""---------- CANCEL CAPTURE -------------"""    
#currently unused, useful later on
def cancel_capture_process(capture_name): 
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


#convert datetime string to seconds since epoch for use by scheduler
#example input: '2018-03-01 00:09'
#example output: '1519891740.0'
def _get_epoch_time(raw_time): 
    dt_obj = datetime.strptime(raw_time, '%Y-%m-%dT%H:%M:%S.%fZ')
    eight_hours = timedelta(hours=8).total_seconds()
    return time.mktime(dt_obj.timetuple()) - eight_hours


