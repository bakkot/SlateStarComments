ls=localStorage;
ps="visited-"+location.pathname;
lv=parseInt(ls[ps]);
if(isNaN(lv))lv=0;
cl=document.querySelectorAll(".commentholder");
mr=lv;
nc=0;
for(i=0;i<cl.length;++i){
	pt=Date.parse(cl[i].querySelector(".comment-meta a").innerHTML.replace(" at", ""));
	if(pt>lv){
		cl[i].style.border="2px solid #5a5";
		++nc;
		if(pt>mr)mr=pt;
	}
}
document.title="("+nc+") "+document.title;
ls[ps]=mr;

/*
http://mrcoles.com/bookmarklet/
javascript:(function()%7Bls%3DlocalStorage%3Bps%3D%22visited-%22%2Blocation.pathname%3Blv%3DparseInt(ls%5Bps%5D)%3Bif(isNaN(lv))lv%3D0%3Bcl%3Ddocument.querySelectorAll(%22.commentholder%22)%3Bmr%3Dlv%3Bnc%3D0%3Bfor(i%3D0%3Bi%3Ccl.length%3B%2B%2Bi)%7Bpt%3DDate.parse(cl%5Bi%5D.querySelector(%22.comment-meta%20a%22).innerHTML.replace(%22%20at%22%2C%20%22%22))%3Bif(pt%3Elv)%7Bcl%5Bi%5D.style.border%3D%222px%20solid%20%235a5%22%3B%2B%2Bnc%3Bif(pt%3Emr)mr%3Dpt%3B%7D%7Ddocument.title%3D%22(%22%2Bnc%2B%22)%20%22%2Bdocument.title%3Bls%5Bps%5D%3Dmr%7D)()
*/