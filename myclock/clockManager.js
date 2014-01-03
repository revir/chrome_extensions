var ClockManager = {};

ClockManager.clocks = {};
ClockManager.enabled = true;

ClockManager.audio = null;

ClockManager.alertType = {
    alert: "alert",
    music: "music"
};

ClockManager.repeatType = {
    none: "noRepeat",
    daily: "daily",
    weekly: "weekly",
    monthly: "monthly"
};

ClockManager.init = function() {
    var clocks = Settings.getObject("clocks");
    if (clocks) {
        ClockManager.clocks = clocks;
    }
    //init audio
    ClockManager.audio = $('<input>');
    ClockManager.audio.attr('type', 'text');
    ClockManager.audio.attr('src', 'http://m1.music.126.net/3p33jB2LJHJQFocxm8T0mg==/5660285859848175.mp3');

    ClockManager.enabled = Settings.getValue("enableClocks", true);
};

ClockManager.save = function saveClocks() {
    Settings.setObject("clocks", ClockManager.clocks);
    // Settings.setObject("historyClocks", ClockManager.historyClocks);
    Settings.setValue("enableClocks", ClockManager.enabled);
};

ClockManager.isEnabled = function isEnabled() {
    return ClockManager.enabled;
};

ClockManager.setEnabled = function setEnabled(enabled) {
    ClockManager.enabled = !! enabled;
    Settings.setValue("enableClocks", ClockManager.enabled);
};

ClockManager.getClocks = function getClocks() {
    var arr = [];
    for (var i in ClockManager.clocks) {
        if (ClockManager.clocks.hasOwnProperty(i)) {
            arr[arr.length] = ClockManager.clocks[i];
        }
    }
    return arr;
};

ClockManager.getClock = function getClock(clock) {
    if (typeof(clock) === "string") {
        return ClockManager.clocks[clock];
    } else
        return ClockManager.clocks[clock.createTime];
};

ClockManager.setClocks = function setclocks(clocks) {
    t = $.extend(true, {}, clocks);
    ClockManager.clocks = t;
    ClockManager.save();
};

ClockManager.updateClock = function updateClock(clock) {
    ClockManager.clocks[clock.createTime] = clock;
    ClockManager.save();
    //?? apply?
};

ClockManager.removeClock = function removeClock(clock) {
    if (typeof(clock) === "string") {
        delete ClockManager.clocks[clock];
    } else {
        delete ClockManager.clocks[clock.createTime];
    }
    ClockManager.save();
};

// ClockManager.dismissClock = function dismissClock(createTime) {
//     var c = $.extend(true, {}, ClockManager.clocks[createTime]);
//     ClockManager.historyClocks[createTime] = c;
//     ClockManager.removeClock(createTime);
//     ClockManager.flushHistoryClocks();
// };

ClockManager.getSortedClocks = function getSortedClocks() {
    var arr = ClockManager.getClocks();
    arr = arr.sort(function(o1, o2) {
        return Date.parse(o1.createTime) - Date.parse(o2.createTime);
    });
    return arr;
};

// ClockManager.flushHistoryClocks = function flushHistoryClocks() {
//     //TODO: withyear or withmonth or withinweek etc...
//     ClockManager.save();
// };

// ClockManager.getClockStatus = function getClockStatus(clock) {
//     if (typeof(clock) === "string") {
//         return ClockManager.clocksStatus[clock] || {};
//     } else {
//         return ClockManager.clocksStatus[clock.createTime] || {};
//     }
// };

// ClockManager.onClockDismissed = function onClockDismissed(notificationId) {
//     ClockManager.dismissClock(notificationId);
//     if (ClockManager.clocksStatus[notificationId])
//         delete ClockManager.clocksStatus[notificationId];
// };

ClockManager.getClockCountDown = function(clock) {
    if (typeof(clock) === 'string') {
        return ClockManager.clocks[clock].countDown;
    } else {
        return ClockManager.clocks[clock.createTime].countDown;
    }
};

ClockManager.clockTick = function clockTick() {
    if (!ClockManager.enabled)
        return;
    var func = function() {};
    for (var i in ClockManager.clocks) {
        if (ClockManager.clocks.hasOwnProperty(i)) {
            var clock = ClockManager.clocks[i];
            var dateDiff = Date.parse(clock.clockTime) - Date.now();

            if (!clock.clockTime || !clock.createTime)
                continue;
            if (clock.countDown && clock.countDown <= 0 && dateDiff <= 0) {
                if (clock.repeat === ClockManager.repeatType.none)
                    continue;

                var od = new Date(clock.clockTime);

                if (clock.repeat === ClockManager.repeatType.daily)
                    od.setDate(od.getDate() + 1);
                else if (clock.repeat === ClockManager.repeatType.weekly)
                    od.setDate(od.getDate() + 7);
                else if (clock.repeat === ClockManager.repeatType.monthly)
                    od.setMonth(od.getMonth() + 1);

                dateDiff = od.getTime() - Date.now();
                clock.clockTime = od.toLocaleString();
            }

            clock.countDown = Math.floor(dateDiff / 1000);
            if (clock.countDown <= 0) {
                var opt = {
                    type: "basic",
                    title: "Time's up!",
                    message: clock.clockTime + ' : ' + clock.name,
                    iconUrl: "images/clock_48x48.png"
                };
                if(ClockManager.audio)
                    ClockManager.audio[0].play();
                chrome.notifications.create(clock.createTime, opt, func);
            }
        }
    }
};

ClockManager.init();