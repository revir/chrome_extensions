var ClockManager = {};

ClockManager.clocks = {};
ClockManager.enabled = true;

ClockManager.alertType = {
	alert: "alert",
	music: "music"
};

ClockManager.defaultClock = {
    id:"Default Clock",
    name:"Default Clock",
    description:"Default clock",
    time: "2013-10-21 08:00:00",
    repeat:["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    alert: ClockManager.alertType.alert
    //countDown
    //createTime
};

ClockManager.init = function () {
	ClockManager.loadClocks();
};

ClockManager.loadClocks = function() {
	var clocks = Settings.getObject("clocks");
    if (clocks) {
        ClockManager.clocks = clocks;
    }

    ClockManager.enabled = Settings.getValue("enableClocks", true);
};

ClockManager.save = function saveClocks() {
    Settings.setObject("clocks", ClockManager.clocks);
    Settings.setValue("enableClocks", ClockManager.enabled);
};

ClockManager.isEnabled = function isEnabled() {
    return ClockManager.enabled;
};

ClockManager.setEnabled = function setEnabled(enabled) {
    ClockManager.enabled = !!enabled;
};

ClockManager.getClocks = function getClocks() {
    var arr = [];
    for (var i in ClockManager.clocks) {
        if (clocks.hasOwnProperty(i)) {
            arr[arr.length] = clocks[i];
        }
    }
    return arr;
};

ClockManager.setClocks = function setclocks(clocks) {
    t = $.extend(true, {}, clocks);
    ClockManager.clocks = t;
};

ClockManager.addClock = function addClock(clock) {
    ClockManager.clocks[clock.id] = clock;
    ClockManager.save();
    //?? apply?
};

ClockManager.getSortedClocks = function getSortedClocks() {
    var arr = ClockManager.getClocks();
    arr = arr.sort(Utils.compareNamedObjects);
    return arr;
};

ClockManager.init();