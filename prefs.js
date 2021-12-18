'use strict';

const {GObject, Gtk, Soup} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const GS_SCHEMA = "org.gnome.shell.extensions.thanatophobia";
const GS_KEY_YEAR = "year";
const GS_KEY_MONTH = "month";
const GS_KEY_DAY = "day";
const GS_KEY_HOUR = "hour";
const GS_KEY_MINUTE = "minute";
const GS_KEY_SEX = "sex";
const GS_KEY_COUNTRY = "country";
const GS_KEY_LIFE_EXPECTANCY = "expectancy";
const GS_KEY_LIFE_EXPECTANCY_YEAR = "expectancy-year";
const DEFAULT_LIFE_EXPECTANCY = 73.2
const session = new Soup.SessionAsync();

function init() {
}

function limit(min,max,x) {
    if(isNaN(x)) return min;
    return Math.min(max,Math.max(min,x));
}

function getExpectancyString(le, year) {
    return `Your current live expectancy is: ${le} (as of ${year})`
}

function GET(url, callback) {
    const request = Soup.Message.new('GET', url);
    session.queue_message(request, function(session, message) {
        callback(message.status_code, request.response_body.data);
    });
}

function buildPrefsWidget() {
    this.settings = ExtensionUtils.getSettings(
        GS_SCHEMA
    );

    /******************************
     * Set up labels
     ******************************/
    let birthdateLabel = new Gtk.Label({
        label: "Birthdate:",
        halign: Gtk.Align.START,
        visible: true
    });
    let timeLabel = new Gtk.Label({
        label: "Time:",
        halign: Gtk.Align.START,
        visible: true
    });
    let timeSeparatorLabel = new Gtk.Label({
        label: ":",
        halign: Gtk.Align.START,
        visible: true
    });
    let countryLabel = new Gtk.Label({
        label: "Country (ISO-a3):",
        halign: Gtk.Align.START,
        visible: true
    });
    let sexLabel = new Gtk.Label({
        label: "Sex:",
        halign: Gtk.Align.START,
        visible: true
    });
    let expectancyLabel = new Gtk.Label({
        label: getExpectancyString(this.settings.get_double(GS_KEY_LIFE_EXPECTANCY), this.settings.get_int(GS_KEY_LIFE_EXPECTANCY_YEAR)),
        halign: Gtk.Align.START,
        visible: true
    });

    /******************************
     * Set up widgets
     ******************************/
    // Calendar
    let birthdateEntry = new Gtk.Calendar({
        year: this.settings.get_int(GS_KEY_YEAR),
        month: this.settings.get_int(GS_KEY_MONTH),
        day: this.settings.get_int(GS_KEY_DAY),
        halign: Gtk.Align.START,
        visible: true
    });
    // Birthdate hours
    let hourEntry = new Gtk.SpinButton();
    hourEntry.set_sensitive(true);
    hourEntry.set_numeric(true);
    hourEntry.set_range(0, 23);
    hourEntry.set_value(limit(0,23,settings.get_int(GS_KEY_HOUR)));
    hourEntry.set_increments(1, 2);
    // Birthdate minutes
    let minuteEntry = new Gtk.SpinButton();
    minuteEntry.set_sensitive(true);
    minuteEntry.set_numeric(true);
    minuteEntry.set_range(0, 59);
    minuteEntry.set_value(limit(0,59,settings.get_int(GS_KEY_MINUTE)));
    minuteEntry.set_increments(1, 2);
    // Residency country
    let countryEntry = new Gtk.Entry({
        buffer: new Gtk.EntryBuffer()
    });
    countryEntry.set_text(settings.get_string(GS_KEY_COUNTRY))
    // Biological sex
    let sexEntry = new Gtk.ComboBoxText()
    sexEntry.append_text("Male");
    sexEntry.append_text("Female");
    sexEntry.set_active(settings.get_int(GS_KEY_SEX)===1?0:1);
    // Recalculate button
    let recalculateButton = new Gtk.Button({ label: "Recalculate" })

    /******************************
     * Add widgets to container
     ******************************/
    // Container
    let prefsWidget = new Gtk.Grid({
        "margin-start": 18,
        "margin-end": 18,
        "margin-top": 18,
        "margin-bottom": 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    });
    // Calendar
    prefsWidget.attach(birthdateLabel, 0, 1, 1, 1);
    prefsWidget.attach_next_to(birthdateEntry, birthdateLabel, Gtk.PositionType.RIGHT, 3, 1);
    // Birthdate hours and minutes
    prefsWidget.attach_next_to(timeLabel, birthdateLabel, Gtk.PositionType.BOTTOM, 1, 1);
    prefsWidget.attach_next_to(hourEntry, timeLabel, Gtk.PositionType.RIGHT, 1, 1);
    prefsWidget.attach_next_to(timeSeparatorLabel, hourEntry, Gtk.PositionType.RIGHT, 1, 1);
    prefsWidget.attach_next_to(minuteEntry, timeSeparatorLabel, Gtk.PositionType.RIGHT, 1, 1);
    // Residency country
    prefsWidget.attach_next_to(countryLabel, timeLabel, Gtk.PositionType.BOTTOM, 1, 1);
    prefsWidget.attach_next_to(countryEntry, countryLabel, Gtk.PositionType.RIGHT, 3, 1);
    // Biological sex
    prefsWidget.attach_next_to(sexLabel, countryLabel, Gtk.PositionType.BOTTOM, 1, 1);
    prefsWidget.attach_next_to(sexEntry, sexLabel, Gtk.PositionType.RIGHT, 3, 1);
    // Recalculate
    prefsWidget.attach_next_to(expectancyLabel, sexLabel, Gtk.PositionType.BOTTOM, 4, 1);
    prefsWidget.attach_next_to(recalculateButton, expectancyLabel, Gtk.PositionType.BOTTOM, 1, 1);

    /******************************
     * Add callbacks
     ******************************/
    // Calendar changed
    birthdateEntry.connect("day-selected", function (inputField) {
        settings.set_int(GS_KEY_YEAR, inputField.get_date().get_year());
        settings.set_int(GS_KEY_MONTH, inputField.get_date().get_month() - 1);
        settings.set_int(GS_KEY_DAY, inputField.get_date().get_day_of_month());
    });
    // Hours
    hourEntry.connect("changed", function (field) {
       settings.set_int(GS_KEY_HOUR, field.get_value_as_int());
    });
    // Minutes
    minuteEntry.connect("changed", function (field) {
        settings.set_int(GS_KEY_MINUTE, field.get_value_as_int());
    });
    // Country
    countryEntry.connect("changed", function (field) {
        settings.set_string(GS_KEY_COUNTRY, field.get_text().toUpperCase());
    })
    // Sex
    sexEntry.connect("changed", function (field) {
        settings.set_int(GS_KEY_SEX, field.get_active_text() === "Male"?1:0);
    });
    // Button
    recalculateButton.connect("clicked", () => {
        const getData = i => {
            if(i > 20) {
                expectancyLabel.set_text(`Could not fetch data, using previous: ${this.settings.get_double(GS_KEY_LIFE_EXPECTANCY)}`)
                return;
            }

            expectancyLabel.set_text(`Fetching data from WHO (${i} years old)...`);
            let year = new Date().getFullYear() - i;
            let country = settings.get_string(GS_KEY_COUNTRY);
            let sex = settings.get_int(GS_KEY_SEX) === 1?'MLE':'FMLE';
            GET(`https://apps.who.int/gho/athena/api/GHO/WHOSIS_000001.json?profile=simple&filter=COUNTRY:${country};YEAR:${year};SEX:${sex}`,
                (status, body) => {
                    if(status >= 200 || status < 300) {
                        try {
                            const json = JSON.parse(body);
                            if(json["fact"].length === 0) {
                                getData(i+1);
                                return;
                            }
                            let sum = 0
                            for(const fact of json['fact']) {
                                sum += parseFloat(fact["Value"])
                            }
                            const expectancy = sum / json["fact"].length;
                            settings.set_double(GS_KEY_LIFE_EXPECTANCY, expectancy);
                            settings.set_int(GS_KEY_LIFE_EXPECTANCY_YEAR, year);
                            expectancyLabel.set_text(getExpectancyString(
                                    this.settings.get_double(GS_KEY_LIFE_EXPECTANCY),
                                    this.settings.get_int(GS_KEY_LIFE_EXPECTANCY_YEAR)))
                        } catch (e) {
                            getData(i+1);
                        }
                    } else getData(i+1);
                })
        }
        getData(0);
    })
    // Put container on window
    prefsWidget.connect('realize', () => {
        {
            let window = prefsWidget.get_root();
            window.default_width = 200;
            window.default_height = 200;
        }
    });

    return prefsWidget;
}