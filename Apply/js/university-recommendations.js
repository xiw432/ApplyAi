import { supabase } from "./supabase.js";

/**
 * Load recommended universities based on user profile
 */
async function loadRecommendedUniversities() {
  const container = document.getElementById("recommended-universities-list");
  if (!container) return;

  // Show loading state
  container.innerHTML = `
    <div style="padding:32px 22px;text-align:center;">
      <div style="font-size:13px;color:#9CA3AF;">Loading recommendations...</div>
    </div>
  `;

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error getting user:", userError);
      showNoRecommendations(container);
      return;
    }

    // Load user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error loading profile:", profileError);
      showNoRecommendations(container);
      return;
    }

    // If no profile exists, still try to show some recommendations
    if (!profile) {
      console.log("No profile found, showing general recommendations");
    }

    // Get universities user has already saved
    const { data: savedUniversities } = await supabase
      .from("saved_universities")
      .select("university_id")
      .eq("user_id", user.id);

    const savedIds = savedUniversities?.map(s => s.university_id) || [];

    // Get universities user has already applied to
    const { data: applications } = await supabase
      .from("applications")
      .select("university_name")
      .eq("user_id", user.id);

    const appliedNames = applications?.map(a => a.university_name?.toLowerCase()) || [];

    // Build query for recommendations
    let query = supabase
      .from("universities")
      .select("*");

    // Filter by target country if available
    if (profile && profile.target_country) {
      query = query.eq("country", profile.target_country);
    }

    // Filter by degree level if available
    if (profile && profile.degree_level) {
      query = query.contains("degree_levels", [profile.degree_level]);
    }

    // Exclude already saved universities
    if (savedIds.length > 0) {
      query = query.not("id", "in", `(${savedIds.join(",")})`);
    }

    // Order by ranking (ascending = better ranking)
    query = query.order("ranking", { ascending: true });

    // Limit to 10 for filtering
    query = query.limit(10);

    const { data: universities, error: uniError } = await query;

    if (uniError) {
      console.error("Error loading universities:", uniError);
      showNoRecommendations(container);
      return;
    }

    if (!universities || universities.length === 0) {
      showNoRecommendations(container);
      return;
    }

    // Filter out universities user has already applied to (by name)
    let recommendations = universities.filter(uni => 
      !appliedNames.includes(uni.name?.toLowerCase())
    );

    // If budget is available, sort by tuition proximity
    if (profile && profile.budget && recommendations.length > 0) {
      recommendations = sortByBudgetProximity(recommendations, profile.budget);
    }

    // Take top 5 recommendations
    recommendations = recommendations.slice(0, 5);

    if (recommendations.length === 0) {
      showNoRecommendations(container);
      return;
    }

    // Render recommendations
    renderRecommendations(recommendations, container);

  } catch (error) {
    console.error("Error loading recommendations:", error);
    showNoRecommendations(container);
  }
}

/**
 * Sort universities by budget proximity
 */
function sortByBudgetProximity(universities, budget) {
  // Parse budget (e.g., "$20,000" -> 20000)
  const budgetNum = parseBudget(budget);
  if (!budgetNum) return universities;

  return universities.sort((a, b) => {
    const tuitionA = parseBudget(a.tuition_fee) || Infinity;
    const tuitionB = parseBudget(b.tuition_fee) || Infinity;

    const diffA = Math.abs(tuitionA - budgetNum);
    const diffB = Math.abs(tuitionB - budgetNum);

    return diffA - diffB;
  });
}

/**
 * Parse budget string to number
 */
