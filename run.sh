cd `dirname $0`
DATE=`date +%Y-%m-%d-%H-%M-%S`
screen -d -S atcoder-discord-bot -m bash -c "deno task start | tee ./log/${DATE}.log"

