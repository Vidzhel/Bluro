#! /bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd $SCRIPTPATH

if [ ! -d ../src ]; then
    mkdir ../src
fi

if [ ! -e ../src/bluro_cms ]; then
    echo copy bluro_cms
    cp -r ../bluro_cms ../src/bluro_cms
    cp ./dev_entrypoint.sh ../src/bluro_cms/dev_entrypoint.sh
fi

if [ ! -e ../src/tech_overload_blog ]; then
    echo copy tech_overload_blog
    cp -r ../tech_overload_blog ../src/tech_overload_blog
    cp ./dev_entrypoint.sh ../src/tech_overload_blog/dev_entrypoint.sh
fi

docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up

echo Done