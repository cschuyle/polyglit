(this.webpackJsonppolyglit=this.webpackJsonppolyglit||[]).push([[0],{124:function(e,t,n){},125:function(e,t,n){},126:function(e,t,n){},127:function(e,t,n){},128:function(e,t,n){},240:function(e,t,n){"use strict";n.r(t);var i=n(0),r=n.n(i),a=n(10),o=n.n(a),l=(n(124),n(125),n(126),n(127),n(128),n(111)),c=n(11),s=n(21),u=n(41),d=n(25),h=n(61),p=n(60),b=n.p+"static/media/popout-flat.8676d87d.png",m=n.p+"static/media/pdf.5a5d0ba1.png",v=n.p+"static/media/document.2d3b7428.png",j=n.p+"static/media/lp-cover.94255a7e.jpg",g=n.p+"static/media/audiobook.cd1398bf.png",f=n(5),y=n(278),x=n(275),P=n(279),w=n(276),O=n(274),I=n(3);function k(e,t){return e.littlePrinceItem.language>=t.littlePrinceItem.language?1:-1}var T=Object(f.a)({arrow:{"&:before":{border:"1px solid #444444"},color:"white"},tooltip:{fontSize:"1em",backgroundColor:"white",border:"1px solid #444444",color:"#444444",borderRadius:".2em",boxShadow:"0 0 0.5em 0.5em #f2f2f2",maxWidth:"none"}})(y.a),L=Object(f.a)({tooltip:{fontSize:"1em",backgroundColor:"lightyellow",color:"darkslategray",border:"1px solid black"}})(y.a),C=function(e){Object(h.a)(n,e);var t=Object(p.a)(n);function n(e){var i;return Object(u.a)(this,n),(i=t.call(this,e)).state={troveItems:[],displayedTroveItems:[],searchText:"",onlyDuplicates:!1},i}return Object(d.a)(n,[{key:"componentDidMount",value:function(){var e=this;this.fetchTrove().then((function(t){console.log("Got ".concat(t.items.length," Trove items")),e.setState({troveItems:t.items.sort(k)}),e.search("",!1)}))}},{key:"fetchTrove",value:function(){return fetch(this.props.troveUrl).then((function(e){return e.json()}))}},{key:"render",value:function(){var e=this;return Object(I.jsx)("div",{id:"main_content_wrap",className:"outer",children:Object(I.jsxs)("div",{id:"main_content",className:"inner",children:[Object(I.jsx)("h1",{children:this.props.pageHeader}),Object(I.jsx)("p",{children:this.props.pageSubtitle}),Object(I.jsxs)("span",{children:[Object(I.jsx)("div",{children:Object(I.jsxs)("div",{style:{display:"flex"},children:[Object(I.jsx)("div",{style:{width:"90%"},children:Object(I.jsx)(x.a,{label:"Search keywords",type:"search",variant:"outlined",style:{width:"100%"},value:this.state.searchText,onChange:function(t){return e.onSearchTextChanged(t)},placeholder:"language, country, title, script, format ..."})}),this.props.showDupsCheckbox&&Object(I.jsx)("div",{style:{marginLeft:"20px"},children:Object(I.jsx)("div",{style:{float:"left"},children:Object(I.jsx)(P.a,{control:Object(I.jsx)(w.a,{checked:this.state.onlyDuplicates,onChange:function(t){return e.onOnlyDuplicatesChanged(t)},color:"default"}),label:Object(I.jsx)(T,{title:Object(I.jsxs)("section",{children:["Send me an email at ",Object(I.jsx)("a",{href:"mailto:carl@dragnon.com",children:"carl@dragnon.com"})]}),arrow:!0,interactive:!0,placement:"bottom-start",children:Object(I.jsxs)("div",{children:["Show only copies for which I have duplicates ",Object(I.jsx)("i",{children:Object(I.jsx)("strong",{children:"(want to make a deal?)"})})]})})})})})]})}),Object(I.jsx)("p",{}),Object(I.jsxs)("section",{children:["Showing ",this.state.displayedTroveItems.length," of ",this.state.troveItems.length," editions of ",this.props.collectionTitle]}),Object(I.jsx)("p",{}),Object(I.jsx)("section",{className:"column",children:this.state.displayedTroveItems.map((function(t,n){return e.renderTroveItem(t,n)}))})]})]})})}},{key:"onSearchTextChanged",value:function(e){this.setState({searchText:e.target.value}),this.search(e.currentTarget.value,this.state.onlyDuplicates)}},{key:"onOnlyDuplicatesChanged",value:function(e){console.log("only duplicates value is ".concat(e.currentTarget.checked)),this.setState({searchText:this.state.searchText,onlyDuplicates:e.target.checked}),this.search(this.state.searchText,e.currentTarget.checked)}},{key:"search",value:function(e,t){this.setState({displayedTroveItems:this.state.troveItems.filter(this.troveItemMatches(e,t))})}},{key:"troveItemMatches",value:function(e,t){var n=function(e){return!0};e&&(e=e.toLowerCase(),n=function(t){var n,i,r,a,o,l,c,s,u,d,h,p,b,m,v,j;return(null===(n=t.littlePrinceItem.author)||void 0===n?void 0:n.toLowerCase().includes(e))||(null===(i=t.littlePrinceItem.format)||void 0===i?void 0:i.toLowerCase().includes(e))||(null===(r=t.littlePrinceItem.illustrator)||void 0===r?void 0:r.toLowerCase().includes(e))||t.littlePrinceItem.language.toLowerCase().includes(e)||(null===(a=t.littlePrinceItem.narrator)||void 0===a?void 0:a.toLowerCase().includes(e))||(null===(o=t.littlePrinceItem.publisher)||void 0===o?void 0:o.toLowerCase().includes(e))||(null===(l=t.littlePrinceItem.script)||void 0===l?void 0:l.toLowerCase().includes(e))||t.littlePrinceItem.title.toLowerCase().includes(e)||(null===(c=t.littlePrinceItem.translator)||void 0===c?void 0:c.toLowerCase().includes(e))||(null===(s=t.littlePrinceItem.comments)||void 0===s?void 0:s.join("/").toLowerCase().includes(e))||(null===(u=t.littlePrinceItem["language-spoken-in"])||void 0===u?void 0:u.toLowerCase().includes(e))||(null===(d=t.littlePrinceItem["publication-country"])||void 0===d?void 0:d.toLowerCase().includes(e))||(null===(h=t.littlePrinceItem["publication-location"])||void 0===h?void 0:h.toLowerCase().includes(e))||(null===(p=t.littlePrinceItem["script-family"])||void 0===p?void 0:p.toLowerCase().includes(e))||(null===(b=t.littlePrinceItem["search-words"])||void 0===b?void 0:b.toLowerCase().includes(e))||(null===(m=t.littlePrinceItem.tags)||void 0===m?void 0:m.join("/").toLowerCase().includes(e))||(null===(v=t.littlePrinceItem["translation-title"])||void 0===v?void 0:v.toLowerCase().includes(e))||(null===(j=t.littlePrinceItem["translation-title-transliterated"])||void 0===j?void 0:j.toLowerCase().includes(e))||!1});var i=n;return t&&(i=function(e){var t;return n(e)&&(null!==(t=e.littlePrinceItem.quantity)&&void 0!==t?t:1)>2}),i}},{key:"renderTroveItem",value:function(e,t){return Object(I.jsx)(T,{title:this.troveItemTooltipContents(e),arrow:!0,interactive:!0,placement:"right-start",enterDelay:300,enterNextDelay:300,children:Object(I.jsxs)("div",{className:"thumbnail",children:[Object(I.jsx)("a",{target:"_blank",href:e.littlePrinceItem.largeImageUrl,children:Object(I.jsx)("div",{style:{position:"relative"},children:Object(I.jsx)("img",{width:"150",height:"100%",src:e.littlePrinceItem.smallImageUrl,alt:e.littlePrinceItem.title})})}),Object(I.jsx)("div",{className:"caption",children:e.littlePrinceItem.language})]},t)})}},{key:"troveItemTooltipContents",value:function(e){var t,n=this,i=function(e,t){return{field:e,value:t}},r=["translation-title","translation-title-transliterated","language","script","translator","illustrator","narrator","isbn13","format","year","publisher","publication-country","publication-location","acquisition-blurb","tags","comments"].map((function(t){switch(t){case"language":return i("Language",n.constructLanguage(e));case"translation-title":return i("Title in translation",n.constructTranslationTitle(e));case"script":return i("Script",e.littlePrinceItem.script);case"translator":return i("Translated by",e.littlePrinceItem.translator);case"illustrator":return i("Illustrated by",e.littlePrinceItem.illustrator);case"narrator":return i("Narrated by",e.littlePrinceItem.narrator);case"isbn13":return i("ISBN-13",e.littlePrinceItem.isbn13);case"format":return i("Format",e.littlePrinceItem.format);case"publisher":return i("Published",n.constructPublicationBlurb(e.littlePrinceItem));case"year":return i("Publication year",e.littlePrinceItem.year);case"tags":return i("Tags",n.constructTagsBlurb(e.littlePrinceItem.tags));case"acquisition-blurb":return i("Acquired",n.constructAquisitionBlurb(e.littlePrinceItem));case"comments":return i(null,e.littlePrinceItem.comments)}})).filter((function(e){return null!=e&&n.isPresent(e.value)}));return Object(I.jsxs)(O.a,{container:!0,direction:"row",spacing:2,children:[Object(I.jsxs)(O.a,{item:!0,direction:"column",justify:"center",children:[Object(I.jsx)(O.a,{item:!0,children:this.renderDocumentLink(e.littlePrinceItem.largeImageUrl)}),null===(t=e.littlePrinceItem.files)||void 0===t?void 0:t.map((function(e){return Object(I.jsx)(O.a,{item:!0,children:n.renderDocumentLink(e)})}))]}),Object(I.jsx)(O.a,{item:!0,children:Object(I.jsxs)("div",{children:[Object(I.jsx)("strong",{children:Object(I.jsx)("i",{children:e.littlePrinceItem.title})}),Object(I.jsx)("p",{}),r.map((function(e){return null!=(null===e||void 0===e?void 0:e.field)?Object(I.jsxs)("span",{children:[Object(I.jsxs)("strong",{children:[null===e||void 0===e?void 0:e.field,":"]})," ",null===e||void 0===e?void 0:e.value,Object(I.jsx)("p",{})]}):Array.isArray(null===e||void 0===e?void 0:e.value)?null===e||void 0===e?void 0:e.value.map((function(e,t){return Object(I.jsxs)("span",{children:[e,Object(I.jsx)("p",{})]},t)})):Object(I.jsx)("span",{children:null===e||void 0===e?void 0:e.value})}))]})})]})}},{key:"isPresent",value:function(e){return!(null===e||void 0===e||""===e)}},{key:"constructTranslationTitle",value:function(e){var t=e.littlePrinceItem["translation-title"],n=e.littlePrinceItem["translation-title-transliterated"];return this.isPresent(t)&&this.isPresent(n)?"".concat(t," [").concat(n,"]"):this.isPresent(n)?"".concat(n):this.isPresent(t)?"".concat(t):null}},{key:"constructLanguage",value:function(e){var t=e.littlePrinceItem.language,n=e.littlePrinceItem["language-spoken-in"];return null!=n?"".concat(t," (spoken in ").concat(n,")"):t}},{key:"renderDocumentLink",value:function(e){var t=this.iconFor(e),n=Object(s.a)(t,2),i=n[0],r=n[1];return Object(I.jsx)("a",{href:e,target:"_blank",rel:"noreferrer",children:Object(I.jsx)(L,{title:"Open ".concat(i," in new tab"),placement:"left-end",children:Object(I.jsx)("img",{style:{padding:0,margin:0,border:0,boxShadow:"0",filter:"grayscale(50%)"},src:r,width:"32px",height:"32px",alt:"Open"})})})}},{key:"constructPublicationBlurb",value:function(e){var t=e.publisher,n=e["publication-location"],i=e["publication-country"];return this.isPresent(t)||this.isPresent(n)||this.isPresent(i)?this.isPresent(t)||this.isPresent(n)?this.isPresent(t)||this.isPresent(i)?this.isPresent(n)||this.isPresent(i)?this.isPresent(t)?this.isPresent(n)?this.isPresent(i)?"by ".concat(t," in ").concat(n,", ").concat(i):"by ".concat(t," in ").concat(n):"by ".concat(t," in ").concat(i):"in ".concat(n,", ").concat(i):"by ".concat(t):"in ".concat(n):"in ".concat(i):null}},{key:"constructAquisitionBlurb",value:function(e){var t=e["acquired-from"],n=e["date-acquired"];return this.isPresent(t)||this.isPresent(n)?this.isPresent(t)&&this.isPresent(n)?"from ".concat(t," on ").concat(n):this.isPresent(n)?this.isPresent(n)?void 0:"on ".concat(n):"from ".concat(t):null}},{key:"constructTagsBlurb",value:function(e){return this.isPresent(e)?e.join(", "):null}},{key:"iconFor",value:function(e){return(e=e.toLowerCase()).endsWith(".png")||e.endsWith(".gif")||e.endsWith(".jpg")||e.endsWith(".jpeg")?["cover image",j]:e.endsWith(".pdf")?["PDF",m]:e.endsWith(".doc")||e.endsWith(".docx")?["document",v]:e.endsWith(".mp3")?["audio file",g]:["file",b]}}]),n}(r.a.Component),S=n(110),A=n.n(S),D=function(e){Object(h.a)(n,e);var t=Object(p.a)(n);function n(){var e;Object(u.a)(this,n);for(var i=arguments.length,r=new Array(i),a=0;a<i;a++)r[a]=arguments[a];return(e=t.call.apply(t,[this].concat(r))).body="\n# TL; DR\n\n- [The Little Prince](./the-little-prince)\n- [The Hobbit](./the-hobbit)\n- [The Adventures of Alice in Wonderland](./alice-in-wonderland)\n- [Other titles](./other-titles)\n\n- [The Little Prince - Items I'm looking for](./the-little-prince-wanted)\n\n# What's a Polyglit??\n\nThat's me being clever by abbreviating the phrase \"Polyglot Literature\".\n\nActually, it's not an abbreviation.  It's not even a contraction.  \nIt's a [portmanteau](https://en.wikipedia.org/wiki/Portmanteau)\n\n---\n\nThis site contains a summary of various works of literature that I've acquired over the years, in languages other \nthan my native one (which is English).\n\n\n## The Little Prince\n \n[The Little Prince](the-little-prince) is one of the most widely translated books around, so it only makes sense to \ncollect those.\n  \nGranted, this is not a particularly original endeavor - lots of folks collect this one.  A few that I've found:\n* [petit-prince-collection](http://www.petit-prince-collection.com/lang/traducteurs.php?lang=en)\n* [petit-prince.at](http://www.petit-prince.at/collection.htm)\n* [genius.com/Antoine-de-saint-exupery-collection-of-the-little-prince-editions-annotated](https://genius.com/Antoine-de-saint-exupery-collection-of-the-little-prince-editions-annotated) - Fairly complete looking list of editions, with metadata!\n* [malyksiaze.net](https://malyksiaze.net/en) - This one has a \"let's make a deal\" page\n\n## A couple other likely targets\n\nIf I'm in a store trying to find a book in language _X_, and can't find The Little Prince, \nI'll generally go for [The Hobbit](the-hobbit), or [Alice in Wonderland](alice-in-wonderland) (yes, I know that the actual title is _Alice's Adventures in Wonderland_).\n\n## Nope, try again\n\nFailing the above, I cast about for whatever I can find: Translations into local languages or local literature.\nI like to find children's books because it's easier to learn from them as a beginner.\nAnd of course, language learning materials.\nHere are some of the books [not originally in English](other-titles) that I've acquired.\n   \n## Translations are boring\n\nThe astute among you have noticed that all the above are translations.  \nSo, here are some books I've acquired over the years in their original language:\n* Das Kapital (German)\n* Le Petit Prince (French)\n* M\u043e\u0441\u043a\u0432\u0430 2042 (Russian)\n* Embers (Hungarian)\n* 2666 (Spanish)\n* K\xe9raban le t\xe9tu (French)\n* Mais o\xf9 sont pass\xe9es les Indo Europ\xe9ens? (French)\n* Python \u0434\u043b\u044f \u0434\u0456\u0442\u0435\u0439 (Ukrainian)\n* De ontdekking van de hemel (Dutch)\n* \u0420\u0430\u0441\u043f\u0443\u0301\u0442\u0438\u043d (Russian)\n* \xc0 la recherche du temps perdu (French)\n* La Possibilit\xe9 d'une \xeele (French)\n* \u4e09\u4f53 (Mandarin)\n* Ciacole al pedocin (Triestese)\n* \xc9vk\xf6nyv (Hungarian)\n* Innansveitarkronika (Icelandic)\n* \u0392\u03af\u03bf\u03c2 \u03ba\u03b1\u03b9 \u03a0\u03bf\u03bb\u03b9\u03c4\u03b5\u03af\u03b1 \u03c4\u03bf\u03c5 \u0391\u03bb\u03ad\u03be\u03b7 \u0396\u03bf\u03c1\u03bc\u03c0\u03ac (Greek)\n* \xd6rtlich Bet\xe4ubt (German)\n* Marvirinstrato (Esperanto) \n* Le capital au XXIe si\xe8cle",e}return Object(d.a)(n,[{key:"render",value:function(){return Object(I.jsx)("div",{id:"main_content_wrap",className:"outer",children:Object(I.jsx)("section",{id:"main_content",className:"inner",children:Object(I.jsx)(A.a,{children:this.body})})})}}]),n}(r.a.Component),q=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,280)).then((function(t){var n=t.getCLS,i=t.getFID,r=t.getFCP,a=t.getLCP,o=t.getTTFB;n(e),i(e),r(e),a(e),o(e)}))};o.a.render(Object(I.jsxs)(r.a.StrictMode,{children:[Object(I.jsx)("div",{id:"header_wrap",className:"outer",children:Object(I.jsxs)("header",{className:"inner",children:[Object(I.jsx)("h1",{id:"project_title",children:"polyglit"}),Object(I.jsx)("h2",{id:"project_tagline",children:"A collection of literary works in Lots of Languages"})]})}),Object(I.jsx)(l.a,{basename:"/polyglit",children:Object(I.jsxs)(c.c,{children:[Object(I.jsx)(c.a,{path:"/",exact:!0,component:function(){return Object(I.jsx)(D,{})}}),Object(I.jsx)(c.a,{path:["/the-little-prince","/little-prince","/littleprince"],exact:!0,component:function(){return Object(I.jsx)(C,{pageHeader:"The Little Prince (Le Petit Prince) by Antoine de Saint-Exup\xe9ry",pageSubtitle:"My collection, painstakingly acquired over the years.",troveUrl:"https://moocho-test.s3-us-west-2.amazonaws.com/public/little-prince",collectionTitle:"The Little Prince",showDupsCheckbox:!0})}}),Object(I.jsx)(c.a,{path:["/the-hobbit","/hobbit","/thehobbit"],exact:!0,component:function(){return Object(I.jsx)(C,{pageHeader:"The Hobbit, or There and Back Again - by J.R.R. Tolkien",pageSubtitle:"My collection, painstakingly acquired over the years.",troveUrl:"https://moocho-test.s3-us-west-2.amazonaws.com/public/hobbit",collectionTitle:"The Hobbit",showDupsCheckbox:!0})}}),Object(I.jsx)(c.a,{path:["/alice-in-wonderland","/alice","aliceinwonderland"],exact:!0,component:function(){return Object(I.jsx)(C,{pageHeader:"Alice's Adventures in Wonderland, by Lewis Carroll",pageSubtitle:"My collection, painstakingly acquired over the years.",troveUrl:"https://moocho-test.s3-us-west-2.amazonaws.com/public/alice-in-wonderland",collectionTitle:"Alice in Wonderland",showDupsCheckbox:!0})}}),Object(I.jsx)(c.a,{path:["/other-titles","/other","/othertitles"],exact:!0,component:function(){return Object(I.jsx)(C,{pageHeader:"Collection: Not originally in English",pageSubtitle:"My collection, painstakingly acquired over the years.",troveUrl:"https://moocho-test.s3-us-west-2.amazonaws.com/public/books",collectionTitle:"opportunistically-acquired titles, either translated from, or in the original non-English text",showDupsCheckbox:!0})}}),Object(I.jsx)(c.a,{path:["/the-little-prince-wanted","/little-prince-wanted","/littleprincewanted"],exact:!0,component:function(){return Object(I.jsx)(C,{pageHeader:"The Little Prince (Le Petit Prince) by Antoine de Saint-Exup\xe9ry",pageSubtitle:"Editions of The Little Prince which I am looking for",troveUrl:"https://moocho-test.s3-us-west-2.amazonaws.com/public/little-prince-wanted",collectionTitle:"The Little Prince - Wanted Items",showDupsCheckbox:!1})}})]})}),Object(I.jsx)("div",{id:"footer_wrap",className:"outer",children:Object(I.jsx)("footer",{className:"inner",children:Object(I.jsxs)("p",{style:{textAlign:"center"},children:["polyglit maintained by ",Object(I.jsx)("a",{href:"https://dragnon.com",children:"Carlton Schuyler"})]})})})]}),document.getElementById("root")),q()}},[[240,1,2]]]);
//# sourceMappingURL=main.0d0ae93f.chunk.js.map