import sched, time
from datetime import datetime
import multiprocessing 

from capture import *

# this handles initiating the capture, creating the process for a schedulerd
def new_capture_process(credentials, capture_name, db_name, start_time, end_time): 
    capture_scheduler = sched.scheduler(time.time, time.sleep)

    start_capture_process = multiprocessing.Process(target=start_capture, 
            args=(capture_name, db_name, start_time, end_time))
    start_time_adjusted = 0
    start_capture_process_id = capture_scheduler.enterabs(start_time_adjusted, 1, 
            start_capture_process.start())

    processes_by_cid[capture_name] = (start_capture_process_id,)

    if end_time != 'No end time..': #scheduled capture
        end_capture_process = multiprocessing.Process(target=end_capture, 
                args=(credentials, capture_name, db_name, false))
        end_time_adjusted = 0
        #NOTE ACTUAL SCHEDULING IS NOT YET WORKING
        end_capture_process_id = capture_scheduler.enterabs(end_time_adjusted, 1, 
                end_capture_process.start())

        processes_by_cid[capture_name] = (start_capture_process_id, end_capture_process_id)


#currently unused, useful later on
def cancel_capture_process(capture_name): 
    end_capture_process_id = processes_by_cid[capture_name][1]
    capture_scheduler.cancel(end_capture_process_id)
    
def get_delta(raw_time): 
    now = datetime.now()

def no_more_captures(): 
    return not capture_scheduler.queue() 


