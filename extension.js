/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
'use strict';

const GETTEXT_DOMAIN = 'thanatophobia-extension';
const GS_DATE_OF_BIRTH = "date-of-birth";
const GS_SCHEMA = "org.gnome.shell.extensions.thanatophobia";

const ExtensionUtils = imports.misc.extensionUtils;
const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;
const _ = Gettext.gettext;
const {GObject, St, Clutter} = imports.gi;

const GLib = imports.gi.GLib;
let sourceId = null;

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('Current Age Indicator'));

            this.gsettings = ExtensionUtils.getSettings(GS_SCHEMA);
            this.gsettings.connect('changed::' + GS_DATE_OF_BIRTH, () => this._dateOfBirthChanged());
            this.date_of_birth = this.gsettings.get_string(GS_DATE_OF_BIRTH);

            this.label = new St.Label({
                y_align: Clutter.ActorAlign.CENTER
            })
            this.add_child(this.label);

            this._refresh();
        }

        _dateOfBirthChanged() {
            this.date_of_birth = this.gsettings.get_string(GS_DATE_OF_BIRTH);
            this._refresh();
        }

        _updateAge() {
            this.label.set_text(((Date.now() - new Date(this.date_of_birth).getTime()) / 31536000000).toFixed(9).toString());
        }

        _refresh() {
            this._updateAge();

            if (this._timeout) {
                Mainloop.source_remove(this._timeout);
                this._timeout = null;
            }

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
