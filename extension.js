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

const GS_SCHEMA = "org.gnome.shell.extensions.current-age";
const GS_DATE_OF_BIRTH = "date-of-birth";
const ExtensionUtils = imports.misc.extensionUtils;
const GETTEXT_DOMAIN = 'current-age-extension';

const {GObject, St, Clutter} = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Mainloop = imports.mainloop;

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('Current Age Indicator'));

            this.gsettings = ExtensionUtils.getSettings(GS_SCHEMA);
            this.date_of_birth = this.gsettings.get_string(GS_DATE_OF_BIRTH);

            this.add_child(new St.Label({
                text: ((Date.now() - new Date(this.date_of_birth).getTime()) / 31536000000).toString(),
                y_align: Clutter.ActorAlign.CENTER
            }));
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
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
