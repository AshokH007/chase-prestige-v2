const routes = {
    '/': {
        title: 'Stop Missing The Right Jobs.',
        description: 'Precision-matched job discovery delivered daily at 9AM.',
        type: 'hero'
    },
    '/dashboard': {
        title: 'Dashboard',
        description: 'No jobs yet. In the next step, you will load a realistic dataset.',
        type: 'empty'
    },
    '/saved': {
        title: 'Saved Jobs',
        description: 'Your curated list of opportunities. No data yet.',
        type: 'empty'
    },
    '/digest': {
        title: 'Weekly Digest',
        description: 'Premium daily summary features will be available here soon.',
        type: 'empty'
    },
    '/settings': {
        title: 'Job Preferences',
        description: 'Define your search parameters to receive tailored notifications.',
        type: 'settings'
    },
    '/proof': {
        title: 'Proof & Progress',
        description: 'Placeholder page for artifact collection.',
        type: 'plain'
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
        renderPage(path, route);
        updateActiveLink(path);
    } else {
        render404();
    }
    
    navLinksContainer.classList.remove('open');
}

function renderPage(path, route) {
    let content = '';

    if (route.type === 'hero') {
        content = `
            <section class="context-header" style="padding: 80px 0; text-align: center;">
                <div style="max-width: var(--max-content-width); margin: 0 auto; width: 100%; padding: 0 var(--space-3);">
                    <h1 style="font-size: 56px; margin-bottom: 24px;">${route.title}</h1>
                    <p style="font-size: 20px; color: var(--text-secondary); margin-bottom: 40px; line-height: 1.6;">${route.description}</p>
                    <a href="#/settings" class="btn btn-primary" style="padding: 16px 32px; font-size: 17px;">Start Tracking</a>
                </div>
            </section>
        `;
    } else if (route.type === 'settings') {
        content = `
            ${renderHeader(route.title, route.description)}
            <main class="workspace-container">
                <div class="primary-workspace">
                    <div class="card">
                        <div class="input-group">
                            <label>Role Keywords</label>
                            <input type="text" placeholder="e.g. Senior Frontend Engineer, Staff Designer">
                        </div>
                        <div class="input-group">
                            <label>Preferred Locations</label>
                            <input type="text" placeholder="e.g. New York, London, Remote">
                        </div>
                        <div class="input-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                            <div>
                                <label>Mode</label>
                                <select style="width: 100%;">
                                    <option>Remote</option>
                                    <option>Hybrid</option>
                                    <option>Onsite</option>
                                </select>
                            </div>
                            <div>
                                <label>Experience Level</label>
                                <select style="width: 100%;">
                                    <option>Junior</option>
                                    <option>Mid-level</option>
                                    <option>Senior</option>
                                    <option>Lead / Staff</option>
                                </select>
                            </div>
                        </div>
                        <button class="btn btn-primary" style="margin-top: var(--space-3);">Save Preferences</button>
                    </div>
                </div>
                <aside class="secondary-panel">
                    <h3 style="font-size: 16px; margin-bottom: 16px; font-weight: 600;">Preference Logic</h3>
                    <p style="font-size: 14px; color: var(--text-secondary);">These settings determine the matching algorithm's accuracy. Be as specific as possible with keywords.</p>
                </aside>
            </main>
        `;
    } else {
        content = `
            ${renderHeader(route.title, route.description)}
            <main class="workspace-container">
                <div class="primary-workspace">
                    <div class="card" style="border-style: dashed; padding: 64px; text-align: center; opacity: 0.7;">
                        <p style="color: var(--text-secondary);">${route.description}</p>
                    </div>
                </div>
                <aside class="secondary-panel">
                    <h3 style="font-size: 16px; margin-bottom: 16px; font-weight: 600;">Status</h3>
                    <p style="font-size: 14px; color: var(--text-secondary);">This view is in a placeholder state. Functional components will be integrated in the next development cycle.</p>
                </aside>
            </main>
        `;
    }

    appRoot.innerHTML = content;
    progressText.style.display = (path !== '/' && path !== '/proof' && path !== '/') ? 'inline' : 'none';
}

function renderHeader(title, description) {
    return `
        <section class="context-header">
            <div style="max-width: 1440px; margin: 0 auto; width: 100%;">
                <h1 style="font-size: 32px; margin-bottom: 8px;">${title}</h1>
                <p style="color: var(--text-secondary); margin-bottom: 0;">${description}</p>
            </div>
        </section>
    `;
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

