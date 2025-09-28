(function () {
    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const toggleButtons = document.querySelectorAll('.toggle-btn, .inline-link[data-target]');
    const passwordToggleButtons = document.querySelectorAll('.password-toggle');
    const feedbackEl = document.getElementById('authFeedback');

    const endpoints = {
        register: 'register.php',
        login: 'login.php',
    };

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
            if (!btn.classList.contains('toggle-btn')) {
                return;
            }

            const isActive = btn.dataset.target === target;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
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

    const allowedEmailDomain = '@kld.edu.ph';

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isSchoolEmail(email) {
        return email.endsWith(allowedEmailDomain);
    }

    function trimValue(input) {
        return input ? input.trim() : '';
    }

    function setLoading(form, isLoading) {
        const button = form.querySelector('.auth-submit');
        if (!button) return;
        button.disabled = isLoading;
        button.classList.toggle('is-loading', isLoading);
        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.textContent = 'Please wait…';
        } else if (button.dataset.originalText) {
            button.textContent = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }

    async function submitForm(url, formData) {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json().catch(() => ({
            status: 'error',
            message: 'Server returned an invalid response. Please try again.',
        }));

        if (!response.ok || data.status !== 'success') {
            throw new Error(data.message || 'An unexpected error occurred.');
        }

        return data;
    }

    signUpForm?.addEventListener('submit', async event => {
        event.preventDefault();
        clearFeedback();

        const username = trimValue(signUpForm.username.value);
        const email = trimValue(signUpForm.email.value).toLowerCase();
        const password = signUpForm.password.value || '';
        const confirmPassword = signUpForm.confirmPassword.value || '';

        if (username.length < 3) {
            showFeedback('Username must be at least 3 characters long.', 'error');
            signUpForm.username.focus();
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

        const payload = new FormData();
        payload.set('username', username);
        payload.set('email', email);
        payload.set('password', password);
        payload.set('confirmPassword', confirmPassword);

        setLoading(signUpForm, true);

        try {
            const data = await submitForm(endpoints.register, payload);
            showFeedback(data.message || 'Account created successfully! You can now sign in.', 'success');
            signUpForm.reset();
            switchForm('signin');
            if (signInForm) {
                signInForm.email.value = email;
                signInForm.password.focus();
            }
        } catch (error) {
            showFeedback(error.message, 'error');
        } finally {
            setLoading(signUpForm, false);
        }
    });

    signInForm?.addEventListener('submit', async event => {
        event.preventDefault();
        clearFeedback();

        const email = trimValue(signInForm.email.value).toLowerCase();
        const password = signInForm.password.value || '';
        const remember = !!signInForm.remember?.checked;

        if (!validateEmail(email)) {
            showFeedback('Enter a valid email address.', 'error');
            signInForm.email.focus();
            return;
        }

        if (!isSchoolEmail(email)) {
            showFeedback(`Only school email addresses (${allowedEmailDomain}) are allowed.`, 'error');
            signInForm.email.focus();
            return;
        }

        if (!password) {
            showFeedback('Please enter your password.', 'error');
            signInForm.password.focus();
            return;
        }

        const payload = new FormData();
        payload.set('email', email);
        payload.set('password', password);
        payload.set('remember', remember ? 'true' : 'false');

        setLoading(signInForm, true);

        try {
            const data = await submitForm(endpoints.login, payload);
            showFeedback(data.message || 'Login successful. Redirecting…', 'success');

            setTimeout(() => {
                window.location.href = 'index.php';
            }, 1000);
        } catch (error) {
            showFeedback(error.message, 'error');
            signInForm.password.focus();
        } finally {
            setLoading(signInForm, false);
        }
    });

})();
