import { supabase } from "./supabase.js";

/**
 * Load deadline reminders for the current user
 */
async function loadDeadlineReminders() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return;
    }

    // Fetch all applications with deadlines
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .not("deadline", "is", null)
      .order("deadline", { ascending: true });

    if (appsError) {
      console.error("Error fetching applications:", appsError);
      return;
    }

    if (!applications || applications.length === 0) {
      updateNotificationBadge(0);
      return;
    }

    // Categorize deadlines
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const overdue = [];
    const dueSoon = []; // within 7 days
    const upcoming = []; // within 30 days

    for (const app of applications) {
      const deadline = new Date(app.deadline);
      deadline.setHours(0, 0, 0, 0);

      const daysUntil = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) {
        overdue.push({ ...app, daysUntil });
      } else if (daysUntil <= 7) {
        dueSoon.push({ ...app, daysUntil });
      } else if (daysUntil <= 30) {
        upcoming.push({ ...app, daysUntil });
      }
    }

    // Update notification badge count
    const totalReminders = overdue.length + dueSoon.length;
    updateNotificationBadge(totalReminders);

    // Store reminders globally for notification panel
    window.deadlineReminders = {
      overdue,
      dueSoon,
      upcoming,
      total: totalReminders,
    };

    // Update notification panel if it exists
    updateNotificationPanel();
  } catch (error) {
    console.error("Error loading deadline reminders:", error);
  }
}

/**
 * Update notification badge count
 */
function updateNotificationBadge(count) {
  const badge = document.querySelector('[onclick*="deadline alerts"]');
  if (!badge) return;

  // Find or create the red dot
  let dot = badge.querySelector('div[style*="background:#EF4444"]');
  
  if (count > 0) {
    if (!dot) {
      dot = document.createElement("div");
      dot.style.cssText = "position:absolute;top:8px;right:8px;width:7px;height:7px;border-radius:50%;background:#EF4444;border:1.5px solid #F8F9FB;";
      badge.appendChild(dot);
    }
    // Update onclick to show notification panel
    badge.onclick = function() { toggleNotificationPanel(); };
  } else {
    if (dot) {
      dot.remove();
    }
    badge.onclick = function() { 
      if (typeof showToast === "function") {
        showToast("No deadline alerts");
      }
    };
  }
}

/**
 * Toggle notification panel
 */
function toggleNotificationPanel() {
  let panel = document.getElementById("notification-panel");
  
  if (!panel) {
    createNotificationPanel();
    panel = document.getElementById("notification-panel");
  }

  if (panel.style.display === "none" || !panel.style.display) {
    panel.style.display = "block";
    updateNotificationPanel();
  } else {
    panel.style.display = "none";
  }
}

/**
 * Create notification panel
 */
function createNotificationPanel() {
  const panel = document.createElement("div");
  panel.id = "notification-panel";
  panel.style.cssText = `
    position: fixed;
    top: 70px;
    right: 32px;
    width: 360px;
    max-height: 500px;
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    z-index: 1000;
    display: none;
    overflow: hidden;
  `;

  panel.innerHTML = `
    <div style="padding: 16px 20px; border-bottom: 1px solid #F3F4F6; display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <span style="font-size: 15px; font-weight: 700; color: #111;">Deadline Reminders</span>
      </div>
      <div onclick="toggleNotificationPanel()" style="cursor: pointer; color: #9CA3AF; font-size: 20px; line-height: 1; padding: 4px;" onmouseover="this.style.color='#111'" onmouseout="this.style.color='#9CA3AF'">×</div>
    </div>
    <div id="notification-content" style="max-height: 440px; overflow-y: auto;">
      <!-- Content will be loaded here -->
    </div>
  `;

  document.body.appendChild(panel);

  // Close panel when clicking outside
  document.addEventListener("click", function(e) {
    const panel = document.getElementById("notification-panel");
    const badge = document.querySelector('[onclick*="toggleNotificationPanel"]');
    if (panel && panel.style.display === "block" && !panel.contains(e.target) && e.target !== badge && !badge?.contains(e.target)) {
      panel.style.display = "none";
    }
  });
}

/**
 * Update notification panel content
 */
