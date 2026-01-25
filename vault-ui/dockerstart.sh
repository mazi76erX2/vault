#!/bin/bash

find ./assets/index*.js -type f -exec sed -i 's|##VAULT_API_URL##|'"$VAULT_API_URL"'|g' {} +
find ./assets/index*.js -type f -exec sed -i 's|##VAULT_API_WEBSOCKET_URL##|'"$VAULT_API_WEBSOCKET_URL"'|g' {} +
npm run prod

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
