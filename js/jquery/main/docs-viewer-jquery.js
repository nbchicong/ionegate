(function($){
	$.fn.docViewer = function(options) {
	
		var settings = {
			title  : '',
			width  : '600',
			height : '700'
		};
		
		if (options) { 
			$.extend(settings, options);
		}
		
		return this.each(function() {
			var file = $(this).attr('href');
			settings.title = $(this).text();
			var obj = $(this).html(function () {
				var id = $(this).attr('id');
				var gdvId = (typeof id !== 'undefined' && id !== false) ? id + '-gdocsviewer' : '';
				return '<div id="' + gdvId + '" class="gdocsviewer"><iframe src="https://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(file) + '" width="' + settings.width + '" height="' + settings.height + '" style="border: none;"></iframe></div>';
			});
			
			var isMobile = navigator.userAgent.match(/mobile|iPhone|iPad|android|ontouchstart|symbian|series60/i);
			if(!isMobile) { 
				var width = $(this).parent().width();
				var left = $(this).parent().position().left + 1;
				var top = $(this).position().top;
				obj.before("<div style='position:absolute; text-align: center; background: #eee; left:" +
				left + "px; top:" +
				top + "px; width:" + 			
				width + "px; height:37px;'>" + settings.title + "</div>");
			}
		});
	};
})( jQuery );
