/**
 * Scrollt zu dem Element, das mit `.k-selected` innerhalb des gegebenen Baums markiert ist, nach einer kurzen Verzögerung.
 * @param {string} treeSelector - CSS-Selektor, der den Baum spezifiziert, in dem das Element gesucht wird.
 */
function scrollToItem(treeSelector) {
    setTimeout(function() {
        const item = document.querySelector(treeSelector + " .k-selected");
        if (item) {
            item.scrollIntoView();
            item.focus();
        }
    }, 300);
}
window.scrollToItem = scrollToItem;
