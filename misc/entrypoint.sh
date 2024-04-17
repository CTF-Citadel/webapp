#!/bin/bash

echo """
###################
  ____ _____ ____  
 / ___|_   _|  _ \ 
| |     | | | | | |
| |___  | | | |_| |
 \____| |_| |____/ 

###################

[+] Starting ...
"""

echo "[+] Trying to migrate DB Schema ..."

while ! $(npm run migrate 1> /dev/null); do
    echo "Migration Error!"
    sleep 5;
done

echo "[+] Done! Starting Web Application ..."

npm run dist
