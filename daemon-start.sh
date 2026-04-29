#!/bin/bash
cd "$(dirname "$0")"

# Double-fork to daemonize
(while true; do
  npx next dev -p 3000 >> ./dev.log 2>&1
  echo "[$(date)] Server exited, restarting in 5s..." >> ./dev.log
  sleep 5
done) &
echo $! > ./.dev-server-pid
