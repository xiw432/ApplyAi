import { supabase } from "./supabase.js";
import { initPageHeader, getSavedUniversitiesCount } from "./page-header.js";

// ── Load topbar profile badge ──
async function loadTopbarProfile() {
    const nameEl = document.getElementById("topbar-user-name");
    const countryEl = document.getElementById("topbar-user-country");
    const degreeEl = document.getElementById("topbar-user-degree");
    const avatarEl = document.getElementById("topbar-user-avatar");

    if (!nameEl || !countryEl || !degreeEl) return;

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
        nameEl.textContent = "Guest";
        countryEl.textContent = "--";
        degreeEl.textContent = "--";
        if (avatarEl) avatarEl.textContent = "G";
        return;
    }

    // Fetch profile data
    const { data: profile } = await supabase
        .from("profiles")
        .select("name, target_country, degree_level")
        .eq("id", user.id)
        .maybeSingle();

    // Display name
    const displayName = profile?.name || user.email?.split('@')[0] || "User";
    nameEl.textContent = displayName.split(' ')[0]; // First name only

    // Display country (abbreviated)
    const country = profile?.target_country || "--";
    const countryAbbr = getCountryAbbreviation(country);
    countryEl.textContent = countryAbbr;

    // Display degree (abbreviated)
    const degree = profile?.degree_level || "--";
    const degreeAbbr = getDegreeAbbreviation(degree);
    degreeEl.textContent = degreeAbbr;

    // Update avatar initial
    if (avatarEl) {
        const initial = displayName.charAt(0).toUpperCase();
        avatarEl.textContent = initial;
    }

    // Update "My List" count
    const savedCount = await getSavedUniversitiesCount();
    const myListCountEl = document.getElementById("my-list-count");
    if (myListCountEl) {
        myListCountEl.textContent = savedCount;
    }
}

// ── Helper: Get country abbreviation ──
function getCountryAbbreviation(country) {
    const abbr = {
        "Germany": "DE",
        "USA": "US",
        "United States": "US",
        "UK": "UK",
        "United Kingdom": "UK",
        "Canada": "CA",
        "Australia": "AU",
        "China": "CN",
        "Netherlands": "NL",
        "Sweden": "SE",
        "India": "IN",
        "France": "FR",
        "Spain": "ES",
        "Italy": "IT",
        "Japan": "JP",
        "South Korea": "KR",
        "Singapore": "SG",
        "Switzerland": "CH",
        "Austria": "AT",
        "Belgium": "BE",
        "Denmark": "DK",
        "Norway": "NO",
        "Finland": "FI"
    };
    return abbr[country] || country.substring(0, 2).toUpperCase();
}

// ── Helper: Get degree abbreviation ──
function getDegreeAbbreviation(degree) {
    if (!degree || degree === "--") return "--";
    if (degree.includes("Masters") || degree.includes("MSc") || degree.includes("MA")) return "MS";
    if (degree.includes("Bachelor")) return "BS";
    if (degree.includes("PhD") || degree.includes("Doctorate")) return "PhD";
    if (degree.includes("MBA")) return "MBA";
    if (degree.includes("Diploma")) return "DIP";
    return degree.substring(0, 3).toUpperCase();
}

/**
 * Load universities from the Supabase `universities` table
 * with optional search and filter parameters.
 *
 * @param {Object} [filters]
 * @param {string} [filters.searchTerm]
 * @param {string} [filters.country]
 * @param {string} [filters.degreeLevel]
 */
