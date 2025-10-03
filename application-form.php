<?php
require_once __DIR__ . '/session.php';

$user = getAuthenticatedUser();
$org = isset($_GET['org']) ? trim($_GET['org']) : null;
$orgSafe = $org ? htmlspecialchars($org, ENT_QUOTES, 'UTF-8') : null;
$containerClasses = 'auth-container auth-container--single';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Organization Application | ConnectEd</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="auth.css">
    <link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="images/favicon-16x16.png">
    <link rel="manifest" href="images/site.webmanifest">
</head>
<body class="auth-page">
    <header id="header" class="auth-header">
        <nav>
            <div class="nav-brand">
                <div class="logo">
                    <a href="index.php" class="logo-link">
                        <img src="images/logo.png" alt="ConnectEd logo" class="logo-img" />
                        <span class="logo-text">ConnectEd</span>
                    </a>
                </div>
                <div class="breadcrumbs auth-breadcrumbs" aria-label="Breadcrumb">
                    <ol>
                        <li><a href="index.php#home">Home</a></li>
                        <li><a href="index.php#organization">Organizations</a></li>
                        <li aria-current="page">Apply</li>
                    </ol>
                </div>
            </div>
            <?php if ($user): ?>
                <div class="nav-auth nav-auth--dropdown">
                    <button class="nav-user-toggle" type="button" aria-expanded="false">
                        <span class="nav-username">Hello, <?php echo htmlspecialchars($user['username'] ?? $user['email'], ENT_QUOTES, 'UTF-8'); ?></span>
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

    <main class="auth-main" aria-labelledby="applyHeading">
        <div class="<?php echo $containerClasses; ?>">
            <section class="auth-card" aria-live="polite">
                <?php if (!$user): ?>
                    <h1 id="applyHeading">Application Restricted</h1>
                    <div class="form-feedback show error" role="alert">
                        You must register or log in before applying.
                    </div>
                    <p class="auth-meta">
                        <a href="user-login.html" class="text-link">Go to the sign in / sign up page</a>
                    </p>
                <?php else: ?>
                    <h1 id="applyHeading">Apply to Organization<?php echo $orgSafe ? ': ' . $orgSafe : ''; ?></h1>
                    <p>Complete the form below to submit your application. A confirmation will be sent to your registered email.</p>
                    <form id="applicationForm" class="auth-form active" method="post" action="submit-application.php" data-org="<?php echo $orgSafe ?: 'general'; ?>" data-logo="images/logo.png">
                        <input type="hidden" name="org" value="<?php echo $orgSafe ?: ''; ?>">
                        <div class="form-group">
                            <label for="applicantName">Full name</label>
                            <input type="text" id="applicantName" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="applicantEmail">Email address</label>
                            <input type="email" id="applicantEmail" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="applicantMessage">Why do you want to join?</label>
                            <textarea id="applicantMessage" name="message" rows="5" placeholder="Share your motivations and relevant experiences" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="applicantContribution">Which area are you most interested in contributing to?</label>
                            <select id="applicantContribution" name="contribution" required>
                                <option value="" disabled selected>Select one option</option>
                                <option value="events">Planning and running events</option>
                                <option value="communications">Communications and social media outreach</option>
                                <option value="finance">Budgeting and finance support</option>
                                <option value="membership">Member engagement and onboarding</option>
                            </select>
                        </div>
                        <button type="submit" class="auth-submit">Submit application</button>
                    </form>
                    <div class="form-feedback" id="applicationFeedback" role="alert" hidden></div>
                <?php endif; ?>
            </section>
        </div>
    </main>

    <footer class="auth-footer">
        <p>&copy; 2024 ConnectEd. Empowering student success through collaboration.</p>
    </footer>

    <script src="nav-dropdown.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="application-form.js"></script>
</body>
</html>
