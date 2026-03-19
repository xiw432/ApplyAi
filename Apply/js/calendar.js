import { supabase } from "./supabase.js"
import { initPageHeader, getUpcomingDeadlinesCount } from "./page-header.js"

// Current calendar state
let currentYear = new Date().getFullYear()
let currentMonth = new Date().getMonth()
let currentView = "week" // day, week, month

// ── Initialize page ──
async function init() {
    // Initialize page header with dynamic subtitle
    await initPageHeader({
        pageTitle: "Calendar",
        pageCategory: "Schedule",
        getSubtitle: async (user) => {
            const count = await getUpcomingDeadlinesCount()
            if (count === 0) {
                return "No upcoming deadlines"
            }
            if (count === 1) {
                return "1 upcoming deadline"
            }
            return `${count} upcoming deadlines`
        }
    })

    // Load deadlines and render calendar
    await loadDeadlines()
    renderMiniCalendar()
    renderMainCalendar()
}

// ── Load deadlines from Supabase ──
async function loadDeadlines() {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .not("deadline", "is", null)
        .order("deadline", { ascending: true })

    if (error) {
        console.error("Error loading deadlines:", error.message)
        return
    }

    const apps = data || []

    // Render deadline cards in the right panel
    renderDeadlineCards(apps)

    // Mark deadline dates on the mini calendar
    markMiniCalendarDeadlines(apps)

    // Update the deadline count badge
    updateDeadlineCount(apps)
}

