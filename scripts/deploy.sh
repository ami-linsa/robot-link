#!/bin/bash

#clients=(hz24 hz25 hz32 hz37 hz48 hz63 hz84 hz85 hz86 hz87 hz92 hz93 hz94 hz95)
#clients=(hz25 hz48 hz63 hz84 hz85 hz86 hz87 hz92 hz93 hz94 hz95)
clients=(hz25 hz37 hz85 hz86 hz87 hz63 hz11 hz12)
#clients=(hz25)
robot_path="/home/popo/perftest/pomelo-robot-demo"

for client in ${clients[@]}
do
	echo "rsync .ssh/config " $client
#/usr/bin/rsync -av --delete /home/popo/.ssh/config popo@$client.popo.163.org:/home/popo/.ssh/
	echo " "
	

    echo "rsync script/link.js " $client
    /usr/bin/rsync -av --delete $robot_path/app/script/link.js popo@$client.popo.163.org:$robot_path/app/script/
	/usr/bin/rsync -av --delete $robot_path/app/script/all-polling.js popo@$client.popo.163.org:$robot_path/app/script/
	echo "rsync script/sync.js " $client
	/usr/bin/rsync -av --delete $robot_path/app/script/sync.js popo@$client.popo.163.org:$robot_path/app/script/
	
	echo "rsync script/clients.js " $client
#	/usr/bin/rsync -av --delete $robot_path/app/script/clients.js popo@$client.popo.163.org:$robot_path/app/script/

	echo "rsync script/p2p.js " $client
	/usr/bin/rsync -av --delete $robot_path/app/script/p2p.js popo@$client.popo.163.org:$robot_path/app/script/

	echo "rsync script/uids " $client
#	/usr/bin/rsync -av --delete $robot_path/app/script/uids popo@$client.popo.163.org:$robot_path/app/script/
	
	echo "rsync config/env.json " $client
	/usr/bin/rsync -av --delete $robot_path/app/config/env.json popo@$client.popo.163.org:$robot_path/app/config/
	
	echo "rsync config/prod/config.json " $client
	/usr/bin/rsync -av --delete $robot_path/app/config/prod/config.json popo@$client.popo.163.org:$robot_path/app/config/prod/
done
