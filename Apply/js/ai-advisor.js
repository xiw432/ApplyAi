import { supabase } from "./supabase.js";

/**
 * Load user context from Supabase
 */
async function loadUserContext() {
  console.log("=== Loading User Context ===");
  try {
    // Get current user
    console.log("Fetching current user...");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error getting user:", userError);
      console.error("User object:", user);
      return null;
    }
    console.log("User fetched successfully:", user.id);

    // Fetch user profile
    console.log("Fetching user profile...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      console.error("Profile error details:", JSON.stringify(profileError, null, 2));
    } else if (profile) {
      console.log("Profile fetched successfully");
    } else {
      console.log("No profile found for user - using fallback");
    }

    // Fetch applications (without join)
    console.log("Fetching applications...");
    const { data: applications, error: appsError } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id);

    if (appsError) {
      console.error("Error fetching applications:", appsError);
      console.error("Applications error details:", JSON.stringify(appsError, null, 2));
    } else {
      console.log("Applications fetched:", applications?.length || 0);
    }

    // Fetch saved universities (without join)
    console.log("Fetching saved universities...");
    const { data: savedUniversities, error: savedError } = await supabase
      .from("saved_universities")
      .select("*")
      .eq("user_id", user.id);

    if (savedError) {
      console.error("Error fetching saved universities:", savedError);
      console.error("Saved universities error details:", JSON.stringify(savedError, null, 2));
    } else {
      console.log("Saved universities fetched:", savedUniversities?.length || 0);
    }

    // Fetch university details if needed
    let universityDetails = {};
    const universityIds = new Set();
    
    // Collect university IDs from saved universities
    if (savedUniversities && savedUniversities.length > 0) {
      savedUniversities.forEach(saved => {
        if (saved.university_id) {
          universityIds.add(saved.university_id);
        }
      });
    }

    // Fetch university details for saved universities
    if (universityIds.size > 0) {
      console.log("Fetching university details for", universityIds.size, "universities...");
      const { data: universities, error: uniError } = await supabase
        .from("universities")
        .select("id, name, country, ranking, tuition_fee, programs")
        .in("id", Array.from(universityIds));

      if (uniError) {
        console.error("Error fetching universities:", uniError);
      } else if (universities) {
        universities.forEach(uni => {
          universityDetails[uni.id] = uni;
        });
        console.log("University details fetched:", universities.length);
      }
    }

    // Build context object
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
        university_name: app.university_name,
        country: app.country,
        program: app.program,
        status: app.status,
        deadline: app.deadline,
        progress: app.progress,
      })) || [],
      savedUniversities: savedUniversities?.map(saved => {
        const uni = universityDetails[saved.university_id];
        return {
          name: uni?.name || saved.university_name,
          country: uni?.country,
          ranking: uni?.ranking,
          programs: uni?.programs,
          tuition_fee: uni?.tuition_fee,
        };
      }) || [],
    };

    console.log("Context built successfully");
    console.log("=== User Context Complete ===");
    return context;
  } catch (error) {
    console.error("=== User Context Exception ===");
    console.error("Exception in loadUserContext:", error);
    console.error("Exception message:", error.message);
    console.error("Exception stack:", error.stack);
    return null;
  }
}

/**
 * Send a message to the AI Advisor via Supabase Edge Function
 */
