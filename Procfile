web: concurrently -k -s first -n api,web -c green,blue "API_PORT=3001 node server.js" "next start -p $PORT"
