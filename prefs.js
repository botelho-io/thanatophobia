'use strict';

const {Gtk, Soup} = imports.gi;
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
const GS_KEY_COUNTDOWN = "countdown";
const GS_KEY_DIGITS = "rounding";
const session = new Soup.SessionAsync();

function init() {
}

function limit(min, max, x) {
    if (isNaN(x)) return min;
    return Math.min(max, Math.max(min, x));
}

function getExpectancyString(le, year) {
    return `Your current live expectancy is: ${le} (as of ${year})`
}

function GET(url, callback) {
    const request = Soup.Message.new('GET', url);
    session.queue_message(request, function (session, message) {
        callback(message.status_code, request.response_body.data);
    });
}

function buildPrefsWidget() {
    this.settings = ExtensionUtils.getSettings(GS_SCHEMA);

    /******************************
     * Set up labels
     ******************************/
    let birthdateLabel = new Gtk.Label({
        label: "Birthdate:", halign: Gtk.Align.START, visible: true
    });
    let timeLabel = new Gtk.Label({
        label: "Time:", halign: Gtk.Align.START, visible: true
    });
    let timeSeparatorLabel = new Gtk.Label({
        label: ":", halign: Gtk.Align.START, visible: true
    });
    let countryLabel = new Gtk.Label({
        label: "Country (ISO-a3):", halign: Gtk.Align.START, visible: true
    });
    let sexLabel = new Gtk.Label({
        label: "Sex:", halign: Gtk.Align.START, visible: true
    });
    let expectancyLabel = new Gtk.Label({
        label: getExpectancyString(this.settings.get_double(GS_KEY_LIFE_EXPECTANCY), this.settings.get_int(GS_KEY_LIFE_EXPECTANCY_YEAR)),
        halign: Gtk.Align.START,
        visible: true
    });
    let countryLink = new Gtk.LinkButton({
        label: "ISO 3166 Code List",
        uri: "https://www.iso.org/obp/ui/#search/code/",
        halign: Gtk.Align.END,
        visible: true
    });
    let modeLabel = new Gtk.Label({
        label: "Display Mode:", halign: Gtk.Align.START, visible: true
    });
    let digitLabel = new Gtk.Label({
        label: "Number of digits:", halign: Gtk.Align.START, visible: true
    });

    /******************************
     * Set up widgets
     ******************************/
    // Calendar
    let birthdateEntry = new Gtk.Calendar({
            year: this.settings.get_int(GS_KEY_YEAR),
            month: this.settings.get_int(GS_KEY_MONTH) - 1,
            day: this.settings.get_int(GS_KEY_DAY),
            halign: Gtk.Align.START,
            visible: true
        });
    // Birthdate hours
    let hourEntry = new Gtk.SpinButton();
    hourEntry.set_sensitive(true);
    hourEntry.set_numeric(true);
    hourEntry.set_range(0, 23);
    hourEntry.set_value(limit(0, 23, settings.get_int(GS_KEY_HOUR)));
    hourEntry.set_increments(1, 2);
    // Birthdate minutes
    let minuteEntry = new Gtk.SpinButton();
    minuteEntry.set_sensitive(true);
    minuteEntry.set_numeric(true);
    minuteEntry.set_range(0, 59);
    minuteEntry.set_value(limit(0, 59, settings.get_int(GS_KEY_MINUTE)));
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
    sexEntry.set_active(settings.get_int(GS_KEY_SEX) === 1 ? 0 : 1);
    // Recalculate button
    let recalculateButton = new Gtk.Button({label: "Recalculate"})
    // Mode selection
    let modeEntry = new Gtk.ComboBoxText()
    modeEntry.append_text("Count up from birthday (age)");
    modeEntry.append_text("Count down from life expectancy");
    modeEntry.set_active(settings.get_int(GS_KEY_COUNTDOWN) === 1 ? 1 : 0);
    // Digit selection
    let digitEntry = new Gtk.SpinButton();
    digitEntry.set_sensitive(true);
    digitEntry.set_numeric(true);
    digitEntry.set_range(0, 10);
    digitEntry.set_value(limit(0, 10, settings.get_int(GS_KEY_DIGITS)));
    digitEntry.set_increments(1, 2);

    /******************************
     * Add widgets to container
     ******************************/
    // Container
    let prefsWidget = new Gtk.Grid({
            "margin-start": 18,
            "margin-end": 18,
            "margin-top": 18,
            "margin-bottom": 18,
            "column_spacing": 12,
            "row_spacing": 12,
            "visible": true
        });
    // Calendar
    prefsWidget.attach(birthdateLabel, 0, 1, 1, 1);
    prefsWidget.attach_next_to(birthdateEntry, birthdateLabel, Gtk.PositionType.RIGHT, 3, 1);
    // Birthdate hours and minutes
    prefsWidget.attach_next_to(timeLabel, birthdateLabel, Gtk.PositionType.BOTTOM, 1, 1);
    prefsWidget.attach_next_to(hourEntry, timeLabel, Gtk.PositionType.RIGHT, 1, 1);
    prefsWidget.attach_next_to(timeSeparatorLabel, hourEntry, Gtk.PositionType.RIGHT, 1, 1);
    prefsWidget.attach_next_to(minuteEntry, timeSeparatorLabel, Gtk.PositionType.RIGHT, 1, 1);
    // Biological sex
    prefsWidget.attach_next_to(sexLabel, timeLabel, Gtk.PositionType.BOTTOM, 1, 1);
    prefsWidget.attach_next_to(sexEntry, sexLabel, Gtk.PositionType.RIGHT, 3, 1);
    // Residency country
    prefsWidget.attach_next_to(countryLabel, sexLabel, Gtk.PositionType.BOTTOM, 1, 1);
    prefsWidget.attach_next_to(countryEntry, countryLabel, Gtk.PositionType.RIGHT, 3, 1);
    // Recalculate
    prefsWidget.attach_next_to(expectancyLabel, countryLabel, Gtk.PositionType.BOTTOM, 4, 1);
    prefsWidget.attach(recalculateButton, 0, 7, 1, 1);
    // Country link
    prefsWidget.attach(countryLink, 1, 7, 3, 1);
    // Display mode
    prefsWidget.attach_next_to(modeLabel, recalculateButton, Gtk.PositionType.BOTTOM, 1, 1);
    prefsWidget.attach_next_to(modeEntry, modeLabel, Gtk.PositionType.RIGHT, 3, 1);
    // Digit
    prefsWidget.attach_next_to(digitLabel, modeLabel, Gtk.PositionType.BOTTOM, 1, 1);
    prefsWidget.attach_next_to(digitEntry, digitLabel, Gtk.PositionType.RIGHT, 3, 1);

    /******************************
     * Add callbacks
     ******************************/
    // Calendar changed
    function update_date(inputField) {
        settings.set_int(GS_KEY_YEAR, inputField.get_date().get_year());
        settings.set_int(GS_KEY_MONTH, inputField.get_date().get_month());
        settings.set_int(GS_KEY_DAY, inputField.get_date().get_day_of_month());
    }

    birthdateEntry.connect("day-selected", update_date);
    birthdateEntry.connect("next-month", update_date);
    birthdateEntry.connect("prev-month", update_date);
    birthdateEntry.connect("next-year", update_date);
    birthdateEntry.connect("prev-year", update_date);
    // Hours
    hourEntry.connect("changed", function (field) {
        settings.set_int(GS_KEY_HOUR, field.get_value_as_int());
    });
    // Country
    countryEntry.connect("changed", function (field) {
        settings.set_string(GS_KEY_COUNTRY, field.get_text().toUpperCase());
    })
    // Sex
    sexEntry.connect("changed", function (field) {
        settings.set_int(GS_KEY_SEX, field.get_active() === 1 ? 0 : 1);
    });
    // Button
    recalculateButton.connect("clicked", () => {
        // Users country ISO-3 code
        let country = settings.get_string(GS_KEY_COUNTRY);
        // User's gender converted to a string for filtering the results of the WHO API
        // "BTSX" (both sexes) and "UNK" (unknown) are also available and could be a fall-back
        let sex = settings.get_int(GS_KEY_SEX) === 1 ? 'MLE' : 'FMLE';

        // The WHO may not have data for every year so "getData" gets called recursively
        // in order to find the latest year with data available
        const getData = yearOffset => {
            // If the data is more than 20 years old, give up, this may also happen
            // because an invalid country ISO alpha-3 code was provided
            if (yearOffset > 20) {
                expectancyLabel.set_text("Could not fetch data, using previous: " + this.settings.get_double(GS_KEY_LIFE_EXPECTANCY) + "\nDid you input a correct ISO alpha-3 country code?")
                return;
            }

            // Try to fetch data from WHO
            expectancyLabel.set_text(`Fetching data from WHO (${yearOffset} years old)...`);
            // Get year with ofset
            let year = new Date().getFullYear() - yearOffset;
            // Make API call
            GET(`https://apps.who.int/gho/athena/api/GHO/WHOSIS_000001.json?profile=simple&filter=COUNTRY:${country};YEAR:${year};SEX:${sex}`, (status, body) => {
                if (status >= 200 || status < 300) {
                    // Try to parse body on success
                    try {
                        const json = JSON.parse(body);
                        if (json["fact"].length === 0) {
                            // The JSON returned by the API has no data
                            getData(yearOffset + 1);
                            return;
                        }
                        // Average the results returned by the API
                        let sum = 0
                        for (const fact of json['fact']) {
                            sum += parseFloat(fact["Value"])
                        }
                        const expectancy = sum / json["fact"].length;
                        // Update settings
                        settings.set_double(GS_KEY_LIFE_EXPECTANCY, expectancy);
                        settings.set_int(GS_KEY_LIFE_EXPECTANCY_YEAR, year);
                        // Update label
                        expectancyLabel.set_text(getExpectancyString(this.settings.get_double(GS_KEY_LIFE_EXPECTANCY), this.settings.get_int(GS_KEY_LIFE_EXPECTANCY_YEAR)))
                    } catch (e) {
                        // The WHO API sometimes returns badly formatted JSON strings
                        // it could also change, making the parsing process break
                        getData(yearOffset + 1);
                    }
                } else {
                    // Fail on error code
                    getData(yearOffset + 1);
                }
            })
        }
        getData(0);
    })
    // Display mode
    modeEntry.connect("changed", function (field) {
        settings.set_int(GS_KEY_COUNTDOWN, field.get_active() === 1 ? 1 : 0);
    });
    // Digit
    digitEntry.connect("changed", function (field) {
        settings.set_int(GS_KEY_DIGITS, field.get_value_as_int());
    });
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