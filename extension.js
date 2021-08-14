'use strict';

const GETTEXT_DOMAIN = 'thanatophobia-extension';
const GS_KEY_DAY = "day";
const GS_KEY_MONTH = "month";
const GS_KEY_YEAR = "year";
const GS_SCHEMA = "org.gnome.shell.extensions.thanatophobia";
const LIFE_EXPECTANCY = 72.6

const ExtensionUtils = imports.misc.extensionUtils;
const GLib = imports.gi.GLib;
const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const _ = Gettext.gettext;
const {GObject, St, Clutter} = imports.gi;

let sourceId = null;

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('Current Age Indicator'));

            this.gsettings = ExtensionUtils.getSettings(GS_SCHEMA);
            this.gsettings.connect('changed::' + GS_KEY_YEAR, () => this._dateOfBirthChanged());
            this.gsettings.connect('changed::' + GS_KEY_MONTH, () => this._dateOfBirthChanged());
            this.gsettings.connect('changed::' + GS_KEY_DAY, () => this._dateOfBirthChanged());

            this.year = this.gsettings.get_int(GS_KEY_YEAR);
            this.month = this.gsettings.get_int(GS_KEY_MONTH);
            this.day = this.gsettings.get_int(GS_KEY_DAY);

            this.label = new St.Label({
                y_align: Clutter.ActorAlign.CENTER
            })
            this.add_child(this.label);

            const age = ((Date.now() - new Date(this.year, this.month, this.day).getTime()) / 3.15576e+10).toFixed(9)
            let item = new PopupMenu.PopupMenuItem(_(`${Math.floor(age / LIFE_EXPECTANCY * 100).toString()}% of global average life expectancy`));

            this.menu.addMenuItem(item);
            this._refresh();
        }

        _dateOfBirthChanged() {
            this.year = this.gsettings.get_int(GS_KEY_YEAR);
            this.month = this.gsettings.get_int(GS_KEY_MONTH);
            this.day = this.gsettings.get_int(GS_KEY_DAY);
            this._refresh();
        }

        _updateAge() {
            this.label.set_text(((Date.now() - new Date(this.year, this.month, this.day).getTime()) / 3.15576e+10).toFixed(9).toString());
        }

        _refresh() {
            this._updateAge();
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
