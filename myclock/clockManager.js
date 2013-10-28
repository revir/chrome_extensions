var ClockManager = {};

ClockManager.clocks = {};
ClockManager.historyClocks = {};
ClockManager.clocksStatus = {};
ClockManager.enabled = true;

ClockManager.alertType = {
    alert: "alert",
    music: "music"
};

ClockManager.init = function() {
    var clocks = Settings.getObject("clocks");
    if (clocks) {
        ClockManager.clocks = clocks;
    }
    var historyClocks = Settings.getObject("historyClocks");
    if (historyClocks) {
        ClockManager.historyClocks = historyClocks;
    }

    ClockManager.enabled = Settings.getValue("enableClocks", true);
};

ClockManager.save = function saveClocks() {
    Settings.setObject("clocks", ClockManager.clocks);
    Settings.setObject("historyClocks", ClockManager.historyClocks);
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
    if (typeof(clock) === "number") {
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
    if (typeof(clock) === "number") {
        delete ClockManager.clocks[clock];
    } else {
        delete ClockManager.clocks[clock.createTime];
    }
    ClockManager.save();
};

ClockManager.dismissClock = function dismissClock(createTime) {
    var c = $.extend(true, {}, ClockManager.clocks[createTime]);
    ClockManager.historyClocks[createTime] = c;
    ClockManager.removeClock(createTime);
    ClockManager.flushHistoryClocks();
};

ClockManager.getSortedClocks = function getSortedClocks() {
    var arr = ClockManager.getClocks();
    arr = arr.sort(function(o1, o2) {
        return parseInt(o1.createTime, 10) - parseInt(o2.createTime, 10);
    });
    return arr;
};

ClockManager.flushHistoryClocks = function flushHistoryClocks() {
    //TODO: withyear or withmonth or withinweek etc...
    ClockManager.save();
};

ClockManager.getClockStatus = function getClockStatus(clock) {
    if (typeof(clock) === "number") {
        return ClockManager.clocksStatus[clock];
    } else {
        return ClockManager.clocksStatus[clock.createTime];
    }
};

ClockManager.onClockDismissed = function onClockDismissed(notificationId) {
    var createTime = parseInt(notificationId, 10);
    ClockManager.dismissClock(createTime);
    if (ClockManager.clocksStatus[createTime])
        delete ClockManager.clocksStatus[createTime];
};

ClockManager.clockTick = function clockTick() {
    var oldClocksStatus = ClockManager.clocksStatus;
    ClockManager.clocksStatus = {};
    var nowDate = Date.now();
    for (var i in ClockManager.clocks) {
        if (ClockManager.clocks.hasOwnProperty(i)) {
            var clock = ClockManager.clocks[i];
            if (!clock.clockTime || !clock.createTime)
                continue;
            var oldStatus = oldClocksStatus[i];
            var status = {};

            status.ringing = oldStatus && oldStatus.ringing ? true : false;
            var dateDiff = clock.clockTime - nowDate;
            status.nowDate = nowDate;
            status.countDown = dateDiff;
            status.dayDown = Math.floor(dateDiff / (24 * 60 * 60 * 1000));
            status.hourDown = Math.floor(dateDiff / (60 * 60 * 1000));
            status.minuteDown = Math.floor(dateDiff / (60 * 1000));
            status.secondDown = Math.floor(dateDiff / 1000);
            ClockManager.clocksStatus[i] = status;

            if (ClockManager.enabled && dateDiff <= 0 && !status.ringing) {
                ClockManager.clocksStatus[i].ringing = true;
                var opt = {
                    type: "basic",
                    title: "It's time to...",
                    message: clock.name,
                    iconUrl: "images/clock_48x48.png"
                };
                chrome.notifications.create(String(clock.createTime), opt, ClockManager.onClockDismissed);
            }
        }
    }
};

ClockManager.init();