async function loadUniversities(filters = {}) {
    const grid = document.getElementById("uni-grid");
    const noResults = document.getElementById("no-results");
    const countNum = document.getElementById("count-num");

    if (!grid) return;

    // Show a loading state
    grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:64px 40px;color:#9997aa;">
      <div style="font-size:16px;font-weight:500;">Loading universities…</div>
    </div>`;
    if (noResults) noResults.style.display = "none";

    // Build query dynamically
    let query = supabase
        .from("universities")
        .select("*")
        .order("ranking", { ascending: true });

    // Search term — filter by name OR program (case-insensitive)
    const searchTerm = (filters.searchTerm || "").trim();
    if (searchTerm) {
        query = query.or(
            `name.ilike.%${searchTerm}%,program.ilike.%${searchTerm}%`
        );
    }

    // Country filter
    if (filters.country) {
        query = query.eq("country", filters.country);
    }

    // Degree level filter
    if (filters.degreeLevel) {
        query = query.eq("degree_level", filters.degreeLevel);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error loading universities:", error);
        grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:64px 40px;color:#9997aa;">
        <div style="font-size:18px;font-weight:600;color:#57556a;font-family:'Fraunces',serif;margin-bottom:8px;">Failed to load universities</div>
        <div style="font-size:14px;">Please try refreshing the page.</div>
      </div>`;
        if (noResults) noResults.style.display = "none";
        return;
    }

    if (!data || data.length === 0) {
        grid.innerHTML = "";
        if (noResults) {
            noResults.style.display = "block";
            const titleEl = noResults.querySelector("div[style*='font-size:18px']");
            const subtitleEl = noResults.querySelector("div[style*='font-size:14px']");
            if (titleEl) titleEl.textContent = "No universities found.";
            if (subtitleEl) subtitleEl.textContent = "Try adjusting your filters or search term.";
        }
        if (countNum) countNum.textContent = "0";
        return;
    }

    // Update count
    if (countNum) countNum.textContent = String(data.length);
    if (noResults) noResults.style.display = "none";

    // Render cards
    grid.innerHTML = data.map((uni) => renderUniversityCard(uni)).join("");
}

/**
 * Read current values from the page UI inputs and reload universities.
 * Exposed globally so the inline HTML event handlers can call it.
 */
function filterUniversities() {
    const searchInput = document.getElementById("uni-search");
    const countrySelect = document.getElementById("f-country");
    const degreeLevelSelect = document.getElementById("f-degree");

    loadUniversities({
        searchTerm: searchInput ? searchInput.value : "",
        country: countrySelect ? countrySelect.value : "",
        degreeLevel: degreeLevelSelect ? degreeLevelSelect.value : "",
    });
}

// Expose globally for inline HTML handlers
window.filterUniversities = filterUniversities;

// --- Save University -------------------------------------------------------

/**
 * Save a university to the saved_universities table.
 * Checks for duplicates before inserting.
 *
 * @param {number|string} universityId
 */
async function saveUniversity(universityId) {
    try {
        // Get the current logged-in user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            if (typeof showToast === "function") showToast("Please log in to save universities");
            return;
        }

        // Check for duplicate
        const { data: existing, error: checkError } = await supabase
            .from("saved_universities")
            .select("id")
            .eq("user_id", user.id)
            .eq("university_id", universityId)
            .maybeSingle();

        if (checkError) {
            console.error("Error checking saved universities:", checkError);
            if (typeof showToast === "function") showToast("Something went wrong");
            return;
        }

        if (existing) {
            if (typeof showToast === "function") showToast("University already saved");
            return;
        }

        // Insert
        const { error: insertError } = await supabase
            .from("saved_universities")
            .insert({
                user_id: user.id,
                university_id: universityId,
            });

        if (insertError) {
            console.error("Error saving university:", insertError);
            if (typeof showToast === "function") showToast("Failed to save university");
            return;
        }

        if (typeof showToast === "function") showToast("University saved!");
    } catch (err) {
        console.error("saveUniversity error:", err);
        if (typeof showToast === "function") showToast("Something went wrong");
    }
}

window.saveUniversity = saveUniversity;

// --- Helpers ---------------------------------------------------------------

function getAccentColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 55%, 40%)`;
}

function getAbbreviation(name) {
    if (!name) return "?";
    const words = name.replace(/university|of|the/gi, "").trim().split(/\s+/).filter(Boolean);
    if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
    return words.map((w) => w[0]).join("").substring(0, 3).toUpperCase();
}

function esc(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderUniversityCard(uni) {
    const accent = getAccentColor(uni.name || "");
    const abbr = getAbbreviation(uni.name || "");
    const location = [uni.city, uni.country].filter(Boolean).join(", ");
    const rankLabel = uni.ranking ? `#${uni.ranking} QS` : "";
    const locationLine = [location, rankLabel].filter(Boolean).join(" · ");

    const tuitionDisplay = uni.tuition_fee != null
        ? `$${Number(uni.tuition_fee).toLocaleString()}`
        : "N/A";

    const deadlineDisplay = uni.deadline
        ? new Date(uni.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "TBD";

    const safeName = esc(uni.name);
    const safeDesc = esc(uni.description);

    return `
    <div class="uni-card" style="background:white;border:1px solid rgba(0,0,0,0.08);border-radius:16px;overflow:hidden;transition:all 0.25s;cursor:pointer;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 12px 40px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
      <div style="height:6px;background:linear-gradient(90deg,${accent},${accent}cc);"></div>
      <div style="padding:20px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;gap:8px;">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
            <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,${accent},${accent}cc);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:white;font-family:'Fraunces',serif;flex-shrink:0;">${esc(abbr)}</div>
            <div style="min-width:0;overflow:hidden;">
              <div style="font-size:15px;font-weight:700;color:#0f0e17;font-family:'Fraunces',serif;line-height:1.3;word-wrap:break-word;">${safeName}</div>
              <div style="font-size:12px;color:#57556a;margin-top:2px;">${esc(locationLine)}</div>
            </div>
          </div>
          <div onclick="saveUniversity(${uni.id});event.stopPropagation();" style="cursor:pointer;padding:4px;color:#9997aa;transition:all 0.2s;" title="Save university" onmouseover="this.style.color='#3148E8'" onmouseout="this.style.color='#9997aa'"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></div>
        </div>

        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
          ${uni.degree_level ? `<span style="font-size:10px;font-weight:700;padding:3px 9px;border-radius:6px;background:#eef0fd;color:#3148E8;letter-spacing:0.3px;">${esc(uni.degree_level)}</span>` : ""}
          ${uni.language ? `<span style="font-size:10px;font-weight:600;padding:3px 9px;border-radius:6px;background:#f3eeff;color:#7c3aed;">${esc(uni.language)}</span>` : ""}
        </div>

        ${safeDesc ? `<div style="font-size:12px;color:#57556a;margin-bottom:10px;line-height:1.6;word-wrap:break-word;overflow-wrap:break-word;">${safeDesc}</div>` : ""}

        <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px;">
          ${uni.program ? `<span style="font-size:11px;background:#f5f4f1;color:#57556a;padding:3px 9px;border-radius:6px;">${esc(uni.program)}</span>` : ""}
          <span style="font-size:11px;background:#e4f7f0;color:#1a9e6e;padding:3px 9px;border-radius:6px;font-weight:600;">Tuition: ${esc(tuitionDisplay)}</span>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid rgba(0,0,0,0.06);">
          <div style="font-size:11px;color:#9997aa;">⏰ Deadline: <strong style="color:#dc2626;">${esc(deadlineDisplay)}</strong></div>
          <div style="display:flex;gap:8px;">
            <div onclick="if(typeof showToast==='function')showToast('Details coming soon');event.stopPropagation();" style="font-size:12px;font-weight:600;color:white;background:#3148E8;padding:7px 14px;border-radius:8px;cursor:pointer;box-shadow:0 2px 8px rgba(49,72,232,0.3);">View Details →</div>
          </div>
        </div>
      </div>
    </div>`;
}

// Debounce helper for search input
let _searchTimer = null;
function debouncedFilter() {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(filterUniversities, 300);
}
window.debouncedFilter = debouncedFilter;

// Auto-load on page load
loadUniversities();


// Import page header utilities
import { initPageHeader, getSavedUniversitiesCount } from "./page-header.js"

// Initialize page
async function init() {
    // Load topbar profile badge
    await loadTopbarProfile()

    // Initialize page header with dynamic subtitle
    await initPageHeader({
        pageTitle: "University Explorer",
        pageCategory: "Explore",
        getSubtitle: async (user) => {
            const savedCount = await getSavedUniversitiesCount()
            if (savedCount > 0) {
                return `${savedCount} universit${savedCount !== 1 ? 'ies' : 'y'} saved`
            }
            return "Discover and save universities worldwide"
        }
    })
}

// Auto-load on page ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
} else {
    init()
}
