# Displays your age in real time

## Great source of motivation according to terror management theory 😈

![in-action](https://github.com/yatxone/thanatophobia/raw/main/gif/preview.gif)

## Install:

### From GNOME Extensions

https://extensions.gnome.org/extension/4425/thanatophobia

### Manually:

```shell
git clone https://github.com/botelho-io/thanatophobia.git
mv thanatophobia thanatophobia@yatx.one
sudo rm -r $XDG_DATA_HOME/gnome-shell/extensions/thanatophobia@yatx.one/
glib-compile-schemas thanatophobia@yatx.one/schemas
gnome-extensions pack --force ./thanatophobia@yatx.one
sudo gnome-extensions uninstall thanatophobia@yatx.one
sudo gnome-extensions install --force ./thanatophobia@yatx.one.shell-extension.zip
thanatophobia@yatx.one/wayland.sh > thanatophobia@yatx.one/log.txt
```

You might need to log out for the extension to be listed.

## Settings:

The following can be configured from the settings menu:
+ Select the date and time of your birth.
+ Select your birth sex and the country where you live.
+ Click `Recalculate` to automatically fetch life expectancy from the WHO.
+ Select a display mode.
  + Count up from your birth, giving you your age.
  + Count down from your life expectancy, giving you the number of years until your expected death.
+ Select a number of digits to display, the higher this number is the more precision you get, but it also consumes more resources.