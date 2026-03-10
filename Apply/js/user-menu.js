import { supabase } from "./supabase.js";

/**
 * Load the current user and update UI elements that display user info.
 */
async function loadCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    // Sidebar user name
    const nameEl = document.getElementById("sidebar-user-name");
    // Sidebar user email
    const emailEl = document.getElementById("sidebar-user-email");
    // Avatar initials (sidebar + topbar)
    const avatarEls = document.querySelectorAll(".user-avatar-initial");

    if (error || !user) {
        if (nameEl) nameEl.textContent = "Guest";
        if (emailEl) emailEl.textContent = "Not signed in";
        return;
    }

    const email = user.email || "";
    const displayName = user.user_metadata?.full_name || email.split("@")[0] || "User";
    const initial = displayName.charAt(0).toUpperCase();

    if (nameEl) nameEl.textContent = displayName;
    if (emailEl) emailEl.textContent = email;
    avatarEls.forEach((el) => { el.textContent = initial; });
}

/**
 * Sign the user out and redirect to the login page.
 */
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        if (typeof showToast === "function") showToast("Logout failed: " + error.message);
        return;
    }
    window.location.href = "../auth/login.html";
}

/**
 * Toggle the user menu dropdown in the sidebar.
 */
function toggleUserMenu() {
    const menu = document.getElementById("user-menu-dropdown");
    if (!menu) return;
    const isOpen = menu.style.display === "block";
    menu.style.display = isOpen ? "none" : "block";
}

// Close menu when clicking outside
document.addEventListener("click", (e) => {
    const menu = document.getElementById("user-menu-dropdown");
    const trigger = document.getElementById("user-menu-trigger");
    if (menu && trigger && !trigger.contains(e.target) && !menu.contains(e.target)) {
        menu.style.display = "none";
    }
});

// Expose globally
window.handleLogout = handleLogout;
window.toggleUserMenu = toggleUserMenu;

// Auto-load
loadCurrentUser();
