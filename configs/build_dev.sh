#! /bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd $SCRIPTPATH

# Setup environmet
cd ../bluro_cms
echo Installing bluro_cms dependencies
npm install

cd ../tech_overload_blog
echo Installing tech_overload_blog dependencies
npm install

cd ../admin_panel
echo Installing admin_panel dependencies
npm install

cd ../configs
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up