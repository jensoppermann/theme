const autoprefixer = require("autoprefixer");
const chalk = require("chalk");
const { exec } = require("child_process");
const del = require("del");
const gulp = require("gulp");
const eslint = require("gulp-eslint-new");
const header = require("gulp-header");
const log = require("fancy-log");
const merge = require('merge-stream');
const path = require("path");
const plumber = require('gulp-plumber');
const postcss = require("gulp-postcss");
const sass = require("gulp-sass")(require("node-sass"));
const sourcemaps = require("gulp-sourcemaps");
const through2 = require('through2');
const webpackConfig = require("./webpack.config.js");
const webpackStream = require("webpack-stream");
const isProduction = process.env.NODE_ENV === "production";
const packageJsonPath = path.join(
    __dirname,
    "node_modules",
    "@progress",
    "kendo-theme-material",
    "package.json"
);
const version = require(packageJsonPath).version;

const distPath = isProduction
    ? "../FISBoxBlazorStart/wwwroot/" // production
    : "../FISBoxBlazorStart/wwwroot/"; // development

const paths = {
    src: {
        scss: "./src/scss/**/*.scss",
        js: "./src/js/**/*.js",
        fonts: "./src/fonts/**/*.*",
        imgs: "./src/imgs/**/*.*",
    },
    dist: {
        css: `${distPath}css`,
        js: `${distPath}js`,
        fonts: `${distPath}fonts`,
        imgs: `${distPath}imgs`,
    },
};

const notifications = {
    kendo: `Kendo UI Theme Version: ${version}`,
    mode: `Mode: ${process.env.NODE_ENV}`,
};

log(`${notifications.kendo} `);
log(notifications.mode);

/**
 * Filtert Paare von CSS-Regeln, um sicherzustellen, dass !important-Regeln korrekt behandelt werden.
 * @returns {Function} Ein PostCSS-Plugin, das für jede CSS-Regel im Root ausgeführt wird.
 */
function filterNonImportantPairs() {
    return (root) => {
        const selectorMap = new Map();

        root.walkRules(rule => {
            // Entferne den Escape-Charakter und das Ausrufezeichen, um den normalen Selektor zu erhalten
            const normalSelector = rule.selector.replace(/\.\\!/g, ".");
            const isImportant = rule.selector.startsWith(".\\!");

            if (isImportant) {
                // Wenn es eine korrespondierende normale Regel gibt
                if (selectorMap.has(normalSelector)) {
                    const normalRule = selectorMap.get(normalSelector);
                    // Füge den !important Selektor zum normalen Selektor hinzu
                    normalRule.selector = `${normalRule.selector}, ${rule.selector}`;
                    // Aktualisiere Deklarationen in der normalen Regel, um sie als !important zu markieren
                    rule.walkDecls(decl => {
                        const existingDecl = normalRule.nodes.find(node => node.prop === decl.prop);
                        if (existingDecl) {
                            existingDecl.important = true;
                            existingDecl.value = decl.value;
                        } else {
                            // Wenn keine vorhandene Deklaration gefunden wurde, füge eine neue hinzu, inklusive !important
                            normalRule.append({ prop: decl.prop, value: decl.value, important: true });
                        }
                    });
                    // Entferne die ursprüngliche !important Regel
                    rule.remove();
                } else {
                    // Behandlung für den Fall, dass keine korrespondierende normale Regel vorhanden ist (sollte theoretisch nicht vorkommen)
                    selectorMap.set(normalSelector, rule);
                }
            } else {
                // Für normale Regeln, füge sie hinzu, wenn nicht bereits vorhanden
                if (!selectorMap.has(normalSelector)) {
                    selectorMap.set(normalSelector, rule);
                }
            }
        });
    };
}

/**
 * Erstellt eine Funktion zur Ersetzung der Platzhalter für Layer-Namen im CSS-Inhalt.
 * @param {string} name - Der Name des Layers, der ersetzt werden soll.
 * @returns {Function} Eine Funktion, die den CSS-Inhalt als Parameter nimmt und die Ersetzungen durchführt.
 */
function replaceLayer(name) {
    return function(content) {
        const regexStart = new RegExp(`\\.layer-${name}\\s*\\{\\s*flex:\\s*start\\s*;?\\s*\\}`, 'g');
        const regexEnd = new RegExp(`\\.layer-${name}\\s*\\{\\s*flex:\\s*end\\s*;?\\s*\\}`, 'g');

        let modifiedContent = content.replace(regexStart, `@layer ${name} {`);
        modifiedContent = modifiedContent.replace(regexEnd, '}');

        return modifiedContent;
    };
}

/**
 * Erstellt ein durch2-Objekt-Stream zur Ersetzung von Layer-Platzhaltern im CSS-Inhalt.
 * @returns {Stream} Ein durch2-Stream, der die Layer-Platzhalter im Buffer-Inhalt ersetzt.
 */
function replaceLayerPlaceholders() {
    return through2.obj(function(file, _, callback) {
        if (file.isBuffer()) {
            let content = file.contents.toString();

            // Verwende die separate Funktion für die Ersetzungen
            content = replaceLayer('framework')(content);
            content = replaceLayer('custom')(content);

            file.contents = Buffer.from(content);
        }
        callback(null, file);
    });
}

