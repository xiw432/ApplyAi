(function() {
'use strict';

// Toast notification
var toastTimer;
window.showToast = function(msg) {
  var toast = document.getElementById('toast');
  var msgEl = document.getElementById('toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.style.cssText = 'position:fixed;bottom:28px;right:28px;z-index:9999;background:#0f0e17;color:white;border-radius:14px;padding:14px 20px;font-size:14px;font-weight:500;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,0.2);max-width:320px;transform:translateY(80px);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);pointer-events:none;font-family:DM Sans,sans-serif;';
    toast.innerHTML = '<span id="toast-icon" style="display:inline-flex;width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,0.2);align-items:center;justify-content:center;flex-shrink:0;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span><span id="toast-msg">' + (msg || 'Done!') + '</span>';
    document.body.appendChild(toast);
  }
  msgEl = document.getElementById('toast-msg');
  if (msgEl) msgEl.textContent = msg || 'Done!';
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { toast.classList.remove('show'); }, 3000);
};

// Floating AI Panel (dashboard)
window.toggleAIPanel = function() {
  var panel = document.getElementById('ai-panel');
  if (!panel) return;
  var isOpen = panel.style.display === 'flex';
  panel.style.display = isOpen ? 'none' : 'flex';
};

var aiReplies = [
  "Based on your profile, I recommend also looking at NUS Singapore and KTH Sweden — both have strong CS programs with scholarships.",
  "For Tsinghua, you need: ① Notarized degree ② Official transcripts ③ 2 recommendation letters ④ SOP ⑤ Language certificate (HSK 4+ or IELTS 6.5+).",
  "I can help draft your personal statement. Start with a compelling story about why you chose this field. Want a template?",
  "Your profile strength is 72%. To improve: add your GRE score, upload your degree certificate, and complete your research statement.",
  "The CSC scholarship covers full tuition + ¥3,000/month stipend + accommodation. Deadline March 30 — 12 days away!"
];
var aiReplyIdx = 0;

window.sendAIMessage = function(text) {
  var input = document.getElementById('ai-input') || document.getElementById('dash-ai-input');
  var chat = document.getElementById('ai-chat-area');
  if (!chat) { showToast('AI panel will open when available'); return; }
  var msg = text || (input ? input.value.trim() : '');
  if (!msg) return;
  if (input) input.value = '';

  var userBubble = document.createElement('div');
  userBubble.style.cssText = 'display:flex;justify-content:flex-end;';
  userBubble.innerHTML = '<div style="background:#2563EB;border-radius:10px 0 10px 10px;padding:9px 14px;max-width:240px;"><p style="font-size:13px;color:white;line-height:1.5;margin:0;">' + msg.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</p></div>';
  chat.appendChild(userBubble);
  chat.scrollTop = chat.scrollHeight;

  setTimeout(function() {
    var reply = aiReplies[aiReplyIdx % aiReplies.length];
    aiReplyIdx++;
    var aiBubble = document.createElement('div');
    aiBubble.style.cssText = 'display:flex;gap:8px;align-items:flex-start;';
    aiBubble.innerHTML = '<div style="width:26px;height:26px;border-radius:6px;background:#2563EB;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg></div><div style="background:white;border:1px solid #E2E8F0;border-radius:0 10px 10px 10px;padding:10px 14px;max-width:260px;"><p style="font-size:13px;color:#0F172A;line-height:1.6;margin:0;">' + reply + '</p></div>';
    chat.appendChild(aiBubble);
    chat.scrollTop = chat.scrollHeight;
  }, 700);
};

})();
