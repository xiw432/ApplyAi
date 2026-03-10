import { supabase } from "./supabase.js";

/**
 * Load user context from Supabase (same as AI Advisor)
 */
async function loadUserContext() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select(`
        *,
        universities (
          name,
          country,
          ranking,
          tuition_fee
        )
      `)
      .eq("user_id", user.id);

    if (appsError) {
      console.error("Error fetching applications:", appsError);
    }

    const { data: savedUniversities, error: savedError } = await supabase
      .from("saved_universities")
      .select(`
        *,
        universities (
          name,
          country,
          ranking,
          tuition_fee,
          programs
        )
      `)
      .eq("user_id", user.id);

    if (savedError) {
      console.error("Error fetching saved universities:", savedError);
    }

    const context = {
      profile: profile ? {
        name: profile.full_name || user.email?.split("@")[0] || "User",
        email: user.email,
        country: profile.country,
        target_country: profile.target_country,
        degree: profile.degree_level,
        field_of_study: profile.field_of_study,
        gpa: profile.gpa,
        budget: profile.budget,
        english_score: profile.english_score,
      } : null,
      applications: applications?.map(app => ({
        university_name: app.universities?.name || app.university_name,
        country: app.universities?.country,
        program: app.program,
        status: app.status,
        deadline: app.deadline,
        progress: app.progress,
      })) || [],
      savedUniversities: savedUniversities?.map(saved => ({
        name: saved.universities?.name,
        country: saved.universities?.country,
        ranking: saved.universities?.ranking,
        programs: saved.universities?.programs,
        tuition_fee: saved.universities?.tuition_fee,
      })) || [],
    };

    return context;
  } catch (error) {
    console.error("Error loading user context:", error);
    return null;
  }
}

/**
 * Load AI-generated next actions for the dashboard
 */
async function loadAiNextActions() {
  const container = document.getElementById("ai-next-actions-list");
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div style="padding:20px;text-align:center;">
      <div style="display:inline-flex;gap:4px;align-items:center;">
        <div style="width:8px;height:8px;border-radius:50%;background:#7C3AED;animation:typing-bounce 1.4s infinite ease-in-out;"></div>
        <div style="width:8px;height:8px;border-radius:50%;background:#7C3AED;animation:typing-bounce 1.4s infinite ease-in-out 0.2s;"></div>
        <div style="width:8px;height:8px;border-radius:50%;background:#7C3AED;animation:typing-bounce 1.4s infinite ease-in-out 0.4s;"></div>
      </div>
      <div style="font-size:12px;color:#9CA3AF;margin-top:8px;">Generating personalized actions...</div>
    </div>
  `;

  try {
    // Load user context
    const context = await loadUserContext();

    // Call AI Advisor with special prompt for next actions
    const { data, error } = await supabase.functions.invoke("ai-advisor", {
      body: {
        message: "Based on this user's profile, applications, deadlines, and saved universities, generate 3 to 5 clear, specific, and actionable next steps they should take right now. Format each action as a short sentence (max 10 words). Focus on urgent deadlines, missing documents, and profile improvements. Return ONLY the actions as a numbered list, nothing else.",
        context,
      },
    });

    if (error) {
      console.error("Error loading AI next actions:", error);
      container.innerHTML = `
        <div style="padding:20px;text-align:center;color:#9CA3AF;font-size:13px;">
          Unable to load recommendations. <a href="ai-advisor.html" style="color:#7C3AED;font-weight:600;text-decoration:none;">Try AI Advisor →</a>
        </div>
      `;
      return;
    }

    if (data && data.reply) {
      // Parse the AI response into action items
      const actions = parseActionsFromReply(data.reply);
      renderNextActions(actions, container);
    } else {
      container.innerHTML = `
        <div style="padding:20px;text-align:center;color:#9CA3AF;font-size:13px;">
          No recommendations available.
        </div>
      `;
    }
  } catch (err) {
    console.error("Error calling AI for next actions:", err);
    container.innerHTML = `
      <div style="padding:20px;text-align:center;color:#9CA3AF;font-size:13px;">
        Unable to load recommendations.
      </div>
    `;
  }
}

/**
 * Parse AI reply into action items
 */
function parseActionsFromReply(reply) {
  // Split by newlines and filter out empty lines
  const lines = reply.split("\n").filter(line => line.trim());
  
  const actions = [];
  for (const line of lines) {
    // Match numbered lists like "1. Action" or "1) Action" or "- Action"
    const match = line.match(/^[\d]+[\.\)]\s*(.+)$/) || line.match(/^[-•]\s*(.+)$/);
    if (match) {
      actions.push(match[1].trim());
    } else if (line.trim() && !line.includes("Based on") && !line.includes("Here are")) {
      // Include non-numbered lines that look like actions
      actions.push(line.trim());
    }
  }
  
  // Limit to 5 actions
  return actions.slice(0, 5);
}

/**
 * Render next actions in the container
 */
function renderNextActions(actions, container) {
  if (actions.length === 0) {
    container.innerHTML = `
      <div style="padding:20px;text-align:center;color:#9CA3AF;font-size:13px;">
        You're all caught up! 🎉
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  const icons = [
    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
  ];

  const colors = [
    { bg: "#FEE2E2", color: "#DC2626" },
    { bg: "#FEF3C7", color: "#D97706" },
    { bg: "#EFF6FF", color: "#2563EB" },
    { bg: "#F3E8FF", color: "#7C3AED" },
    { bg: "#DCFCE7", color: "#16A34A" },
  ];

  actions.forEach((action, idx) => {
    const icon = icons[idx % icons.length];
    const color = colors[idx % colors.length];

    const actionDiv = document.createElement("div");
    actionDiv.style.cssText = "display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:9px;cursor:pointer;transition:all 0.15s;background:#FAFAFA;border:1px solid #F3F4F6;";
    actionDiv.onmouseover = function() {
      this.style.background = "#F0EDFF";
      this.style.borderColor = "#DDD6FE";
    };
    actionDiv.onmouseout = function() {
      this.style.background = "#FAFAFA";
      this.style.borderColor = "#F3F4F6";
    };
    actionDiv.onclick = function() {
      if (typeof showToast === "function") {
        showToast("Action noted: " + action);
      }
    };

    actionDiv.innerHTML = `
      <div style="width:28px;height:28px;border-radius:7px;background:${color.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${color.color};">
        ${icon}
      </div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;color:#111;line-height:1.4;">${escapeHtml(action)}</div>
      </div>
    `;

    container.appendChild(actionDiv);
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Add animation styles if not already present
if (!document.getElementById("typing-animation-style")) {
  const style = document.createElement("style");
  style.id = "typing-animation-style";
  style.textContent = `
    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-8px); }
    }
  `;
  document.head.appendChild(style);
}

// Auto-load on page ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadAiNextActions);
} else {
  loadAiNextActions();
}

// Expose function globally
window.loadAiNextActions = loadAiNextActions;
