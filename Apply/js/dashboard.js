import { supabase } from "./supabase.js"

async function loadDashboardStats() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)

    if (error) {
        console.error("Error loading dashboard stats:", error.message)
        return
    }

    const apps = data || []

    // Calculate statistics
    const totalApplications = apps.length
    const savedCount = apps.filter(a => a.status === "Saved").length
    const preparingCount = apps.filter(a => a.status === "Preparing").length
    const submittedCount = apps.filter(a => a.status === "Submitted").length
    const interviewCount = apps.filter(a => a.status === "Interview").length
    const acceptedCount = apps.filter(a => a.status === "Accepted").length
    const rejectedCount = apps.filter(a => a.status === "Rejected").length

    // Count urgent deadlines (within 14 days)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const urgentDeadlines = apps.filter(a => {
        if (!a.deadline) return false
        const d = new Date(a.deadline)
        d.setHours(0, 0, 0, 0)
        const daysLeft = Math.ceil((d - now) / (1000 * 60 * 60 * 24))
        return daysLeft >= 0 && daysLeft <= 14
    }).length

    // Update stat cards
    const totalEl = document.getElementById("stat-total-applications")
    if (totalEl) totalEl.textContent = totalApplications

    const urgentEl = document.getElementById("stat-urgent-deadlines")
    if (urgentEl) urgentEl.textContent = urgentDeadlines

    // Update the "Active" badge in Application Tracker header
    const activeEl = document.getElementById("stat-active-count")
    if (activeEl) activeEl.textContent = totalApplications + " Active"

    // Update the greeting subtitle with dynamic deadline info
    const subtitleEl = document.getElementById("stat-deadline-subtitle")
    if (subtitleEl) {
        if (urgentDeadlines > 0) {
            subtitleEl.innerHTML = `You have <strong style="color:#DC2626;font-weight:700;">${urgentDeadlines} urgent deadline${urgentDeadlines !== 1 ? 's' : ''}</strong> this week — let's get ahead of them.`
        } else {
            subtitleEl.innerHTML = `No urgent deadlines right now — great time to prepare your next application!`
        }
    }

    // Update sidebar badge for Applications count
    const sidebarAppsEl = document.getElementById("sidebar-apps-count")
    if (sidebarAppsEl) sidebarAppsEl.textContent = totalApplications

    // Render application rows in the tracker table
    renderApplicationRows(apps)

    // Render upcoming deadlines
    renderUpcomingDeadlines(apps)
}

// ── Status color mapping ──
const STATUS_STYLES = {
    "Saved": { bg: "#F3F4F6", color: "#6B7280", label: "Saved" },
    "Preparing": { bg: "#FEF3C7", color: "#D97706", label: "In Progress" },
    "Submitted": { bg: "#DBEAFE", color: "#1D4ED8", label: "Submitted" },
    "Interview": { bg: "#EDE9FE", color: "#7C3AED", label: "Interview" },
    "Accepted": { bg: "#DCFCE7", color: "#16A34A", label: "Accepted" },
    "Rejected": { bg: "#FEE2E2", color: "#DC2626", label: "Rejected" }
}

function getInitials(name) {
    if (!name) return "?"
    const words = name.trim().split(/\s+/)
    if (words.length === 1) return words[0].substring(0, 3).toUpperCase()
    return words.map(w => w[0]).join("").substring(0, 3).toUpperCase()
}

