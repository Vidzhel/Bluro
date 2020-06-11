#! /bin/bash
SCRIPTPATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
cd $SCRIPTPATH

DOT_ENV=./front.env
ENV_VARIABLES=""

while read -r line
do
    ENV_VARIABLES="$ENV_VARIABLES $line"
done < $DOT_ENV

cd ../bluro_cms
npm install

cd ../tech_overload_blog
npm install
eval $ENV_VARIABLES npm run build

cd ../admin_panel
npm install
eval $ENV_VARIABLES npm run build

cd ../configs
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up