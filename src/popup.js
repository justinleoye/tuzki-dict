$(document).ready(function(){
    // check if the user login state
    checkLogin();

    //get and set the selected text of the active page
    setSelectedText();

    $('button[name=querysubmit]').click(function(){
        console.log("form submit!");

        // trig the blur event of the input[name=q],so that can commit the input[name=q] blur callback function
        $('input[name=q]').trigger("blur");//Q:....blur?
        var q = $('input[name=q]').val();
        // q should not be none
        if(q == '' || q == null){
            return false;
        }

        // 查询单词
        query_words(q,handle_success,function(){
            // TODO:出现网络错误时的处理
        });

        //do for better user experience
        $("#query-result").empty();
        // 禁用查询按钮，以免用户失误多次点击
        $('button[name=querysubmit]').attr("disabled","disabled");

        // 对于表单的submit事件，必须要在最后返回一个false，否则页面会发生提交而发生重载
        return false;
    });

    // 查词
    function query_words(q,success,error){
        console.log('q=',q);
        var url = 'http://fanyi.youdao.com/openapi.do?keyfrom=Justin&key=2064817359&type=data&doctype=json&version=1.1&q='+ q;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4){
                var resultJSON = JSON.parse(xhr.responseText);
                console.log(resultJSON.translation[0]);
                if(resultJSON.errorCode == 0){
                    handle_success(resultJSON);
                }

                $('button[name=querysubmit]').removeAttr("disabled");//解禁
            }
        };
        xhr.send();
        return false;
    };

    // 查词网络正确返回时，处理数据
    function handle_success(resultJSON){
        //Create the DOM tree
        var head_youdao = document.createElement("h4");
        head_youdao.setAttribute("class","alert alert-info");
        head_youdao.innerHTML = "有道词典释义";

        var q_translation = create_youdao_translation_element(resultJSON);//Q:靠一個變量可以區分？
        var q_basic = create_youdao_basic_element(resultJSON);
        var q_web = create_web_translation_element(resultJSON);
        
        // 将DOM结点插入DOM树
        var query_result = document.getElementById("query-result");
        query_result.appendChild(head_youdao);
        if(q_translation != null) query_result.appendChild(q_translation);
        query_result.appendChild(q_basic);
        if(q_web != null){
            query_result.appendChild(q_web);
        }
    };

    // 显示有道释义
    function create_youdao_translation_element(resultJSON){
        var q_translation = null;
        if(resultJSON.translation){
            q_translation = document.createElement("div");
            q_translation.innerHTML = '<h5>' + getTextFromList(resultJSON.translation) + '</h5>';
        }
        return q_translation;
    };
    
    // 显示有道释义 基本释义
    function create_youdao_basic_element(resultJSON){
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
        return q_basic;
    };
    
    // 显示网络释义
    function create_web_translation_element(resultJSON){
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
        return q_web;
    };
    
    /*
     *store the word to the server db
     *
     */

    $('input[name=q]').blur(function(){
        var q = $('input[name=q]').val();
        var word = $('input[name=word]').val();
        if(q != word){
            $('button[name=storesubmit]').removeAttr("disabled");
            //$('button[name=storesubmit] i').attr("class","icon-pencil");
            $('button[name=storesubmit] span').attr("class","glyphicon glyphicon-pencil"); //zz
        }
        $('input[name=word]').attr("value",q);//set the word to the store form
    });

    //Store the word into server
    // Event submit of the form store triggered
    $('form[name=store]').submit(function(){
        //console.log("store form submit!");


        var word = $('input[name=word]').val();
        //console.log("word=",word);
        if(word){
            $('button[name=storesubmit]').attr("disabled","disabled");
            $('button[name=storesubmit] div[class=tooltip-inner]').empty();
            $('button[name=storesubmit] div[class=tooltip-inner]').append("正在写入单词本");
            //$('button[name=storesubmit] i').attr("class","icon-time");
            $('button[name=storesubmit] span').attr("class","glyphicon glyphicon-time");
            //var url = 'http://yeyuan.sinaapp.com/tuzki';
            var url = "http://localhost:8080/tuzki"
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            //xhr.setRequestHeader("Cookie","not cool!");
            //xhr.setRequestHeader("Cookie","user="+user);
            xhr.onreadystatechange = function() {
                //console.log("xhr.readyState=",xhr.readyState);
                if(xhr.readyState == 4){
                    //console.log(xhr.responseText);
                    var result = JSON.parse(xhr.responseText);
                    if(result.code == '0' || result.code == '1'){
                        $('button[name=storesubmit] div[class=tooltip-inner]').empty();
                        $('button[name=storesubmit] div[class=tooltip-inner]').append("已存入，共存入"+result.count+"次");
                        //$('button[name=storesubmit] i').attr("class","icon-ok");
                        $('button[name=storesubmit] span').attr("class","glyphicon glyphicon-ok");
                    }else if(result.code == '3'){
                        $('button[name=storesubmit] div[class=tooltip-inner]').empty();
                        $('button[name=storesubmit] div[class=tooltip-inner]').append("哎哟，你还没登录啦！");
                        //$('button[name=storesubmit] i').attr("class","icon-ban-circle");
                        $('button[name=storesubmit] span').attr("class","glyphicon glyphicon-circle");
                    }else{
                        $('button[name=storesubmit] div[class=tooltip-inner]').empty();
                        $('button[name=storesubmit] div[class=tooltip-inner]').append("哎哟，你还没登录啦！");
                        //$('button[name=storesubmit] i').attr("class","icon-question-sign");
                        $('button[name=storesubmit] span').attr("class","glyphicon glyphicon-sign");
                    }
                }
            };
            xhr.send(word);
        }
        return false;
    });

    // tooltip for the store button
    $('button[name=storesubmit]').mouseover(function(){
        //$(this).tooltip();
    });
    // tooltip for the wordsbook
    $('a[name=book]').mouseover(function(){
        //$(this).tooltip();
    });
});

