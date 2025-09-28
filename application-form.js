(function () {
    const form = document.getElementById('applicationForm');
    if (!form) {
        return;
    }

    const storageKey = `applicationFormDraft:${form.dataset.org || 'general'}`;
    const fields = {
        name: form.querySelector('[name="name"]'),
        email: form.querySelector('[name="email"]'),
        message: form.querySelector('[name="message"]'),
        contribution: form.querySelector('[name="contribution"]'),
    };
    const submitButton = form.querySelector('.auth-submit');
    const feedbackEl = document.getElementById('applicationFeedback');
    const headingEl = document.getElementById('applyHeading');
    const orgIdentifier = form.dataset.org || 'general';
    const orgLabel = headingEl ? headingEl.textContent.replace(/^Apply to Organization:?\s*/i, '').trim() || orgIdentifier : orgIdentifier;
    const logoSource = form.dataset.logo || 'images/logo.png';
    let logoDataUrlLoaded = false;
    let logoDataUrlCache = null;

    function isFieldEligible(field) {
        return field && typeof field.value === 'string';
    }

    function loadDraft() {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) {
                return;
            }
            const draft = JSON.parse(raw);
            Object.entries(fields).forEach(([key, field]) => {
                if (!isFieldEligible(field)) {
                    return;
                }
                if (Object.prototype.hasOwnProperty.call(draft, key) && draft[key] !== undefined) {
                    field.value = draft[key];
                }
            });
        } catch (error) {
            console.warn('Unable to load saved application draft.', error);
        }
    }

    function saveDraft() {
        const draft = {};
        Object.entries(fields).forEach(([key, field]) => {
            if (isFieldEligible(field)) {
                draft[key] = field.value;
            }
        });
        try {
            localStorage.setItem(storageKey, JSON.stringify(draft));
        } catch (error) {
            console.warn('Unable to save application draft.', error);
        }
    }

    function clearDraft() {
        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.warn('Unable to clear application draft.', error);
        }
    }

    function setLoading(isLoading) {
        if (!submitButton) {
            return;
        }

        submitButton.disabled = isLoading;
        submitButton.classList.toggle('is-loading', isLoading);

        if (isLoading) {
            submitButton.dataset.originalText = submitButton.textContent;
            submitButton.textContent = 'Submitting…';
        } else if (submitButton.dataset.originalText) {
            submitButton.textContent = submitButton.dataset.originalText;
            delete submitButton.dataset.originalText;
        }
    }

    function showFeedback(message, type = 'success') {
        if (!feedbackEl) {
            return;
        }

        feedbackEl.textContent = message;
        feedbackEl.classList.remove('success', 'error', 'show');
        feedbackEl.classList.add(type, 'show');
        feedbackEl.hidden = false;
    }

    function clearFeedback() {
        if (!feedbackEl) {
            return;
        }

        feedbackEl.classList.remove('success', 'error', 'show');
        feedbackEl.hidden = true;
        feedbackEl.textContent = '';
    }

    function sanitizeForFilename(value) {
        return (value || 'application')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || 'application';
    }

    function buildDownloadContent(details, timestamp = new Date()) {
        const lines = [
            'ConnectEd Application Submission',
            `Organization: ${orgLabel || 'General'}`,
        ];

        lines.push(`Submitted on: ${timestamp.toLocaleString()}`);
        lines.push('');
        lines.push('Applicant Details');
        lines.push(`Full name: ${details.name || '—'}`);
        lines.push(`Email address: ${details.email || '—'}`);
        lines.push(`Contribution interest: ${details.contribution || '—'}`);
        lines.push('');
        lines.push('Motivation');
        lines.push(details.message ? details.message : '—');
        lines.push('');
        lines.push('Thank you for submitting your application to ConnectEd.');

        return lines.join('\r\n');
    }

    function downloadAsText(details, timestamp = new Date()) {
        const content = buildDownloadContent(details, timestamp);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        const slug = sanitizeForFilename(orgIdentifier);
        anchor.href = url;
        anchor.download = `application-${slug}-${timestamp.getTime()}.txt`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    }

    async function getLogoDataUrl() {
        if (logoDataUrlLoaded) {
            return logoDataUrlCache;
        }

        logoDataUrlLoaded = true;

        try {
            const response = await fetch(logoSource, { cache: 'force-cache' });
            if (!response.ok) {
                throw new Error(`Logo fetch failed with status ${response.status}`);
            }
            const blob = await response.blob();
            logoDataUrlCache = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Unable to decode logo blob.'));
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.warn('Unable to load logo for PDF export.', error);
            logoDataUrlCache = null;
        }

        return logoDataUrlCache;
    }

    async function downloadApplicationCopy(details) {
        const pdfLib = window.jspdf;
        const slug = sanitizeForFilename(orgIdentifier);

        const timestamp = new Date();

        if (!pdfLib || typeof pdfLib.jsPDF !== 'function') {
            downloadAsText(details, timestamp);
            return;
        }

        const { jsPDF } = pdfLib;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageSize = doc.internal.pageSize;
        const marginX = 48;
        const contentWidth = pageSize.getWidth() - marginX * 2;
        let cursorY = 96;

        doc.setDrawColor(210, 215, 223);
        doc.setTextColor(28, 30, 38);

        const logoDataUrl = await getLogoDataUrl();
        const hasLogo = Boolean(logoDataUrl);

        if (hasLogo) {
            const watermarkSize = Math.min(pageSize.getWidth(), pageSize.getHeight()) * 0.55;
            const watermarkX = (pageSize.getWidth() - watermarkSize) / 2;
            const watermarkY = (pageSize.getHeight() - watermarkSize) / 2;

            let resetOpacity = null;
            if (typeof doc.GState === 'function' && typeof doc.setGState === 'function') {
                const previousState = doc.GState({ opacity: 1 });
                resetOpacity = previousState;
                const translucentState = doc.GState({ opacity: 0.2 });
                doc.setGState(translucentState);
                doc.addImage(logoDataUrl, 'PNG', watermarkX, watermarkY, watermarkSize, watermarkSize, undefined, 'FAST');
                doc.setGState(previousState);
            } else {
                doc.addImage(logoDataUrl, 'PNG', watermarkX, watermarkY, watermarkSize, watermarkSize, undefined, 'NONE', 0);
            }
        }

        let titleX = marginX;
        const logoWidth = hasLogo ? 70 : 0;
        const logoHeight = hasLogo ? 70 : 0;

        let headerTop = cursorY - 20;
        if (hasLogo) {
            headerTop = cursorY - logoHeight / 2;
            doc.addImage(logoDataUrl, 'PNG', marginX, headerTop, logoWidth, logoHeight);
            titleX = marginX + logoWidth + 20;
        }

        const titleBaseline = headerTop + (hasLogo ? logoHeight * 0.42 : 16);
        const subtitleBaseline = titleBaseline + 18;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('ConnectEd Application Summary', titleX, titleBaseline);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(80, 82, 94);
        doc.text('Thank you for submitting your application. Keep this copy for your records.', titleX, subtitleBaseline);

        cursorY = headerTop + (hasLogo ? logoHeight : 28);
        cursorY += hasLogo ? 28 : 16;
        doc.setTextColor(28, 30, 38);
        doc.text(`Organization: ${orgLabel || 'General'}`, marginX, cursorY);
        cursorY += 16;
        doc.text(`Submitted on: ${timestamp.toLocaleString()}`, marginX, cursorY);
        cursorY += 24;

        // Applicant information table
        const tableLabelWidth = 150;
        const tableValueWidth = contentWidth - tableLabelWidth;
        const rows = [
            ['Full name', details.name || '—'],
            ['Email address', details.email || '—'],
            ['Contribution interest', details.contribution || '—'],
            ['Organization', orgLabel || '—'],
        ];

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text('Applicant Details', marginX, cursorY);
        cursorY += 14;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);

        rows.forEach(([label, value]) => {
            const wrappedValue = doc.splitTextToSize(value || '—', tableValueWidth - 16);
            const rowHeight = Math.max(28, wrappedValue.length * 14 + 12);

            doc.setFillColor(240, 248, 255);
            doc.rect(marginX, cursorY, tableLabelWidth, rowHeight, 'FD');
            doc.setFillColor(255, 255, 255);
            doc.rect(marginX + tableLabelWidth, cursorY, tableValueWidth, rowHeight, 'FD');

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(33, 37, 41);
            doc.text(label, marginX + 8, cursorY + 18);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60, 63, 70);
            wrappedValue.forEach((line, index) => {
                doc.text(line, marginX + tableLabelWidth + 8, cursorY + 18 + index * 14);
            });

            cursorY += rowHeight;
        });

        cursorY += 24;

        // Motivation section
        const motivation = details.message || '—';
        const motivationLines = doc.splitTextToSize(motivation, contentWidth - 16);
        const motivationHeight = Math.max(60, motivationLines.length * 14 + 28);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(28, 30, 38);
        doc.text('Motivation', marginX, cursorY);
        cursorY += 10;

        doc.setDrawColor(210, 215, 223);
        doc.setFillColor(255, 255, 255);
        doc.rect(marginX, cursorY, contentWidth, motivationHeight, 'S');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(60, 63, 70);
        motivationLines.forEach((line, index) => {
            doc.text(line, marginX + 8, cursorY + 20 + index * 14);
        });

        cursorY += motivationHeight + 30;

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.setTextColor(110, 115, 125);
        doc.text('This PDF was generated by the ConnectEd application portal.', marginX, cursorY);
        doc.text('If you have questions, contact the Student Services Office.', marginX, cursorY + 14);

        doc.save(`application-${slug}-${timestamp.getTime()}.pdf`);
    }

    Object.values(fields)
        .filter(isFieldEligible)
        .forEach(field => {
            const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
            field.addEventListener(eventName, saveDraft);
        });

    form.addEventListener('submit', async event => {
        event.preventDefault();

        if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
            return;
        }

        clearFeedback();

        const MIN_WORDS = 30;
        const MIN_ALPHA_WORDS = 10;
        const submission = {};
        Object.entries(fields).forEach(([key, field]) => {
            if (isFieldEligible(field)) {
                submission[key] = field.value.trim();
            }
        });
        submission.org = orgLabel;

        const words = submission.message ? submission.message.trim().split(/[\s]+/) : [];
        const realWords = words.filter(word => /[a-zA-Z]{2,}/.test(word));

        if (words.length < MIN_WORDS || realWords.length < MIN_ALPHA_WORDS) {
            showFeedback(`Tell us more! Please share at least ${MIN_WORDS} meaningful words about why you want to join.`, 'error');
            fields.message?.focus();
            return;
        }

        const formData = new FormData(form);

        setLoading(true);

        try {
            const response = await fetch(form.action || window.location.href, {
                method: (form.method || 'post').toUpperCase(),
                body: formData,
            });

            const data = await response.json().catch(() => null);

            if (!response.ok || !data || data.status !== 'success') {
                const message = data?.message || 'We could not submit your application right now. Please try again later.';
                throw new Error(message);
            }

            showFeedback(data.message || 'Your application has been submitted successfully!', 'success');
            clearDraft();

            if (window.confirm('Would you like to download a copy of your submitted application?')) {
                await downloadApplicationCopy(submission);
            }

            form.reset();
        } catch (error) {
            showFeedback(error.message || 'We encountered an unexpected error. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    });

    loadDraft();
})();
