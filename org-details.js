(function () {
    const orgData = window.organizationData || {};

    const params = new URLSearchParams(window.location.search);
    const orgId = params.get('org');
    const organization = orgId ? orgData[orgId.toLowerCase()] : null;

    const orgNameEl = document.getElementById('orgName');
    const orgTaglineEl = document.getElementById('orgTagline');
    const orgDescriptionEl = document.getElementById('orgDescription');
    const orgImageEl = document.getElementById('orgImage');
    const orgAchievementsList = document.getElementById('orgAchievements');
    const applyLinkEl = document.getElementById('applyLink');
    const relatedGrid = document.getElementById('relatedOrganizations');

    if (!organization) {
        document.title = 'Organization Not Found | ConnectEd';
        if (orgNameEl) {
            orgNameEl.textContent = 'Organization not found';
        }
        if (orgDescriptionEl) {
            orgDescriptionEl.textContent = 'We couldn\'t find the organization you were looking for. Please go back and choose another organization.';
        }
        if (orgTaglineEl) {
            orgTaglineEl.textContent = '';
        }
        if (orgImageEl) {
            orgImageEl.classList.add('hidden');
        }
        if (orgAchievementsList) {
            orgAchievementsList.innerHTML = '';
        }
        return;
    }

    document.title = `${organization.name} | ConnectEd`;

    if (orgNameEl) orgNameEl.textContent = organization.name;
    if (orgTaglineEl) orgTaglineEl.textContent = organization.tagline;
    if (orgDescriptionEl) orgDescriptionEl.textContent = organization.description;
    if (orgImageEl) {
        orgImageEl.src = organization.image;
        orgImageEl.alt = organization.name;
    }

    if (applyLinkEl) {
        const applyHref = organization.applyLink && organization.applyLink !== '#' ? organization.applyLink : 'mailto:info@connected.edu.ph?subject=Application%20Inquiry%20-%20' + encodeURIComponent(organization.name);
        applyLinkEl.href = applyHref;
    }

    if (orgAchievementsList) {
        orgAchievementsList.innerHTML = '';
        (organization.achievements || []).forEach((achievement) => {
            const li = document.createElement('li');
            li.textContent = achievement;
            orgAchievementsList.appendChild(li);
        });
    }

    if (relatedGrid) {
        relatedGrid.innerHTML = '';
        Object.entries(orgData).forEach(([key, org]) => {
            if (key === orgId.toLowerCase()) return;

            const card = document.createElement('a');
            card.href = `org-details.html?org=${encodeURIComponent(key)}`;
            card.className = 'related-card';

            card.innerHTML = `
                <div class="related-media">
                    <img src="${org.image}" alt="${org.name}" />
                </div>
                <div class="related-content">
                    <h3>${org.name}</h3>
                    <p>${org.tagline}</p>
                </div>
            `;
            relatedGrid.appendChild(card);
        });
    }
})();
