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
