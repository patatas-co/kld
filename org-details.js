(function () {
    const orgData = window.organizationData || {};

    const params = new URLSearchParams(window.location.search);
    const orgId = params.get('org');
    const organization = orgId ? orgData[orgId.toLowerCase()] : null;

    const orgNameEl = document.getElementById('orgName');
    const orgTaglineEl = document.getElementById('orgTagline');
    const orgSummaryEl = document.getElementById('orgSummary');
    const orgAboutEl = document.getElementById('orgAbout');
    const orgImageEl = document.getElementById('orgImage');
    const orgAchievementsList = document.getElementById('orgAchievements');
    const achievementImageEl = document.getElementById('achievementImage');
    const achievementTitleEl = document.getElementById('achievementTitle');
    const achievementDescriptionEl = document.getElementById('achievementDescription');
    const achievementToggle = document.getElementById('achievementToggle');
    const ACHIEVEMENT_VISIBLE_COUNT = 3;
    const applyLinkEl = document.getElementById('applyLink');
    const relatedGrid = document.getElementById('relatedOrganizations');
    const relatedToggle = document.getElementById('relatedToggle');
    const RELATED_VISIBLE_COUNT = 3;
    const statMembersEl = document.getElementById('orgStatMembers');
    const statProgramsEl = document.getElementById('orgStatPrograms');
    const statImpactEl = document.getElementById('orgStatImpact');

    if (!organization) {
        document.title = 'Organization Not Found | ConnectEd';
        if (orgNameEl) {
            orgNameEl.textContent = 'Organization not found';
        }
        if (orgSummaryEl) {
            orgSummaryEl.textContent = 'We couldn\'t find the organization you were looking for. Please go back and choose another organization.';
        }
        if (orgAboutEl) {
            orgAboutEl.textContent = '';
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
    if (orgSummaryEl) orgSummaryEl.textContent = organization.summary || organization.description || '';
    if (orgAboutEl) orgAboutEl.textContent = organization.about || organization.description || '';
    if (orgImageEl) {
        orgImageEl.src = organization.image;
        orgImageEl.alt = organization.name;
    }

    if (statMembersEl) {
        statMembersEl.textContent = organization.stats && organization.stats.members ? organization.stats.members : '—';
    }

    if (statProgramsEl) {
        statProgramsEl.textContent = organization.stats && organization.stats.programs ? organization.stats.programs : '—';
    }

    if (statImpactEl) {
        statImpactEl.textContent = organization.stats && organization.stats.impact ? organization.stats.impact : '—';
    }

    if (applyLinkEl) {
        const applyHref = organization.applyLink && organization.applyLink !== '#' ? organization.applyLink : 'mailto:info@connected.edu.ph?subject=Application%20Inquiry%20-%20' + encodeURIComponent(organization.name);
        applyLinkEl.href = applyHref;
    }

    if (orgAchievementsList) {
        orgAchievementsList.innerHTML = '';
        const achievements = organization.achievements || [];
        achievements.forEach((achievement, index) => {
            const li = document.createElement('li');
            li.textContent = achievement;
            if (index >= ACHIEVEMENT_VISIBLE_COUNT) {
                li.classList.add('is-collapsed');
            }
            orgAchievementsList.appendChild(li);
        });

        if (achievementImageEl && organization.featuredAchievement) {
            achievementImageEl.src = organization.featuredAchievement.image;
            achievementImageEl.alt = organization.featuredAchievement.title || 'Featured achievement';
        }

        if (achievementTitleEl && organization.featuredAchievement) {
            achievementTitleEl.textContent = organization.featuredAchievement.title || 'Highlighted milestone';
        }

        if (achievementDescriptionEl && organization.featuredAchievement) {
            achievementDescriptionEl.textContent = organization.featuredAchievement.description || '';
        }

        if (achievementToggle) {
            if (achievements.length <= ACHIEVEMENT_VISIBLE_COUNT) {
                achievementToggle.hidden = true;
                orgAchievementsList.classList.remove('is-collapsed');
            } else {
                achievementToggle.hidden = false;
                achievementToggle.addEventListener('click', () => {
                    const expanded = achievementToggle.getAttribute('aria-expanded') === 'true';
                    const items = orgAchievementsList.querySelectorAll('li');

                    if (expanded) {
                        achievementToggle.setAttribute('aria-expanded', 'false');
                        achievementToggle.textContent = 'View full milestone list';
                        items.forEach((item, index) => {
                            if (index >= ACHIEVEMENT_VISIBLE_COUNT) {
                                item.classList.add('is-collapsed');
                            }
                        });
                        orgAchievementsList.classList.add('is-collapsed');
                    } else {
                        achievementToggle.setAttribute('aria-expanded', 'true');
                        achievementToggle.textContent = 'Hide milestone list';
                        items.forEach((item) => item.classList.remove('is-collapsed'));
                        orgAchievementsList.classList.remove('is-collapsed');
                    }
                });
            }
        }
    }

    if (relatedGrid) {
        relatedGrid.innerHTML = '';
        const relatedEntries = Object.entries(orgData).filter(([key]) => key !== orgId.toLowerCase());

        relatedEntries.forEach(([key, org], index) => {
            const card = document.createElement('a');
            card.href = `org-details.html?org=${encodeURIComponent(key)}`;
            card.className = 'related-card';

            if (index >= RELATED_VISIBLE_COUNT) {
                card.classList.add('is-collapsed');
                card.setAttribute('aria-hidden', 'true');
            }

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

        if (relatedToggle) {
            if (relatedEntries.length <= RELATED_VISIBLE_COUNT) {
                relatedToggle.hidden = true;
            } else {
                relatedToggle.hidden = false;
                relatedToggle.addEventListener('click', () => {
                    const expanded = relatedToggle.getAttribute('aria-expanded') === 'true';
                    const cards = relatedGrid.querySelectorAll('.related-card');

                    if (expanded) {
                        relatedToggle.setAttribute('aria-expanded', 'false');
                        relatedToggle.textContent = 'View more organizations';
                        cards.forEach((card, index) => {
                            if (index >= RELATED_VISIBLE_COUNT) {
                                card.classList.add('is-collapsed');
                                card.setAttribute('aria-hidden', 'true');
                            }
                        });
                    } else {
                        relatedToggle.setAttribute('aria-expanded', 'true');
                        relatedToggle.textContent = 'Show fewer organizations';
                        cards.forEach((card, index) => {
                            if (index >= RELATED_VISIBLE_COUNT) {
                                card.classList.remove('is-collapsed');
                                card.removeAttribute('aria-hidden');
                            }
                        });
                    }
                });
            }
        }
    }
})();
