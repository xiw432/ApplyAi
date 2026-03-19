import { supabase } from "./supabase.js"
import { initPageHeader } from "./page-header.js"

// ── Initialize settings page ──
async function init() {
    // Initialize page header
    await initPageHeader({
        pageTitle: "Settings",
        pageCategory: "Account",
        getSubtitle: async (user) => {
            return "Manage your profile and preferences"
        }
    })

    // Load user data
    await loadUserProfile()
}

// ── Load user profile and populate all fields ──
async function loadUserProfile() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) {
        console.error("No user logged in")
        return
    }

    // Fetch profile data
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

    if (error) {
        console.error("Error loading profile:", error.message)
    }

    // Populate profile fields
    populateProfileFields(user, profile)
}

// ── Populate all form fields with real data ──
function populateProfileFields(user, profile) {
    // Profile avatar - use first letter of name
    const avatarEl = document.querySelector(".g-avatar")
    if (avatarEl && profile?.name) {
        avatarEl.textContent = profile.name.charAt(0).toUpperCase()
    } else if (avatarEl && user?.email) {
        avatarEl.textContent = user.email.charAt(0).toUpperCase()
    }

    // Full name
    const nameInput = document.querySelector('input[type="text"]')
    if (nameInput) {
        nameInput.value = profile?.name || user?.email?.split('@')[0] || ""
    }

    // Email
    const emailInput = document.querySelector('input[type="email"]')
    if (emailInput) {
        emailInput.value = user?.email || ""
        emailInput.disabled = true // Email cannot be changed
        emailInput.style.opacity = "0.7"
        emailInput.style.cursor = "not-allowed"
    }

    // Country of origin
    const countrySelect = document.querySelectorAll('.g-select')[0]
    if (countrySelect && profile?.country_of_origin) {
        countrySelect.value = profile.country_of_origin
    }

    // Target study country
    const targetCountrySelect = document.querySelectorAll('.g-select')[1]
    if (targetCountrySelect && profile?.target_country) {
        targetCountrySelect.value = profile.target_country
    }

    // AI Advisor preferences
    const advisorToneSelect = document.querySelectorAll('.g-select')[2]
    if (advisorToneSelect && profile?.advisor_tone) {
        advisorToneSelect.value = profile.advisor_tone
    }

    const responseLengthSelect = document.querySelectorAll('.g-select')[3]
    if (responseLengthSelect && profile?.response_length) {
        responseLengthSelect.value = profile.response_length
    }

    const focusAreasSelect = document.querySelectorAll('.g-select')[4]
    if (focusAreasSelect && profile?.focus_areas) {
        focusAreasSelect.value = profile.focus_areas
    }

    const languageSelect = document.querySelectorAll('.g-select')[5]
    if (languageSelect && profile?.language) {
        languageSelect.value = profile.language
    }

    // Application preferences
    const prefCountrySelect = document.querySelectorAll('.g-select')[6]
    if (prefCountrySelect && profile?.preferred_country) {
        prefCountrySelect.value = profile.preferred_country
    }

    const degreeLevelSelect = document.querySelectorAll('.g-select')[7]
    if (degreeLevelSelect && profile?.degree_level) {
        degreeLevelSelect.value = profile.degree_level
    }

    const fieldOfStudySelect = document.querySelectorAll('.g-select')[8]
    if (fieldOfStudySelect && profile?.field_of_study) {
        fieldOfStudySelect.value = profile.field_of_study
    }

    const budgetSelect = document.querySelectorAll('.g-select')[9]
    if (budgetSelect && profile?.budget_range) {
        budgetSelect.value = profile.budget_range
    }
}

// ── Save profile changes ──
async function saveProfile() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    const nameInput = document.querySelector('input[type="text"]')
    const countrySelect = document.querySelectorAll('.g-select')[0]
    const targetCountrySelect = document.querySelectorAll('.g-select')[1]

    const updates = {
        id: user.id,
        name: nameInput?.value || null,
        country_of_origin: countrySelect?.value || null,
        target_country: targetCountrySelect?.value || null,
        updated_at: new Date().toISOString()
    }

    const { error } = await supabase
        .from("profiles")
        .upsert(updates)

    if (error) {
        console.error("Error saving profile:", error.message)
        window.showToast("Error saving profile")
    } else {
        window.showToast("Profile saved successfully!")
        // Reload sidebar to reflect changes
        if (window.loadSidebarCounts) {
            window.loadSidebarCounts()
        }
    }
}

// ── Save AI preferences ──
async function saveAIPreferences() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    const advisorToneSelect = document.querySelectorAll('.g-select')[2]
    const responseLengthSelect = document.querySelectorAll('.g-select')[3]
    const focusAreasSelect = document.querySelectorAll('.g-select')[4]
    const languageSelect = document.querySelectorAll('.g-select')[5]

    const updates = {
        id: user.id,
        advisor_tone: advisorToneSelect?.value || null,
        response_length: responseLengthSelect?.value || null,
        focus_areas: focusAreasSelect?.value || null,
        language: languageSelect?.value || null,
        updated_at: new Date().toISOString()
    }

    const { error } = await supabase
        .from("profiles")
        .upsert(updates)

    if (error) {
        console.error("Error saving AI preferences:", error.message)
        window.showToast("Error saving preferences")
    } else {
        window.showToast("AI preferences saved!")
    }
}

// ── Save application preferences ──
async function saveApplicationPreferences() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    const prefCountrySelect = document.querySelectorAll('.g-select')[6]
    const degreeLevelSelect = document.querySelectorAll('.g-select')[7]
    const fieldOfStudySelect = document.querySelectorAll('.g-select')[8]
    const budgetSelect = document.querySelectorAll('.g-select')[9]

    const updates = {
        id: user.id,
        preferred_country: prefCountrySelect?.value || null,
        degree_level: degreeLevelSelect?.value || null,
        field_of_study: fieldOfStudySelect?.value || null,
        budget_range: budgetSelect?.value || null,
        updated_at: new Date().toISOString()
    }

    const { error } = await supabase
        .from("profiles")
        .upsert(updates)

    if (error) {
        console.error("Error saving preferences:", error.message)
        window.showToast("Error saving preferences")
    } else {
        window.showToast("Preferences saved!")
    }
}

// Expose functions globally for HTML onclick handlers
window.saveProfile = saveProfile
window.saveAIPreferences = saveAIPreferences
window.saveApplicationPreferences = saveApplicationPreferences

// Auto-load on page ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
} else {
    init()
}
