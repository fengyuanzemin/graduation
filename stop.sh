#!/usr/bin/env bash
cd ./api
forever stop ./bin/www
forever stop ./algorithm/hot.js
forever stop ./algorithm/index.js

cd ../frontend/
forever stop build/build.js