function daysUntil(dateStr) {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

function formatDate(dateStr) {
    const d = new Date(dateStr)
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return `${months[d.getMonth()]} ${d.getDate()}`
}

// ── Render deadline cards in the right panel ──
function renderDeadlineCards(apps) {
    const container = document.getElementById("calendar-deadlines")
    if (!container) return

    container.innerHTML = ""

    // Filter to future + today deadlines
    const upcoming = apps.filter(a => daysUntil(a.deadline) >= 0)

    if (upcoming.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:24px 16px;color:#9CA3AF;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 10px;display:block;"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <div style="font-size:13px;font-weight:600;margin-bottom:4px;">No upcoming deadlines</div>
                <div style="font-size:11.5px;">Add deadlines in your <a href="tracker.html" style="color:#2563EB;text-decoration:none;font-weight:600;">Application Tracker</a></div>
            </div>`
        return
    }

    for (const app of upcoming) {
        const days = daysUntil(app.deadline)
        const dateStr = formatDate(app.deadline)

        let dotColor, labelBg, labelColor
        if (days <= 14) {
            dotColor = "#EF4444"; labelBg = "#FEE2E2"; labelColor = "#DC2626"
        } else if (days <= 30) {
            dotColor = "#F59E0B"; labelBg = "#FEF3C7"; labelColor = "#D97706"
        } else {
            dotColor = "#10B981"; labelBg = "#D1FAE5"; labelColor = "#059669"
        }

        container.insertAdjacentHTML("beforeend", `
            <div style="background:white;border:1px solid #E6E8EC;border-radius:12px;padding:14px;cursor:pointer;transition:all 0.15s;box-shadow:0 2px 8px rgba(0,0,0,0.04);" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)';this.style.transform='translateY(-1px)'" onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';this.style.transform=''">
                <div style="display:flex;align-items:flex-start;gap:10px;">
                    <div style="width:8px;height:8px;border-radius:50%;background:${dotColor};margin-top:4px;flex-shrink:0;"></div>
                    <div style="flex:1;">
                        <div style="font-size:12.5px;font-weight:700;color:#111;margin-bottom:2px;">${app.university_name || "Untitled"}</div>
                        <div style="font-size:11px;color:#888;margin-bottom:6px;">${app.program || "Application Deadline"}</div>
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                            <span style="font-size:11px;font-weight:600;color:${labelColor};">${dateStr}</span>
                            <span style="font-size:10px;font-weight:600;background:${labelBg};color:${labelColor};padding:2px 8px;border-radius:6px;">${days} day${days !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>
        `)
    }
}

// ── Mark deadline dates on the mini calendar ──
function markMiniCalendarDeadlines(apps) {
    const grid = document.getElementById("mini-cal-grid")
    if (!grid) return

    // Collect deadline dates as YYYY-MM-DD strings
    const deadlineDates = new Set(apps.map(a => a.deadline))

    // Find all day cells in the mini calendar grid and mark those with deadlines
    const dayCells = grid.querySelectorAll("[data-date]")
    for (const cell of dayCells) {
        const cellDate = cell.getAttribute("data-date")
        if (deadlineDates.has(cellDate)) {
            // Add a small red dot indicator
            if (!cell.querySelector(".deadline-dot")) {
                const dot = document.createElement("div")
                dot.className = "deadline-dot"
                dot.style.cssText = "width:4px;height:4px;border-radius:50%;background:#EF4444;margin:1px auto 0;"
                cell.appendChild(dot)
            }
        }
    }
}

// ── Update the deadline count badge ──
function updateDeadlineCount(apps) {
    const badge = document.getElementById("calendar-deadline-count")
    if (!badge) {
        return
    }
    const upcoming = apps.filter(a => daysUntil(a.deadline) >= 0)
    badge.textContent = upcoming.length
}

// Expose globally
window.loadDeadlines = loadDeadlines
window.calNav = calNav
window.goToday = goToday
window.setCalView = setCalView
window.openEventModal = openEventModal

// Calendar navigation functions
function calNav(direction) {
    currentMonth += direction
    if (currentMonth > 11) {
        currentMonth = 0
        currentYear++
    } else if (currentMonth < 0) {
        currentMonth = 11
        currentYear--
    }
    renderMiniCalendar()
    renderMainCalendar()
}

function goToday() {
    const now = new Date()
    currentYear = now.getFullYear()
    currentMonth = now.getMonth()
    renderMiniCalendar()
    renderMainCalendar()
}

function setCalView(view) {
    currentView = view
    // Update button styles
    const buttons = {
        day: document.getElementById("vbtn-day"),
        week: document.getElementById("vbtn-week"),
        month: document.getElementById("vbtn-month")
    }
    
    for (const [key, btn] of Object.entries(buttons)) {
        if (btn) {
            if (key === view) {
                btn.style.background = "#111"
                btn.style.color = "white"
                btn.style.fontWeight = "600"
            } else {
                btn.style.background = "transparent"
                btn.style.color = "#777"
                btn.style.fontWeight = "500"
            }
        }
    }
    
    renderMainCalendar()
}

function openEventModal() {
    window.showToast("Custom events coming soon")
}

// Render mini calendar
function renderMiniCalendar() {
    const monthLabel = document.getElementById("mini-month-label")
    const grid = document.getElementById("mini-cal-grid")
    
    if (!grid) return
    
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    
    if (monthLabel) {
        monthLabel.textContent = `${months[currentMonth]} ${currentYear}`
    }
    
    // Update main calendar month label too
    const mainLabel = document.getElementById("cal-month-label")
    if (mainLabel) {
        mainLabel.textContent = `${months[currentMonth]} ${currentYear}`
    }
    
    // Generate calendar grid
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth
    const todayDate = today.getDate()
    
    grid.innerHTML = ""
    
    // Add day headers
    const dayHeaders = ["S", "M", "T", "W", "T", "F", "S"]
    dayHeaders.forEach(day => {
        const header = document.createElement("div")
        header.style.cssText = "text-align:center;font-size:10px;font-weight:600;color:#999;padding:4px 0;"
        header.textContent = day
        grid.appendChild(header)
    })
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div")
        grid.appendChild(empty)
    }
    
    // Add day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div")
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        cell.setAttribute("data-date", dateStr)
        
        const isToday = isCurrentMonth && day === todayDate
        
        cell.style.cssText = `
            text-align:center;
            font-size:11px;
            padding:6px 4px;
            cursor:pointer;
            border-radius:6px;
            transition:background 0.15s;
            ${isToday ? 'background:#111;color:white;font-weight:700;' : 'color:#333;'}
        `
        
        if (!isToday) {
            cell.onmouseover = () => cell.style.background = "#f0f0f0"
            cell.onmouseout = () => cell.style.background = ""
        }
        
        cell.textContent = day
        grid.appendChild(cell)
    }
}

// Render main calendar view
function renderMainCalendar() {
    // For now, just update the month label
    // Full calendar rendering would go here
    const mainLabel = document.getElementById("cal-month-label")
    if (mainLabel) {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        mainLabel.textContent = `${months[currentMonth]} ${currentYear}`
    }
}

// Auto-load on page ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
} else {
    init()
}
