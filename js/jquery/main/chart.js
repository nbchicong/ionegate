google.load('visualization', '1', {packages: ['corechart']});
$(document).ready(function(){
 var start = $("#m2-month").attr("month");
 var year = $("#m2-month").attr("year");	
 
 if(start - 3 < 0){
	 year -= 1;
	 start = start -3 + 12;
 }else{
	 start -=3; 
 }
 
 $.ajax( {
         "dataType": 'json',
         "type": "POST",
         "data": [{name: "start", value:start},
                  {name: "year", value:year},
                  {name: "range", value:6}],
         "url": "/inetcloud/portal/og/rrchartsummary.ivt",
         "success": function (json) {
         	if(!!json && !!json.quarter && !!json.quarter.quarters){
         		var quarters = json.quarter.quarters[0].entry;  
         		var percentage, item;
         		var array = [['Tháng', 'Tiếp nhận', 'Giải quyết', 'Đúng hẹn', '% đúng hẹn']];
         		for(var i = 0; i<6; i++){
         			item = quarters[i].summaryquarter;
         			if (item.solved <= 0){
         				percentage = 0;
         			}else{
         				percentage = Math.round((item.ontime * 100)/item.solved);
         			}
         			array.push([item.year + "-"  + (item.month + 1),
         			           item.received, 
         			           item.solved,
         			           item.ontime,
         			          percentage]);
         		}
         		
         		
         		
         		 var data = google.visualization.arrayToDataTable(array);

                    // Create and draw the visualization.
                    var ac = new google.visualization.ComboChart(document.getElementById('visualization'));
                    ac.draw(data, {
                      title : 'Tình hình giải quyết hồ sơ 6 tháng gần đây',
                      titleTextStyle: {fontSize:20 },
                      width: 780,
                      height: 415,
                      vAxes: {0: {title: "Hồ sơ"}, 1: {title: "%",minValue:60, maxValue: 100}},
                      hAxis: {title: "Tháng"},
                      seriesType: "bars",
                      series: {3: {type: "line", targetAxisIndex: 1}}
                    });
         	}
         }
     });
});