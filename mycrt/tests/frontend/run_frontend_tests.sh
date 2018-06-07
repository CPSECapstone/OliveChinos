#!/bin/bash

cd ../../static
echo Building Package...
#npm run build & wait
echo Package Built. 
echo

cd ../tests/frontend #get back to test directory
echo Running server... 
python3 ../../server/mycrt.py > server.out 2>&1 &
SERVER_PID=$!
sleep 5
echo &
echo Running Tests... &
pytest
kill $SERVER_PID

