window.setupTreeNavClickHandler = function() {
    const navElement = document.querySelector('.js-left-tree-nav');
    if (navElement) {
        navElement.addEventListener('click', event => {
            // Find the target or its closest parent with the specified class
            let target = event.target;
            while (target && !target.classList.contains('k-treeview-leaf')) {
                if (target === navElement) {
                    // Stop the loop if we reach the container without finding the target class
                    return;
                }
                target = target.parentElement;
            }
            if (target && target.classList.contains('k-treeview-leaf')) {
                target.closest('.k-treeview-item').querySelector('.k-treeview-toggle').click();
            }
        });
    } else {
        // eslint-disable-next-line no-console
        console.error('Navigation element not found!');
    }
};
