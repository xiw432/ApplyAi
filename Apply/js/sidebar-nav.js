import { supabase } from "./supabase.js";

/**
 * Load real counts for sidebar navigation badges
 */
async function loadSidebarCounts() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    try {
        // Count saved universities
        const { count: universitiesCount } = await supabase
            .from("saved_universities")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        // Count applications
        const { count: applicationsCount } = await supabase
            .from("applications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

        // Count upcoming deadlines (applications with deadlines in the future)
        const today = new Date().toISOString().split('T')[0];
        const { count: deadlinesCount } = await supabase
            .from("applications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("deadline", today);

        // Update sidebar badges
        updateBadge("sidebar-universities-count", universitiesCount);
        updateBadge("sidebar-applications-count", applicationsCount);
        updateBadge("sidebar-calendar-count", deadlinesCount);
    } catch (error) {
        console.error("Error loading sidebar counts:", error);
    }
}

/**
 * Update a badge element with count, hide if zero
 */
function updateBadge(elementId, count) {
    const badge = document.getElementById(elementId);
    if (!badge) return;

    if (count && count > 0) {
        badge.textContent = count;
        badge.style.display = "";
    } else {
        badge.textContent = "0";
        badge.style.display = "";
    }
}

/**
 * Highlight the active navigation item based on current page
 */
function highlightActiveNav() {
    const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
    
    // Remove active class from all nav items
    document.querySelectorAll(".snav-item").forEach(item => {
        item.classList.remove("snav-on");
        item.style.background = "";
        item.style.color = "rgba(255,255,255,0.5)";
    });

    // Add active class to current page
    let activeId = "";
    if (currentPage.includes("dashboard")) activeId = "snav-dashboard";
    else if (currentPage.includes("university") || currentPage.includes("universities")) activeId = "snav-universities";
    else if (currentPage.includes("tracker") || currentPage.includes("application")) activeId = "snav-tracker";
    else if (currentPage.includes("calendar")) activeId = "snav-calendar";
    else if (currentPage.includes("internship")) activeId = "snav-internships";
    else if (currentPage.includes("learn")) activeId = "snav-learn";
    else if (currentPage.includes("ai-advisor")) activeId = "snav-advisor";
    else if (currentPage.includes("settings")) activeId = "snav-settings";

    if (activeId) {
        const activeItem = document.getElementById(activeId);
        if (activeItem) {
            activeItem.classList.add("snav-on");
            activeItem.style.background = "rgba(255,255,255,0.08)";
            activeItem.style.color = "rgba(255,255,255,0.95)";
        }
    }
}

// Auto-load on page ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        loadSidebarCounts();
        highlightActiveNav();
    });
} else {
    loadSidebarCounts();
    highlightActiveNav();
}

// Expose globally
window.loadSidebarCounts = loadSidebarCounts;
