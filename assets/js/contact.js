(function () {
  const SETTINGS_URL = '../assets/data/settings.json';
  const FORM_ENDPOINT = '../api/form_contact.php';

  async function loadSettings() {
    try {
      const res = await fetch(SETTINGS_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('Failed to load settings.json');
      return await res.json();
    } catch (err) {
      console.error('Error loading settings:', err);
      return null;
    }
  }

  function wireContactDetails(settings) {
    if (!settings) return;

    const phoneEl = document.getElementById('contactPhone');
    const whatsappEl = document.getElementById('contactWhatsApp');
    const emailEl = document.getElementById('contactEmail');
    const addressEl = document.getElementById('contactAddress');
    const mapFrame = document.getElementById('contactMapFrame');

    const phone = settings.phone || '';
    const whatsapp = settings.whatsapp || '';
    const email = settings.email || '';
    const address = settings.address || '';
    const mapUrl = settings.map_url || '';

    if (phoneEl && phone) {
      phoneEl.textContent = phone;
      phoneEl.href = 'tel:' + phone.replace(/\s+/g, '');
    }

    if (whatsappEl && whatsapp) {
      whatsappEl.textContent = whatsapp;
      const waDigits = whatsapp.replace(/\D/g, '');
      whatsappEl.href = waDigits ? 'https://wa.me/' + waDigits : '#';
    }

    if (emailEl && email) {
      emailEl.textContent = email;
      emailEl.href = 'mailto:' + email;
    }

    if (addressEl && address) {
      addressEl.textContent = address;
    }

    if (mapFrame && mapUrl) {
      mapFrame.src = mapUrl;
    }
  }

  function showStatus(message, type) {
    const statusEl = document.getElementById('contact-status');
    if (!statusEl) return;

    statusEl.textContent = message || '';
    statusEl.classList.remove('is-error', 'is-success');

    if (type === 'error') {
      statusEl.classList.add('contact-status--error');
    } else if (type === 'success') {
      statusEl.classList.add('contact-status--success');
    }
  }

  function setupForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      showStatus('', '');

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      try {
        const formData = new FormData(form);

        // Basic front-end validation
        const name = (formData.get('name') || '').toString().trim();
        const email = (formData.get('email') || '').toString().trim();
        const message = (formData.get('message') || '').toString().trim();

        if (!name || !email || !message) {
          throw new Error('Please fill in your name, email and message.');
        }

        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: formData,
        });

        // Try reading JSON, but also support plain text
        let data = null;
        let textBody = '';
        try {
          textBody = await res.text();
          data = JSON.parse(textBody);
        } catch (_) {
          // Not JSON – leave data as null, textBody may still be useful
        }

        // Decide what "success" means:
        // 1) If backend sends success flag, respect it.
        // 2) If no success flag but HTTP 200, treat as success.
        let isSuccess = false;
        let serverMessage = '';

        if (data && typeof data === 'object') {
          // success property may be boolean or string
          if (typeof data.success !== 'undefined') {
            isSuccess =
              data.success === true ||
              data.success === 'true' ||
              data.success === 1 ||
              data.success === '1';
          } else {
            // No explicit success flag; assume 200 = success
            isSuccess = res.ok;
          }
          serverMessage = data.message || '';
        } else {
          // Plain text response
          isSuccess = res.ok;
          serverMessage = textBody || '';
        }

        if (!isSuccess) {
          throw new Error(
            serverMessage || 'Something went wrong. Please try again.'
          );
        }

        // Success path
        showStatus(
          serverMessage || 'Thank you. Your message has been received.',
          'success'
        );
        form.reset();
      } catch (err) {
        console.error('Contact form error:', err);
        showStatus(err.message || 'Unable to send message.', 'error');
      } finally {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send message';
        }
      }
    });
  }

  async function init() {
    // Wire settings (contact details + map)
    const settings = await loadSettings();
    wireContactDetails(settings);

    // Form handling
    setupForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
