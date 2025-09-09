#!/bin/bash
cd /var/www/html/cityfinance/cf-ui-ssr
# pm2 stop cf-ui-ssr
pm2 start cf-ui-ssr/server/server.mjs --name cf-ui-ssr
