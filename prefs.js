'use strict';

const Gtk = imports.gi.Gtk;
const ExtensionUtils = imports.misc.extensionUtils;
const GS_SCHEMA = "org.gnome.shell.extensions.thanatophobia";
const GS_KEY_YEAR = "year";
const GS_KEY_MONTH = "month";
const GS_KEY_DAY = "day";

function init() {
}

function buildPrefsWidget() {
    this.settings = ExtensionUtils.getSettings(
        GS_SCHEMA
    );

    let prefsWidget = new Gtk.Grid({
        "margin-start": 18,
        "margin-end": 18,
        "margin-top": 18,
        "margin-bottom": 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true
    });

    let birthdateLabel = new Gtk.Label({
        label: "Birthdate:",
        halign: Gtk.Align.START,
        visible: true
    });

    let birthdateEntry = new Gtk.Calendar({
        year: this.settings.get_int(GS_KEY_YEAR),
        month:  this.settings.get_int(GS_KEY_MONTH),
        day:  this.settings.get_int(GS_KEY_DAY),
        halign: Gtk.Align.START,
        visible: true
    });

    birthdateEntry.connect('day-selected', function (inputField) {
        settings.set_int(GS_KEY_YEAR, inputField.get_date().get_year());
        settings.set_int(GS_KEY_MONTH, inputField.get_date().get_month());
        settings.set_int(GS_KEY_DAY, inputField.get_date().get_day_of_month());
    });

    prefsWidget.attach(birthdateLabel, 0, 1, 1, 1);
    prefsWidget.attach_next_to(birthdateEntry, birthdateLabel, Gtk.PositionType.RIGHT, 1, 1);

    prefsWidget.connect('realize', () => {
        {
            let window = prefsWidget.get_root();
            window.default_width = 200;
            window.default_height = 200;
        }
    });

    return prefsWidget;
}