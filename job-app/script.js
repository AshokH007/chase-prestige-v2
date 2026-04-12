const routes = {
    '/': {
        title: 'Stop Missing The Right Jobs.',
        description: 'Precision-matched job discovery delivered daily at 9AM.',
        type: 'hero'
    },
    '/dashboard': {
        title: 'Dashboard',
        description: 'Daily discovery at 9AM. Filtered for precision.',
        type: 'dashboard'
    },
    '/saved': {
        title: 'Saved Jobs',
        description: 'Opportunities you want to track.',
        type: 'saved'
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

let savedJobs = JSON.parse(localStorage.getItem('savedJobs')) || [];
let currentFilters = {
    keyword: '',
    location: '',
    mode: '',
    experience: '',
    source: '',
    sort: 'latest'
};

function router() {
    const hash = window.location.hash.slice(1) || '/';
    const route = routes[hash];

    if (route) {
        renderPage(hash, route);
        updateActiveLink(hash);
    } else {
        render404();
    }
    
    navLinksContainer.classList.remove('open');
}

function renderPage(path, route) {
    let content = '';

    if (route.type === 'hero') {
        content = renderHero(route);
    } else if (path === '/dashboard') {
        content = renderDashboard();
    } else if (path === '/saved') {
        content = renderSaved();
    } else if (route.type === 'settings') {
        content = renderSettings(route);
    } else {
        content = renderEmpty(route);
    }

    appRoot.innerHTML = content;
    progressText.style.display = (path !== '/' && path !== '/proof') ? 'inline' : 'none';
    
    // Attach listeners after rendering dashboard/saved
    if (path === '/dashboard' || path === '/saved') {
        attachFilterListeners();
    }
}

function renderHero(route) {
    return `
        <section class="context-header" style="padding: 120px 0; text-align: center;">
            <div style="max-width: var(--max-content-width); margin: 0 auto; width: 100%; padding: 0 var(--space-3);">
                <h1 style="font-size: 64px; margin-bottom: 24px;">${route.title}</h1>
                <p style="font-size: 22px; color: var(--text-secondary); margin-bottom: 48px; line-height: 1.6;">${route.description}</p>
                <a href="#/settings" class="btn btn-primary" style="padding: 18px 40px; font-size: 18px;">Start Discovering</a>
            </div>
        </section>
    `;
}

function renderDashboard() {
    return `
        ${renderHeader('Dashboard', 'Daily discovery at 9AM. Filtered for precision.')}
        ${renderFilterBar()}
        <main class="workspace-container">
            <div class="primary-workspace">
                <div id="jobList" class="job-list">
                    ${renderJobList(filterJobs(jobs))}
                </div>
            </div>
            <aside class="secondary-panel">
                <h3 style="font-size: 16px; margin-bottom: 16px; font-weight: 600;">Discovery Stats</h3>
                <div style="font-size: 14px; color: var(--text-secondary);">
                    <p style="margin-bottom: 8px;">Total Active Jobs: <strong>${jobs.length}</strong></p>
                    <p style="margin-bottom: 8px;">Matches for you: <strong>${filterJobs(jobs).length}</strong></p>
                </div>
            </aside>
        </main>
    `;
}

function renderSaved() {
    const savedList = jobs.filter(j => savedJobs.includes(j.id));
    
    if (savedList.length === 0) {
        return `
            ${renderHeader('Saved Jobs', 'Opportunities you want to track.')}
            <main class="workspace-container">
                <div class="primary-workspace">
                    <div class="card" style="border-style: dashed; padding: 80px; text-align: center; opacity: 0.7;">
                        <h2 style="font-family: var(--font-heading); margin-bottom: 16px;">Your list is empty</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 24px;">Browse the dashboard to find and save interesting roles.</p>
                        <a href="#/dashboard" class="btn btn-primary">Browse Jobs</a>
                    </div>
                </div>
            </main>
        `;
    }

    return `
        ${renderHeader('Saved Jobs', 'Your curated list of tracked opportunities.')}
        <main class="workspace-container">
            <div class="primary-workspace">
                <div class="job-list">
                    ${renderJobList(savedList)}
                </div>
            </div>
            <aside class="secondary-panel">
                <h3 style="font-size: 16px; margin-bottom: 16px; font-weight: 600;">Status</h3>
                <p style="font-size: 14px; color: var(--text-secondary);">Saving a job keeps it here for easy access even if you refresh or switch browsers.</p>
            </aside>
        </main>
    `;
}

function renderFilterBar() {
    return `
        <div class="filter-bar">
            <div class="filter-group">
                <input type="text" id="keywordSearch" class="filter-input" placeholder="Search keywords..." value="${currentFilters.keyword}">
            </div>
            <select id="locationFilter" class="filter-select">
                <option value="">All Locations</option>
                <option value="Bangalore" ${currentFilters.location === 'Bangalore' ? 'selected' : ''}>Bangalore</option>
                <option value="Hyderabad" ${currentFilters.location === 'Hyderabad' ? 'selected' : ''}>Hyderabad</option>
                <option value="Mumbai" ${currentFilters.location === 'Mumbai' ? 'selected' : ''}>Mumbai</option>
                <option value="Noida" ${currentFilters.location === 'Noida' ? 'selected' : ''}>Noida</option>
                <option value="Remote" ${currentFilters.location === 'Remote' ? 'selected' : ''}>Remote Only</option>
            </select>
            <select id="modeFilter" class="filter-select">
                <option value="">All Modes</option>
                <option value="Onsite" ${currentFilters.mode === 'Onsite' ? 'selected' : ''}>Onsite</option>
                <option value="Remote" ${currentFilters.mode === 'Remote' ? 'selected' : ''}>Remote</option>
                <option value="Hybrid" ${currentFilters.mode === 'Hybrid' ? 'selected' : ''}>Hybrid</option>
            </select>
            <select id="expFilter" class="filter-select">
                <option value="">Experience</option>
                <option value="Fresher" ${currentFilters.experience === 'Fresher' ? 'selected' : ''}>Fresher</option>
                <option value="0-1" ${currentFilters.experience === '0-1' ? 'selected' : ''}>0–1 Year</option>
                <option value="1-3" ${currentFilters.experience === '1-3' ? 'selected' : ''}>1–3 Years</option>
                <option value="3-5" ${currentFilters.experience === '3-5' ? 'selected' : ''}>3–5 Years</option>
            </select>
            <select id="sortFilter" class="filter-select">
                <option value="latest" ${currentFilters.sort === 'latest' ? 'selected' : ''}>Latest First</option>
                <option value="oldest" ${currentFilters.sort === 'oldest' ? 'selected' : ''}>Oldest First</option>
            </select>
        </div>
    `;
}

function filterJobs(jobArray) {
    let filtered = jobArray.filter(job => {
        const matchesKeyword = job.title.toLowerCase().includes(currentFilters.keyword.toLowerCase()) || 
                               job.company.toLowerCase().includes(currentFilters.keyword.toLowerCase());
        const matchesLocation = !currentFilters.location || job.location === currentFilters.location;
        const matchesMode = !currentFilters.mode || job.mode === currentFilters.mode;
        const matchesExp = !currentFilters.experience || job.experience === currentFilters.experience;
        
        return matchesKeyword && matchesLocation && matchesMode && matchesExp;
    });

    if (currentFilters.sort === 'latest') {
        filtered.sort((a,b) => a.postedDaysAgo - b.postedDaysAgo);
    } else {
        filtered.sort((a,b) => b.postedDaysAgo - a.postedDaysAgo);
    }

    return filtered;
}

function renderJobList(filteredJobs) {
    if (filteredJobs.length === 0) {
        return `<div class="card" style="padding: 40px; text-align: center; color: var(--text-secondary);">No jobs match your search.</div>`;
    }

    return filteredJobs.map(job => `
        <div class="job-card">
            <div class="job-info">
                <h3>${job.title}</h3>
                <div style="font-weight: 500; margin-bottom: 4px;">${job.company}</div>
                <div class="job-meta">
                    <span>📍 ${job.location} (${job.mode})</span>
                    <span class="job-badge">💼 ${job.experience}</span>
                    <span class="job-badge">💰 ${job.salaryRange}</span>
                    <span class="job-source">${job.source}</span>
                    <span>🕒 ${job.postedDaysAgo === 0 ? 'Today' : job.postedDaysAgo + ' days ago'}</span>
                </div>
            </div>
            <div class="job-actions">
                <button onclick="handleView('${job.id}')" class="btn btn-secondary" style="padding: 8px 16px;">View</button>
                <button onclick="handleSave('${job.id}')" class="btn btn-secondary" style="padding: 8px 16px; border-color: ${savedJobs.includes(job.id) ? 'var(--accent-color)' : ''}; color: ${savedJobs.includes(job.id) ? 'var(--accent-color)' : ''}">
                    ${savedJobs.includes(job.id) ? 'Saved' : 'Save'}
                </button>
                <a href="${job.applyUrl}" target="_blank" class="btn btn-primary" style="padding: 8px 16px; text-align: center; text-decoration: none;">Apply</a>
            </div>
        </div>
    `).join('');
}

function handleSave(id) {
    if (savedJobs.includes(id)) {
        savedJobs = savedJobs.filter(jid => jid !== id);
    } else {
        savedJobs.push(id);
    }
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
    router(); // Re-render current page
}

function handleView(id) {
    const job = jobs.find(j => j.id === id);
    if (!job) return;

    const modalRoot = document.getElementById('modal-root');
    modalRoot.innerHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <button class="modal-close" onclick="closeModal()">&times;</button>
                <h2 style="font-family: var(--font-heading); font-size: 32px; margin-bottom: 8px;">${job.title}</h2>
                <div style="font-size: 18px; margin-bottom: 24px; color: var(--accent-color); font-weight: 600;">${job.company}</div>
                
                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Requirements & Skills</h3>
                <div class="modal-skills">
                    ${job.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
                </div>

                <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; margin-top: 24px;">Job Description</h3>
                <p style="line-height: 1.7; color: var(--text-secondary);">${job.description}</p>
                
                <div style="margin-top: 40px; display: flex; gap: 16px;">
                    <a href="${job.applyUrl}" target="_blank" class="btn btn-primary" style="flex: 1; text-align: center; text-decoration: none; padding: 14px;">Apply External</a>
                    <button class="btn btn-secondary" style="flex: 1;" onclick="handleSave('${job.id}'); closeModal();">
                        ${savedJobs.includes(job.id) ? 'Remove From Saved' : 'Save Job'}
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal-root').innerHTML = '';
    document.body.style.overflow = 'auto';
}

function attachFilterListeners() {
    const keywordInput = document.getElementById('keywordSearch');
    const locationSelect = document.getElementById('locationFilter');
    const modeSelect = document.getElementById('modeFilter');
    const expSelect = document.getElementById('expFilter');
    const sortSelect = document.getElementById('sortFilter');

    if (keywordInput) {
        keywordInput.addEventListener('input', (e) => {
            currentFilters.keyword = e.target.value;
            updateDashboard();
        });
    }
    if (locationSelect) {
        locationSelect.addEventListener('change', (e) => {
            currentFilters.location = e.target.value;
            updateDashboard();
        });
    }
    if (modeSelect) {
        modeSelect.addEventListener('change', (e) => {
            currentFilters.mode = e.target.value;
            updateDashboard();
        });
    }
    if (expSelect) {
        expSelect.addEventListener('change', (e) => {
            currentFilters.experience = e.target.value;
            updateDashboard();
        });
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentFilters.sort = e.target.value;
            updateDashboard();
        });
    }
}

function updateDashboard() {
    const jobList = document.getElementById('jobList');
    if (jobList) {
        jobList.innerHTML = renderJobList(filterJobs(jobs));
    }
}
// Helper functions for settings and empty states
function renderSettings(route) {
    return `
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
                    <div class="settings-grid">
                        <div class="input-group">
                            <label>Mode</label>
                            <select>
                                <option>Remote</option>
                                <option>Hybrid</option>
                                <option>Onsite</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Experience Level</label>
                            <select>
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
}

function renderEmpty(route) {
    return `
        ${renderHeader(route.title, route.description)}
        <main class="workspace-container">
            <div class="primary-workspace">
                <div class="card" style="border-style: dashed; padding: 64px; text-align: center; opacity: 0.7;">
                    <p style="color: var(--text-secondary);">${route.description}</p>
                </div>
            </div>
            <aside class="secondary-panel">
                <h3 style="font-size: 16px; margin-bottom: 16px; font-weight: 600;">Status</h3>
                <p style="font-size: 14px; color: var(--text-secondary);">This view is in a placeholder state. Functional components will be integrated soon.</p>
            </aside>
        </main>
    `;
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


