#!/bin/bash

# check clients config
clients=(hz24 hz25 hz37 hz86 hz87 hz63 hz11 hz12)
for client in ${clients[@]}
do 
	echo $client ' info: '
	ssh popo@$client.popo.163.org "cat /proc/cpuinfo|grep processor; cat /proc/meminfo|grep MemTotal; cat /proc/version; cat /proc/sys/net/ipv4/ip_local_port_range "
done
