(function () {
    const containers = document.querySelectorAll('.nav-auth--dropdown');
    if (!containers.length) {
        return;
    }

    const closeOthers = (current) => {
        containers.forEach((container) => {
            if (container !== current) {
                container.classList.remove('is-open');
                const toggle = container.querySelector('.nav-user-toggle');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    };

    containers.forEach((container) => {
        const toggle = container.querySelector('.nav-user-toggle');
        if (!toggle) {
            return;
        }

        toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = container.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (isOpen) {
                closeOthers(container);
            }
        });

        container.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                container.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    });

    document.addEventListener('click', (event) => {
        containers.forEach((container) => {
            if (!container.contains(event.target)) {
                container.classList.remove('is-open');
                const toggle = container.querySelector('.nav-user-toggle');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
})();
