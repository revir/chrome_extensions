if (!chrome.cookies) {
    chrome.cookies = chrome.experimental.cookies;
}

function cookieMatch(c1, c2) {
    return (c1.name == c2.name) && (c1.domain == c2.domain) &&
        (c1.hostOnly == c2.hostOnly) && (c1.path == c2.path) &&
        (c1.secure == c2.secure) && (c1.httpOnly == c2.httpOnly) &&
        (c1.session == c2.session) && (c1.storeId == c2.storeId);
}

function CookieCache() {
    this.cookies_ = [];
    this.add = function(cookie) {
        this.remove(cookie);
        this.cookies_.splice(0, 0, cookie);
        console.log('added cookies_.length:' + this.cookies_.length);
    };
    this.remove = function(cookie) {
        var i = 0;
        for (i in this.cookies_) {
            if (cookieMatch(this.cookies_[i], cookie)) {
                this.cookies_.splice(i, 1);
                console.log('removed cookies_.length:' + this.cookies_.length);
                break;
            }
        }

    };
    this.removeAll = function() {
        console.log('remove all cookies_.');
        this.cookies_ = [];
    };

    this.getAll = function() {
        console.log('getAll cookies_.length:' + this.cookies_.length);
        return this.cookies_;
    };
}

var cache = new CookieCache();
var watchedTab = null;

chrome.cookies.onChanged.addListener(function(info) {
    if (watchedTab !== null) {
        if (info.removed) {
            cache.remove(info.cookie);
        } else {
            cache.add(info.cookie);
        }
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.getCookie) {
            var cookies = cache.getAll();
            sendResponse(cookies);
        } else if (request.watchTab) {
            watchedTab = sender.tab.id;
            //remove the older cookies
        }
    }
);

chrome.tabs.onRemoved.addListener(function(tabId, info) {
    if (watchedTab && tabId === watchedTab) {
        chrome.storage.local.clear();
        cache.removeAll();
        watchedTab = null;
    }
});