var htmlLogin = '<div class="klip_edit_container" id="klip_edit_container" style="z-index:9999;cursor:move;background-color: rgb(219, 221, 196); height:300px; width:250px;position:fixed; top:30px;right:40px; box-shadow: 10px 5px 10px rgb(121, 92, 92);">' +
    '<div id="klip_edit_save" class="safesitex_ucookie large green klip_button pulse" title="Alt-Ctrl-Enter" style="margin:auto;margin-top: 40px;">提交</div>' +
    '<p style="text-align:center; margin-top: 10px; font-size:14px;">登陆后点击此按钮提交登陆信息！</p>' +
    '<p style="text-align:center; margin-top: 10px; font-size:14px;">如果您此前已经登陆了， 请退出该网站后重新登陆！</p>' +
    '</div>';

var version = '0.2';

jQuery(document).ready(start);

function start() {
    var tBtn = jQuery('a[safesitex_tid]');
    if (tBtn.length) {
        tBtn.removeClass('not-installed');
        tBtn.click(function(event) {
            var taskId = tBtn.attr('safesitex_tid');
            var taskUrl = tBtn.attr('safesitex_url');
            var xurl = document.location.href;
            chrome.storage.local.set({
                'taskId': taskId,
                'taskUrl': taskUrl,
                'xurl': xurl
            }, function() {
                // alert('Settings saved');
            });
        });
        return;
    }

    chrome.storage.local.get({
        'taskId': '',
        'taskUrl': '',
        'xurl': ''
    }, function(result) {
        var taskId = result.taskId;
        var taskUrl = result.taskUrl;
        var xurl = result.xurl;
        if (taskId && taskUrl && xurl) {
            var baseHost = document.location.host; //bug? maybe some host use subhost to login...
            var taskHost = taskUrl.match(/:\/\/([^\/]+)/)[1];
            var filter = taskHost.replace(/www\.|bbs\.|forum\.|mobile\.|wap\.|news\./, '');
            var replyUrl = xurl.match(/^.*?\/task\w+/)[0] + '/cookie/';
            // alert('test');
            if (baseHost === taskHost) {
                // alert('match');
                chrome.runtime.sendMessage({
                    'watchTab': filter
                });

                jQuery('body').prepend(htmlLogin);
                drag('klip_edit_container');
                jQuery('.safesitex_ucookie').click(function(event) {

                    console.log('cookie filter:' + filter);
                    chrome.runtime.sendMessage({
                        'getCookie': filter
                    }, function(response) {
                        console.log(response.length);
                        console.log(response);
                        if (response.length) {
                            jQuery.post(replyUrl, {
                                    'cookies': response,
                                    'userAgent': window.navigator.userAgent
                                },
                                function(data) {
                                    alert('提交成功！');
                                    chrome.storage.local.clear();
                                    window.close();
                                });
                        } else {
                            alert('获取登陆信息失败！');
                            chrome.storage.local.clear();
                            window.close();
                        }
                    });
                });
            }
        }
    });
}

function drag(elid) {
    var target = document.getElementById(elid);
    var flag = false;
    var b = 0,
        c = 0;

    var getRight = function(el) {
        return document.width - el.clientX;
    };
    document.onmouseup = function() {
        flag = false;
    };
    document.onmousemove = function(d) {
        if (!flag) return;
        d = d || event;
        target.style.right = (getRight(d) - b) + "px";
        target.style.top = (d.clientY - c) + "px";
    };
    target.onmousedown = function(event) {
        flag = true;
        b = getRight(event) - parseInt(target.style.right, 10);
        c = event.clientY - parseInt(target.style.top, 10);

        console.log('target.style.right = ' + target.style.right);
        console.log('event.clientX = ' + event.clientX);
        console.log('b = ' + b);
        console.log('c = ' + c);
    };
}