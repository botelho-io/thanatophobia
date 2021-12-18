'use strict';

const GETTEXT_DOMAIN = 'thanatophobia-extension';
const GS_KEY_DAY = "day";
const GS_KEY_MONTH = "month";
const GS_KEY_YEAR = "year";
const GS_KEY_HOUR = "hour";
const GS_KEY_MINUTE = "minute";
const GS_KEY_LIFE_EXPECTANCY = "expectancy";
const GS_SCHEMA = "org.gnome.shell.extensions.thanatophobia";

const ExtensionUtils = imports.misc.extensionUtils;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const _ = Gettext.gettext;
const {GObject, St, Clutter} = imports.gi;

let sourceId = null;

const Indicator = GObject.registerClass(class Indicator extends PanelMenu.Button {
    _init() {
        // Call constructor
        super._init(0.0, _('Current Age Indicator'));

        // Init variables
        this.year = NaN
        this.month = NaN
        this.day = NaN
        this.hour = NaN
        this.minute = NaN
        this.expectancy = NaN
        this.bDate = new Date();

        // Add age indicator label
        this.label = new St.Label({
            y_align: Clutter.ActorAlign.CENTER
        })
        this.add_child(this.label);

        // Add popup menu "life-percentage" label
        this.menuItem = new PopupMenu.PopupMenuItem(_('...'));
        this.menu.addMenuItem(this.menuItem);

        // Open settings in order to read from user data
        this.gsettings = ExtensionUtils.getSettings(GS_SCHEMA);

        // Read from userdata for the first time
        this._userDataUpdated();

        // Set-up update when user data is modified
        this.gsettings.connect('changed::' + GS_KEY_DAY, () => this._userDataUpdated());
        this.gsettings.connect('changed::' + GS_KEY_MONTH, () => this._userDataUpdated());
        this.gsettings.connect('changed::' + GS_KEY_YEAR, () => this._userDataUpdated());
        this.gsettings.connect('changed::' + GS_KEY_HOUR, () => this._userDataUpdated());
        this.gsettings.connect('changed::' + GS_KEY_MINUTE, () => this._userDataUpdated());
        this.gsettings.connect('changed::' + GS_KEY_LIFE_EXPECTANCY, () => this._userDataUpdated());

        // Start refresh loop
        this._refresh();
    }

    // Calculates user's age
    _getAge() {
        return ((Date.now() - this.bDate.getTime()) / 3.15576e+10).toFixed(9);
    }

    // Reads data from settings file
    _userDataUpdated() {
        // Read user data
        this.year = this.gsettings.get_int(GS_KEY_YEAR);
        this.month = this.gsettings.get_int(GS_KEY_MONTH);
        this.day = this.gsettings.get_int(GS_KEY_DAY);
        this.hour = this.gsettings.get_int(GS_KEY_HOUR);
        this.minute = this.gsettings.get_int(GS_KEY_MINUTE);
        this.expectancy = this.gsettings.get_double(GS_KEY_LIFE_EXPECTANCY);
        // Calculate user's birth date
        this.bDate = new Date(this.year, this.month - 1, this.day, this.hour, this.minute);
        // Recalculate users life expectancy
        this.menuItem.label.set_text(_(`${(this._getAge() / this.expectancy * 100).toFixed(4).toString()}% of global average life expectancy`));
    }

    // Refresh loop
    _refresh() {
        this.label.set_text(this._getAge().toString());
        sourceId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => this._refresh());
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        if (sourceId) {
            GLib.Source.remove(sourceId);
            sourceId = null;
        }
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
