// run to reset:
// localStorage.removeItem('visited-' + location.pathname);


// Global variables are fun!
var lastGivenDate, commentCountText, commentsList, divDiv, dateInput, commentsScroller;





// *** Sets up borders and populates comments list

function border(since, updateTitle) {
  lastGivenDate = since;
  var commentList = document.querySelectorAll('.commentholder');
  var mostRecent = since;
  var newComments = [];
  
  // Walk comments, setting borders as appropriate and saving new comments in a list
  for(var i = 0; i < commentList.length; ++i) {
    var postTime = Date.parse(commentList[i].querySelector('.comment-meta a').textContent.replace(' at', ''));
    if (postTime > since) {
      commentList[i].classList.add('new-comment');
      newComments.push({time: postTime, ele: commentList[i]});
      if (postTime > mostRecent) {
        mostRecent = postTime;
      }
    }
    else {
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
  commentsList.innerHTML = '';
  if (newCount > 0 ) {
    divDiv.style.display = 'block';
    newComments.sort(function(a, b){return a.time - b.time;});
    for(i = 0; i < newCount; ++i) {
      var ele = newComments[i].ele;
      var newLi = document.createElement('li');
      newLi.innerHTML = ele.querySelector('cite').textContent + ' <span class="comments-date">' + (new Date(newComments[i].time)).toLocaleString() + '</span>';
      newLi.addEventListener('click', function(ele){return function(){ele.scrollIntoView(true);};}(ele));
      commentsList.appendChild(newLi);
    }
  }
  else {
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
  if(this.textContent == 'Hide') {
    this.textContent = 'Show';
    myComment.style.opacity = '.6';
    myBody.style.display = 'none';
    myMeta.style.display = 'none';
    if(myChildren) {
      myChildren.style.display = 'none';
    }
  }
  else {
    this.textContent = 'Hide';
    myComment.style.opacity = '1';
    myBody.style.display = 'block';
    myMeta.style.display = 'block';
    if(myChildren) {
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
  '.comments-floater { position: fixed; right: 4px; top: 4px; padding: 2px 5px; width: 230px;font-size: 14px; border-radius: 5px; background: rgba(250, 250, 250, 0.90); }' +
  '.comments-scroller { word-wrap: break-word; max-height: 500px; max-height: 80vh; overflow-y:scroll; }' +
  '.comments-date { font-size: 11px; }' +
  '.semantic-cell { display: table-cell; }' +
  '.cct-span { white-space: nowrap; }' +
  '.date-input { width: 100%; box-sizing: border-box; }' +
  '.input-span { width: 100%; padding-left: 5px; }' +
  '.hider { position: absolute; left: -22px; top: 6px;}' +
  '';
  document.head.appendChild(styleEle);



  // *** Create and insert the floating list of comments, and its contents


  // The floating box.
  var floatBox = document.createElement('div');
  floatBox.className = 'comments-floater';


  // Container for the text node below.
  var cctSpan = document.createElement('span');
  cctSpan.className = 'semantic-cell cct-span';

  // The text node which says 'x comments since'
  commentCountText = document.createTextNode('');


  // Container for the text box below.
  var inputSpan = document.createElement('span');
  inputSpan.className = 'semantic-cell input-span';

  // The text box with the date.
  dateInput = document.createElement('input');
  dateInput.className = 'date-input';
  dateInput.addEventListener('blur', function(){
    var newDate = Date.parse(dateInput.value);
    if (isNaN(newDate)) {
      alert('Given date not valid.');
      dateInput.value = (new Date(lastGivenDate)).toLocaleString();
      return;
    }
    border(newDate, false);
  }, false);
  dateInput.addEventListener('keypress', function(e){
    if (e.keyCode === 13) {
      dateInput.blur();
    }
  }, false);


  // Container for the comments list and the '[+]'
  divDiv = document.createElement('div');
  divDiv.style.display = 'none';

  // The '[+]'
  var hider = document.createElement('span');
  hider.textContent = '[+]';
  hider.className = 'hider';
  hider.addEventListener('click', function(){
    if (commentsScroller.style.display != 'none') {
      commentsScroller.style.display = 'none';
    }
    else {
      commentsScroller.style.display = '';
    }
  }, false);

  // Scrollable container for the comments list 
  commentsScroller = document.createElement('div');
  commentsScroller.className = 'comments-scroller';
  commentsScroller.style.display = 'none';

  // Actual list of comments
  commentsList = document.createElement('ul');



  // Insert all the things we made into each other and ultimately the document.

  cctSpan.appendChild(commentCountText);
  floatBox.appendChild(cctSpan);

  inputSpan.appendChild(dateInput);
  floatBox.appendChild(inputSpan);

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
  dateInput.value = (new Date(lastVisit)).toLocaleString();
  var mostRecent = border(lastVisit, false);
  localStorage[pathString] = mostRecent;
}



function makeShowHide() {
  // *** Add buttons to show/hide threads

  var comments = document.querySelectorAll('div.commentholder');

  for(var i=0; i<comments.length; ++i) {
    var hideLink = document.createElement('a');
    hideLink.className = 'comment-reply-link';
    hideLink.style.textDecoration = 'underline';
    hideLink.textContent = 'Hide';

    hideLink.addEventListener('click', commentToggle, false);

    var divs = comments[i].children;
    var replyEle = divs[divs.length-1];

    replyEle.appendChild(hideLink);
  }
}



function makeNewText() {
  // *** Add ~new~ to new comments
  
  var comments = document.querySelectorAll('div.commentholder');

  for(var i=0; i<comments.length; ++i) {
    var newText = document.createElement('span');
    newText.className = 'new-text';
    newText.textContent = '~new~';

    var meta = comments[i].querySelector('div.comment-meta');
    meta.appendChild(newText);
  }
}



// ??
function boustrophedon(justChars) {
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
    if(justChars) {
      backbase.style.unicodeBidi = 'bidi-override';
      backbase.style.direction = 'rtl';
    }
    else {
      backbase.style.transform = 'scale(-1, 1)';
      backbase.style['-webkit-transform'] = 'scale(-1, 1)';
    }
    backbase.style.background = 'white';

  
    for(var i=1; i<lines; i+=2) {
      var copy = backbase.cloneNode(true);
      copy.style.clip = 'rect(' + i*lineHeight + 'px, auto, ' + (i+1)*lineHeight + 'px, auto)';
      console.log(copy);
      ele.appendChild(copy);
    }
  }


  var ps = document.querySelectorAll('div.pjgm-postcontent > p');
  for(var i=0; i<ps.length; ++i) {
    mangle(ps[i]);
  }
}

// http://stackoverflow.com/a/25388984
function getComments(context) {
  var foundComments = [];
  var elementPath = [context];
  while (elementPath.length > 0) {
    var el = elementPath.pop();
    for (var i = 0; i < el.childNodes.length; i++) {
      var node = el.childNodes[i];
      if (node.nodeType === 8) {
        foundComments.push(node);
      } else {
        elementPath.push(node);
      }
    }
  }
  return foundComments;
}

function existsCommentWith(str) {
  var htmlComments = getComments(document);
  for (var i = 0; i < htmlComments.length; ++i) {
    if (htmlComments[i].data.replace(/^\s+|\s+$/g,'') == str) {
      return true;
    }
  }
  return false;
}



// Run iff we're on a page which looks like a post
if(location.pathname.substring(0, 3) == '/20') {
  makeHighlight();
  makeShowHide();
  makeNewText();
}
if(location.search == '?boustrophedon' || existsCommentWith('boustrophedon')) boustrophedon(false);
