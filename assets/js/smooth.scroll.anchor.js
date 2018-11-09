(function($){
	var $root_cont_smooth_scroll = $('html, body');
	var smooth_effect = 'swing'; // swing or linear are JQ basics if use of jQuery UI then easeOutBounce or easeOutBack are cool see easing options
	var time_effect = 1000;
	// Select all links with hashes
	$('a[href*="#"]')
	// Remove links that don't actually link to anything or handle empty hashes that gets you back to the top
	//.not('[href="#"]')
	//.not('[href="#0"]')
	.not('[href="#noscroll"]')
	.not('[href="#carousel-1"]')
	.not('[href*="#modal"]') // Switch off all modal links
	//.not('[href="#modal_contact"]')
	//.not('[href="#modal_subscribe_transporteurs"]')
	//.not('[href="#modal_subscribe_pilotes"]')
	//.not('[href="#modal_add_lead"]')
	.click(function(event) {
		// On-page links
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
			// Remember anchor as we will update url
			var myScrollAnchor = this.hash;
			// Figure out element to scroll to
			var target = $(this.hash);
			if(myScrollAnchor!="") target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			// Does a scroll target exist?
			if (target.length) {
				// Only prevent default if animation is actually gonna happen
				event.preventDefault();
				$root_cont_smooth_scroll.animate({
				  scrollTop: target.offset().top
				}, time_effect, smooth_effect, function() {
				  // Callback after animation
				  // Update url
				  window.location.hash = myScrollAnchor;
				  // Must change focus!
				  var $target = $(target);
				  $target.focus();
				  if ($target.is(":focus")) { // Checking if the target was focused
					return false;
				  } else {
					$target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
					$target.focus(); // Set focus again
				  };
				});
			}
			else {
				// handling empty hashes that gets you back to the top
				event.preventDefault();
				$root_cont_smooth_scroll.animate({
				  scrollTop: 0
				}, time_effect, smooth_effect, function() {
				  window.location.hash = myScrollAnchor;
				});
			}
		}
	});
})(jQuery);