function daysUntil(dateStr) {
    if (!dateStr) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

function formatDeadline(dateStr) {
    if (!dateStr) return "—"
    const d = new Date(dateStr)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

// ── Render application rows in the tracker table ──
function renderApplicationRows(apps) {
    const container = document.getElementById("dashboard-app-rows")
    if (!container) return

    container.innerHTML = ""

    if (apps.length === 0) {
        container.innerHTML = `
            <div style="padding:32px 24px;text-align:center;color:#9CA3AF;font-size:13px;">
                No applications yet. <a href="tracker.html" style="color:#2563EB;font-weight:600;text-decoration:none;">Add your first application →</a>
            </div>`
        return
    }

    // Show up to 5 most recent applications
    const recent = apps.slice(0, 5)
    for (const app of recent) {
        const style = STATUS_STYLES[app.status] || STATUS_STYLES["Saved"]
        const initials = getInitials(app.university_name)
        const days = daysUntil(app.deadline)
        const deadlineStr = formatDeadline(app.deadline)

        let daysLabel = ""
        if (days !== null) {
            if (days < 0) daysLabel = `<div style="font-size:11px;color:#DC2626;">Passed</div>`
            else if (days <= 14) daysLabel = `<div style="font-size:11px;color:#DC2626;">${days} days left</div>`
            else if (days <= 30) daysLabel = `<div style="font-size:11px;color:#D97706;">${days} days left</div>`
            else daysLabel = `<div style="font-size:11px;color:#16A34A;">${days} days left</div>`
        }

        // Random-ish gradient based on name
        const hash = (app.university_name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)
        const gradients = [
            "#0F172A", "#1E3A5F", "#6600AA", "#7B0000", "#003366", "#8C1515", "#1B3D6F"
        ]
        const bgColor = gradients[hash % gradients.length]

        container.insertAdjacentHTML("beforeend", `
            <div style="display:grid;grid-template-columns:2.2fr 1fr 1.6fr 1.3fr;padding:16px 24px;border-bottom:1px solid #F9FAFB;align-items:center;cursor:pointer;transition:background 0.15s;"
                 onmouseover="this.style.background='#FAFAFA'" onmouseout="this.style.background=''">
                <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
                    <div style="width:36px;height:36px;min-width:36px;border-radius:9px;background:${bgColor};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:white;font-family:'Fraunces',serif;">${initials}</div>
                    <div>
                        <div style="font-size:13.5px;font-weight:600;color:#111;">${app.university_name || "Untitled"}</div>
                        <div style="font-size:11.5px;color:#9CA3AF;">${app.program || ""} · ${app.country || ""}</div>
                    </div>
                </div>
                <div><span style="font-size:11px;font-weight:700;background:${style.bg};color:${style.color};padding:3px 10px;border-radius:6px;">${style.label}</span></div>
                <div>
                    <div style="font-size:12.5px;color:#6B7280;">${deadlineStr}</div>
                    ${daysLabel}
                </div>
                <div style="font-size:12px;color:#6B7280;font-weight:500;">${app.notes || "—"}</div>
            </div>
        `)
    }
}

// ── Render upcoming deadlines ──
function renderUpcomingDeadlines(apps) {
    const container = document.getElementById("dashboard-deadlines")
    if (!container) return

    // Filter apps with deadlines in the future, sort by deadline
    const upcoming = apps
        .filter(a => a.deadline && daysUntil(a.deadline) >= 0)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 3)

    container.innerHTML = ""

    if (upcoming.length === 0) {
        container.innerHTML = `
            <div style="padding:24px 22px;text-align:center;color:#9CA3AF;font-size:13px;">
                No upcoming deadlines
            </div>`
        return
    }

    for (const app of upcoming) {
        const d = new Date(app.deadline)
        const day = d.getDate()
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const month = months[d.getMonth()]
        const days = daysUntil(app.deadline)

        let urgencyColor, urgencyBg, barColor
        if (days <= 14) {
            urgencyColor = "#DC2626"; urgencyBg = "#FEE2E2"; barColor = "#FCA5A5"
        } else if (days <= 30) {
            urgencyColor = "#D97706"; urgencyBg = "#FEF3C7"; barColor = "#FCD34D"
        } else {
            urgencyColor = "#16A34A"; urgencyBg = "#DCFCE7"; barColor = "#86EFAC"
        }

        container.insertAdjacentHTML("beforeend", `
            <div style="display:flex;align-items:center;gap:16px;padding:14px 22px;border-bottom:1px solid #F9FAFB;cursor:pointer;transition:background 0.15s;"
                 onmouseover="this.style.background='#FAFAFA'" onmouseout="this.style.background=''">
                <div style="min-width:38px;text-align:center;">
                    <div style="font-size:20px;font-weight:800;color:${urgencyColor};">${day}</div>
                    <div style="font-size:9px;font-weight:600;color:#9CA3AF;text-transform:uppercase;">${month}</div>
                </div>
                <div style="width:3px;height:36px;border-radius:2px;background:${barColor};"></div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:600;color:#111;">${app.university_name || "Untitled"}</div>
                    <div style="font-size:11.5px;color:#9CA3AF;">${app.program || ""}</div>
                </div>
                <span style="font-size:10.5px;font-weight:700;background:${urgencyBg};color:${urgencyColor};padding:2px 9px;border-radius:6px;">${days} days</span>
            </div>
        `)
    }
}

// Auto-load on page ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadDashboardStats)
} else {
    loadDashboardStats()
}