/**
 * Führt eine Stilanalyse auf den SCSS-Dateien aus und zeigt die Ergebnisse in der Konsole an.
 * @param {Function} done - Eine Callback-Funktion, die das Ende der Task signalisiert.
 */
function lintStyles(done) {
    const configPath = path.join(__dirname, "stylelintrc.json");
    const stylelintCommand = `npx stylelint "${paths.src.scss}" --config "${configPath}"`;

    exec(stylelintCommand, { cwd: __dirname }, (error, stdout, stderr) => {
        if (error) {
            log(chalk.red(`exec error: ${error}`));
            return done(error);
        }
        if (stderr) {
            log(chalk.red(`stderr: ${stderr}`));
        }
        log(chalk.green(`stdout:\n${stdout}`));
        done();
    });
}

/**
 * Lint JavaScript-Dateien mit ESLint und zeigt Formatierungsfehler oder -warnungen.
 * @returns {Stream} Ein Stream, der die linting-Prozesse für JS-Dateien durchführt.
 */
function lintJs() {
    return gulp
        .src(paths.src.js)
        .pipe(eslint())
        .pipe(eslint.format('stylish'))
        .pipe(eslint.failAfterError());
}

/**
 * Kompiliert SCSS zu CSS, führt PostCSS-Plugins aus und speichert das Ergebnis.
 * @returns {Stream} Ein Stream, der die Kompilierung und Verarbeitung von SCSS-Dateien durchführt.
 */
function scssTask() {
    return gulp
        .src(paths.src.scss)
        .pipe(plumber({
            errorHandler: function(err) {
                log(chalk.red(`Error caught in PostCSS plugin:: ${err}`));
                this.emit('end'); // Dies signalisiert Gulp, dass die Task trotz des Fehlers als "beendet" betrachtet wird
            }
        }))
        //.pipe(sourcemaps.init())
        .pipe(
            sass({ outputStyle: isProduction ? "compressed" : "expanded",
                indentType: "space",
                indentWidth: 4 }).on(
                "error",
                sass.logError
            )
        )
        .pipe(replaceLayerPlaceholders())
        .pipe(postcss([ autoprefixer(), filterNonImportantPairs() ]))
        .pipe(header(`/* ${notifications.kendo} */\n/* ${notifications.mode} */\n`))
        //.pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.dist.css));
}

/**
 * Kompiliert und bündelt JavaScript-Dateien mit Webpack.
 * Nutzt die Konfiguration aus `webpack.config.js` und schreibt die Ausgabe in das Zielverzeichnis.
 * @returns {Stream} Ein Stream, der die Webpack-Kompilierung und das Schreiben der Ausgabedateien durchführt.
 */
function jsTask() {
    return gulp
        .src(paths.src.js)
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest(paths.dist.js));
}

/**
 * Kopiert Schriftarten von einem Quellverzeichnis in ein Zielverzeichnis.
 * @returns {Stream} Ein Stream, der die Schriftarten kopiert.
 */
function copyFonts() {
    const customFonts = gulp.src(paths.src.fonts)
        .pipe(gulp.dest(paths.dist.fonts));

    const kendoFont = gulp.src('node_modules/@progress/kendo-font-icons/dist/kendo-font-icons.ttf', { base: 'node_modules/@progress/kendo-font-icons/dist' })
        .pipe(gulp.dest(paths.dist.fonts));

    return merge(customFonts, kendoFont);
}

/**
 * Kopiert Bilder von einem Quellverzeichnis in ein Zielverzeichnis.
 * @returns {Stream} Ein Stream, der die Bilder kopiert.
 */
function copyImages() {
    log(chalk.blue("Copying images"));
    return gulp
        .src(paths.src.imgs)
        .pipe(
            gulp.dest(paths.dist.imgs)
        );
}

/**
 * Löscht Dateien im Zielverzeichnis, ausgenommen bestimmte Verzeichnisse oder Dateien.
 * @returns {Promise} Ein Promise, das erfüllt wird, wenn die Löschung abgeschlossen ist.
 */
function clean() {
    const pathToClean = isProduction ? distPath.prod : distPath.dev;

    return del([
        `${pathToClean}**/*`,
        `!${pathToClean}/lib/**`,
        `!${pathToClean}/lib`,
        `!${pathToClean}/FISBoxBlazor.styles.css`
    ], { force: true });
}

function watchTask() {
    gulp.watch(paths.src.scss, gulp.series(/*lintStyles,*/ scssTask));
    gulp.watch(paths.src.js, gulp.series(lintJs, jsTask));
    gulp.watch(paths.src.fonts, copyFonts);
    gulp.watch(paths.src.imgs, copyImages);
}
gulp.task(
    "watch",
    gulp.series(
        clean,
        gulp.parallel(/*lintStyles,*/ lintJs, scssTask, jsTask, copyFonts, copyImages),
        watchTask
    )
);

gulp.task(
    "dev",
    gulp.series(
        clean,
        gulp.parallel(/*lintStyles,*/ lintJs, scssTask, jsTask, copyFonts, copyImages)
    )
);

gulp.task(
    "prod",
    gulp.series(
        clean,
        gulp.parallel(scssTask, jsTask, copyFonts, copyImages)
    )
);

gulp.task(
    "lint",
    gulp.series(
        gulp.parallel(lintStyles, lintJs)
    )
);
