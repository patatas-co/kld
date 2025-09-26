(function () {
    const storageKey = 'connectedUsers';
    const activeUserKey = 'connectedActiveUser';

    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const toggleButtons = document.querySelectorAll('.toggle-btn, .inline-link[data-target]');
    const passwordToggleButtons = document.querySelectorAll('.password-toggle');
    const feedbackEl = document.getElementById('authFeedback');

    function loadUsers() {
        try {
            const stored = localStorage.getItem(storageKey);
            if (!stored) return [];
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
            console.error('Failed to parse stored users', err);
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(storageKey, JSON.stringify(users));
    }

    function setActiveUser(user, persist) {
        const store = persist ? localStorage : sessionStorage;
        store.setItem(activeUserKey, JSON.stringify({
            fullName: user.fullName,
            email: user.email,
            studentId: user.studentId || null,
            loginAt: new Date().toISOString()
        }));
    }

    function showFeedback(message, type = 'success') {
        if (!feedbackEl) return;
        feedbackEl.textContent = message;
        feedbackEl.classList.remove('success', 'error', 'show');
        feedbackEl.classList.add(type, 'show');
        feedbackEl.hidden = false;
    }

    function clearFeedback() {
        if (!feedbackEl) return;
        feedbackEl.classList.remove('success', 'error', 'show');
        feedbackEl.hidden = true;
        feedbackEl.textContent = '';
    }

    function switchForm(target) {
        clearFeedback();
        const showSignIn = target === 'signin';

        toggleButtons.forEach(btn => {
            if (btn.classList.contains('toggle-btn')) {
                btn.classList.toggle('active', btn.dataset.target === target);
                btn.setAttribute('aria-selected', btn.dataset.target === target ? 'true' : 'false');
            }
        });

        signInForm.classList.toggle('active', showSignIn);
        signUpForm.classList.toggle('active', !showSignIn);
    }

    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            if (!target) return;
            switchForm(target);
        });
    });

    passwordToggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            if (!targetId) return;
            const input = document.getElementById(targetId);
            if (!input) return;

            const isHidden = input.type === 'password';
            input.type = isHidden ? 'text' : 'password';

            btn.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
            btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
            const textSpan = btn.querySelector('.toggle-text');
            if (textSpan) {
                textSpan.textContent = isHidden ? 'Hide' : 'Show';
            }
        });
    });

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function trimValue(input) {
        return input ? input.trim() : '';
    }

    signUpForm?.addEventListener('submit', event => {
        event.preventDefault();
        clearFeedback();

        const fullName = trimValue(signUpForm.fullName.value);
        const studentId = trimValue(signUpForm.studentId.value);
        const email = trimValue(signUpForm.email.value).toLowerCase();
        const password = signUpForm.password.value || '';
        const confirmPassword = signUpForm.confirmPassword.value || '';

        if (fullName.length < 3) {
            showFeedback('Please enter your full name (at least 3 characters).', 'error');
            signUpForm.fullName.focus();
            return;
        }

        if (!validateEmail(email)) {
            showFeedback('Enter a valid email address.', 'error');
            signUpForm.email.focus();
            return;
        }

        if (password.length < 8) {
            showFeedback('Password must be at least 8 characters long.', 'error');
            signUpForm.password.focus();
            return;
        }

        if (password !== confirmPassword) {
            showFeedback('Passwords do not match. Please re-type them.', 'error');
            signUpForm.confirmPassword.focus();
            return;
        }

        const users = loadUsers();
        const duplicate = users.find(user => user.email === email);
        if (duplicate) {
            showFeedback('An account with that email already exists. Try signing in instead.', 'error');
            switchForm('signin');
            signInForm.email.value = email;
            signInForm.password.focus();
            return;
        }

        users.push({ fullName, studentId, email, password });
        saveUsers(users);

        signUpForm.reset();
        showFeedback('Account created successfully! You can now sign in.', 'success');
        switchForm('signin');
        signInForm.email.value = email;
        signInForm.password.focus();
    });

    signInForm?.addEventListener('submit', event => {
        event.preventDefault();
        clearFeedback();

        const email = trimValue(signInForm.email.value).toLowerCase();
        const password = signInForm.password.value || '';
        const remember = signInForm.remember.checked;

        if (!validateEmail(email)) {
            showFeedback('Enter a valid email address.', 'error');
            signInForm.email.focus();
            return;
        }

        if (!password) {
            showFeedback('Please enter your password.', 'error');
            signInForm.password.focus();
            return;
        }

        const users = loadUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            showFeedback('Incorrect email or password. Please try again.', 'error');
            signInForm.password.focus();
            return;
        }

        setActiveUser(user, remember);
        showFeedback('Welcome back! Redirecting you to the homepage…', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1200);
    });
})();
