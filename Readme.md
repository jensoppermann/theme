# Frontend - Anleitung und Erklärung

## Aufbau DivOps
Das Tooling ist an den TeckStack von [Kendo UI Themes Monorepo](https://github.com/telerik/kendo-themes) angelehnt, um bessere Kompatibilität zu gewährleisten.
- Als Build-Tool wird [NPM](https://www.npmjs.com/) verwendet.
- Als CSS-Framework wird das Material-Package von [Kendo UI Themes Monorepo](https://github.com/telerik/kendo-themes) verwendet.
- Als [PostCSS](https://postcss.org/)-Plugin mit 
  - [Autoprefixer](https://github.com/postcss/autoprefixer)
  - [Custom scripts](#anpassungen-an-der-kendo-ui-themes-monorepo)
- Als Javascript-Bibliothek wird [jQuery](https://jquery.com/) verwendet.
- Als Taskrunner wird [Gulp](http://gulpjs.com/) verwendet.
- Als Bundler wird [Webpack](https://webpack.js.org/) verwendet.
- Als CSS-Präprozessor wird [Sass](http://sass-lang.com/) verwendet.
- Als Linter wird [ESLint](http://eslint.org/) und [Stylelint](https://stylelint.io/) verwendet.

### Start
Wenn das Projekt geklont wurde, kann das Frontend mit folgendem Befehl im Wurzelverzeichnis "FISBOXKern\Kern\Blazor\Theme" in der Konsole installiert werden: ".\install\install.ps1"

### Build Development
Um das Frontend nur im Dev-Mode zu bauen, muss ".\npm run build:dev" ausgeführt werden.

### Build Production
Um das Frontend nur im Prod-Mode zu bauen, muss ".\npm run build:prod" ausgeführt werden. Dabei werden alle Dateien minifiziert und optimiert.

### Development & Watch
Um mit dem Frontend im Dev-Mode zu entwickeln und die Dateien automatisch neu zu bauen, muss ".\npm run watch" ausgeführt werden.

### Linting
Um die Javascript und SCSS nur zu linten, muss ".\npm run lint" ausgeführt werden.

## Entwicklung
(S)CSS-Klassen werden grundsätzlich immer in [Kebab Case](https://developer.mozilla.org/en-US/docs/Glossary/Kebab_case) geschrieben. Dies wird auch von dem Linter überwacht.

Kendo hat seinen eigenen Prefix, der mit "k-" beginnt. Eigene Klassen werden für die Fisbox immer mit "hzd" beginnen.

Modifier-Klassen werden in der Regel mit zwei Hyphen geschrieben (.ich-bin-ein--modifier). Nur hat Kendo selber aber negative Helper-Klassen (.k-top--1 {top: -1px;}), welche auch mit zwei Hyphen geschrieben werden. Dies führt zu Verwirrungen. Aus dem selbem Grund empfiehlt es sich auch nicht, Klassen in der erweiterten [BEM](https://getbem.com/)-Notation zu verwenden.

<span style="color:green">(Todo: Im Team diskutieren, wie man damit umgehen kann)</span>

Vorschlag: wir schreiben Klassen wie folgt:

```
.hzd\:ein-block\:ein-element\:ein-modifier {}
```

Dies wird dann angewendet auf das HTML-Element

```
<div class="hzd:ein-block:ein-element:ein-modifier"></div>
```

## Anpassungen an der Kendo UI Themes Monorepo
Kendo stellt eine Reihe von einzelnen funkionalen CSS-Klassen bereit, um einzelne Attribute zu überschreiben. Diese Helper-Klassen kommen hier immer als Paar vor.

Zum Beispiel

```
.k-d-block {
    display: block;
}

.\!k-d-block {
    display: block !important;
}

.k-d-inline {
    display: inline;
}

.\!k-d-inline {
    display: inline !important;
}
```
Mit Hilfe eines eigenen PostCSS-Plugins werden die Paare jeweils zu einer Klasse zusammengefasst. Warum es diese Paare seitens Kendo gibt, erschließt sich mit Hilfe umfangreichem Fachwissen nicht. Auch tiefe religiöser Meditation liefert keine Erkenntnisse &#129335;. Aber das Zusammenfassen spart einfach mal 300 KB.
```
.k-d-block, .\!k-d-block {
    display: block !important;
}

.k-d-inline, .\!k-d-inline {
    display: inline !important;
}
```

### SASS und Variablen der einzelnen Komponenten

- [SASS Variables Overview](https://www.telerik.com/kendo-angular-ui/components/styling/variables/)
- [Customization](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization/)
- [Customizing Appbar](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-appbar/)
- [Customizing Avatar](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-avatar/)
- [Customizing Badge](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-badge/)
- [Customizing Bottom-nav](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-bottom-nav/)
- [Customizing Bottom-navigation](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-bottom-navigation/)
- [Customizing Box-shadow](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-box-shadow/)
- [Customizing Breadcrumb](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-breadcrumb/)
- [Customizing Button](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-button/)
- [Customizing Captcha](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-captcha/)
- [Customizing Card](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-card/)
- [Customizing Charts](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-charts/)
- [Customizing Checkbox](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-checkbox/)
- [Customizing Chip](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-chip/)
- [Customizing Cologradient](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-cologradient/)
- [Customizing Color System](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-color-system/)
- [Customizing Coloreditor](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-coloreditor/)
- [Customizing Colorpalette](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-colorpalette/)
- [Customizing Common](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-common/)
- [Customizing Component](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-component/)
- [Customizing Dialog](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-dialog/)
- [Customizing Dock-manager](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-dock-manager/)
- [Customizing Dropdowntree](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-dropdowntree/)
- [Customizing Dropzone](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-dropzone/)
- [Customizing Editor](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-editor/)
- [Customizing Elevation](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-elevation/)
- [Customizing Expander](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-expander/)
- [Customizing Filemanager](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-filemanager/)
- [Customizing Filter](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-filter/)
- [Customizing Floating-action-button](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-floating-action-button/)
- [Customizing Floating-label](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-floating-label/)
- [Customizing Form](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-form/)
- [Customizing Grid](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-grid/)
- [Customizing Icons](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-icons/)
- [Customizing Input](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-input/)
- [Customizing List](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-list/)
- [Customizing Listbox](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-listbox/)
- [Customizing Listview](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-listview/)
- [Customizing Loader](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-loader/)
- [Customizing Loading](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-loading/)
- [Customizing Menu](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-menu/)
- [Customizing Menu-button](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-menu-button/)
- [Customizing Notification](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-notification/)
- [Customizing Pager](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-pager/)
- [Customizing Pdf-viewer](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-pdf-viewer/)
- [Customizing Picker](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-picker/)
- [Customizing Pickers](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-pickers/)
- [Customizing Popover](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-popover/)
- [Customizing Popup](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-popup/)
- [Customizing Progressbar](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-progressbar/)
- [Customizing Prompt](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-prompt/)
- [Customizing Radio](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-radio/)
- [Customizing Rating](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-rating/)
- [Customizing Scrollview](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-scrollview/)
- [Customizing Shadows](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-shadows/)
- [Customizing Skeleton](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-skeleton/)
- [Customizing Split-button](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-split-button/)
- [Customizing Switch](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-switch/)
- [Customizing Table](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-table/)
- [Customizing Tabstrip](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-tabstrip/)
- [Customizing Tilelayout](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-tilelayout/)
- [Customizing Toolbar](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-toolbar/)
- [Customizing Tooltip](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-tooltip/)
- [Customizing Treeview](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-treeview/)
- [Customizing Typography](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-typography/)
- [Customizing Upload](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-upload/)
- [Customizing Window](https://www.telerik.com/kendo-angular-ui/components/styling/theme-material/customization-window/)

