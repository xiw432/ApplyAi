import { supabase } from "./supabase.js"

// ── Status → Column mapping ──
const STATUS_COL_MAP = {
    "Saved": "col-saved",
    "Preparing": "col-preparing",
    "Submitted": "col-submitted",
    "Interview": "col-interview",
    "Accepted": "col-accepted",
    "Rejected": "col-rejected"
}

// ── Status → Color theme mapping ──
const STATUS_COLORS = {
    "Saved": { dot: "#9997aa", bg: "#f5f4f1", text: "#9997aa", gradient: "linear-gradient(135deg,#6B7280,#9CA3AF)" },
    "Preparing": { dot: "#d97706", bg: "#FFF3E0", text: "#d97706", gradient: "linear-gradient(135deg,#D97706,#F59E0B)" },
    "Submitted": { dot: "#3148E8", bg: "#eef0fd", text: "#3148E8", gradient: "linear-gradient(135deg,#3148E8,#7c8fff)" },
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

    // Build status dropdown options
    const statusOptions = ["Saved", "Preparing", "Submitted", "Interview", "Accepted", "Rejected"]
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
    <div class="kb-card supabase-card" data-id="db-${app.id}" style="background:white;border:1px solid rgba(0,0,0,0.08);border-radius:14px;padding:16px;transition:all 0.2s;box-shadow:0 1px 8px rgba(0,0,0,0.06);" onmouseover="this.style.boxShadow='0 6px 24px rgba(0,0,0,0.11)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='0 1px 8px rgba(0,0,0,0.06)';this.style.transform=''">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:9px;">
          <div style="width:32px;height:32px;border-radius:8px;background:${colors.gradient};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:white;font-family:'Fraunces',serif;flex-shrink:0;">${initials}</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#0f0e17;line-height:1.2;">${app.university_name || "Untitled"}</div>
            <div style="font-size:11px;color:#9997aa;">${app.country || ""}</div>
          </div>
        </div>
        <div style="display:flex;gap:4px;">
          <div onclick="toggleCardDetails('${app.id}')" style="font-size:14px;color:#9997aa;cursor:pointer;padding:2px 5px;border-radius:5px;" onmouseover="this.style.background='#EEF0FD';this.style.color='#3148E8'" onmouseout="this.style.background='';this.style.color='#9997aa'" title="Details">⋯</div>
          <div onclick="deleteApplication('${app.id}')" style="font-size:14px;color:#9997aa;cursor:pointer;padding:2px 5px;border-radius:5px;" onmouseover="this.style.background='#FFEBEE';this.style.color='#dc2626'" onmouseout="this.style.background='';this.style.color='#9997aa'" title="Delete">✕</div>
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
          <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151;cursor:pointer;">
            <input type="checkbox" ${sopChecked} onchange="updateDocumentChecklist('${app.id}', 'sop_done', this.checked)" style="width:14px;height:14px;cursor:pointer;accent-color:#3148E8;">
            <span>Statement of Purpose</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151;cursor:pointer;">
            <input type="checkbox" ${cvChecked} onchange="updateDocumentChecklist('${app.id}', 'cv_done', this.checked)" style="width:14px;height:14px;cursor:pointer;accent-color:#3148E8;">
            <span>CV/Resume</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151;cursor:pointer;">
            <input type="checkbox" ${passportChecked} onchange="updateDocumentChecklist('${app.id}', 'passport_done', this.checked)" style="width:14px;height:14px;cursor:pointer;accent-color:#3148E8;">
            <span>Passport Copy</span>
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#374151;cursor:pointer;">
            <input type="checkbox" ${lorChecked} onchange="updateDocumentChecklist('${app.id}', 'lor_done', this.checked)" style="width:14px;height:14px;cursor:pointer;accent-color:#3148E8;">
            <span>Letter of Recommendation</span>
          </label>
        </div>
      </div>

      <!-- Expandable Details Section -->
      <div id="card-details-${app.id}" style="display:none;margin-bottom:10px;">
        <!-- Documents Section -->
        <div style="background:#EFF6FF;border:1px solid #DBEAFE;border-radius:8px;padding:10px;margin-bottom:10px;">
          <div style="font-size:10px;font-weight:700;color:#1E40AF;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Documents</div>
          <div style="display:flex;gap:6px;">
            <button onclick="openUploadModal('${app.id}', '${escapeHtml(app.university_name)}')" style="flex:1;padding:8px;background:#3148E8;color:white;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:4px;" onmouseover="this.style.background='#2337C7'" onmouseout="this.style.background='#3148E8'">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Upload
            </button>
            <button onclick="showApplicationDocuments('${app.id}', '${escapeHtml(app.university_name)}')" style="flex:1;padding:8px;background:white;color:#3148E8;border:1px solid #3148E8;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:4px;" onmouseover="this.style.background='#EFF6FF'" onmouseout="this.style.background='white'">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              View Files
            </button>
          </div>
        </div>
        
        <!-- Notes Section -->
        <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:10px;">
          <div style="font-size:10px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Notes</div>
          <textarea id="notes-${app.id}" placeholder="Add notes about this application..." style="width:100%;min-height:60px;padding:8px;border:1px solid #E5E7EB;border-radius:6px;font-size:11px;font-family:'DM Sans',sans-serif;color:#374151;resize:vertical;outline:none;" onfocus="this.style.borderColor='#3148E8'" onblur="this.style.borderColor='#E5E7EB'">${app.notes || ''}</textarea>
          <button onclick="saveApplicationNotes('${app.id}')" style="margin-top:6px;width:100%;padding:6px;background:#3148E8;color:white;border:none;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;" onmouseover="this.style.background='#2337C7'" onmouseout="this.style.background='#3148E8'">Save Notes</button>
        </div>
      </div>

      <div style="margin-bottom:${deadlineStr ? '10px' : '0'};">
        <select onchange="updateApplicationStatus('${app.id}', this.value)" style="width:100%;padding:6px 10px;border:1.5px solid #E6E8EC;border-radius:8px;font-size:11px;font-weight:600;font-family:'DM Sans',sans-serif;color:${colors.text};background:${colors.bg};cursor:pointer;outline:none;appearance:auto;" onfocus="this.style.borderColor='#3148E8'" onblur="this.style.borderColor='#E6E8EC'">
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

    // Remove any previously loaded Supabase cards
    document.querySelectorAll(".supabase-card").forEach(el => el.remove())

    // Group applications by status
    const grouped = {}
    for (const status of Object.keys(STATUS_COL_MAP)) {
        grouped[status] = []
    }

    if (data && data.length > 0) {
        for (const app of data) {
            const status = app.status || "Saved"
            if (grouped[status]) {
                grouped[status].push(app)
            } else {
                grouped["Saved"].push(app)
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

    // Update column counts to include Supabase data
    updateColumnCounts()

    // If no applications at all, show empty state message
    if (!data || data.length === 0) {
        const board = document.getElementById("kanban-board")
        if (board && !document.getElementById("no-apps-message")) {
            const emptyMsg = document.createElement("div")
            emptyMsg.id = "no-apps-message"
            emptyMsg.style.cssText = "position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-size:13px;color:#9997aa;background:#f5f4f1;padding:8px 18px;border-radius:10px;white-space:nowrap;z-index:5;"
            emptyMsg.textContent = "No applications added yet. Click \"+ Add University\" to get started!"
            board.style.position = "relative"
            board.appendChild(emptyMsg)
        }
    }
}

// ── Update the count badges on each column header ──
function updateColumnCounts() {
    const counts = {
        "count-saved": document.querySelectorAll("#col-saved .kb-card").length,
        "count-preparing": document.querySelectorAll("#col-preparing .kb-card").length,
        "count-submitted": document.querySelectorAll("#col-submitted .kb-card").length,
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
    const detailsDiv = document.getElementById(`card-details-${id}`)
    if (!detailsDiv) return

    if (detailsDiv.style.display === "none") {
        detailsDiv.style.display = "block"
    } else {
        detailsDiv.style.display = "none"
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

// ── Expose functions to global scope ──
window.addApplication = addApplication
window.deleteApplication = deleteApplication
window.updateApplicationStatus = updateApplicationStatus
window.updateDocumentChecklist = updateDocumentChecklist
window.saveApplicationNotes = saveApplicationNotes
window.toggleCardDetails = toggleCardDetails
window.loadApplications = loadApplications

window.openAddApplicationModal = function () {
    document.getElementById("add-application-modal").style.display = "flex"
}

window.closeAddApplicationModal = function () {
    document.getElementById("add-application-modal").style.display = "none"
}

// ── Auto-load on page ready ──
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadApplications)
} else {
    loadApplications()
}
