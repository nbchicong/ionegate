// #PACKAGE: ionegate-admin-statistic
// #MODULE: Statistic
$(function() {
  $('.easy-pie-chart.percentage').each(function() {
    var $box = $(this).closest('.infobox');
    var barColor = $(this).data('color') || (!$box.hasClass('infobox-dark') ? $box.css('color') : 'rgba(255,255,255,0.95)');
    var trackColor = barColor == 'rgba(255,255,255,0.95)' ? 'rgba(255,255,255,0.25)' : '#E2E2E2';
    var size = parseInt($(this).data('size')) || 50;
    $(this).easyPieChart({
      barColor : barColor,
      trackColor : trackColor,
      scaleColor : false,
      lineCap : 'butt',
      lineWidth : parseInt(size / 10),
      animate : 1000,
      size : size
    });
  });
  
  $('.sparkline').each(function() {
    var $box = $(this).closest('.infobox');
    var barColor = !$box.hasClass('infobox-dark') ? $box.css('color') : '#FFF';
    $(this).sparkline('html', {
      tagValuesAttribute : 'data-values',
      type : 'bar',
      barColor : barColor,
      chartRangeMin : $(this).data('min') || 0
    });
  });

  $('#btn-refresh').on('click', function(e) {
      e.preventDefault();
      $('.percentage, .percentage-light').each(function() {
        var newValue = Math.round(100 * Math.random());
        $(this).data('easyPieChart').update(newValue);
        $('span', this).text(newValue);
      });
  }); 

});
