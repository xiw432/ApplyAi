import { supabase } from "./supabase.js";

/**
 * Calculate profile strength based on real user data
 */
async function calculateProfileStrength() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error getting user:", userError);
      return { percentage: 0, suggestions: ["Please log in to see your profile strength"] };
    }

    const completionFactors = [];
    const suggestions = [];

    // Fetch profile data
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Check profile fields
    if (profile?.full_name) {
      completionFactors.push("name");
    } else {
      suggestions.push("Add your full name");
    }

    if (profile?.country) {
      completionFactors.push("country");
    } else {
      suggestions.push("Add your current country");
    }

    if (profile?.target_country) {
      completionFactors.push("target_country");
    } else {
      suggestions.push("Add your target country");
    }

    if (profile?.degree_level) {
      completionFactors.push("degree");
    } else {
      suggestions.push("Add your degree level");
    }

    if (profile?.field_of_study) {
      completionFactors.push("field");
    } else {
      suggestions.push("Add your field of study");
    }

    if (profile?.budget) {
      completionFactors.push("budget");
    } else {
      suggestions.push("Add your budget");
    }

    if (profile?.gpa) {
      completionFactors.push("gpa");
    }

    if (profile?.english_score) {
      completionFactors.push("english");
    }

    // Fetch saved universities
    const { data: savedUniversities } = await supabase
      .from("saved_universities")
      .select("id")
      .eq("user_id", user.id);

    if (savedUniversities && savedUniversities.length > 0) {
      completionFactors.push("saved_universities");
    } else {
      suggestions.push("Save at least one university");
    }

    // Fetch applications
    const { data: applications } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id);

    if (applications && applications.length > 0) {
      completionFactors.push("applications");

      // Check for document checklist completion
      const hasChecklist = applications.some(app => 
        app.sop_done || app.cv_done || app.passport_done || app.lor_done
      );
      if (hasChecklist) {
        completionFactors.push("checklist");
      } else {
        suggestions.push("Complete document checklists");
      }

      // Check for notes
      const hasNotes = applications.some(app => app.notes && app.notes.trim() !== "");
      if (hasNotes) {
        completionFactors.push("notes");
      }

      // Check for uploaded documents
      const hasDocuments = applications.some(app => 
        app.documents && Array.isArray(app.documents) && app.documents.length > 0
      );
      if (hasDocuments) {
        completionFactors.push("documents");
      } else {
        suggestions.push("Upload application documents");
      }
    } else {
      suggestions.push("Add your first application");
    }

    // Calculate percentage
    const totalFactors = 12; // Total possible completion factors
    const percentage = Math.round((completionFactors.length / totalFactors) * 100);

    return { percentage, suggestions: suggestions.slice(0, 3) }; // Return top 3 suggestions
  } catch (error) {
    console.error("Error calculating profile strength:", error);
    return { percentage: 0, suggestions: ["Error loading profile data"] };
  }
}

/**
 * Render circular progress tracker
 */
function renderCircularProgress(percentage) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine color based on percentage
  let color, bgColor;
  if (percentage >= 80) {
    color = "#16A34A"; // Green
    bgColor = "#F0FDF4";
  } else if (percentage >= 50) {
    color = "#7C3AED"; // Purple
    bgColor = "#FAF5FF";
  } else {
    color = "#D97706"; // Orange
    bgColor = "#FEF3C7";
  }

  return `
    <svg width="120" height="120" viewBox="0 0 120 120" style="transform: rotate(-90deg);">
      <!-- Background circle -->
      <circle
        cx="60"
        cy="60"
        r="${radius}"
        fill="none"
        stroke="${bgColor}"
        stroke-width="8"
      />
      <!-- Progress circle -->
      <circle
        cx="60"
        cy="60"
        r="${radius}"
        fill="none"
        stroke="${color}"
        stroke-width="8"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"
        stroke-linecap="round"
        style="transition: stroke-dashoffset 0.8s ease;"
      />
    </svg>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#111;line-height:1;letter-spacing:-0.5px;">${percentage}<span style="font-size:16px;color:#6B7280;font-weight:600;">%</span></div>
      <div style="font-size:11px;color:#9CA3AF;margin-top:4px;font-weight:600;">Complete</div>
    </div>
  `;
}

/**
 * Load and display profile strength
 */
async function loadProfileStrength() {
  const container = document.getElementById("profile-strength-card");
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div style="padding:24px;text-align:center;">
      <div style="font-size:13px;color:#9CA3AF;">Calculating...</div>
    </div>
  `;

  const { percentage, suggestions } = await calculateProfileStrength();

  // Render the card with circular progress
  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:20px;padding:20px 22px;">
      <div style="position:relative;width:120px;height:120px;flex-shrink:0;">
        ${renderCircularProgress(percentage)}
      </div>
      <div style="flex:1;">
        <div style="font-size:15px;font-weight:700;color:#111;margin-bottom:8px;">Profile Strength</div>
        ${suggestions.length > 0 ? `
          <div style="font-size:12px;color:#6B7280;margin-bottom:6px;font-weight:500;">Next steps:</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${suggestions.map(s => `
              <div style="display:flex;align-items:center;gap:6px;">
                <div style="width:4px;height:4px;border-radius:50%;background:#7C3AED;flex-shrink:0;"></div>
                <div style="font-size:11.5px;color:#6B7280;">${s}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="font-size:12px;color:#16A34A;font-weight:600;">🎉 Your profile is complete!</div>
        `}
      </div>
    </div>
  `;
}

// Expose function globally
window.loadProfileStrength = loadProfileStrength;

// Auto-load on page ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadProfileStrength);
} else {
  loadProfileStrength();
}
