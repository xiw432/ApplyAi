import { supabase } from "./supabase.js"
import { initPageHeader, getApplicationStats } from "./page-header.js"

// ── Status → Column mapping (Fixed order: Planning → Applied → Interview → Accepted → Rejected) ──
const STATUS_COL_MAP = {
    "Planning": "col-planning",
    "Applied": "col-applied",
    "Interview": "col-interview",
    "Accepted": "col-accepted",
    "Rejected": "col-rejected"
}

// ── Status → Color theme mapping ──
const STATUS_COLORS = {
    "Planning": { dot: "#d97706", bg: "#FFF3E0", text: "#d97706", gradient: "linear-gradient(135deg,#D97706,#F59E0B)" },
    "Applied": { dot: "#3148E8", bg: "#eef0fd", text: "#3148E8", gradient: "linear-gradient(135deg,#3148E8,#7c8fff)" },
    "Interview": { dot: "#7c3aed", bg: "#f3eeff", text: "#7c3aed", gradient: "linear-gradient(135deg,#7C3AED,#A78BFA)" },
    "Accepted": { dot: "#1a9e6e", bg: "#e4f7f0", text: "#1a9e6e", gradient: "linear-gradient(135deg,#059669,#34D399)" },
    "Rejected": { dot: "#dc2626", bg: "#FFEBEE", text: "#dc2626", gradient: "linear-gradient(135deg,#DC2626,#F87171)" }
}

