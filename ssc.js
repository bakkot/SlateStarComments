// run to reset:
// localStorage.removeItem('visited-' + location.pathname); sessionStorage.removeItem('prev-' + location.pathname);


// redirect http://slatestarcodex.com/tag/open/?latest (and similar) to their first post
if (location.pathname.match(/^\/tag\/[^\/]+\//) && location.search === '?latest') {
  var rHref = document.querySelector('h2.pjgm-posttitle > a').href;
  if (rHref) {
    location = rHref;
  }
}





// Global variables are fun!
var commentCountText, commentsList, divDiv, isReply;



// *** Date utility functions

function time_fromHuman(string) {
  /* Convert a human-readable date into a JS timestamp */
  if (string.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/)) {
    string = string.replace(' ', 'T');  // revert nice spacing
    string += ':00.000Z';  // complete ISO 8601 date
    time = Date.parse(string);  // milliseconds since epoch

    // browsers handle ISO 8601 without explicit timezone differently
    // thus, we have to fix that by hand
    time += (new Date()).getTimezoneOffset() * 60e3;
  } else {
    string = string.replace(' at', '');
    time = Date.parse(string);  // milliseconds since epoch
  }
  return time;
}

function time_toHuman(time) {
  /* Convert a JS timestamp into a human-readable date */

  // note: time is milliseconds since epoch

  // keep client offset from messing with server time
  time -= (new Date()).getTimezoneOffset() * 60e3;

  date = new Date(time);
  string = date.toISOString();  // to ISO 8601
  string = string.slice(0, 16);  // remove seconds, milliseconds and UTC mark
  string = string.replace('T', ' ');  // use more readable separator
  return string;
}



// *** Sets up borders and populates comments list

function border(since, updateTitle) {
  var commentList = document.querySelectorAll('.commentholder');
  var mostRecent = since;
  var newComments = [];

  // Walk comments, setting borders as appropriate and saving new comments in a list
  for (var i = 0; i < commentList.length; ++i) {
    var postTime = time_fromHuman(commentList[i].querySelector('.comment-meta a').textContent);
    if (postTime > since) {
      commentList[i].classList.add('new-comment');
      newComments.push({time: postTime, ele: commentList[i]});
      if (postTime > mostRecent) {
        mostRecent = postTime;
      }
    } else {
      commentList[i].classList.remove('new-comment');
    }
  }
  var newCount = newComments.length;

  // Maybe add new comment count to title
  if (updateTitle) {
    document.title = '(' + newCount + ') ' + document.title;
  }

  // Populate the floating comment list
  commentCountText.data = '' + newCount + ' comment' + (newCount == 1 ? '' : 's') + ' since ';
  commentsList.textContent = '';
  if (newCount > 0 ) {
    divDiv.style.display = 'block';
    newComments.sort(function(a, b){return a.time - b.time;});
    for (i = 0; i < newCount; ++i) {
      var ele = newComments[i].ele;
      var newLi = document.createElement('li');
      newLi.innerHTML = ele.querySelector('cite').textContent + ' <span class="comments-date">' + time_toHuman(newComments[i].time) + '</span>';
      newLi.className = 'comment-list-item';
      newLi.addEventListener('click', function(ele){return function(){ele.scrollIntoView(true);};}(ele));
      commentsList.appendChild(newLi);
    }
  } else {
    divDiv.style.display = 'none';
  }
  return mostRecent;
}


// *** Toggles visibility of comment which invoked it

function commentToggle() {
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
    if (myChildren) {
      myChildren.style.display = 'block';
    }
  }
  myComment.scrollIntoView(true);
}


// ** Set up highlights on first run

