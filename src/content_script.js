var TuzkiDomain = "http://yeyuan.sinaapp.com/";
//var TuzkiDomain = "http://localhost:8080/"

console.log("content script insected!");
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse){
        console.log("the sender id:",sender);
        console.log("Request:",request);
        var text = getSelectedTextFromPage().trim();
        console.log("SelectedText:",text);
        sendResponse({selectedText: text});
});

// from http://www.codebit.cn/javascript/get-selection.html
// get the selected text in the page
function getSelectedTextFromPage() {
    console.log("getSelectedTextFromPage start...");
    console.log(window.getSelection.toString());

    if(window.getSelection){
        // this technique is the most likely to be standardized.
        // getSelection() returns a Selection object
        console.log(window.getSelection().toString());
        return window.getSelection().toString();
    } else if(document.getSelection){
        //this is an older,simpler technique that returns a string
        return document.getSelection();
    }else if (document.selection){
        // this is the IE-specific technique.
        return document.selection.createRange().text;
    }
}


// from http://www.nowamagic.net/javascript/js_TrimInJavascript.php
// create a trim function for the js object String to trim the blanks in the front and end of the String.
String.prototype.trim = function() {
    //return this.replace(/[(^\s+)(\s+$)]/g,"");//會把字符串中間的空白符也去掉
    //return this.replace(/^\s+|\s+$/g,""); //
    return this.replace(/^\s+/g,"").replace(/\s+$/g,"");
}

// insect css file into page
$(document).ready(function(){
    console.log("css insect start...");
    var href = TuzkiDomain + "static/css/tuzki-content.css";
    var head = document.getElementsByTagName("head")[0];
    var link = document.createElement("link");
    link.setAttribute("rel","stylesheet");
    //link.setAttribute("type","text/css");
    link.setAttribute("href",href);
    head.appendChild(link);
});

// reaction of the text-selection
$(document).mouseup(function(event){
    console.log("text selection reaction start");
    //console.log(event.pageX);
    setTimeout(getTranslation(event),500);

});
$(document).mousedown(function(){
    //console.log("mouse down start...");
    var hovering_win = document.getElementsByClassName("hovering-win")[0];
    if(hovering_win) hovering_win.remove();
});

// get translation
function getTranslation(event){
    var q = getSelectedTextFromPage().trim();
    if(q == '' || q == null) return false;
    //console.log("the right selection");
    var left = event.pageX;
    var top = event.pageY;
    var body = document.getElementsByTagName("body")[0];
    var hovering_win = document.createElement("div");
    hovering_win.setAttribute("class","hovering-win");
    hovering_win.setAttribute("style","position: absolute; left: "+left+"px; top: "+top+"px; z-index:9999;\
    background-color: #5a5a5a;\
    background-color:white;\
    max-width: 320px;\
    display:block;\
    padding:10px;\
    text-align: left;\
    color: #5a5a5a;\
    border-radius: 10px;\
    -webkit-border-radius:10px;\
    box-shadow:2px 2px 20px #528B8B;\
    -webkit-box-shadow:2px 2px 20px #528B8B;\
    ");

    hovering_win.innerHTML = 'Searching...';
    body.appendChild(hovering_win);
    //console.log('q=',q);
    // Encoding the 'q' to utf-8
    q = encodeURIComponent(q);
    var url = 'http://fanyi.youdao.com/openapi.do?keyfrom=Justin&key=2064817359&type=data&doctype=json&version=1.1&q='+ q;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4){
            var resultJSON = JSON.parse(xhr.responseText);
            //console.log(resultJSON);
            if(resultJSON.errorCode == 0){
                //Create the DOM tree
                var head_youdao = document.createElement("h4");
                head_youdao.setAttribute("class","alert alert-info");
                head_youdao.innerHTML = "有道词典释义";
                var q_translation = null;
                if(resultJSON.translation){
                    q_translation = document.createElement("div");
                    q_translation.innerHTML = '' + getTextFromList(resultJSON.translation);
                }

                var q_basic = document.createElement("div");
                q_basic.setAttribute("class","q-basic");

                if(resultJSON.basic){
                    var q_basic_head = document.createElement("h5");
                    q_basic_head.innerHTML = "基本释义";

                    var q_phonetic = null;
                    if(resultJSON.basic.phonetic){
                        q_phonetic = document.createElement("div");
                        q_phonetic.setAttribute("class","q-phonetic");
                        q_phonetic.innerHTML = '读音-[<em>'+resultJSON.basic.phonetic+'</em>]';
                    }
                    var q_explains = null;
                    if(resultJSON.basic.explains){
                        q_explains = document.createElement("div");
                        q_explains.setAttribute("class","q-explains");
                        q_explains.innerHTML = getTextFromList(resultJSON.basic.explains);
                    }
                    q_basic.appendChild(q_basic_head);
                    if(q_phonetic != null) q_basic.appendChild(q_phonetic);
                    if(q_explains != null) q_basic.appendChild(q_explains);
                }else{
                    q_basic.innerHTML = '<h5><em>基本释义未找到！抱歉了，::>_<::</em></h5>';
                }
                var q_web = null;
                if(resultJSON.web){
                    q_web = document.createElement("div");
                    q_web.setAttribute("class","q-web");
                    var head_web = document.createElement("h4");
                    head_web.setAttribute("class","alert alert-info");
                    head_web.innerHTML = "网络释义";

                    var q_web_basic = null;
                    var q_web_phrases=null;
                    if(resultJSON.web.length > 1){
                        q_web_phrases = document.createElement("div");
                        q_web_phrases.setAttribute("class","q-web-phrases");
                        var h5 = document.createElement("h5");
                        h5.innerHTML = "网络短语";
                        q_web_phrases.appendChild(h5);
                    }
                    for(var i=0; i < resultJSON.web.length;i++){
                        if(i==0){
                            q_web_basic = document.createElement("div");
                            q_web_basic.setAttribute("class","q-web-basic");
                            q_web_basic.innerHTML = getTextFromList(resultJSON.web[i].value);
                        }else{
                            var q_web_phrase = document.createElement("div");
                            q_web_phrase.setAttribute("class","q-web-phrase");
                            q_web_phrase.innerHTML = resultJSON.web[i].key + " : " +getTextFromList(resultJSON.web[i].value);
                            q_web_phrases.appendChild(q_web_phrase);
                        }
                    }
                    q_web.appendChild(head_web);
                    if(q_web_basic != null){
                        q_web.appendChild(q_web_basic);
                    }
                    if(q_web_phrases != null){
                        q_web.appendChild(q_web_phrases);
                    }

                }

                var query_result = document.getElementsByClassName("hovering-win")[0];
                query_result.innerHTML = '';
                query_result.appendChild(head_youdao);
                if(q_translation != null) query_result.appendChild(q_translation);
                query_result.appendChild(q_basic);
                if(q_web != null){
                    query_result.appendChild(q_web);
                }
            }
            $('button[name=querysubmit]').removeAttr("disabled");
        }

    };
    xhr.send();

}


function getTextFromList(list){
    //console.log('list:',list)
    var text='';
    for(var item in list){
        text += list[item] + ' ';
        //console.log('list-item:',list[item])
    }
    return text;
}














