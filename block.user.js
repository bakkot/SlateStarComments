// ==UserScript==
// @name           SSC Block
// @namespace      https://github.com/bakkot/SlateStarComments/tree/blocking
// @description    Block users in SlateStarCodex and Unsong comments
// @match          http://slatestarcodex.com/20*
// @match          http://unsongbook.com/*
// @version        1.0.2
// ==/UserScript==

// run to reset:
// localStorage.removeItem('extn-blocklist');

var blocks = JSON.parse(localStorage.getItem('extn-blocklist') || '[]');

var avatars = document.querySelectorAll('div.comment-author > img');

function commentToggle(skipScroll) { // copied from ssc.js, ugh
  var myComment = this.parentElement.parentElement;
  var myBody = myComment.querySelector('div.comment-body');
  var myMeta = myComment.querySelector('div.comment-meta');
  var myChildren = myComment.nextElementSibling;
  if (this.textContent == 'Hide') {
    this.textContent = 'Show';
    myComment.style.opacity = '.6';
    myBody.style.display = 'none';
    myMeta.style.display = 'none';
    if (myChildren) {
      myChildren.style.display = 'none';
    }
  } else {
    this.textContent = 'Hide';
    myComment.style.opacity = '1';
    myBody.style.display = 'block';
    myMeta.style.display = 'block';
    if(myChildren) {
      myChildren.style.display = 'block';
    }
  }
  if (!skipScroll) {
    myComment.scrollIntoView(true);
  }
}

function hideIds(idList) {
  for (var i = 0; i < avatars.length; ++i) {
    var id = avatars[i].src.match(/\/([a-z0-9]+)\?/)[1];
    if (idList.indexOf(id) !== -1) {
      var links = avatars[i].parentElement.parentElement.querySelectorAll('.comment-reply-link');
      for (var j = 0; j < links.length; ++j) { // yes, dumb, but whatever
        if (links[j].innerHTML === 'Hide') {
          commentToggle.call(links[j], true);
          break;
        }
      }
    }
  }
}

function block() {
  var id = this.src.match(/\/([a-z0-9]+)\?/)[1];
  var index = blocks.indexOf(id);
  if (index === -1) {
    if (confirm('Hide comments from this user?')) {
      hideIds([id]);
      blocks.push(id);
      localStorage.setItem('extn-blocklist', JSON.stringify(blocks));
    }
  } else {
    if (confirm('Stop hiding comments from this user? (Takes effect on next page load.)')) {
      blocks.splice(index, 1);
      localStorage.setItem('extn-blocklist', JSON.stringify(blocks));
    }
  }
}

for (var i = 0; i < avatars.length; ++i) {
  avatars[i].addEventListener('click', block, false);
}

var styleEle = document.createElement('style');
styleEle.type = 'text/css';
styleEle.textContent = 'div.comment-author > img:hover { border: 2px solid red; } div.comment-author > img { border: 2px solid transparent; }';
document.head.appendChild(styleEle);

hideIds(blocks);

location.hash && document.querySelector(location.hash).scrollIntoView(); // also a useful bookmarklet!