function parseBudget(budgetStr) {
  if (!budgetStr) return null;
  const cleaned = budgetStr.toString().replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

/**
 * Show no recommendations message
 */
function showNoRecommendations(container) {
  container.style.cssText = "padding:32px 22px;text-align:center;";
  container.innerHTML = `
    <div style="font-size:40px;margin-bottom:12px;">🎓</div>
    <div style="font-size:13px;color:#9CA3AF;">No recommendations available yet.</div>
    <div style="font-size:12px;color:#9CA3AF;margin-top:4px;">Complete your profile to get personalized matches.</div>
  `;
}

/**
 * Render recommendations
 */
function renderRecommendations(universities, container) {
  container.innerHTML = "";
  container.style.cssText = "display:grid;grid-template-columns:repeat(3,1fr);gap:0;";

  universities.forEach((uni, index) => {
    const initial = uni.name ? uni.name.charAt(0).toUpperCase() : "U";
    const colors = [
      { bg: "#EFF6FF", color: "#2563EB" },
      { bg: "#F0FDF4", color: "#16A34A" },
      { bg: "#FEF3C7", color: "#D97706" },
      { bg: "#FAF5FF", color: "#7C3AED" },
      { bg: "#FEE2E2", color: "#DC2626" },
    ];
    const colorScheme = colors[index % colors.length];

    // Calculate real match percentage based on multiple factors
    let matchScore = 70; // Base score
    
    // Ranking bonus (better ranking = higher match)
    if (uni.ranking && uni.ranking <= 100) matchScore += 15;
    else if (uni.ranking && uni.ranking <= 500) matchScore += 10;
    else if (uni.ranking) matchScore += 5;
    
    // Position bonus (first results are typically better matches)
    matchScore += (5 - index) * 2;
    
    // Cap at 100
    matchScore = Math.min(100, matchScore);

    // Format programs
    const programs = Array.isArray(uni.programs) 
      ? uni.programs.slice(0, 2).join(", ")
      : uni.programs || "Various Programs";

    // Format deadline
    const deadlineStr = uni.deadline ? formatDeadline(uni.deadline) : "Check website";

    const card = document.createElement("div");
    card.style.cssText = "padding:18px 22px;border:1px solid rgba(0,0,0,0.85);border-radius:12px;cursor:pointer;transition:all 0.15s;background:white;margin:8px;box-shadow:0 2px 8px rgba(0,0,0,0.04);";
    card.onmouseover = function() { 
      this.style.background = "#FAFAFA";
      this.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
    };
    card.onmouseout = function() { 
      this.style.background = "white";
      this.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
    };
    card.onclick = function() {
      if (typeof showToast === "function") {
        showToast(`Opening ${uni.name}...`);
      }
      // Could navigate to university details page
      window.location.href = `university.html?id=${uni.id}`;
    };

    card.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;border-radius:8px;background:${colorScheme.bg};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:${colorScheme.color};">
            ${initial}
          </div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#111;line-height:1.2;">${escapeHtml(uni.name || "Unknown")}</div>
            <div style="font-size:11px;color:#9CA3AF;">${escapeHtml(uni.country || "")} ${uni.ranking ? `· Rank ${uni.ranking}` : ""}</div>
          </div>
        </div>
        <span style="font-size:13px;font-weight:800;color:#16A34A;">${matchScore}%</span>
      </div>
      <div style="height:4px;background:#F0FDF4;border-radius:999px;overflow:hidden;margin-bottom:10px;">
        <div style="width:${matchScore}%;height:100%;background:linear-gradient(90deg,#16A34A,#4ADE80);border-radius:999px;"></div>
      </div>
      <div style="font-size:11px;color:#6B7280;margin-bottom:8px;line-height:1.4;">${escapeHtml(programs)}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:11px;color:#9CA3AF;">Deadline</span>
        <span style="font-size:11.5px;font-weight:700;color:#2563EB;">${deadlineStr}</span>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * Format deadline for display
 */
function formatDeadline(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  } catch (e) {
    return "TBA";
  }
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

// Expose function globally
window.loadRecommendedUniversities = loadRecommendedUniversities;

// Auto-load on page ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadRecommendedUniversities);
} else {
  loadRecommendedUniversities();
}