function updateNotificationPanel() {
  const content = document.getElementById("notification-content");
  if (!content) return;

  const reminders = window.deadlineReminders;
  if (!reminders) {
    content.innerHTML = `
      <div style="padding: 40px 20px; text-align: center; color: #9CA3AF; font-size: 13px;">
        Loading reminders...
      </div>
    `;
    return;
  }

  if (reminders.total === 0 && reminders.upcoming.length === 0) {
    content.innerHTML = `
      <div style="padding: 40px 20px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 12px;">✅</div>
        <div style="font-size: 14px; font-weight: 600; color: #111; margin-bottom: 4px;">All caught up!</div>
        <div style="font-size: 12px; color: #9CA3AF;">No deadline reminders right now.</div>
      </div>
    `;
    return;
  }

  let html = "";

  // Overdue section
  if (reminders.overdue.length > 0) {
    html += `
      <div style="padding: 16px 20px; border-bottom: 1px solid #F3F4F6;">
        <div style="font-size: 11px; font-weight: 700; color: #DC2626; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
          Overdue (${reminders.overdue.length})
        </div>
    `;
    
    for (const app of reminders.overdue) {
      html += buildReminderItem(app, "overdue");
    }
    
    html += `</div>`;
  }

  // Due Soon section
  if (reminders.dueSoon.length > 0) {
    html += `
      <div style="padding: 16px 20px; border-bottom: 1px solid #F3F4F6;">
        <div style="font-size: 11px; font-weight: 700; color: #D97706; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
          Due Soon (${reminders.dueSoon.length})
        </div>
    `;
    
    for (const app of reminders.dueSoon) {
      html += buildReminderItem(app, "due-soon");
    }
    
    html += `</div>`;
  }

  // Upcoming section
  if (reminders.upcoming.length > 0) {
    html += `
      <div style="padding: 16px 20px;">
        <div style="font-size: 11px; font-weight: 700; color: #2563EB; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
          Upcoming (${reminders.upcoming.length})
        </div>
    `;
    
    for (const app of reminders.upcoming) {
      html += buildReminderItem(app, "upcoming");
    }
    
    html += `</div>`;
  }

  content.innerHTML = html;
}

/**
 * Build a single reminder item
 */
function buildReminderItem(app, type) {
  const colors = {
    "overdue": { bg: "#FEE2E2", color: "#DC2626", label: "Overdue" },
    "due-soon": { bg: "#FEF3C7", color: "#D97706", label: "Due Soon" },
    "upcoming": { bg: "#DBEAFE", color: "#2563EB", label: "Upcoming" }
  };

  const style = colors[type];
  const deadline = new Date(app.deadline);
  const deadlineStr = formatDeadline(app.deadline);
  const daysText = Math.abs(app.daysUntil) === 1 ? "day" : "days";
  const daysLabel = app.daysUntil < 0 
    ? `${Math.abs(app.daysUntil)} ${daysText} overdue`
    : app.daysUntil === 0
    ? "Due today"
    : `${app.daysUntil} ${daysText} left`;

  return `
    <div style="display: flex; align-items: flex-start; gap: 12px; padding: 10px; border-radius: 8px; margin-bottom: 8px; background: ${style.bg}; cursor: pointer; transition: all 0.15s;" 
         onclick="window.location.href='tracker.html'"
         onmouseover="this.style.transform='translateX(2px)'" 
         onmouseout="this.style.transform=''">
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 13px; font-weight: 600; color: #111; margin-bottom: 4px; line-height: 1.3;">
          ${escapeHtml(app.university_name || "Untitled")}
        </div>
        <div style="font-size: 11px; color: #6B7280; margin-bottom: 6px;">
          ${escapeHtml(app.program || "")} ${app.country ? "· " + escapeHtml(app.country) : ""}
        </div>
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span style="font-size: 10px; font-weight: 600; background: white; color: ${style.color}; padding: 2px 8px; border-radius: 4px;">
            ${style.label}
          </span>
          <span style="font-size: 10px; color: #6B7280;">
            📅 ${deadlineStr}
          </span>
          <span style="font-size: 10px; font-weight: 600; color: ${style.color};">
            ${daysLabel}
          </span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Format deadline for display
 */
function formatDeadline(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Expose functions globally
window.loadDeadlineReminders = loadDeadlineReminders;
window.toggleNotificationPanel = toggleNotificationPanel;

// Auto-load on page ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadDeadlineReminders);
} else {
  loadDeadlineReminders();
}