async function sendAdvisorMsg() {
  const input = document.getElementById("advisor-input");
  const messagesContainer = document.getElementById("advisor-messages");
  const sendBtn = document.getElementById("advisor-send-btn");

  if (!input || !messagesContainer) return;

  const message = input.value.trim();
  if (!message) return;

  // DEBUG: Log the user's input message
  console.log("=== AI Advisor Request Start ===");
  console.log("AI message:", message);
  console.log("Message length:", message.length);

  // Disable input and button while processing
  input.disabled = true;
  if (sendBtn) sendBtn.disabled = true;

  // Clear input immediately
  input.value = "";
  input.style.height = "auto";

  // Append user message to chat
  appendUserMessage(message, messagesContainer);

  // Show typing indicator
  const typingId = showTypingIndicator(messagesContainer);

  try {
    // Load user context
    console.log("Loading user context...");
    const context = await loadUserContext();
    console.log("User context loaded:", context ? "Success" : "Failed");
    if (context) {
      console.log("Context profile:", context.profile);
      console.log("Context applications count:", context.applications?.length || 0);
      console.log("Context saved universities count:", context.savedUniversities?.length || 0);
    }

    // DEBUG: Log the request payload
    const requestPayload = { message, context };
    console.log("Request payload:", requestPayload);

    // Call Supabase Edge Function with message and context
    console.log("Calling Supabase Edge Function: ai-advisor");
    const startTime = Date.now();
    const { data, error } = await supabase.functions.invoke("ai-advisor", {
      body: requestPayload,
    });
    const endTime = Date.now();
    console.log(`Function call completed in ${endTime - startTime}ms`);

    // DEBUG: Log the raw response
    console.log("AI function response data:", data);
    console.log("AI function response error:", error);

    // Remove typing indicator
    removeTypingIndicator(typingId);

    if (error) {
      // DEBUG: Log detailed error information
      console.error("=== AI Advisor Error ===");
      console.error("Error object:", error);
      console.error("Error message:", error.message);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      appendAiMessage(
        "Something went wrong. Please try again.",
        messagesContainer,
        true
      );
    } else if (data && data.reply) {
      // DEBUG: Log successful response
      console.log("=== AI Advisor Success ===");
      console.log("Reply received:", data.reply);
      console.log("Reply length:", data.reply.length);
      console.log("Reply preview:", data.reply.substring(0, 100) + "...");
      
      appendAiMessage(data.reply, messagesContainer);
    } else {
      // DEBUG: Log unexpected response format
      console.warn("=== AI Advisor Unexpected Response ===");
      console.warn("Data exists:", !!data);
      console.warn("Data.reply exists:", !!(data && data.reply));
      console.warn("Full data object:", data);
      
      appendAiMessage(
        "Something went wrong. Please try again.",
        messagesContainer,
        true
      );
    }
    
    console.log("=== AI Advisor Request End ===");
  } catch (err) {
    // DEBUG: Log exception details
    console.error("=== AI Advisor Exception ===");
    console.error("Exception caught:", err);
    console.error("Exception message:", err.message);
    console.error("Exception stack:", err.stack);
    console.error("Exception details:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    
    removeTypingIndicator(typingId);
    appendAiMessage(
      "Something went wrong. Please try again.",
      messagesContainer,
      true
    );
  } finally {
    // Re-enable input and button
    input.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
    input.focus();
  }
}

/**
 * Append user message to chat
 */
function appendUserMessage(message, container) {
  const messageDiv = document.createElement("div");
  messageDiv.style.cssText =
    "display:flex;gap:12px;align-items:flex-start;justify-content:flex-end;";

  messageDiv.innerHTML = `
    <div style="flex:1;max-width:580px;display:flex;flex-direction:column;align-items:flex-end;">
      <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:12px 0 12px 12px;padding:14px 18px;box-shadow:0 2px 8px rgba(79,70,229,0.2);">
        <p style="font-size:14px;color:white;line-height:1.7;margin:0;white-space:pre-wrap;">${escapeHtml(
          message
        )}</p>
      </div>
      <div style="font-size:11px;color:#9CA3AF;margin-top:5px;padding-right:2px;">You · Just now</div>
    </div>
    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#2563EB,#7C3AED);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;font-size:13px;font-weight:700;color:white;">
      ${getUserInitial()}
    </div>
  `;

  container.appendChild(messageDiv);
  scrollToBottom(container);
}

/**
 * Append AI message to chat
 */
function appendAiMessage(message, container, isError = false) {
  const messageDiv = document.createElement("div");
  messageDiv.style.cssText = "display:flex;gap:12px;align-items:flex-start;";

  const bgColor = isError ? "#FEF2F2" : "white";
  const borderColor = isError ? "#FCA5A5" : "#E5E7EB";
  const textColor = isError ? "#DC2626" : "#111";

  messageDiv.innerHTML = `
    <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    </div>
    <div style="flex:1;max-width:580px;">
      <div style="background:${bgColor};border:1px solid ${borderColor};border-radius:0 12px 12px 12px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <p style="font-size:14px;color:${textColor};line-height:1.7;margin:0;white-space:pre-wrap;">${escapeHtml(
    message
  )}</p>
      </div>
      <div style="font-size:11px;color:#9CA3AF;margin-top:5px;padding-left:2px;">ApplyAI · Just now</div>
    </div>
  `;

  container.appendChild(messageDiv);
  scrollToBottom(container);
}

/**
 * Show typing indicator
 */
function showTypingIndicator(container) {
  const typingId = "typing-indicator-" + Date.now();
  const typingDiv = document.createElement("div");
  typingDiv.id = typingId;
  typingDiv.style.cssText = "display:flex;gap:12px;align-items:flex-start;";

  typingDiv.innerHTML = `
    <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#4F46E5,#7C3AED);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
    </div>
    <div style="flex:1;max-width:580px;">
      <div style="background:white;border:1px solid #E5E7EB;border-radius:0 12px 12px 12px;padding:16px 18px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <div style="display:flex;gap:4px;align-items:center;">
          <div style="width:8px;height:8px;border-radius:50%;background:#9CA3AF;animation:typing-bounce 1.4s infinite ease-in-out;"></div>
          <div style="width:8px;height:8px;border-radius:50%;background:#9CA3AF;animation:typing-bounce 1.4s infinite ease-in-out 0.2s;"></div>
          <div style="width:8px;height:8px;border-radius:50%;background:#9CA3AF;animation:typing-bounce 1.4s infinite ease-in-out 0.4s;"></div>
        </div>
      </div>
    </div>
  `;

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

  container.appendChild(typingDiv);
  scrollToBottom(container);

  return typingId;
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator(typingId) {
  const typingDiv = document.getElementById(typingId);
  if (typingDiv) {
    typingDiv.remove();
  }
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom(container) {
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

/**
 * Fill input with suggested prompt and optionally send
 */
function advisorPrompt(text, autoSend = true) {
  const input = document.getElementById("advisor-input");
  if (!input) return;

  input.value = text;
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 120) + "px";
  input.focus();

  if (autoSend) {
    sendAdvisorMsg();
  }
}

/**
 * Hide suggestion chips
 */
function hideChips() {
  const chipsContainer = document.getElementById("advisor-chips");
  if (chipsContainer) {
    chipsContainer.style.display = "none";
  }
}

/**
 * Clear chat messages
 */
function clearAdvisorChat() {
  const messagesContainer = document.getElementById("advisor-messages");
  if (!messagesContainer) return;

  // Keep only the first two welcome messages
  const messages = messagesContainer.children;
  const messagesToKeep = 2;

  while (messages.length > messagesToKeep) {
    messages[messages.length - 1].remove();
  }

  // Show chips again
  const chipsContainer = document.getElementById("advisor-chips");
  if (chipsContainer) {
    chipsContainer.style.display = "flex";
  }

  if (typeof showToast === "function") {
    showToast("Chat cleared");
  }
}

/**
 * Get user initial for avatar
 */
function getUserInitial() {
  const nameEl = document.getElementById("sidebar-user-name");
  if (nameEl && nameEl.textContent && nameEl.textContent !== "Loading…") {
    return nameEl.textContent.charAt(0).toUpperCase();
  }
  return "U";
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Expose functions globally
window.sendAdvisorMsg = sendAdvisorMsg;
window.advisorPrompt = advisorPrompt;
window.hideChips = hideChips;
window.clearAdvisorChat = clearAdvisorChat;
