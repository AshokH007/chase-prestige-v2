const routes = {
    '/': {
        title: 'Welcome',
        description: 'Establish the core parameters for your automated job board oversight.',
        showProgress: false
    },
    '/dashboard': {
        title: 'Dashboard',
        description: 'This section will be built in the next step.',
        showProgress: true
    },
    '/saved': {
        title: 'Saved Jobs',
        description: 'This section will be built in the next step.',
        showProgress: true
    },
    '/digest': {
        title: 'Weekly Digest',
        description: 'This section will be built in the next step.',
        showProgress: true
    },
    '/settings': {
        title: 'Settings',
        description: 'This section will be built in the next step.',
        showProgress: true
    },
    '/proof': {
        title: 'Proof & Progress',
        description: 'This section will be built in the next step.',
        showProgress: true
    }
};

const appRoot = document.getElementById('app-root');
const navLinks = document.querySelectorAll('.nav-link');
const menuToggle = document.getElementById('menuToggle');
const navLinksContainer = document.getElementById('navLinks');
const progressText = document.getElementById('progressText');
const statusBadge = document.getElementById('statusBadge');

function router() {
    const path = window.location.hash.slice(1) || '/';
    const route = routes[path];

    if (route) {
        renderPage(route.title, route.description, route.showProgress);
        updateActiveLink(path);
    } else {
        render404();
    }
    
    // Auto-close mobile menu on navigation
    navLinksContainer.classList.remove('open');
}

function renderPage(title, description, showProgress) {
    appRoot.innerHTML = `
        <section class="context-header">
            <div style="max-width: 1440px; margin: 0 auto; width: 100%;">
                <h1 style="font-size: 40px; margin-bottom: 8px;">${title}</h1>
                <p style="color: var(--text-secondary); margin-bottom: 0;">${description}</p>
            </div>
        </section>
        <main class="workspace-container">
            <div class="primary-workspace">
                <div class="card" style="border-style: dashed; opacity: 0.6;">
                    <div style="text-align: center; padding: 64px;">
                        <p style="color: var(--text-secondary);">The ${title} interface is currently under construction.</p>
                    </div>
                </div>
            </div>
            <aside class="secondary-panel">
                <h3 style="font-size: 18px; margin-bottom: 16px; font-family: var(--font-body); font-weight: 600;">Information</h3>
                <p style="font-size: 15px; color: var(--text-secondary);">Please return in the next stage of development to see the functional components of this page.</p>
            </aside>
        </main>
    `;
    
    progressText.style.display = showProgress ? 'inline' : 'none';
}

function render404() {
    appRoot.innerHTML = `
        <section class="context-header">
            <div style="max-width: 1440px; margin: 0 auto; width: 100%;">
                <h1 style="font-size: 40px; margin-bottom: 8px;">Page Not Found</h1>
                <p style="color: var(--text-secondary); margin-bottom: 0;">The page you are looking for does not exist.</p>
            </div>
        </section>
        <main class="workspace-container" style="display: block; text-align: center; padding: 64px;">
            <a href="#/" class="btn btn-primary">Return Home</a>
        </main>
    `;
    progressText.style.display = 'none';
    updateActiveLink(null);
}

function updateActiveLink(path) {
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${path}`);
    });
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

menuToggle.addEventListener('click', () => {
    navLinksContainer.classList.toggle('open');
});
