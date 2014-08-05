Slate Star Comments
===================

Some of the best discussion on the net (if you like a very particular kind of discussion) happens in the comments of Scott Alexander's blog, [Slate Star Codex](http://slatestarcodex.com/). Unfortunately the thread system doesn't make it easy to see when new comments have been posted. This is a bit of code to fix that: comments posted since your last visit (or a time you specify) are outlined, and (if using the UserScript or extension) a small floating window lists them.

See [screenshots here](http://imgur.com/a/ThOgM).

Installation
------------

Tested only on recent versions of Firefox and Chrome.

Firefox users: Install Greasemonkey and open SSComments/ssc.user.js in Firefox.

Chrome users: [Install the extension](https://chrome.google.com/webstore/detail/slatestarcomments/aobpboihcjnlhbnjckjaeafncnpaageh)! Or do it the hard way: save SSComments/ssc.user.js to disk, go to `chrome://extensions`, and drag the script onto the main body of the window.

Lazy/untrusting users: use the Bookmarklet.

Bookmarklet
-----------

The installation-free method! Just create a new bookmark going to the code at the end of this section (ideally in your bookmarks bar) and run it whenever you visit a post. Make sure the URL of your bookmark starts with `javascript:`

Note that the bookmarklet version does *not* provide the floating list of new comments - it only outlines them. Note also that this version doesn't (and cannot) know when you last *visited* the page, only when you last *ran the script* (though runs on a previous visit will be remembered).

However, the number of new comments will be added to the window title, so you can at least see how much new stuff there is without scrolling around for highlighted comments.

Bookmarklet code:
```
javascript:(function()%7Bls%3DlocalStorage%3Bps%3D%22visited-%22%2Blocation.pathname%3Blv%3DparseInt(ls%5Bps%5D)%3Bif(isNaN(lv))lv%3D0%3Bcl%3Ddocument.querySelectorAll(%22.commentholder%22)%3Bmr%3Dlv%3Bnc%3D0%3Bfor(i%3D0%3Bi%3Ccl.length%3B%2B%2Bi)%7Bpt%3DDate.parse(cl%5Bi%5D.querySelector(%22.comment-meta%20a%22).innerHTML.replace(%22%20at%22%2C%20%22%22))%3Bif(pt%3Elv)%7Bcl%5Bi%5D.style.border%3D%222px%20solid%20%235a5%22%3B%2B%2Bnc%3Bif(pt%3Emr)mr%3Dpt%3B%7D%7Ddocument.title%3D%22(%22%2Bnc%2B%22)%20%22%2Bdocument.title%3Bls%5Bps%5D%3Dmr%7D)()
```

Usage Tips
----------

These only apply for the full version of the script, not the bookmarklet.

Clicking the \[-\] (only displayed if there is a nonzero number of new comments) will show or hide the list of comments. Clicking on an entry in the list will scroll you to it (provided it isn't already on the page).

You can edit the date displayed in the textbox, and the highlighted comments and comments list will update accordingly.
