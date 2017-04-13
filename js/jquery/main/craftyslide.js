/*
 * Craftyslide
 * Created by: Abid Din - http://craftedpixelz.co.uk
 * Version: 1.0
 * Copyright: Crafted Pixelz
 * License: MIT license
 * Updated: 7th June 2011
 */
(function($){
	$.fn.craftyslide = function(options){
	
		// Defaults
		var defaults = {
			"width": 600,
			"height": 300,
			"pagination": true,
			"fadetime": 350,
			"delay": 5000,
			"desc":''
		};
		
		var options = $.extend(defaults, options);
		
		return this.each(function(){

			// Vars
			var $this = $(this);
			var $slides = $this.find("ul li");
			
			
			
			$slides.not(':first').hide();
			
			// 
			
			
			// Pagination
			function paginate(){
				$this.append("<ol id='pagination' />");
				
				var i = 1;
				$slides.each(function(){
					$(this).attr("id", "slide" + i);
					$("#pagination").append("<li><a href='#slide" + i + "'>" + i + "</a></li>");
					i++;
				});
				
				$("#pagination li a:first").addClass("active");
			}
			
			// Add captions
			function captions(){
				$slides.each(function(){
					$caption = $(this).find("img").attr("title");
					if ($caption !== undefined) {
						
						$(this).prepend("<p class='caption'>" + $caption + "</p>");
					}
					$slides.filter(":first").find(".caption").css("bottom", 0);
				});
			}
			
			// Manual mode
			function manual(){
				var $pagination = $("#pagination li a");
				$pagination.click(function(e){
					e.preventDefault();
					var $current = $(this.hash);
					if ($current.is(":hidden")) {
						$slides.fadeOut(options.fadetime);
						$current.fadeIn(options.fadetime);
						$pagination.removeClass("active");
						$(this).addClass("active");
						var __capPadding = $current.find(".caption").innerHeight();
						var __capBottom = (0- __capPadding - $current.find(".caption").height())+'px';
						$current.find(".caption").css("bottom", __capBottom);
						$current.find(".caption").delay(300).animate({
							bottom: 0
						}, 300);
					}
				});
			}
			
			// Auto mode
			var interval_function = function(){
				$slides.filter(":first-child")
					.fadeOut(options.fadetime)
					.next("li")
					.fadeIn(options.fadetime)
					.end()
					.appendTo("#slideshow ul");
				$('#pagination li a').removeClass('active');
				$('#pagination li a[href="#'+$slides.filter(":first-child").attr('id')+'"]').addClass('active');
				if(!!options.desc){
					var $desc = $(options.desc);
					$desc.html($slides.filter(":first-child").find('img').attr('desc'));
				}
				$slides.each(function(){
					if ($slides.is(":visible")) {
						var __capPadding = $(this).find(".caption").innerHeight();
						var __capBottom = (0- __capPadding - $(this).find(".caption").height())+'px';
						$(this).find(".caption").css("bottom", __capBottom);
						$(this).find(".caption").delay(300).animate({
							bottom: 0
						}, 300);
					}
				});
			};
			var interval;
			function auto(){
				interval = setInterval(interval_function, options.delay);
			}
			
			// Width
			$this.width(options.width);
			$this.find("ul, li img").width(options.width);
			
			// Height
			$this.height(options.height);
			$this.find("ul, li").height(options.height);
			// Check Boolean 
			// Check Boolean values
//			if (options.pagination === true) {
			paginate();
//			} else {
			auto();
//			}
			
			captions();
			manual();
			$this.hover(function () {
        clearInterval(interval);
	    }, function () {
	        auto();
	    });
		});
	};
})(jQuery);
