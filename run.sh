#!/usr/bin/env bash
cd ./api
forever start ./bin/www
forever start ./algorithm/hot.js
forever start ./algorithm/index.js

cd ../frontend/
forever start build/build.js