var ClockManager = {};

ClockManager.clocks = {};
ClockManager.enabled = true;

ClockManager.alertType = {
	alert: "alert",
	music: "music"
};

ClockManager.defaultClock = {
    id:"defaultClock",
    name:"Default Clock",
    description:"Default clock",
    time: "2013-10-21 08:00:00",
    repeat:["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    alert: ClockManager.alertType.alert,
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