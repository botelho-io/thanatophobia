'use strict';

const Gtk = imports.gi.Gtk;
const ExtensionUtils = imports.misc.extensionUtils;
const GS_SCHEMA = "org.gnome.shell.extensions.thanatophobia";
const GS_KEY_TIMEOUT = "birthdate";

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
        label: "Date of birth:",
        halign: Gtk.Align.START,
        visible: true
    });

    let birthdateField = new Gtk.Entry({
        text: this.settings.get_string(GS_KEY_TIMEOUT),
        halign: Gtk.Align.START,
        visible: true
    });

    birthdateField.connect('changed', function (inputField) {
        settings.set_string(GS_KEY_TIMEOUT, inputField.get_text());
    });

    prefsWidget.attach(birthdateLabel, 0, 1, 1, 1);
    prefsWidget.attach_next_to(birthdateField, birthdateLabel, Gtk.PositionType.RIGHT, 1, 1);

    prefsWidget.connect('realize', () => {
        {
            let window = prefsWidget.get_root();
            window.default_width = 200;
            window.default_height = 200;
        }
    });

    return prefsWidget;
}