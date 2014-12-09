// ==UserScript==
// @name           SlateStarComments Parents
// @namespace      http://www.github.com/bakkot
// @description    Adds link to parent comment on SSC threads
// @match          http://slatestarcodex.com/20*
// @version        0.1
// ==/UserScript==


function makeParentLinks() {
  var commentList = document.querySelectorAll('li.comment');
  for(var i = 0; i < commentList.length; ++i) {
    if(commentList[i].parentElement.tagName == 'OL') {
      continue;
    }
    
    var parent = commentList[i].parentElement.parentElement;
    var parentID = parent.firstElementChild.id;


    var parentLink = document.createElement('a');
    parentLink.href = '#' + parentID;
    parentLink.className = 'comment-reply-link';
    parentLink.style.textDecoration = 'underline';
    parentLink.textContent = '↑';

    var replyEle = commentList[i].querySelector('div.reply');
    
    replyEle.appendChild(document.createTextNode(' '));

    replyEle.appendChild(parentLink);
    
  }
}

makeParentLinks();
