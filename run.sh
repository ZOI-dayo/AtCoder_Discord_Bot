cd `dirname $0`
DATE=`date +%Y-%m-%d-%H-%M-%S`
screen -d -S atcoder-discord-bot -m bash -c "deno task start 2>&1 | tee ./log/${DATE}.log"

