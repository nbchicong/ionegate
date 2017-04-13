$(document).ready(function(){
	checkStatus($("#m2-month").attr("month"), $("#m2-month").attr("year"));	

	 $("#statistic-before").ajaxStart(function() {
		$(this).showLoading();
	 });
 
	 $("#statistic-before").ajaxStop(function(){
		 $(this).hideLoading();
	 });  	

	 $(".btt-statistic").click(function(){
		 if($(this).hasClass("disabled")){
			 return;
		 }
		 var start = parseInt($("#m2-month").attr("month"));
		 var year = parseInt($("#m2-month").attr("year"));
		 if($(this).hasClass("prev")){
			 if(start - 3 < 0){
				 year -= 1;
				 start = start -3 + 12;
			 }else{
				 start -=3; 
			 }
		 }else{
			 if(start + 3 > 11){
				 year += 1;
				 start = start + 3 - 12;
			 }else{
				 start +=3; 
			 }
		 }
		 
		 $.ajax({
	         "dataType": 'json',
	         "type": "POST",
	         "data": [{name: "start", value:start},
	                  {name: "year", value:year}],
	         "url": "/inetcloud/portal/og/rrrangesummary.ivt",
	         "success": function (json) {
	         	if(!!json && !!json.quarter && !!json.quarter.quarters){
	         		var quarters = json.quarter.quarters[0].entry;  
	         		var percentage, item;
	         		for(var i = 0; i<3; i++){
	         			var j = 2 -i;
	         			item = quarters[i].summaryquarter;
	         			if (item.solved <= 0){
	         				percentage = 0;
	         			}else{
	         				percentage = Math.round((item.ontime * 100)/item.solved);
	         			}
	         			$("#m"+ j +"-month").text(item.month + 1);
	         			var linkDetail = $("#m"+ j +"-link-detail"); 
	         			linkDetail.attr('month', item.month);
	         			linkDetail.attr('year', item.year);
	         			
	         			if(j == 2){
	         				$("#m"+ j +"-month").attr("month", item.month);
	         				$("#m"+ j +"-month").attr("year", item.year);
	         				checkStatus(item.month, item.year);
	         			}
	         			
	         			$("#m"+ j +"-received").text(item.received + " hồ sơ");
	         			$("#m"+ j +"-solved").text(item.solved + " hồ sơ");
	         			$("#m"+ j +"-percentage").text(percentage + "% ");
	         		}
	         		
	         		var year = $("#year-summary-title").attr('data-year');
         			loadByYear(quarters[2].summaryquarter.month, quarters[2].summaryquarter.year);
	         	}
	         }
	     });
	 });     
});

function loadByYear(month, year){
	$.ajax({
     "dataType": 'json',
     "type": "POST",
     "data": [{name: "month", value:month},{name: "year", value:year}],
     "url": "/inetcloud/portal/og/rryearsummary.ivt",
     "success": function (json) {
     	var title =  'Tình hình xử lý hồ sơ đúng hẹn từ <br>tháng 1 năm ' + year  +
     				' đến tháng ' + (month + 1) + ' năm ' + year;
     	$('#year-summary-title').html(title);
     	$('#year-summary-inventory').html(json.summaryquarter.inventory);
     	$('#year-summary-received').html(json.summaryquarter.received);
     	$('#year-summary-solved').html(json.summaryquarter.solved);
     	if(json.summaryquarter.ontime > 0){
     		var percent = json.summaryquarter.ontime/json.summaryquarter.solved;
     		$('#year-summary-percent').html(Math.round(percent * 100) + '%');
     	}else {
     		$('#year-summary-percent').html('0 %');
     	}
     	$("#year-summary-title").attr('data-year', year);
     	$("#year-summary-title").attr('data-month', month);
     }
 	});
}

function checkStatus(start, year){
	var end = start;
	if(start + 3 > 11){
		year += 1;
		end = start + 3 -12;
	}else{
		end = start + 3;
	}
	
	// check previous button
	if(year == currentYear){
		if( end >=(currentMonth -1)){// disable
			$("#next-button").addClass("disabled");
		}else{
			$("#next-button").removeClass("disabled");
		}
	}else if(year > currentYear){
		$("#next-button").addClass("disabled");
	}else{
		$("#next-button").removeClass("disabled");
	}
	
	if(start <= 2 && year == 2011){
		$("#prev-button").addClass("disabled");
	} else {
		$("#prev-button").removeClass("disabled");
	}
}