
// Useful functions

// Parse string to make imgs from img links
function parseLinks(string) {
    return string
			.replace(/([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif))/gi, "<img src='$1' />");
};
