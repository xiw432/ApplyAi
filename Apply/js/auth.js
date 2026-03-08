(function() {
'use strict';

window.showToast = function(msg) {
  var t = document.getElementById('auth-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'auth-toast';
    t.className = 'toast';
    t.style.cssText = 'position:fixed;bottom:28px;right:28px;z-index:9999;background:#0f0e17;color:white;border-radius:14px;padding:14px 20px;font-size:14px;font-weight:500;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,0.2);max-width:320px;transform:translateY(80px);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);pointer-events:none;font-family:DM Sans,sans-serif;';
    t.innerHTML = '<span style="display:inline-flex;width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,0.2);align-items:center;justify-content:center;flex-shrink:0;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span><span id="auth-toast-msg">' + (msg || 'Done!') + '</span>';
    document.body.appendChild(t);
  }
  var m = document.getElementById('auth-toast-msg');
  if (m) m.textContent = msg || 'Done!';
  t.style.transform = 'translateY(0)';
  t.style.opacity = '1';
  clearTimeout(window._authToastTimer);
  window._authToastTimer = setTimeout(function() {
    t.style.transform = 'translateY(80px)';
    t.style.opacity = '0';
  }, 2400);
};

window.authRedirectToDashboard = function() {
  window.location.href = '../Dashboard/dashboard.html';
};

})();
