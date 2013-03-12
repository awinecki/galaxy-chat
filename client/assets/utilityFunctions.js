
// Useful functions

// Parse string to make imgs from img links
function parseImages(string) {
	return string
		.replace(/<a href=\'([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))'>.*<\/a>/gi, "<img src='$1' />");
};

function replaceURLWithHTMLLinks(string) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return string.replace(exp,"<a href='$1'>$1</a>"); 
}

function parseContent(string) {
	return parseImages(replaceURLWithHTMLLinks(string));
}

function refreshTimes(interval) {
	$(".single-message").each(function(i, val) {
		var readableTime = moment($(this).data('time')).fromNow();
		$(this).children('.message-time').html(readableTime);
	});

	setTimeout(function() {
		refreshTimes(interval);
	}, interval);
}