function getTextFromList(list){
    //console.log('list:',list)
    var text='';
    for(var item in list){
        text += list[item] + ' ';
        //console.log('list-item:',list[item])
    }
    return text;
}

//Q:....
function setSelectedText(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs,text){
        var tab = tabs[0];
        //console.log("tab_id:",tab.id);
        // 与页面进行通信 
        chrome.tabs.sendRequest(tab.id,{greeting: "hello,J"},function(response,text){//Q:{greeting: "hello,J"}??
            //console.log("response>>",response);
            if(response.selectedText){
                var text = response.selectedText
                console.log("Response:",text);
                $('input[name=q]').attr("value",text);//屬性value的值變為text
                console.log("selectedText>:",text);
                $('form[name=query]').trigger("submit");//觸發submitQ:為何還能觸發 這個form已經沒有了？？
            }
            //console.log("return here1");
            //return true;
        });
        //console.log("return here2");
        //return true;
    });
    //console.log("return here3");
    //return ;
}


function getCookie(domain, name, callback){
    var details = {"url": domain, "name": name};
    chrome.cookies.get(details, function(cookie){
        //console.log("get a cookie:",cookie);
        if(callback){
            callback(cookie.value);
        }
    });
}

//Q:'True' '10' '13'
function checkLogin(){
    // get the cookie of the domain of the server
    //var domain = "http://yeyuan.sinaapp.com";
    var domain = "http://localhost:8080";
    var url = domain + "/tuzki-get-acount-state";
    var xhr = new XMLHttpRequest();
    //AJAX 从服务器端获得数据
    xhr.open("GET",url,true);


    xhr.onreadystatechange = function(){
        //console.log("xhr.readyState=",xhr.readyState);
        if(xhr.readyState == 4){//响应已完成
            //console.log(xhr.responseText);
            var result = JSON.parse(xhr.responseText);//字符串转化为JS对象
            var update_link = '';
            if(result.update == 'True'){
                update_link = '<a href="' + domain + '/home" target="_blank"><span class="label label-important">新版本</span></a>';
            }
            if(result.code == '10'){
                var hello = document.createElement("p");//新的标签
                hello.innerHTML = 'Hello,'+result.username + '!' + update_link;

                var hello_div = document.getElementById('hello');
                hello_div.appendChild(hello);
            }else if(result.code == '13'){
                var hello = document.createElement("p");

                var words_book_link = '<a href="' + domain + '/login" target="_blank">登录</a>|<a href="' + domain + '/signup" target="_blank">注册</a>';
                hello.innerHTML = 'Hello!' + words_book_link + update_link;

                var hello_div = document.getElementById('hello');
                hello_div.appendChild(hello);
            }
        }
    };
    xhr.send();
}
