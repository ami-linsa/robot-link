#! /bin/bash

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


awk '{if($10 ~ /in/) print $0}' statistic.log > in

#login

awk '{if($11 == 90 && $12 == 34) print $13}' in | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData in____auth 90 34;
fi

awk '{if($11 == 93 && $12 == 1) print $13}' in | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData in____sync 93 1;
fi


awk '{if($11 == 90 && $12 == 6) print $13}' in | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData in_logout 90 6;
fi

awk '{if($11 == 96 && $12 == 1) print $13}' in | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData in_p2p_send 96 1;
fi


awk '{if($10 ~ /out/) print $0}' statistic.log > out

#login

awk '{if($11 == 90 && $12 == 4) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
	getData out_kickout 90 4;
fi


awk '{if($11 == 90 && $12 == 34) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_auth 90 34;
fi

#logout
awk '{if($11 == 90 && $12 == 6) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_logout 90 6;
fi

#syn
awk '{if($11 == 91 && $12 == 101) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_uinfo 91 101;
fi

awk '{if($11 == 91 && $12 == 106) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_flist 91 106;
fi



awk '{if($11 == 91 && $12 == 102) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_uinfo_flist 91 102;
fi


awk '{if($11 == 94 && $12 == 104) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_tlist 94 104;
fi


awk '{if($11 == 94 && $12 == 111) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_tuser_list 94 111;
fi

awk '{if($11 == 92 && $12 == 9) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_manyou 92 9;
fi

awk '{if($11 == 92 && $12 == 4) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_sys_nti_off 92 4;
fi

awk '{if($11 == 92 && $12 == 5) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_p2p_off 92 5;
fi

awk '{if($11 == 94 && $12 == 9) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_t_msg_off 94 9;
fi

awk '{if($11 == 93 && $12 == 1) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_sync_done 93 1;
fi

#p2p
awk '{if($11 == 96 && $12 == 50) print $13}' out | sort -n > a
lineNum=`cat a | wc -l`

if [ $lineNum -gt 0 ]
then
    getData out_p2p_recv 96 50;
fi