// ── Format deadline display ──
function formatDeadline(dateStr) {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function daysUntil(dateStr) {
    if (!dateStr) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

// ── Generate initials from university name ──
function getInitials(name) {
    if (!name) return "?"
    const words = name.trim().split(/\s+/)
    if (words.length === 1) return words[0].substring(0, 3).toUpperCase()
    return words.map(w => w[0]).join("").substring(0, 3).toUpperCase()
}

// ── Escape HTML to prevent XSS ──
function escapeHtml(text) {
    if (!text) return ""
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

// ── Build a single kanban card HTML ──
function buildCardHTML(app) {
    const status = app.status || "Saved"
    const colors = STATUS_COLORS[status] || STATUS_COLORS["Saved"]
    const initials = getInitials(app.university_name)
    const deadlineStr = formatDeadline(app.deadline)
    const days = daysUntil(app.deadline)
    let daysLabel = ""
    if (days !== null) {
        if (days < 0) daysLabel = `<span style="font-size:10px;font-weight:600;background:#FFEBEE;color:#dc2626;padding:2px 8px;border-radius:999px;">Passed</span>`
        else if (days <= 14) daysLabel = `<span style="font-size:10px;font-weight:600;background:#FFEBEE;color:#dc2626;padding:2px 8px;border-radius:999px;">${days}d left</span>`
        else if (days <= 30) daysLabel = `<span style="font-size:10px;font-weight:600;background:#FFF3E0;color:#d97706;padding:2px 8px;border-radius:999px;">${days}d left</span>`
        else daysLabel = `<span style="font-size:10px;font-weight:600;background:#e4f7f0;color:#1a9e6e;padding:2px 8px;border-radius:999px;">${days}d left</span>`
    }

    // Build status dropdown options (Fixed order)
    const statusOptions = ["Planning", "Applied", "Interview", "Accepted", "Rejected"]
    const statusSelect = statusOptions.map(s =>
        `<option value="${s}"${s === status ? ' selected' : ''}>${s}</option>`
    ).join('')

    // Document checklist
    const sopChecked = app.sop_done ? 'checked' : ''
    const cvChecked = app.cv_done ? 'checked' : ''
    const passportChecked = app.passport_done ? 'checked' : ''
    const lorChecked = app.lor_done ? 'checked' : ''

    const completedDocs = [app.sop_done, app.cv_done, app.passport_done, app.lor_done].filter(Boolean).length
    const totalDocs = 4
    const progressPercent = (completedDocs / totalDocs) * 100

    return `
    <div class="kb-card supabase-card" draggable="true" data-id="db-${app.id}" ondragstart="handleDragStart(event, '${app.id}')" ondragend="handleDragEnd(event)" onclick="openDetailPanel('${app.id}')" style="background:white;border:1px solid rgba(0,0,0,0.08);border-radius:14px;padding:16px;transition:all 0.2s;box-shadow:0 1px 8px rgba(0,0,0,0.06);cursor:pointer;" onmouseover="this.style.boxShadow='0 6px 24px rgba(0,0,0,0.11)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='0 1px 8px rgba(0,0,0,0.06)';this.style.transform=''">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:9px;">
          <div style="width:32px;height:32px;border-radius:8px;background:${colors.gradient};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:white;font-family:'Fraunces',serif;flex-shrink:0;">${initials}</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#0f0e17;line-height:1.2;">${app.university_name || "Untitled"}</div>
            <div style="font-size:11px;color:#9997aa;">${app.country || ""}</div>
          </div>
        </div>
        <div style="display:flex;gap:4px;">
          <div onclick="event.stopPropagation();deleteApplication('${app.id}')" style="font-size:14px;color:#9997aa;cursor:pointer;padding:2px 5px;border-radius:5px;" onmouseover="this.style.background='#FFEBEE';this.style.color='#dc2626'" onmouseout="this.style.background='';this.style.color='#9997aa'" title="Delete">✕</div>
        </div>
      </div>
      ${app.program ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;"><span style="font-size:10px;font-weight:600;padding:3px 9px;border-radius:6px;background:${colors.bg};color:${colors.text};">${app.program}</span></div>` : ""}
      
      <!-- Document Checklist -->
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:10px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <div style="font-size:10px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;">Documents</div>
          <div style="font-size:10px;font-weight:600;color:#6B7280;">${completedDocs}/${totalDocs}</div>
        </div>
        <div style="height:3px;background:#E5E7EB;border-radius:999px;margin-bottom:8px;overflow:hidden;">
          <div style="width:${progressPercent}%;height:100%;background:linear-gradient(90deg,#3148E8,#7c8fff);border-radius:999px;transition:width 0.3s;"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;">
          <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151;cursor:pointer;" onclick="event.stopPropagation()">
            <input type="checkbox" ${sopChecked} onchange="updateDocumentChecklist('${app.id}', 'sop_done', this.checked)" style="width:14px;height:14px;cursor:pointer;accent-color:#3148E8;">
            <span>Statement of Purpose</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151;cursor:pointer;" onclick="event.stopPropagation()">
            <input type="checkbox" ${cvChecked} onchange="updateDocumentChecklist('${app.id}', 'cv_done', this.checked)" style="width:14px;height:14px;cursor:pointer;accent-color:#3148E8;">
            <span>CV/Resume</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151;cursor:pointer;" onclick="event.stopPropagation()">
            <input type="checkbox" ${passportChecked} onchange="updateDocumentChecklist('${app.id}', 'passport_done', this.checked)" style="width:14px;height:14px;cursor:pointer;accent-color:#3148E8;">
            <span>Passport Copy</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151;cursor:pointer;" onclick="event.stopPropagation()">
            <input type="checkbox" ${lorChecked} onchange="updateDocumentChecklist('${app.id}', 'lor_done', this.checked)" style="width:14px;height:14px;cursor:pointer;accent-color:#3148E8;">
            <span>Letter of Recommendation</span>
          </label>
        </div>
      </div>

      <div style="margin-bottom:${deadlineStr ? '10px' : '0'};">
        <select onchange="event.stopPropagation();updateApplicationStatus('${app.id}', this.value)" style="width:100%;padding:6px 10px;border:1.5px solid #E6E8EC;border-radius:8px;font-size:11px;font-weight:600;font-family:'DM Sans',sans-serif;color:${colors.text};background:${colors.bg};cursor:pointer;outline:none;appearance:auto;" onfocus="this.style.borderColor='#3148E8'" onblur="this.style.borderColor='#E6E8EC'">
          ${statusSelect}
        </select>
      </div>
      ${deadlineStr ? `
      <div style="display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid rgba(0,0,0,0.06);">
        <div style="font-size:11px;color:#9997aa;">⏰ ${deadlineStr}</div>
        ${daysLabel}
      </div>` : ""}
    </div>
  `
}

// ── Load applications from Supabase ──
async function loadApplications() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error loading applications:", error.message)
        return
    }

    // Store data globally for filtering
    window.allApplications = data || []

    // Remove any previously loaded Supabase cards
    document.querySelectorAll(".supabase-card").forEach(el => el.remove())

    // Group applications by status
    const grouped = {}
    for (const status of Object.keys(STATUS_COL_MAP)) {
        grouped[status] = []
    }

    if (data && data.length > 0) {
        for (const app of data) {
            const status = app.status || "Planning"
            if (grouped[status]) {
                grouped[status].push(app)
            } else {
                grouped["Planning"].push(app)
            }
        }
    }

    // Render cards into each column
    for (const [status, colId] of Object.entries(STATUS_COL_MAP)) {
        const col = document.getElementById(colId)
        if (!col) continue

        const apps = grouped[status]
        for (const app of apps) {
            col.insertAdjacentHTML("beforeend", buildCardHTML(app))
        }
    }

    // Update column counts and summary stats
    updateColumnCounts()
    updateSummaryStats(data)
    populateCountryFilter(data)

    // If no applications at all, show empty state message
    if (!data || data.length === 0) {
        const board = document.getElementById("kanban-board")
        if (board && !document.getElementById("no-apps-message")) {
            const emptyMsg = document.createElement("div")
            emptyMsg.id = "no-apps-message"
            emptyMsg.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;z-index:5;"
            emptyMsg.innerHTML = `
                <div style="font-size:48px;margin-bottom:12px;opacity:0.3;">📋</div>
                <div style="font-size:15px;font-weight:600;color:#0f0e17;margin-bottom:6px;">No applications yet</div>
                <div style="font-size:13px;color:#9997aa;">Click "Add Application" to get started!</div>
            `
            board.style.position = "relative"
            board.appendChild(emptyMsg)
        }
    } else {
        // Remove empty message if it exists
        const emptyMsg = document.getElementById("no-apps-message")
        if (emptyMsg) emptyMsg.remove()
    }
}

// ── Update summary stats bar ──
function updateSummaryStats(data) {
    if (!data) return

    const total = data.length
    const planning = data.filter(a => a.status === "Planning").length
    const applied = data.filter(a => a.status === "Applied").length
    const interview = data.filter(a => a.status === "Interview").length
    const accepted = data.filter(a => a.status === "Accepted").length

    const statTotal = document.getElementById("stat-total")
    const statPlanning = document.getElementById("stat-planning")
    const statApplied = document.getElementById("stat-applied")
    const statInterview = document.getElementById("stat-interview")
    const statAccepted = document.getElementById("stat-accepted")

    if (statTotal) statTotal.textContent = total
    if (statPlanning) statPlanning.textContent = planning
    if (statApplied) statApplied.textContent = applied
    if (statInterview) statInterview.textContent = interview
    if (statAccepted) statAccepted.textContent = accepted
}

// ── Populate country filter dropdown ──
function populateCountryFilter(data) {
    if (!data) return

    const countries = [...new Set(data.map(a => a.country).filter(Boolean))].sort()
    const filterCountry = document.getElementById("filter-country")
    
    if (filterCountry) {
        // Keep the "All Countries" option
        filterCountry.innerHTML = '<option value="">All Countries</option>'
        
        countries.forEach(country => {
            const option = document.createElement("option")
            option.value = country
            option.textContent = country
            filterCountry.appendChild(option)
        })
    }
}

// ── Filter applications ──
function filterApplications() {
    const searchInput = document.getElementById("search-input")
    const filterStatus = document.getElementById("filter-status")
    const filterCountry = document.getElementById("filter-country")

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : ""
    const statusFilter = filterStatus ? filterStatus.value : ""
    const countryFilter = filterCountry ? filterCountry.value : ""

    const allCards = document.querySelectorAll(".supabase-card")

    allCards.forEach(card => {
        const cardId = card.getAttribute("data-id")
        if (!cardId) return

        // Extract app ID from data-id (format: "db-{id}")
        const appId = cardId.replace("db-", "")
        const app = window.allApplications?.find(a => a.id === appId)
        
        if (!app) {
            card.style.display = "none"
            return
        }

        let show = true

        // Search filter
        if (searchTerm) {
            const universityName = (app.university_name || "").toLowerCase()
            const program = (app.program || "").toLowerCase()
            if (!universityName.includes(searchTerm) && !program.includes(searchTerm)) {
                show = false
            }
        }

        // Status filter
        if (statusFilter && app.status !== statusFilter) {
            show = false
        }

        // Country filter
        if (countryFilter && app.country !== countryFilter) {
            show = false
        }

        card.style.display = show ? "block" : "none"
    })

    // Update column counts after filtering
    updateColumnCounts()
}

// ── Clear all filters ──
function clearFilters() {
    const searchInput = document.getElementById("search-input")
    const filterStatus = document.getElementById("filter-status")
    const filterCountry = document.getElementById("filter-country")

    if (searchInput) searchInput.value = ""
    if (filterStatus) filterStatus.value = ""
    if (filterCountry) filterCountry.value = ""

    filterApplications()
}

// ── Update the count badges on each column header ──
function updateColumnCounts() {
    const counts = {
        "count-planning": document.querySelectorAll("#col-planning .kb-card").length,
        "count-applied": document.querySelectorAll("#col-applied .kb-card").length,
        "count-interview": document.querySelectorAll("#col-interview .kb-card").length,
        "count-accepted": document.querySelectorAll("#col-accepted .kb-card").length,
        "count-rejected": document.querySelectorAll("#col-rejected .kb-card").length
    }
    for (const [id, count] of Object.entries(counts)) {
        const el = document.getElementById(id)
        if (el) el.textContent = count
    }
}

// ── Delete application ──
async function deleteApplication(id) {
    if (!confirm("Are you sure you want to delete this application?")) return
    const { error } = await supabase.from("applications").delete().eq("id", id)
    if (error) {
        alert(error.message)
    } else {
        loadApplications()
    }
}

// ── Update application status ──
async function updateApplicationStatus(id, newStatus) {
    const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", id)

    if (error) {
        alert(error.message)
    } else {
        loadApplications()
    }
}

// ── Update document checklist ──
async function updateDocumentChecklist(id, field, checked) {
    const { error } = await supabase
        .from("applications")
        .update({ [field]: checked })
        .eq("id", id)

    if (error) {
        console.error("Error updating checklist:", error.message)
        alert("Failed to update checklist")
    } else {
        // Reload to update progress bar
        loadApplications()
    }
}

// ── Save application notes ──
async function saveApplicationNotes(id) {
    const notesTextarea = document.getElementById(`notes-${id}`)
    if (!notesTextarea) return

    const notes = notesTextarea.value.trim()

    const { error } = await supabase
        .from("applications")
        .update({ notes })
        .eq("id", id)

    if (error) {
        alert("Failed to save notes: " + error.message)
    } else {
        if (typeof showToast === "function") {
            showToast("Notes saved successfully")
        } else {
            alert("Notes saved successfully")
        }
    }
}

// ── Toggle card details (notes section) ──
function toggleCardDetails(id) {
    // Open side panel instead of inline expansion
    openDetailPanel(id)
}

// ── Open side panel with application details ──
function openDetailPanel(appId) {
    const app = window.allApplications?.find(a => a.id === appId)
    if (!app) {
        console.error("Application not found:", appId)
        return
    }

    const panel = document.getElementById("app-detail-panel")
    const backdrop = document.getElementById("panel-backdrop")
    const content = document.getElementById("panel-content")

    if (!panel || !backdrop || !content) return

    // Build panel content
    const colors = STATUS_COLORS[app.status] || STATUS_COLORS["Planning"]
    const initials = getInitials(app.university_name)
    const deadlineStr = formatDeadline(app.deadline)
    const days = daysUntil(app.deadline)
    
    let urgencyBadge = ""
    if (days !== null) {
        if (days < 0) urgencyBadge = `<span style="font-size:11px;font-weight:600;background:#FFEBEE;color:#dc2626;padding:4px 10px;border-radius:999px;">Deadline Passed</span>`
        else if (days <= 14) urgencyBadge = `<span style="font-size:11px;font-weight:600;background:#FFEBEE;color:#dc2626;padding:4px 10px;border-radius:999px;">Due in ${days} days</span>`
        else if (days <= 30) urgencyBadge = `<span style="font-size:11px;font-weight:600;background:#FFF3E0;color:#d97706;padding:4px 10px;border-radius:999px;">Due in ${days} days</span>`
        else urgencyBadge = `<span style="font-size:11px;font-weight:600;background:#e4f7f0;color:#1a9e6e;padding:4px 10px;border-radius:999px;">Due in ${days} days</span>`
    }

    // Status dropdown options
    const statusOptions = ["Planning", "Applied", "Interview", "Accepted", "Rejected"]
    const statusSelect = statusOptions.map(s =>
        `<option value="${s}"${s === app.status ? ' selected' : ''}>${s}</option>`
    ).join('')

    // Document checklist
    const sopChecked = app.sop_done ? 'checked' : ''
    const cvChecked = app.cv_done ? 'checked' : ''
    const passportChecked = app.passport_done ? 'checked' : ''
    const lorChecked = app.lor_done ? 'checked' : ''

    const completedDocs = [app.sop_done, app.cv_done, app.passport_done, app.lor_done].filter(Boolean).length
    const totalDocs = 4
    const progressPercent = (completedDocs / totalDocs) * 100

    content.innerHTML = `
        <!-- University Header -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
            <div style="width:48px;height:48px;border-radius:12px;background:${colors.gradient};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:white;font-family:'Fraunces',serif;flex-shrink:0;">${initials}</div>
            <div style="flex:1;">
                <div style="font-size:16px;font-weight:700;color:#0f0e17;margin-bottom:2px;">${app.university_name || "Untitled"}</div>
                <div style="font-size:13px;color:#9997aa;">${app.country || ""}</div>
            </div>
        </div>

        <!-- Program -->
        ${app.program ? `
        <div style="margin-bottom:20px;">
            <div style="font-size:11px;font-weight:700;color:#9997aa;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Program</div>
            <div style="font-size:14px;font-weight:600;color:#0f0e17;">${app.program}</div>
        </div>
        ` : ""}

        <!-- Status -->
        <div style="margin-bottom:20px;">
            <div style="font-size:11px;font-weight:700;color:#9997aa;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Status</div>
            <select id="panel-status-${appId}" onchange="updateApplicationStatusFromPanel('${appId}', this.value)" style="width:100%;padding:10px 14px;border:1.5px solid #E6E8EC;border-radius:10px;font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif;color:${colors.text};background:${colors.bg};cursor:pointer;outline:none;">
                ${statusSelect}
            </select>
        </div>

        <!-- Deadline -->
        ${deadlineStr ? `
        <div style="margin-bottom:20px;">
            <div style="font-size:11px;font-weight:700;color:#9997aa;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Deadline</div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;">
                <div style="font-size:14px;font-weight:600;color:#0f0e17;">⏰ ${deadlineStr}</div>
                ${urgencyBadge}
            </div>
        </div>
        ` : ""}

        <!-- Document Checklist -->
        <div style="margin-bottom:20px;">
            <div style="font-size:11px;font-weight:700;color:#9997aa;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Document Checklist</div>
            <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:16px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <div style="font-size:13px;font-weight:600;color:#6B7280;">Progress</div>
                    <div style="font-size:13px;font-weight:700;color:#0f0e17;">${completedDocs}/${totalDocs} Complete</div>
                </div>
                <div style="height:6px;background:#E5E7EB;border-radius:999px;margin-bottom:16px;overflow:hidden;">
                    <div style="width:${progressPercent}%;height:100%;background:linear-gradient(90deg,#3148E8,#7c8fff);border-radius:999px;transition:width 0.3s;"></div>
                </div>
                <div style="display:flex;flex-direction:column;gap:10px;">
                    <label style="display:flex;align-items:center;gap:10px;font-size:13px;color:#374151;cursor:pointer;padding:8px;border-radius:8px;transition:background 0.2s;" onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background=''">
                        <input type="checkbox" ${sopChecked} onchange="updateDocumentChecklistFromPanel('${appId}', 'sop_done', this.checked)" style="width:18px;height:18px;cursor:pointer;accent-color:#3148E8;">
                        <span style="flex:1;">Statement of Purpose</span>
                    </label>
                    <label style="display:flex;align-items:center;gap:10px;font-size:13px;color:#374151;cursor:pointer;padding:8px;border-radius:8px;transition:background 0.2s;" onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background=''">
                        <input type="checkbox" ${cvChecked} onchange="updateDocumentChecklistFromPanel('${appId}', 'cv_done', this.checked)" style="width:18px;height:18px;cursor:pointer;accent-color:#3148E8;">
                        <span style="flex:1;">CV/Resume</span>
                    </label>
                    <label style="display:flex;align-items;center;gap:10px;font-size:13px;color:#374151;cursor:pointer;padding:8px;border-radius:8px;transition:background 0.2s;" onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background=''">
                        <input type="checkbox" ${passportChecked} onchange="updateDocumentChecklistFromPanel('${appId}', 'passport_done', this.checked)" style="width:18px;height:18px;cursor:pointer;accent-color:#3148E8;">
                        <span style="flex:1;">Passport Copy</span>
                    </label>
                    <label style="display:flex;align-items:center;gap:10px;font-size:13px;color:#374151;cursor:pointer;padding:8px;border-radius:8px;transition:background 0.2s;" onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background=''">
                        <input type="checkbox" ${lorChecked} onchange="updateDocumentChecklistFromPanel('${appId}', 'lor_done', this.checked)" style="width:18px;height:18px;cursor:pointer;accent-color:#3148E8;">
                        <span style="flex:1;">Letter of Recommendation</span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Notes -->
        <div style="margin-bottom:20px;">
            <div style="font-size:11px;font-weight:700;color:#9997aa;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Notes</div>
            <textarea id="panel-notes-${appId}" placeholder="Add notes about this application..." style="width:100%;min-height:120px;padding:12px 14px;border:1.5px solid #E6E8EC;border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;color:#374151;resize:vertical;outline:none;box-sizing:border-box;" onfocus="this.style.borderColor='#3148E8'" onblur="this.style.borderColor='#E6E8EC'">${app.notes || ''}</textarea>
            <button onclick="saveNotesFromPanel('${appId}')" style="margin-top:10px;width:100%;padding:12px;background:#3148E8;color:white;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:background 0.2s;" onmouseover="this.style.background='#2337C7'" onmouseout="this.style.background='#3148E8'">Save Notes</button>
        </div>

        <!-- Documents Section -->
        <div style="margin-bottom:20px;">
            <div style="font-size:11px;font-weight:700;color:#9997aa;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Documents</div>
            <div style="display:flex;gap:10px;">
                <button onclick="openUploadModal('${appId}', '${escapeHtml(app.university_name)}')" style="flex:1;padding:12px;background:#3148E8;color:white;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:6px;" onmouseover="this.style.background='#2337C7'" onmouseout="this.style.background='#3148E8'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload
                </button>
                <button onclick="showApplicationDocuments('${appId}', '${escapeHtml(app.university_name)}')" style="flex:1;padding:12px;background:white;color:#3148E8;border:1.5px solid #3148E8;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:6px;" onmouseover="this.style.background='#EFF6FF'" onmouseout="this.style.background='white'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    View Files
                </button>
            </div>
        </div>

        <!-- Delete Button -->
        <div style="padding-top:20px;border-top:1px solid rgba(0,0,0,0.08);">
            <button onclick="deleteApplicationFromPanel('${appId}')" style="width:100%;padding:12px;background:#FFEBEE;color:#dc2626;border:1px solid rgba(220,38,38,0.2);border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;" onmouseover="this.style.background='#FEE2E2';this.style.borderColor='#dc2626'" onmouseout="this.style.background='#FFEBEE';this.style.borderColor='rgba(220,38,38,0.2)'">Delete Application</button>
        </div>
    `

    // Show panel and backdrop with animation
    panel.style.display = "block"
    backdrop.style.display = "block"
    
    // Trigger animation
    setTimeout(() => {
        panel.style.transform = "translateX(0)"
        panel.style.transition = "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
        backdrop.style.opacity = "1"
        backdrop.style.transition = "opacity 0.3s"
    }, 10)
}

// ── Close side panel ──
function closeDetailPanel() {
    const panel = document.getElementById("app-detail-panel")
    const backdrop = document.getElementById("panel-backdrop")

    if (!panel || !backdrop) return

    // Animate out
    panel.style.transform = "translateX(100%)"
    backdrop.style.opacity = "0"

    setTimeout(() => {
        panel.style.display = "none"
        backdrop.style.display = "none"
        panel.style.transform = ""
        backdrop.style.opacity = ""
    }, 300)
}

// ── Update status from panel ──
async function updateApplicationStatusFromPanel(id, newStatus) {
    const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", id)

    if (error) {
        alert("Failed to update status: " + error.message)
    } else {
        // Update the app in window.allApplications
        const app = window.allApplications?.find(a => a.id === id)
        if (app) app.status = newStatus

        // Reload applications to update the board
        await loadApplications()
        
        // Reopen the panel to show updated status
        openDetailPanel(id)
        
        if (typeof showToast === "function") {
            showToast("Status updated successfully")
        }
    }
}

// ── Update document checklist from panel ──
async function updateDocumentChecklistFromPanel(id, field, checked) {
    const { error } = await supabase
        .from("applications")
        .update({ [field]: checked })
        .eq("id", id)

    if (error) {
        console.error("Error updating checklist:", error.message)
        alert("Failed to update checklist")
    } else {
        // Update the app in window.allApplications
        const app = window.allApplications?.find(a => a.id === id)
        if (app) app[field] = checked

        // Reload applications to update the board
        await loadApplications()
        
        // Reopen the panel to show updated progress
        openDetailPanel(id)
    }
}

// ── Save notes from panel ──
async function saveNotesFromPanel(id) {
    const notesTextarea = document.getElementById(`panel-notes-${id}`)
    if (!notesTextarea) return

    const notes = notesTextarea.value.trim()

    const { error } = await supabase
        .from("applications")
        .update({ notes })
        .eq("id", id)

    if (error) {
        alert("Failed to save notes: " + error.message)
    } else {
        // Update the app in window.allApplications
        const app = window.allApplications?.find(a => a.id === id)
        if (app) app.notes = notes

        if (typeof showToast === "function") {
            showToast("Notes saved successfully")
        } else {
            alert("Notes saved successfully")
        }
    }
}

// ── Delete application from panel ──
async function deleteApplicationFromPanel(id) {
    if (!confirm("Are you sure you want to delete this application?")) return
    
    const { error } = await supabase.from("applications").delete().eq("id", id)
    
    if (error) {
        alert(error.message)
    } else {
        closeDetailPanel()
        loadApplications()
        
        if (typeof showToast === "function") {
            showToast("Application deleted")
        }
    }
}

// ── Add application ──
async function addApplication() {
    const university = document.getElementById("university_name").value
    const country = document.getElementById("country").value
    const program = document.getElementById("program").value
    const status = document.getElementById("status").value
    const deadline = document.getElementById("deadline").value
    const notes = document.getElementById("notes").value

    if (!university || !country || !program) {
        alert("Please fill in university name, country, and program.")
        return
    }

    const user = (await supabase.auth.getUser()).data.user

    const { error } = await supabase
        .from("applications")
        .insert({
            user_id: user.id,
            university_name: university,
            country: country,
            program: program,
            status: status,
            deadline: deadline || null,
            notes: notes
        })

    if (error) {
        alert(error.message)
    } else {
        alert("Application added successfully")
        location.reload()
    }
}

// ── Drag and Drop Functionality ──
let draggedCardId = null

function handleDragStart(event, appId) {
    draggedCardId = appId
    event.dataTransfer.effectAllowed = "move"
    event.target.style.opacity = "0.5"
}

function handleDragEnd(event) {
    event.target.style.opacity = "1"
    draggedCardId = null
}

function handleDragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
}

function handleDrop(event, targetStatus) {
    event.preventDefault()
    
    if (!draggedCardId) return

    const app = window.allApplications?.find(a => a.id === draggedCardId)
    if (!app) return

    // Don't update if dropped in same column
    if (app.status === targetStatus) return

    // Update status in Supabase
    updateApplicationStatusViaDrag(draggedCardId, targetStatus)
}

async function updateApplicationStatusViaDrag(id, newStatus) {
    const { error } = await supabase
        .from("applications")
        .update({ status: newStatus })
        .eq("id", id)

    if (error) {
        alert("Failed to update status: " + error.message)
    } else {
        // Update the app in window.allApplications
        const app = window.allApplications?.find(a => a.id === id)
        if (app) app.status = newStatus

        // Reload applications to update the board
        await loadApplications()
        
        if (typeof showToast === "function") {
            showToast(`Moved to ${newStatus}`)
        }
    }
}

// ── Expose functions to global scope ──
window.addApplication = addApplication
window.deleteApplication = deleteApplication
window.updateApplicationStatus = updateApplicationStatus
window.updateDocumentChecklist = updateDocumentChecklist
window.saveApplicationNotes = saveApplicationNotes
window.toggleCardDetails = toggleCardDetails
window.loadApplications = loadApplications
window.filterApplications = filterApplications
window.clearFilters = clearFilters
window.openDetailPanel = openDetailPanel
window.closeDetailPanel = closeDetailPanel
window.updateApplicationStatusFromPanel = updateApplicationStatusFromPanel
window.updateDocumentChecklistFromPanel = updateDocumentChecklistFromPanel
window.saveNotesFromPanel = saveNotesFromPanel
window.deleteApplicationFromPanel = deleteApplicationFromPanel
window.handleDragStart = handleDragStart
window.handleDragEnd = handleDragEnd
window.handleDragOver = handleDragOver
window.handleDrop = handleDrop

window.openAddApplicationModal = function () {
    document.getElementById("add-application-modal").style.display = "flex"
}

window.closeAddApplicationModal = function () {
    document.getElementById("add-application-modal").style.display = "none"
}

// ── Initialize page ──
async function init() {
    // Initialize page header with dynamic subtitle
    await initPageHeader({
        pageTitle: "Application Tracker",
        pageCategory: "Applications",
        getSubtitle: async (user) => {
            const stats = await getApplicationStats()
            if (stats.total === 0) {
                return "Start tracking your university applications"
            }
            if (stats.urgent > 0) {
                return `<strong style="color:#DC2626;">${stats.urgent} urgent deadline${stats.urgent !== 1 ? 's' : ''}</strong> approaching`
            }
            return `Tracking ${stats.total} application${stats.total !== 1 ? 's' : ''}`
        }
    })

    await loadApplications()
}

// ── Auto-load on page ready ──
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
} else {
    init()
}
