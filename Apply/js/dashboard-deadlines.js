import { supabase } from "./supabase.js";

/**
 * Load application deadlines for the logged-in user,
 * categorise them, and render alerts on the dashboard.
 */
async function loadDeadlineAlerts() {
    const deadlinesContainer = document.getElementById("dashboard-deadlines");
    const urgentCountEl = document.getElementById("stat-urgent-deadlines");
    const subtitleEl = document.getElementById("stat-deadline-subtitle");
    const totalAppsEl = document.getElementById("stat-total-applications");

    // Get current user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        if (deadlinesContainer) deadlinesContainer.innerHTML = emptyRow("Please log in to see deadlines.");
        return;
    }

    // Fetch applications with non-null deadlines
    const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .not("deadline", "is", null)
        .order("deadline", { ascending: true });

    if (error) {
        console.error("Error loading deadline alerts:", error);
        if (deadlinesContainer) deadlinesContainer.innerHTML = emptyRow("Failed to load deadlines.");
        return;
    }

    // Also get total application count (including those without deadlines)
    const { count: totalCount } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

    if (totalAppsEl && totalCount != null) totalAppsEl.textContent = String(totalCount);

    // Categorise
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue = [];
    const urgent = []; // within 7 days
    const upcoming = []; // within 30 days

    for (const app of data || []) {
        const dl = new Date(app.deadline);
        dl.setHours(0, 0, 0, 0);
        const diffMs = dl - today;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        const entry = { ...app, _diffDays: diffDays };

        if (diffDays < 0) {
            overdue.push(entry);
        } else if (diffDays <= 7) {
            urgent.push(entry);
        } else if (diffDays <= 30) {
            upcoming.push(entry);
        }
    }

    // Update stat card
    const urgentTotal = overdue.length + urgent.length;
    if (urgentCountEl) urgentCountEl.textContent = String(urgentTotal);

    // Update subtitle
    if (subtitleEl) {
        if (urgentTotal > 0) {
            subtitleEl.innerHTML = `You have <strong style="color:#DC2626;font-weight:700;">${urgentTotal} urgent deadline${urgentTotal > 1 ? "s" : ""}</strong> this week — let's get ahead of them.`;
        } else if (upcoming.length > 0) {
            subtitleEl.innerHTML = `You have <strong style="color:#D97706;font-weight:700;">${upcoming.length} upcoming deadline${upcoming.length > 1 ? "s" : ""}</strong> in the next 30 days.`;
        } else {
            subtitleEl.textContent = "No upcoming deadlines — you're all caught up!";
        }
    }

    // Render deadline list — combine overdue + urgent + upcoming, show up to 5
    const allSorted = [...overdue, ...urgent, ...upcoming].slice(0, 5);

    if (allSorted.length === 0) {
        if (deadlinesContainer) deadlinesContainer.innerHTML = emptyRow("No upcoming deadlines.");
        return;
    }

    if (deadlinesContainer) {
        deadlinesContainer.innerHTML = allSorted.map((app) => renderDeadlineRow(app)).join("");
    }
}

// --- Helpers ---------------------------------------------------------------

function esc(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderDeadlineRow(app) {
    const name = esc(app.university_name);
    const status = esc(app.status);
    const deadlineDate = new Date(app.deadline);
    const deadlineStr = deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const diffDays = app._diffDays;

    // Label & colours
    let label, labelBg, labelColor, dateColor;
    if (diffDays < 0) {
        label = "Overdue";
        labelBg = "#FEF2F2";
        labelColor = "#DC2626";
        dateColor = "#DC2626";
    } else if (diffDays <= 7) {
        label = "Due Soon";
        labelBg = "#FFF7ED";
        labelColor = "#D97706";
        dateColor = "#D97706";
    } else {
        label = "Upcoming";
        labelBg = "#F0FDF4";
        labelColor = "#16A34A";
        dateColor = "#16A34A";
    }

    const daysText =
        diffDays < 0
            ? `${Math.abs(diffDays)}d overdue`
            : diffDays === 0
                ? "Today"
                : `${diffDays}d left`;

    return `
    <div style="padding:14px 22px;border-bottom:1px solid #F3F4F6;display:flex;align-items:center;gap:12px;transition:background 0.15s;"
         onmouseover="this.style.background='#FAFAFA'" onmouseout="this.style.background=''">
      <div style="width:6px;height:6px;min-width:6px;border-radius:50%;background:${labelColor};"></div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:600;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
        <div style="font-size:11px;color:#9CA3AF;margin-top:2px;">${status}</div>
      </div>
      <div style="text-align:right;white-space:nowrap;">
        <div style="font-size:12px;font-weight:700;color:${dateColor};">${esc(deadlineStr)}</div>
        <div style="font-size:10px;color:#9CA3AF;margin-top:2px;">${esc(daysText)}</div>
      </div>
      <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;background:${labelBg};color:${labelColor};white-space:nowrap;">${label}</span>
    </div>`;
}

function emptyRow(msg) {
    return `
    <div style="padding:32px 22px;text-align:center;">
      <div style="font-size:13px;color:#9CA3AF;">${esc(msg)}</div>
    </div>`;
}

// Auto-load on page load
loadDeadlineAlerts();
