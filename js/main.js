// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
  var emailListForm = document.getElementById('emailListForm');
  var contactForm = document.getElementById('contactForm');
  var emailListStatus = document.getElementById('emailListStatus');
  var contactStatus = document.getElementById('contactStatus');

  function setStatus(el, message, state) {
    if (!el) { return; }
    el.textContent = message;
    el.classList.remove('is-success', 'is-error');
    if (state) { el.classList.add(state); }
  }

  function submitNetlifyForm(form, statusEl, onSuccess) {
    var submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; }
    setStatus(statusEl, 'Sending...', '');

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    }).then(function(response) {
      if (!response.ok) { throw new Error('Network response was not ok'); }
      if (onSuccess) { onSuccess(); }
      setStatus(statusEl, 'Thanks! Your submission is confirmed.', 'is-success');
    }).catch(function() {
      setStatus(statusEl, 'Submitting...', '');
      form.submit();
    });
  }

  if (emailListForm) {
    emailListForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var emailField = emailListForm.querySelector('input[type=email]');
      if (!emailField || !emailField.value.includes('@')) {
        if (emailField) { emailField.style.borderColor = '#C8202F'; emailField.focus(); }
        return;
      }
      submitNetlifyForm(emailListForm, emailListStatus, function() {
        setStatus(emailListStatus, 'Thanks for signing up! You are on the email list.', 'is-success');
        emailListForm.querySelectorAll('input, button').forEach(function(i) { i.disabled = true; });
      });
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var email = contactForm.querySelector('input[type=email]');
      var msg = contactForm.querySelector('textarea');
      if (!email || !email.value.includes('@')) { email.style.borderColor = '#C8202F'; email.focus(); return; }
      if (!msg || !msg.value.trim()) { msg.style.borderColor = '#C8202F'; msg.focus(); return; }
      submitNetlifyForm(contactForm, contactStatus, function() {
        var cfBtn = document.getElementById('cfBtn');
        if (cfBtn) {
          cfBtn.textContent = 'Message Sent — We\'ll be in touch!';
          cfBtn.style.background = '#2d7a3a';
          cfBtn.disabled = true;
        }
        contactForm.querySelectorAll('input, select, textarea').forEach(function(i) { i.disabled = true; });
      });
    });
  }

  // Endorsement Form Handler
  var endorseForm = document.getElementById('endorseForm');
  var endorseStatus = document.getElementById('endorseStatus');
  if (endorseForm) {
    endorseForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = endorseForm.querySelector('input[name="full-name"]');
      var email = endorseForm.querySelector('input[type=email]');
      if (!name || !name.value.trim()) { name.style.borderColor = '#C8202F'; name.focus(); return; }
      if (!email || !email.value.includes('@')) { email.style.borderColor = '#C8202F'; email.focus(); return; }
      submitNetlifyForm(endorseForm, endorseStatus, function() {
        var endorseBtn = document.getElementById('endorseBtn');
        if (endorseBtn) {
          endorseBtn.textContent = 'Endorsement Submitted — Thank You!';
          endorseBtn.style.background = '#2d7a3a';
          endorseBtn.disabled = true;
        }
        endorseForm.querySelectorAll('input, select, textarea').forEach(function(i) { i.disabled = true; });
      });
    });
  }

  // Endorsement Modal - close on overlay click
  var endorseModal = document.getElementById('endorseModal');
  if (endorseModal) {
    endorseModal.addEventListener('click', function(e) {
      if (e.target === endorseModal) {
        endorseModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // Mailto link handler
  document.querySelectorAll('a[href^="mailto:"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var mailtoUrl = this.getAttribute('href');
      var emailMatch = mailtoUrl.match(/^mailto:([^?]+)/);
      var emailOpened = false;
      function onBlur() { emailOpened = true; }
      window.addEventListener('blur', onBlur);
      window.location.href = mailtoUrl;
      if (emailMatch) {
        var email = decodeURIComponent(emailMatch[1]);
        setTimeout(function() {
          window.removeEventListener('blur', onBlur);
          if (!emailOpened && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email).then(function() {
              showMailtoToast('Email address copied: ' + email);
            });
          }
        }, 1000);
      }
    });
  });

  // Hamburger Menu Toggle
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Expansion Function for issue cards
  document.querySelectorAll('.issue-card--expandable').forEach(function(card) {
    var btn = card.querySelector('.issue-expand-btn');
    var expanded = card.querySelector('.issue-expanded');
    if (!btn || !expanded) return;

    btn.addEventListener('click', function(e) {
      e.preventDefault();

      var isOpen = card.classList.toggle('is-open');

      btn.setAttribute('aria-expanded', String(isOpen));
      expanded.setAttribute('aria-hidden', String(!isOpen));
    });
  });

}); // end DOMContentLoaded



// Cookie Consent Banner - works with GTM
function handleCookieConsent(choice) {
  localStorage.setItem('cookieAccepted', choice === 'accepted');
  document.getElementById('cookieBanner').classList.add('hidden');
  
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  
  if (choice === 'accepted') {
    gtag('consent', 'update', {'analytics_storage': 'granted'});
  } else {
    gtag('consent', 'update', {'analytics_storage': 'denied'});
  }
}

// Toast notification for mailto fallback
function showMailtoToast(message) {
  var existing = document.getElementById('mailtoToast');
  if (existing) existing.remove();
  var toast = document.createElement('div');
  toast.id = 'mailtoToast';
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1B2A4A;color:#fff;padding:14px 28px;border-radius:6px;font-family:Montserrat,sans-serif;font-size:0.88rem;font-weight:500;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.3);opacity:0;transition:opacity 0.3s;';
  document.body.appendChild(toast);
  requestAnimationFrame(function() { toast.style.opacity = '1'; });
  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

// Video Carousel
const track = document.getElementById('vcTrack');
const slides = track ? track.querySelectorAll('.vc-slide') : [];
let current = 0;
const originals = Array.from(slides).map(s => s.innerHTML);

// Autoplay first slide muted
const firstSlide = slides[0];
if (firstSlide) {
  const preview = firstSlide.querySelector('.video-preview');
  const id = preview.dataset.id;
  const title = preview.dataset.title;
  firstSlide.innerHTML = `
    <div class="video-wrapper">
      <iframe
        src="https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=1&playsinline=1"
        title="${title}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>`;
}

function goTo(index) {
  slides[current].innerHTML = originals[current];
  current = (index + slides.length) % slides.length;
  track.style.transform = `translateX(-${current * 100}%)`;
}

document.getElementById('vcPrev')?.addEventListener('click', () => goTo(current - 1));
document.getElementById('vcNext')?.addEventListener('click', () => goTo(current + 1));


track?.addEventListener('click', e => {
  const btn = e.target.closest('.play-btn');
  if (!btn) return;
  const preview = btn.closest('.video-preview');
  const id = preview.dataset.id;
  const title = preview.dataset.title;
  const slide = preview.closest('.vc-slide');

  slide.innerHTML = `
    <div class="video-wrapper">
      <iframe
        src="https://www.youtube.com/embed/${id}?autoplay=1&controls=1&playsinline=1"
        title="${title}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>`;
});


