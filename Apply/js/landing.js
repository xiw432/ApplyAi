(function() {
'use strict';

// Scroll reveal
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });

// Animated typing in search box
var searchInput = document.querySelector('.product-search input');
var queries = [
  'Fully funded scholarships in Europe...',
  'CS Masters programs in Germany...',
  'DAAD scholarship requirements...',
  'Study in Japan MEXT 2025...',
  'Chevening scholarship deadline...'
];
var qi = 0, ci = 0, typing = true;
function typeEffect() {
  if (!searchInput) return;
  var q = queries[qi];
  if (typing) {
    if (ci < q.length) {
      searchInput.value = q.substring(0, ++ci);
      setTimeout(typeEffect, 60);
    } else {
      typing = false;
      setTimeout(typeEffect, 1800);
    }
  } else {
    if (ci > 0) {
      searchInput.value = q.substring(0, --ci);
      setTimeout(typeEffect, 30);
    } else {
      typing = true;
      qi = (qi + 1) % queries.length;
      setTimeout(typeEffect, 400);
    }
  }
}
setTimeout(typeEffect, 1500);

// Animated number counters
function animateCounter(el, target, duration) {
  duration = duration || 1800;
  var start = 0;
  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = Math.min((timestamp - start) / duration, 1);
    var ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target).toLocaleString() + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
var counterObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      var val = parseInt(entry.target.dataset.target, 10);
      animateCounter(entry.target, val);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(function(el) { counterObserver.observe(el); });

// Nav scroll
window.addEventListener('scroll', function() {
  var nav = document.querySelector('nav');
  if (!nav) return;
  if (window.scrollY > 20) {
    nav.style.background = 'rgba(248,247,244,0.9)';
    nav.style.boxShadow = '0 2px 24px rgba(0,0,0,0.06)';
  } else {
    nav.style.background = 'rgba(248,247,244,0.72)';
    nav.style.boxShadow = 'none';
  }
});

// Waitlist form
var wb = document.querySelector('.waitlist-btn');
var wi = document.querySelector('.waitlist-input');
if (wb && wi) {
  wb.addEventListener('click', function() {
    if (wi.value.indexOf('@') >= 0) {
      wb.textContent = '✓ On the list!';
      wb.style.background = 'var(--green)';
      wi.value = '';
      wi.placeholder = 'Welcome aboard!';
    } else {
      wi.style.borderColor = '#EF4444';
      setTimeout(function() { wi.style.borderColor = ''; }, 2000);
    }
  });
}

})();
