var extension = chrome.extension.getBackgroundPage();
var Settings = extension.Settings;
var ClockManager = extension.ClockManager;
var ignoreFieldsChanges = false;
var clocksEnabled = true;

function init() {

    initUI();
    loadOptions();
    // checkPageParams();

    // HelpToolTip.enableTooltips();
}

function initUI() {
    // Tab Control
    $("#tabsContainer div").click(function() {
        $("#tabsContainer div").removeClass("selected").addClass("normal");
        $(this).removeClass("normal").addClass("selected");
        $("#body .tab").hide();
        $("#" + $(this).attr("id") + "Body").show();
        if (this.id == "tabImportExport")
            $(".control").hide();
        else
            $(".control").show();
    });

    // Clocks
    $("#chkEnableClocks").change(function() {
        ClockManager.setEnabled($(this).is(":checked"));
        clocksEnabled = $(this).is(":checked");
        if ($(this).is(":checked")) {
            $("#clocks *, #btnNewClock").removeClass("disabled");
            $("#clocks input, #clocks select").removeAttr("disabled");
        } else {
            $("#clocks *, #btnNewClock").addClass("disabled");
            $("#clocks input, #clocks select").attr("disabled", "disabled");
        }
    });
}

function loadOptions() {
    // Clocks
    clocksEnabled = ClockManager.isEnabled();
    if (clocksEnabled)
        $("#chkEnableClocks").attr("checked", "checked");

    $("#chkEnableClocks").change();

    $("#clocksTable .tableRow").remove();
    var clocks = ClockManager.getSortedClocks();
    for (var i in clocks) {
        if (clocks.hasOwnProperty(i)) {
            clock = clocks[i];
            row = newClockRow(clock, false);
        }
    }
}

function saveOptions() {
    ClockManager.setEnabled($("#chkEnableClocks").is(":checked"));

    // extension.setIconInfo();
    // InfoTip.showMessageI18n("message_optionsSaved", InfoTip.types.success);
}

function closeWindow() {
    // if (anyValueModified && InfoTip.confirmI18n("message_saveChangedValues"))
    //     saveOptions();

    window.close();
}

function switchTab(tab) {
    var tabId;
    switch (tab) {
        case "rules":
            tabId = "tabRules";
            break;

        case "network":
            tabId = "tabNetwork";
            break;

        case "importexport":
            tabId = "tabImportExport";
            break;

        case "general":
            tabId = "tabGeneral";
            break;

        default:
            tabId = "tabProfiles";
            break;
    }
    $("#" + tabId).click();
}

function resetOptions() {

}

function enterFieldEditMode(cell) {
    var input = $("input", cell);
    var span = $("span", cell);
    if (input.is(":visible"))
        return;
    var v = span.text();
    if (v == "-")
        input.val("");
    else
        input.val(span.text());
    input.toggle();
    span.toggle();
    input.focus();
    //	input.select();
}

function exitFieldEditMode(cell) {
    var input = $("input", cell);
    var span = $("span", cell);
    var newValue = input.val().replace(/(^\s*)|(\s*$)/g, "");
    if (newValue === "")
        newValue = "-"; // workaround for jQuery bug (toggling an empty span).

    var row = cell.parentNode.parentNode;
    var clock = row.clock;
    clock[input.attr("name")] = input.val();

    span.text(newValue);
    input.toggle();
    span.toggle();

    if (clock.clockTime && Date.now() < Date.parse(clock.clockTime)) {
        ClockManager.updateClock(clock);
    }
}

function newClockRow(clock, activate) {
    if (!clock && !clocksEnabled)
        return;

    var table = $("#clocksTable");
    var row = $("#clocksTable .templateRow").clone();
    row.removeClass("templateRow").addClass("tableRow");
    table.append(row);

    //timepicker
    $('.timePicker', row).datetimepicker({
        minDate: new Date(),
        onClose: function(text, inst){
            if(text){
                var c = this.parentNode.parentNode.parentNode.clock;
                c.clockTime = text;
                ClockManager.updateClock(c);
            }
        }
    });

    //bind events
    $("td.editable", row).click(function() {
        if (clocksEnabled)
            enterFieldEditMode(this);
    });
    $("td.editable input", row).blur(function() {
        exitFieldEditMode(this.parentNode);
    }).keypress(function() {
        if (event.keyCode == 13) // Enter Key
            $(event.target).blur();
    });
    $("input, select", row).keydown(function() {
        if (event.keyCode == 9) { // Tab Key
            $(event.target).blur();
            var nextFieldCell;
            if (!event.shiftKey)
                nextFieldCell = event.target.parentNode.parentNode.nextElementSibling;
            else
                nextFieldCell = event.target.parentNode.parentNode.previousElementSibling;

            $(nextFieldCell).click();
            $("input, select", nextFieldCell).focus().select();
            return false;
        }
    });

    //set value
    var combobox = $("select[name='clockAlertType']", row);
    if (clock)
        $("option[value='" + clock.alertType + "']", combobox).attr("selected", "selected");

    combobox.change(function() {
        var clock = this.parentNode.parentNode.parentNode.clock;
        clock.alertType = $("option:selected", this).val();
        ClockManager.updateClock(clock);
    });

    if (clock) {
        row[0].clock = clock;
        var status = ClockManager.getClockStatus(clock);
        $(".clockName", row).text(clock.name);
        $(".timePicker", row).datetimepicker("setDate", clock.clockTime);
        $(".clockRepeat", row).text(clock.repeat);
        $(".countDown", row).text(String(status ? status.countDown : 0));
    } else {
        var d = new Date();
        $(".timePicker", row).datetimepicker("setDate", d);
        row[0].clock = {
            name: "New clock",
            clockTime: d.toLocaleString(),
            repeat: "no repeat",
            alertType: ClockManager.alertType.alert,
            createTime: d.toLocaleString()
        };
    }
    if (activate) {
        $("td:first", row).click();
        $("td:first input", row).select();
    }
}

function deleteClockRow() {
    var clock = event.target.parentNode.parentNode;
    $(clock).remove();
    ClockManager.removeClock(clock.clock);
}

function flushClocks() {
    if (!clocksEnabled)
        return;
    var list = $('tr.tableRow');
    list.each(function(index, el) {
        if (!el.clock || !el.clock.createTime)
            return;
        var status = ClockManager.getClockStatus(el.clock);
        $('span.countDown', el).text(String(status ? status.countDown : 0));
    });
}

$(document).ready(function() {
    init();
    $("body").on("click", "div.deleteClock", deleteClockRow);
    $("#btnNewClock").click(function() {
        newClockRow(undefined, true);
    });
    $("#closeWindow").click(closeWindow);

    setInterval(flushClocks, 1000);
});