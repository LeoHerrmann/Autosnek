function fadeLink(url) {
	document.body.style.opacity = 0;

	setTimeout(function() {
        window.location = url;
	}, 200);
	
	setTimeout(function() {
	document.body.style.opacity = 1;
	}, 500)
}
