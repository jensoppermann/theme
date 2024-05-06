const fs = require('fs');
const semver = require('semver');
const { execSync } = require('child_process');

const packageFile = './package.json';
const lockFile = './package-lock.json';
const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

/**
 * Stellt sicher, dass die package-lock.json vorhanden ist, und führt bei Bedarf npm install aus.
 */
function ensurePackageLockExists() {
    if (!fs.existsSync(lockFile)) {
        // eslint-disable-next-line no-console
        console.log("package-lock.json fehlt, führe 'npm install --no-fund' aus...");
        execSync('npm install --no-fund', { stdio: 'inherit' });
    }
}

/**
 * Extrahiert die gesperrten Versionen aus den Abhängigkeiten im package-lock.json.
 * @param {Object} packages - Das "packages"-Objekt aus package-lock.json.
 * @returns {Object} Ein Objekt mit Paketnamen als Schlüsseln und deren gesperrten Versionen als Werte.
 */
function extractLockedVersions(packages) {
    let versions = {};
    for (const [ key, value ] of Object.entries(packages)) {
        if (key.startsWith("node_modules/")) {
            const packageName = key.substring("node_modules/".length);
            if (value.version) {
                versions[packageName] = value.version;
            }
        }
        if (value.dependencies) {
            const subVersions = extractLockedVersions(value.dependencies);
            versions = { ...versions, ...subVersions };
        }
    }
    return versions;
}

/**
 * Aktualisiert die Abhängigkeiten im package.json auf die gesperrten Versionen.
 * @param {Object} dependenciesObj - Das Abhängigkeiten-Objekt aus package.json (dependencies oder devDependencies).
 * @param {Object} lockedVersions - Ein Objekt mit Paketnamen als Schlüsseln und deren gesperrten Versionen als Werte.
 * @returns {boolean} Gibt zurück, ob Änderungen vorgenommen wurden.
 */
function updateDependencies(dependenciesObj, lockedVersions) {
    let changesMade = false;
    for (const dep in dependenciesObj) {
        const originalVersion = dependenciesObj[dep];
        const isCaret = originalVersion.startsWith('^');
        const lockedVersion = lockedVersions[dep];
        const newVersionString = `${isCaret ? '^' : ''}${lockedVersion}`;

        if (lockedVersion && originalVersion !== newVersionString) {
            // eslint-disable-next-line no-console
            console.log(`${dep}: ${originalVersion} -> ${newVersionString}`);
            dependenciesObj[dep] = newVersionString;
            changesMade = true;
        }
    }
    return changesMade;
}

/**
 * Hauptfunktion, die den Update-Prozess der Abhängigkeiten orchestriert.
 */
function main() {
    ensurePackageLockExists();
    const lockJson = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
    const lockedVersions = extractLockedVersions(lockJson.packages);

    const depsUpdated = updateDependencies(packageJson.dependencies, lockedVersions);
    const devDepsUpdated = updateDependencies(packageJson.devDependencies, lockedVersions);

    if (depsUpdated || devDepsUpdated) {
        fs.writeFileSync(packageFile, JSON.stringify(packageJson, null, 4));
        execSync('npm install --no-fund', { stdio: 'inherit' });
        // eslint-disable-next-line no-console
        console.log("Aktualisierung der package.json und package-lock.json abgeschlossen.");
    } else {
        // eslint-disable-next-line no-console
        console.log("Keine Aktualisierungen notwendig.");
    }
}

main();
