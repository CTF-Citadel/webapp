#!/bin/bash

export NODE_ENV=production
export HOST=0.0.0.0
export PORT=8085

echo '''
              __
             /  \
            / /\ \
           /_/  \_\
  __   ____ _____ ____   __
 / /  / ___|_   _|  _ \  \ \
/ /  | |     | | | | | |  \ \
\ \  | |___  | | | |_| |  / /
 \_\  \____| |_| |____/  /_/
           __    __
           \ \  / /
            \ \/ /
             \__/
'''

echo "[+] Migrating DB Schema ..."

while ! $(npx drizzle-kit push:pg 1> /dev/null 2> /dev/null); do
    echo "[-] Migration Error! Retrying in 3 seconds ..."
    sleep 3;
done

echo "[+] Success! Starting Web Application ..."

node ./dist/server/entry.mjs
