# Run me before baker.
# TODO: Would be nicer to prompt and confirm...
echo "Checking for process on sandboxed node port (18731)..."
PID_USING_18731=$(lsof -i :18731 | awk 'END {print $2}')
if [ ! -z "$PID_USING_18731" ]
then
  echo "An existing process is using port 18731. Killing..."
  kill -9 $PID_USING_18731
  sleep 1
fi

PID_USING_18731_PART_2=$(lsof -i :18731 | awk 'END {print $2}')
if [ ! -z "$PID_USING_18731_PART_2" ]
then
  echo "Running kill one more time to be sure..."
  kill -9 $PID_USING_18731_PART_2
  sleep 1
fi