function makeHighlight() {
  // *** Inject some css used by the floating list

  var styleEle = document.createElement('style');
  styleEle.type = 'text/css';
  styleEle.textContent = '.new-comment { border: 2px solid #5a5; }' +
  '.new-text { color: #C5C5C5; display: none; }' +
  '.new-comment .new-text { display: inline; }' +
  '.comments-floater { position: fixed; right: 4px; top: ' + (document.getElementById('wpadminbar') ? '36' : '4') + 'px; padding: 2px 5px; font-size: 14px; border-radius: 5px; background: rgba(250, 250, 250, 0.90); }' +
  // available space on the right = right bar (230px) + page margin ((screen.width - #pjgm-wrap.width) / 2)
  '                             .comments-floater { max-width: calc(230px + (100% - 1258px) / 2); }' +
  '@media (max-width: 1274px) { .comments-floater { max-width: calc(230px + (100% - 1195px) / 2); } }' +
  '@media (max-width: 1214px) { .comments-floater { max-width: calc(230px + (100% - 1113px) / 2); } }' +
  '@media (max-width: 1134px) { .comments-floater { max-width: calc(230px + (100% -  866px) / 2); } }' +
  // at some point, it must cover the main content, we just keep space for [+] / [-]
  '@media (max-width: 850px) { .comments-floater { max-width: 230px; } }' +
  '.comments-scroller { word-wrap: break-word; max-height: 80vh; overflow-y: scroll; }' +
  '.comment-list-item { cursor: pointer; clear: both; }' +
  '.comments-date { font-size: 11px; display: block; }' +
  '@media (min-width:900px) { .comments-date { display: inline-block; text-align: right; float: right; padding-right: 1em; } }' +
  '.cct-span { white-space: nowrap; }' +
  // the full date will fit the input on large screens; on smaller screens, it will shrink to avoid wrapping
  '.date-input { margin-left: .5em; min-width: 3ex; max-width: 10em; width: calc(100% - 153px); }' +
  '@media (max-width: 300px) { .date-input { width: auto; } }' +
  '.hider { position: absolute; left: -25px; top: 6px; display: inline-block; width: 20px; text-align: center; }' +
  '.hider::before { content: "["; float: left; }' +
  '.hider::after { content: "]"; float: right; }' +
  '';
  document.head.appendChild(styleEle);


  // *** Create and insert the floating list of comments, and its contents


  // The floating box.
  var floatBox = document.createElement('div');
  floatBox.className = 'comments-floater';


  // Container for the text node below.
  var cctSpan = document.createElement('span');
  cctSpan.className = 'cct-span';

  // The text node which says 'x comments since'
  commentCountText = document.createTextNode('');

  // The text box with the date.
  var dateInput = document.createElement('input');
  dateInput.className = 'date-input';
  dateInput.addEventListener('blur', function(e) {
    var newDate = time_fromHuman(dateInput.value);
    if (isNaN(newDate)) {
      alert(
        'Couldn\'t parse given date. ' +
        'Use either YYYY-MM-DD HH:mm ' +
        'or the format used for comments.'
      );
      return;
    }
    border(newDate, false);
  });
  dateInput.addEventListener('keypress', function(e) {
    if (e.keyCode === 13) {
      dateInput.blur();
    }
  });


  // Container for the comments list and the '[+]'
  divDiv = document.createElement('div');
  divDiv.style.display = 'none';

  // Scrollable container for the comments list
  var commentsScroller = document.createElement('div');
  commentsScroller.className = 'comments-scroller';
  commentsScroller.style.display = 'none';

  // The '[+]'
  var hider = document.createElement('span');
  hider.textContent = '+';
  hider.className = 'hider';
  hider.addEventListener('click', function(e) {
    if (commentsScroller.style.display != 'none') {
      commentsScroller.style.display = 'none';
      hider.textContent = '+';
    }
    else {
      commentsScroller.style.display = '';
      hider.textContent = '-';
    }
  });

  // Actual list of comments
  commentsList = document.createElement('ul');


  // Insert all the things we made into each other and ultimately the document.

  cctSpan.appendChild(commentCountText);
  floatBox.appendChild(cctSpan);

  floatBox.appendChild(dateInput);

  divDiv.appendChild(hider);
  commentsScroller.appendChild(commentsList);
  divDiv.appendChild(commentsScroller);
  floatBox.appendChild(divDiv);

  document.body.appendChild(floatBox);


  // *** Retrieve the last-visit time from storage, border all comments made after, and save the time of the latest comment in storage for next time

  var pathString = 'visited-' + location.pathname;
  var lastVisit = parseInt(localStorage[pathString]);
  if (isNaN(lastVisit)) {
    lastVisit = 0; // prehistory! Actually 1970, which predates all SSC comments, so we're good.
  }
  if (!isReply) {
    dateInput.value = time_toHuman(lastVisit);
    var mostRecent = border(lastVisit, false);
    localStorage[pathString] = mostRecent;
  } else {
    // Use the same threshold we used last time and leave that as is, but update the threshold to be used on fresh page loads.
    var prevVisit = parseInt(sessionStorage['prev-' + location.pathname]);
    if (isNaN(prevVisit)) {
      prevVisit = lastVisit;
    }
    dateInput.value = time_toHuman(prevVisit);
    var mostRecent = border(prevVisit, false);
    localStorage[pathString] = mostRecent;
  }
  sessionStorage.removeItem('last-submit');
  sessionStorage.removeItem('prev-' + location.pathname);
}

