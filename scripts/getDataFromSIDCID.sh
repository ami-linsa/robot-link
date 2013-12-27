#! /bin/bash

if [ "$#" != "3" ]
then
   echo "please input in/out, sid, cid"
   exit
fi

printf "style\t\tsid\tcid\tlineNum\tmin\tavg\t90\t99\tmax\n"
getData()
{
	    lineNum=`cat a | wc -l`
		ratio=1000000;

		eval $(awk '{ sum+=$1;line++}; END{ print "avg="sum/line}' a)
		Avg=`awk 'BEGIN{printf "%.2f\n",('"$avg"'/'"$ratio"')}'`
		
		t=`sed -n -e ''"$lineNum"'p' a`
		max=`awk 'BEGIN{printf "%.2f\n",('"$t"'/'"$ratio"')}'`
		
		t=`sed -n -e '1p' a`		
		min=`awk 'BEGIN{printf "%.2f\n",('"$t"'/'"$ratio"')}'`
		
		test=0.9
		line=`expr $lineNum*$test|bc`		
		b=${line%%.*}
		t=`sed -n -e ''"$b"'p' a`
		r90=`awk 'BEGIN{printf "%.2f\n",('"$t"'/'"$ratio"')}'`


		
		test=0.99
		line=`expr $lineNum*$test|bc`
		b=${line%%.*}
		t=`sed -n -e ''"$b"'p' a`
		r99=`awk 'BEGIN{printf "%.2f\n",('"$t"'/'"$ratio"')}'`

		
		printf "$1\t$2\t$3\t$lineNum\t$min\t$Avg\t$r90\t$r99\t$max\n"
}


awk '{if($10 ~ /'"$1"'/) print $0}' statistic.log > out
awk '{if($11 == '"$2"' && $12 == '"$3"') print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData $1 $2 $3;
fi
