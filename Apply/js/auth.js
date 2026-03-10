import { supabase } from "./supabase.js"

// Toast notification
window.showToast = function (msg) {
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
  window._authToastTimer = setTimeout(function () {
    t.style.transform = 'translateY(80px)';
    t.style.opacity = '0';
  }, 2400);
};

// Dashboard redirect
window.authRedirectToDashboard = function () {
  window.location.href = '../Dashboard/dashboard.html';
};

// Signup handler
async function handleSignup() {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      alert(error.message);
    } else {
      // Collect extra sign-up fields to pass to profile-setup
      const nameEl = document.getElementById("signup-name");
      const countryEl = document.getElementById("signup-country");
      const targetEl = document.getElementById("signup-target-country");

      const params = new URLSearchParams();
      if (nameEl && nameEl.value) params.set("name", nameEl.value);
      if (countryEl && countryEl.value) params.set("country", countryEl.value);
      if (targetEl && targetEl.value) params.set("target_country", targetEl.value);

      const qs = params.toString();
      window.location.href = "./profile-setup.html" + (qs ? "?" + qs : "");
    }
  } catch (err) {
    alert("Signup failed: " + err.message);
  }
}

window.handleSignup = handleSignup;

// Login handler
async function handleLogin() {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Login successful");
      window.location.href = "../Dashboard/dashboard.html";
    }
  } catch (err) {
    alert("Login failed: " + err.message);
  }
}

window.handleLogin = handleLogin;

// Profile option selector (for card-style inputs on profile-setup page)
window.selectOption = function (el, group) {
  var siblings = el.parentElement.querySelectorAll('.profile-option');
  siblings.forEach(function (s) { s.classList.remove('selected'); });
  el.classList.add('selected');
  // Store the selected value in a hidden input
  var hidden = document.getElementById(group);
  if (hidden) {
    hidden.value = el.querySelector('.po-label').textContent.trim();
  }
};

// Save profile handler
async function saveProfile() {
  try {
    const name = document.getElementById("name") ? document.getElementById("name").value : "";
    const country = document.getElementById("country") ? document.getElementById("country").value : "";
    const targetCountry = document.getElementById("target_country") ? document.getElementById("target_country").value : "";
    const degree = document.getElementById("degree") ? document.getElementById("degree").value : "";
    const budget = document.getElementById("budget") ? document.getElementById("budget").value : "";

    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      alert("You must be logged in to save your profile.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        name: name,
        country: country,
        target_country: targetCountry,
        degree: degree,
        budget: budget
      });

    if (error) {
      alert(error.message);
    } else {
      window.location.href = "../Dashboard/dashboard.html";
    }
  } catch (err) {
    alert("Profile save failed: " + err.message);
  }
}

window.saveProfile = saveProfile;

// Auto-populate profile-setup hidden inputs from URL params (passed from signup)
(function populateProfileFromParams() {
  const params = new URLSearchParams(window.location.search);
  const fields = ["name", "country", "target_country"];
  for (const field of fields) {
    const val = params.get(field);
    if (val) {
      const el = document.getElementById(field);
      if (el) el.value = val;
    }
  }
})();
