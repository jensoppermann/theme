// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Fokussiert ein Element anhand des übergebenen CSS-Selectors.
function BlazorFocusElement(cssSelector) {
    let elem = document.querySelector(cssSelector);
    if (elem !== null) {
        elem.focus();
    }
}
window.BlazorFocusElement = BlazorFocusElement;

//gibt "true" zurück, wenn das übergebene Element oder einer seinen Kindern focus haben
function SetFocusToElement(element) {
    element.focus();
}
window.SetFocusToElement = SetFocusToElement;

//focusiert das übergebene Element
function HasFocusOrChild(element) {
    return element.matches(':focus-within');
}
window.HasFocusOrChild = HasFocusOrChild;

function BeforeUnloadHandler(event) {
    // Recommended
    event.preventDefault();
    // Included for legacy support, e.g. Chrome/Edge < 119
    event.returnValue = true;
}
window.onbeforeunload = BeforeUnloadHandler;