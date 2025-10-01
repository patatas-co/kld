<?php
require_once __DIR__ . '/session.php';

$user = getAuthenticatedUser();
$navUsername = $user['username'] ?? ($user['email'] ?? null);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Details | ConnectEd</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="org-details.css">
    <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-16x16.png">
    <link rel="manifest" href="images/site.webmanifest">
</head>
<body class="org-details-page">
    <header id="header">
        <nav>
            <div class="nav-brand">
                <div class="logo">
                    <img src="images/logo.png" alt="Logo" class="logo-img" />
                    <span class="logo-text">ConnectEd</span>
                </div>
                <div class="breadcrumbs" aria-label="Breadcrumb">
                    <ol>
                        <li><a href="index.php#home">Home</a></li>
                        <li><a href="index.php#organization">Organizations</a></li>
                        <li aria-current="page">Details</li>
                    </ol>
                </div>
            </div>
            <?php if ($user): ?>
                <div class="nav-auth nav-auth--dropdown">
                    <button class="nav-user-toggle" type="button" aria-expanded="false">
                        <span class="nav-username">Hello, <?php echo htmlspecialchars($navUsername ?? 'Member', ENT_QUOTES, 'UTF-8'); ?></span>
                        <span class="nav-user-caret" aria-hidden="true"></span>
                    </button>
                    <div class="nav-user-menu" role="menu">
                        <a href="application-status.php" class="nav-user-action" role="menuitem">Status of Application</a>
                        <a href="logout.php" class="nav-user-action" role="menuitem">Log Out</a>
                    </div>
                </div>
            <?php else: ?>
                <a href="user-login.html" class="cta-btn">Join Now</a>
            <?php endif; ?>
        </nav>
    </header>
    <main class="org-details">
        <section class="hero">
            <div class="hero-content">
                <span class="hero-eyebrow">ConnectEd Organization</span>
                <h1 id="orgName"></h1>
                <p class="hero-tagline" id="orgTagline"></p>
                <p class="hero-summary" id="orgSummary"></p>
                <div class="hero-actions">
                    <a href="#" class="primary-btn" id="applyLink" target="_blank" rel="noopener">Apply Now</a>
                    <a href="index.php#organization" class="ghost-btn">Back to directory</a>
                </div>
                <div class="hero-stats">
                    <div class="stat">
                        <span class="stat-value" id="orgStatMembers">Active</span>
                        <span class="stat-label">Member Network</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value" id="orgStatPrograms">Programs</span>
                        <span class="stat-label">Annual Initiatives</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value" id="orgStatImpact">Reach</span>
                        <span class="stat-label">Community Touchpoints</span>
                    </div>
                </div>
            </div>
            <aside class="hero-media">
                <div class="media-frame">
                    <img src="" alt="Organization" class="hero-image" id="orgImage">
                </div>
            </aside>
        </section>

        <section class="org-overview">
            <div class="section-heading">
                <span class="section-eyebrow">Overview</span>
                <h2>What the organization is all about</h2>
            </div>
            <p class="overview-text" id="orgAbout"></p>
        </section>

        <section class="org-highlights">
            <div class="section-heading">
                <span class="section-eyebrow">Highlights</span>
                <h2>How it elevates student life</h2>
            </div>
            <div class="highlight-grid">
                <article class="highlight-card">
                    <h3>Signature Programs</h3>
                    <p>Collaborate on flagship events, learning labs, and cross-campus campaigns that shape the ConnectEd experience.</p>
                </article>
                <article class="highlight-card">
                    <h3>Guided Growth</h3>
                    <p>Receive mentorship from upper-year leaders, faculty advisers, and alumni who share actionable insights.</p>
                </article>
                <article class="highlight-card">
                    <h3>Community Impact</h3>
                    <p>Extend your influence beyond classrooms by delivering programs that support partner communities and schools.</p>
                </article>
            </div>
        </section>

        <section class="org-achievements">
            <div class="section-heading">
                <span class="section-eyebrow">Milestones</span>
                <h2>Recent achievements</h2>
            </div>
            <div class="achievement-layout">
                <div class="achievement-media">
                    <img id="achievementImage" alt="Highlighted achievement">
                </div>
                <div class="achievement-details">
                    <h3 id="achievementTitle"></h3>
                    <p id="achievementDescription"></p>
                    <button class="achievement-toggle" id="achievementToggle" type="button" aria-expanded="false">
                        View full milestone list
                    </button>
                    <ul id="orgAchievements" class="achievement-list is-collapsed"></ul>
                </div>
            </div>
        </section>

        <section class="org-involvement">
            <div class="section-heading">
                <span class="section-eyebrow">Get Involved</span>
                <h2>Ways to contribute this semester</h2>
            </div>
            <div class="involvement-grid">
                <article class="involvement-card">
                    <h3>Join a project squad</h3>
                    <p>Support active campaigns by taking on roles in logistics, programming, or communications.</p>
                </article>
                <article class="involvement-card">
                    <h3>Lead a workshop</h3>
                    <p>Share your expertise through peer-led sessions that build skills across the student community.</p>
                </article>
                <article class="involvement-card">
                    <h3>Partner with peers</h3>
                    <p>Collaborate with other organizations to co-host events that expand the reach of your initiatives.</p>
                </article>
            </div>
        </section>

        <section class="org-related">
            <div class="section-heading">
                <span class="section-eyebrow">More to explore</span>
                <h2>Discover other organizations</h2>
            </div>
            <div class="related-grid" id="relatedOrganizations"></div>
            <button class="related-toggle" id="relatedToggle" type="button" aria-expanded="false">View more</button>
        </section>

        <section class="org-faq" id="faq">
            <div class="section-heading">
                <span class="section-eyebrow">Support</span>
                <h2>Frequently Asked Questions</h2>
            </div>
            <div class="faq-list" role="list">
                <article class="faq-item is-open" role="listitem">
                    <button class="faq-question" type="button" aria-expanded="true">
                        <span>Who is eligible to participate in the referrals program?</span>
                        <span class="faq-icon" aria-hidden="true"></span>
                    </button>
                    <div class="faq-answer">
                        <p>Only subscribers on paid plans are eligible to refer someone else.</p>
                    </div>
                </article>
                <article class="faq-item" role="listitem">
                    <button class="faq-question" type="button" aria-expanded="false">
                        <span>Can I be referred by multiple people? Can I change who referred me?</span>
                        <span class="faq-icon" aria-hidden="true"></span>
                    </button>
                    <div class="faq-answer" hidden>
                        <p>Each member can list a single referrer. Contact support if you need to update your referral before completing registration.</p>
                    </div>
                </article>
                <article class="faq-item" role="listitem">
                    <button class="faq-question" type="button" aria-expanded="false">
                        <span>How do I know that I received my referral bonus? Where do I see this?</span>
                        <span class="faq-icon" aria-hidden="true"></span>
                    </button>
                    <div class="faq-answer" hidden>
                        <p>You will receive an email confirmation and can track the bonus under your member dashboard within 48 hours of approval.</p>
                    </div>
                </article>
                <article class="faq-item" role="listitem">
                    <button class="faq-question" type="button" aria-expanded="false">
                        <span>I referred a friend, why haven’t I gotten the bonus credits yet?</span>
                        <span class="faq-icon" aria-hidden="true"></span>
                    </button>
                    <div class="faq-answer" hidden>
                        <p>Bonuses post once your referral completes their onboarding. Reach out to the ConnectEd team if more than five business days have passed.</p>
                    </div>
                </article>
            </div>
        </section>
    </main>

    <footer class="site-footer">
        <div class="footer-inner">
            <div class="footer-branding">
                <img src="images/logo.png" alt="ConnectEd logo" class="footer-logo" />
                <div>
                    <p class="footer-title">ConnectEd</p>
                    <p class="footer-tagline">Where students and organizations grow together.</p>
                </div>
            </div>
            <div class="footer-links">
                <div class="footer-column">
                    <h3>Explore</h3>
                    <ul>
                        <li><a href="index.php#home">Home</a></li>
                        <li><a href="index.php#organization">Organizations</a></li>
                        <li><a href="application-status.php">Application Status</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Support</h3>
                    <ul>
                        <li><a href="#faq">FAQs</a></li>
                        <li><a href="mailto:support@connected.edu">Contact Us</a></li>
                        <li><a href="privacy.php">Privacy Policy</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Connect</h3>
                    <ul class="footer-social">
                        <li><a href="https://www.facebook.com" target="_blank" rel="noopener">Facebook</a></li>
                        <li><a href="https://www.instagram.com" target="_blank" rel="noopener">Instagram</a></li>
                        <li><a href="https://www.linkedin.com" target="_blank" rel="noopener">LinkedIn</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-meta">
            <p>&copy; <?php echo date('Y'); ?> ConnectEd. All rights reserved.</p>
        </div>
    </footer>

    <script src="nav-dropdown.js"></script>
    <script src="org-data.js"></script>
    <script src="org-details.js"></script>
</body>
</html>
