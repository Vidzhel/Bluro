#! /bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd $SCRIPTPATH

# go to blog folder
# cd ../tech_overload_blog 
# npm run build
# cp ../tech_overload_blog ../src/tech_overload_blog
# cp ../admin_panel ../src/admin_panel

if [ ! -e ../src/bluro_cms ]; then
    cp -r ../bluro_cms ../src/bluro_cms
    cp ./dev_entrypoint.sh ../src/bluro_cms/dev_entrypoint.sh
fi

docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up

echo Done