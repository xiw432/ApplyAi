import { supabase } from "./supabase.js"

/**
 * Initialize page header with real user data and context
 * @param {Object} config - Configuration for the page header
 * @param {string} config.pageTitle - The main page title
 * @param {string} config.pageCategory - Optional category label (e.g., "Applications", "Explore")
 * @param {Function} config.getSubtitle - Optional async function that returns dynamic subtitle
 */
export async function initPageHeader(config = {}) {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    // Update page title if element exists
    const titleEl = document.getElementById("page-title")
    if (titleEl && config.pageTitle) {
        titleEl.textContent = config.pageTitle
    }

    // Update page category if element exists
    const categoryEl = document.getElementById("page-category")
    if (categoryEl && config.pageCategory) {
        categoryEl.textContent = config.pageCategory
    }

    // Update subtitle with dynamic content
    if (config.getSubtitle) {
        const subtitleEl = document.getElementById("page-subtitle")
        if (subtitleEl) {
            try {
                const subtitle = await config.getSubtitle(user)
                subtitleEl.innerHTML = subtitle
            } catch (error) {
                console.error("Error loading page subtitle:", error)
                subtitleEl.textContent = ""
            }
        }
    }

    // Update user avatar initial
    await updateUserAvatar(user)
}

/**
 * Update user avatar with real initial from profile
 */
async function updateUserAvatar(user) {
    const avatarEl = document.querySelector(".user-avatar-initial")
    if (!avatarEl) return

    // Get user's name from profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()

    const name = profile?.full_name || user.email?.split("@")[0] || "User"
    const initial = name.charAt(0).toUpperCase()
    avatarEl.textContent = initial
}

/**
 * Get time-based greeting
 */
export function getTimeGreeting() {
    const hour = new Date().getHours()
    if (hour >= 12 && hour < 17) return "Good afternoon"
    if (hour >= 17) return "Good evening"
    return "Good morning"
}

/**
 * Get user's display name
 */
export async function getUserDisplayName() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return "there"

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()

    return profile?.full_name || user.email?.split("@")[0] || "there"
}

/**
 * Get application statistics
 */
export async function getApplicationStats() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return { total: 0, urgent: 0, planning: 0, applied: 0, interview: 0, accepted: 0 }

    const { data: apps } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)

    if (!apps) return { total: 0, urgent: 0, planning: 0, applied: 0, interview: 0, accepted: 0 }

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const urgent = apps.filter(a => {
        if (!a.deadline) return false
        const d = new Date(a.deadline)
        d.setHours(0, 0, 0, 0)
        const daysLeft = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
        return daysLeft >= 0 && daysLeft <= 14
    }).length

    const planning = apps.filter(a => a.status === "Planning").length
    const applied = apps.filter(a => a.status === "Applied").length
    const interview = apps.filter(a => a.status === "Interview").length
    const accepted = apps.filter(a => a.status === "Accepted").length

    return {
        total: apps.length,
        urgent,
        planning,
        applied,
        interview,
        accepted
    }
}

/**
 * Get saved universities count
 */
export async function getSavedUniversitiesCount() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return 0

    const { data } = await supabase
        .from("saved_universities")
        .select("id")
        .eq("user_id", user.id)

    return data?.length || 0
}

/**
 * Get upcoming deadlines count
 */
export async function getUpcomingDeadlinesCount() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return 0

    const { data: apps } = await supabase
        .from("applications")
        .select("deadline")
        .eq("user_id", user.id)

    if (!apps) return 0

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return apps.filter(a => {
        if (!a.deadline) return false
        const d = new Date(a.deadline)
        d.setHours(0, 0, 0, 0)
        return d >= now
    }).length
}
