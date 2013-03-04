
// Useful functions

// Parse string to make imgs from img links
function parseLinks(string) {
	return string
		.replace(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/gi, "<img src='$1' />");
};

function refreshTimes(interval) {
	$(".single-message").each(function(i, val) {
		var readableTime = moment($(this).data('time')).fromNow();
		$(this).children('.message-time').html(readableTime);
	});

	setTimeout(function() {
		refreshTimes(interval);
	}, interval);
}
