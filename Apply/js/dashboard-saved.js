import { supabase } from "./supabase.js";

/**
 * Load saved universities for the logged-in user and render them
 * on the dashboard page.
 */
async function loadSavedUniversities() {
    const container = document.getElementById("saved-universities-list");
    const countEl = document.getElementById("stat-saved-universities");

    // Get current user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        if (container) container.innerHTML = emptyState("Please log in to see saved universities.");
        if (countEl) countEl.textContent = "0";
        return;
    }

    // Query saved_universities joined with university data
    const { data, error } = await supabase
        .from("saved_universities")
        .select("id, created_at, university_id, universities(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading saved universities:", error);
        if (container) container.innerHTML = emptyState("Failed to load saved universities.");
        if (countEl) countEl.textContent = "0";
        return;
    }

    // Update the stat count
    const total = data ? data.length : 0;
    if (countEl) countEl.textContent = String(total);

    if (!data || data.length === 0) {
        if (container) container.innerHTML = emptyState("No saved universities yet.");
        return;
    }

    // Show the 5 most recent saved universities
    const recent = data.slice(0, 5);
    if (container) {
        container.innerHTML = recent
            .map((row) => {
                const uni = row.universities;
                if (!uni) return "";
                return renderSavedRow(uni);
            })
            .join("");
    }
}

/**
 * Convert a saved university into an application entry.
 * @param {number|string} universityId
 */
async function addSavedUniversityToApplications(universityId) {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            if (typeof showToast === "function") showToast("Please log in first");
            return;
        }

        // Fetch university details
        const { data: uni, error: uniError } = await supabase
            .from("universities")
            .select("*")
            .eq("id", universityId)
            .single();

        if (uniError || !uni) {
            console.error("Error fetching university:", uniError);
            if (typeof showToast === "function") showToast("University not found");
            return;
        }

        // Check for duplicate application
        const { data: existing, error: checkError } = await supabase
            .from("applications")
            .select("id")
            .eq("user_id", user.id)
            .eq("university_name", uni.name)
            .maybeSingle();

        if (checkError) {
            console.error("Error checking applications:", checkError);
            if (typeof showToast === "function") showToast("Something went wrong");
            return;
        }

        if (existing) {
            if (typeof showToast === "function") showToast("Application already exists");
            return;
        }

        // Insert application
        const { error: insertError } = await supabase
            .from("applications")
            .insert({
                user_id: user.id,
                university_name: uni.name,
                country: uni.country,
                program: uni.program,
                status: "Planning",
                deadline: uni.deadline,
                notes: "",
            });

        if (insertError) {
            console.error("Error creating application:", insertError);
            if (typeof showToast === "function") showToast("Failed to create application");
            return;
        }

        if (typeof showToast === "function") showToast("Application added to tracker!");

        // Reload dashboard data
        loadSavedUniversities();
    } catch (err) {
        console.error("addSavedUniversityToApplications error:", err);
        if (typeof showToast === "function") showToast("Something went wrong");
    }
}

window.addSavedUniversityToApplications = addSavedUniversityToApplications;

// --- Helpers ---------------------------------------------------------------

function esc(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function renderSavedRow(uni) {
    const name = esc(uni.name);
    const country = esc(uni.country);
    const program = esc(uni.program);
    const ranking = uni.ranking ? `#${uni.ranking}` : "—";

    return `
    <div style="padding:14px 22px;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;gap:14px;transition:background 0.15s;cursor:pointer;"
         onmouseover="this.style.background='#FAFAFA'" onmouseout="this.style.background=''">
      <div style="width:34px;height:34px;min-width:34px;border-radius:8px;background:#EFF6FF;display:flex;align-items:center;justify-content:center;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:700;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
        <div style="font-size:11px;color:#9CA3AF;margin-top:2px;">${country}${program ? " · " + program : ""}</div>
      </div>
      <div style="font-size:12px;font-weight:700;color:#2563EB;background:#EFF6FF;padding:3px 9px;border-radius:6px;white-space:nowrap;">${esc(ranking)}</div>
      <div onclick="addSavedUniversityToApplications(${uni.id});event.stopPropagation();" style="font-size:11px;font-weight:600;color:white;background:#111;padding:6px 12px;border-radius:7px;cursor:pointer;white-space:nowrap;transition:opacity 0.15s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">+ Add to Tracker</div>
    </div>`;
}

function emptyState(msg) {
    return `
    <div style="padding:32px 22px;text-align:center;">
      <div style="font-size:13px;color:#9CA3AF;">${esc(msg)}</div>
    </div>`;
}

// Auto-load on page load
loadSavedUniversities();
