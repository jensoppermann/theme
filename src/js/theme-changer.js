let themeChanger = {
    changeCss: function(cssFileUrl) {
        let oldLink = document.getElementById("TelerikThemeLink"); // we have this id on the <link> that references the theme
        let oldHref = oldLink.getAttribute("href");
        let nonce = oldHref.includes('?') ? new URLSearchParams(oldHref.split('?')[1]).get("nonce") : '';

        // In dem Fall, dass wir in einem Unterverzeichnis laufen, bilden wir den Pfad aus
        // dem base tag der Seiten 'Server.cshtml' bzw. 'WASM.cshtml'.
        // Das '~' Zeichen wird dort jeweils serverseitig mit dem in FISBoxBlazorStart.Program.cs angegebenen
        //  app.UsePathBase(basePath) aus den FisBoxConfigurationOptions ersetzt.
        const baseHref = document.getElementsByTagName('base')[0].getAttribute('href');

        let newHref = window.location.origin + baseHref + cssFileUrl;
        if (nonce) {
            newHref += "?nonce=" + nonce; // Fügt den Nonce-Wert der neuen URL hinzu, falls vorhanden
        }

        if (newHref === oldHref) {
            return; // Verhindert das Neuladen, wenn die URL gleich bleibt
        }

        let newLink = document.createElement("link");
        newLink.setAttribute("id", "TelerikThemeLink");
        newLink.setAttribute("rel", "stylesheet");
        newLink.setAttribute("type", "text/css");
        newLink.setAttribute("href", newHref); // Setzt die neue URL mit dem möglicherweise enthaltenen Nonce-Wert

        newLink.onload = () => {
            oldLink.parentElement.removeChild(oldLink); // Entfernt den alten <link>, sobald der neue geladen ist
        };

        document.getElementsByTagName("head")[0].appendChild(newLink); // Fügt den neuen <link> zum <head> hinzu
    }
};
window.themeChanger = themeChanger;