// This logic helps determine if the page was loaded by posting a comment (approximately)
function addUnloadListeners() {
  var commentOrLoginCausedUnload = false;
  var navListener = function(){
    sessionStorage.setItem('last-submit', (new Date()).getTime());
    sessionStorage.setItem('prev-' + location.pathname, time_fromHuman(document.querySelector('.date-input').value));
    commentOrLoginCausedUnload = true;
  }

  var forms = document.querySelectorAll('.comment-form');
  for (var i = 0; i < forms.length; ++i) {
    forms[i].addEventListener('submit', navListener);
  }

  var loginLinks = document.querySelectorAll('.comment-reply-login,.must-log-in>a,.logged-in-as>a:nth-child(2)');
  for (var i = 0; i < loginLinks.length; ++i) {
    loginLinks[i].addEventListener('click', navListener);
  }

  addEventListener('unload', function(){
    if (!commentOrLoginCausedUnload) {
      sessionStorage.removeItem('last-submit');
      sessionStorage.removeItem('prev-' + location.pathname);
    }
  });

  var lastSubmit = parseInt(sessionStorage.getItem('last-submit'));
  if (isNaN(lastSubmit)) {
    lastSubmit = 0;
  }
  isReply = (new Date()).getTime() - lastSubmit < 1200000;
}



function makeShowHideNewTextParentLinks() {
  // *** Add buttons to show/hide threads
  // *** Add ~new~ to comments
  // *** Add link to parent comment

  var comments = document.querySelectorAll('li.comment');

  for (var i=0; i < comments.length; ++i) {
    var commentHolder = comments[i].querySelector('div.commentholder');
    comments[i].holder = commentHolder;

    // Show/Hide
    var hideLink = document.createElement('a');
    hideLink.className = 'comment-reply-link';
    hideLink.style.textDecoration = 'underline';
    hideLink.style.cursor = 'pointer';
    hideLink.textContent = 'Hide';

    hideLink.addEventListener('click', commentToggle);

    var divs = commentHolder.children;
    var replyEle = divs[divs.length-1];

    replyEle.appendChild(hideLink);

    comments[i].hideLink = hideLink;

    // ~new~
    var newText = document.createElement('span');
    newText.className = 'new-text';
    newText.textContent = '~new~';

    var meta = commentHolder.querySelector('div.comment-meta');
    meta.appendChild(newText);

    // Parent link
    if (comments[i].parentElement.tagName === 'UL') {
      var parent = comments[i].parentElement.parentElement;
      var parentID = parent.firstElementChild.id;

      var parentLink = document.createElement('a');
      parentLink.href = '#' + parentID;
      parentLink.className = 'comment-reply-link';
      parentLink.style.textDecoration = 'underline';
      parentLink.title = 'Parent comment';
      parentLink.textContent = '↑';

      var replyEle = commentHolder.querySelector('div.reply');
      replyEle.appendChild(document.createTextNode(' '));
      replyEle.appendChild(parentLink);
    }
  }
}

// Run on pages with comments
if (document.querySelector('#comments')) {
  addUnloadListeners();
  makeHighlight();
  makeShowHideNewTextParentLinks();
}






