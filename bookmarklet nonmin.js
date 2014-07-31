var pathString = "visited-"+location.pathname;
var lastVisit = parseInt(localStorage[pathString]);
if(isNaN(lastVisit)) {
	lastVisit = 0; // prehistory!
}
var commentList = document.querySelectorAll(".commentholder");
var mostRecent = lastVisit;
var newCount = 0;
for(var i=0; i<commentList.length; ++i) {
	var postTime=Date.parse(commentList[i].querySelector(".comment-meta a").innerHTML.replace(' at', ''));
	if(postTime>lastVisit) {
		commentList[i].style.border="2px solid #5a5";
		++newCount;
		if(postTime > mostRecent) {
			mostRecent = postTime;
		}
	}
}
document.title="("+newCount+") " + document.title;
localStorage[pathString] = mostRecent;