// ??
function boustrophedon(justChars, context) {
  function mangle(ele) {
    ele.style.textAlign = 'justify';
    ele.style.position = 'relative';
    var compStyle = getComputedStyle(ele);
    var lineHeight = compStyle.lineHeight;
    lineHeight = parseInt(lineHeight.substring(0, lineHeight.length-2));
    var height = compStyle.height;
    height = parseInt(height.substring(0, height.length-2));

    var lines = height / lineHeight;

    var backbase = ele.cloneNode(true);
    backbase.style.position = 'absolute';
    backbase.style.top = '0px';
    backbase.style.left = '0px';
    if (justChars) {
      backbase.style.unicodeBidi = 'bidi-override';
      backbase.style.direction = 'rtl';
    } else {
      backbase.style.transform = 'scale(-1, 1)';
      backbase.style['-webkit-transform'] = 'scale(-1, 1)';
    }
    backbase.style.background = 'white';


    for (var i = 1; i < lines; i+=2) {
      var copy = backbase.cloneNode(true);
      copy.style.clip = 'rect(' + i*lineHeight + 'px, auto, ' + (i+1)*lineHeight + 'px, auto)';
      ele.appendChild(copy);
    }
  }

  var ps = context.querySelectorAll('div.pjgm-postcontent > p');
  for (var i = 0; i < ps.length; ++i) {
    mangle(ps[i]);
  }
}



var posts = document.querySelectorAll('div.post');
for (var i = 0; i < posts.length; ++i) {
  if (posts[i].querySelector('span#boustrophedon')) {
    boustrophedon(false, posts[i]);
  }
}




// *** Add clickable markup buttons to comment forms

function tag(ele, label) {
  var l = label.length;
  return function() {
    var start = ele.selectionStart;
    var end = ele.selectionEnd;
    if (ele.value.slice(start-2-l, start) === '<' + label + '>' && ele.value.slice(end, end+3+l) === '</' + label + '>') {
      ele.value = ele.value.slice(0, start-2-l) + ele.value.slice(start, end) + ele.value.slice(end+3+l);
      ele.setSelectionRange(start-2-l, end-2-l);
    } else {
      ele.value = ele.value.slice(0, start) + '<' + label + '>' + ele.value.slice(start, end) + '</' + label + '>' + ele.value.slice(end);
      ele.setSelectionRange(start+2+l, end+2+l);
    }
    ele.focus();
  };
}

var buttons = [
  { name: 'Italic', fn: function(ele){ return tag(ele, 'i') } },
  { name: 'Bold', fn: function(ele){ return tag(ele, 'b') } },
  { name: 'Link', fn: function(ele){ return function() {
    var start = ele.selectionStart;
    var end = ele.selectionEnd;
    var offset = 0;
    var url = prompt('To where?');
    if (url !== null) {
      if (url.match('"')) url = encodeURI(url);
      var text = ele.value.slice(start, end);
      if (start === end) {
        text = 'link text';
        end += text.length;
      }
      ele.value = ele.value.slice(0, start) + '<a href="' + url + '">' + text + '</a>' + ele.value.slice(end);
      offset = 11 + url.length;
      ele.setSelectionRange(start + offset, end + offset);
      ele.focus();
    }
  }; } },
  { name: 'Quote', fn: function(ele){ return tag(ele, 'blockquote') } },
  { name: 'Code', fn: function(ele){ return tag(ele, 'code') } },
  { name: 'Strike', fn: function(ele){ return tag(ele, 'strike') } },
]

var rs = document.querySelectorAll('.comment-form-comment, .sce-comment-textarea');
for (var i = 0; i < rs.length; ++i) {
  var r = rs[i].appendChild(document.createElement('p'));
  for (var j = 0; j < buttons.length; ++j) {
    var button = document.createElement('input');
    button.type = 'button';
    button.value = buttons[j].name;
    button.style.width = 'auto';
    button.style.marginRight = '.4em';
    button.tabIndex = -1;
    button.addEventListener('click', buttons[j].fn(r.parentElement.querySelector('textarea')));
    r.appendChild(button);
  } 
}

if(location.host==='unsongbook.com'){(function(){var n,walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);while(n=walk.nextNode())n.textContent=n.textContent.replace(/Berenst(a|e)in/g,function(m){return Math.random()<.1?m:(Math.random()<.5?'Berenstain':'Berenstein');}).replace(/BERENST(A|E)IN/g,function(m){return Math.random()<.1?m:(Math.random()<.5?'BERENSTAIN':'BERENSTEIN');});}());}
