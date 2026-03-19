const AIAdvisorShowcase = () => {
  const features = [
    {
      icon: '✍️',
      title: 'Essay & SOP Writing Help',
      description: 'Craft compelling statements of purpose with AI guidance tailored to each university\'s expectations.'
    },
    {
      icon: '🎯',
      title: 'Smart University Matching',
      description: 'Tell the AI your background and goals—it surfaces your best-fit programs from thousands of options.'
    },
    {
      icon: '🎤',
      title: 'Interview Preparation',
      description: 'Practice common scholarship and admission interview questions with personalized AI feedback.'
    },
    {
      icon: '🗺️',
      title: 'Step-by-Step Application Guidance',
      description: 'From first search to final submission—the AI walks you through every form, document, and deadline.'
    }
  ];

  return (
    <section id="ai-advisor" className="ai-advisor-section">
      <div className="ai-advisor-container">
        <div className="ai-advisor-grid">
          {/* Left: Content */}
          <div className="ai-advisor-content">
            <div className="ai-advisor-label">
              <span>✦</span>
              <span>AI-Powered</span>
            </div>
            <h2 className="ai-advisor-headline">
              Meet Your AI <em>Admissions Copilot</em>
            </h2>
            <p className="ai-advisor-subtext">
              Stop guessing. Your personal AI counselor understands every application, every country, 
              every requirement—and guides you through it all.
            </p>

            <div className="ai-features-list">
              {features.map((feature, index) => (
                <div key={index} className="ai-feature-item">
                  <div className="ai-feature-icon">{feature.icon}</div>
                  <div className="ai-feature-text">
                    <div className="ai-feature-title">{feature.title}</div>
                    <div className="ai-feature-desc">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Chat Window */}
          <div className="ai-advisor-preview">
            <div className="ai-chat-window">
              <div className="ai-chat-topbar">
                <div className="ai-chat-dot"></div>
                <div className="ai-chat-title">ApplyAI Assistant</div>
                <div className="ai-chat-status">
                  <div className="ai-status-dot"></div>
                  <span>Online</span>
                </div>
              </div>

              <div className="ai-messages">
                <div className="ai-msg ai-msg-ai">
                  <div className="ai-msg-name">ApplyAI</div>
                  <div className="ai-msg-bubble">
                    Hi! 👋 I see you're interested in the DAAD scholarship. What's your field of study? 
                    I'll find the best programs for you.
                  </div>
                </div>

                <div className="ai-msg ai-msg-user">
                  <div className="ai-msg-bubble">
                    I'm doing Computer Science, Masters level. I'm from India and want to study in Germany.
                  </div>
                </div>

                <div className="ai-msg ai-msg-ai">
                  <div className="ai-msg-name">ApplyAI</div>
                  <div className="ai-msg-bubble">
                    Great match! I found <strong>12 fully funded CS programs</strong> in Germany for Indian students. 
                    TU Munich, KIT, and TU Berlin are your top matches based on your profile. 
                    Want me to walk you through TU Munich's application?
                  </div>
                </div>

                <div className="ai-msg ai-msg-user">
                  <div className="ai-msg-bubble">
                    Yes! What documents do I need?
                  </div>
                </div>

                <div className="ai-msg ai-msg-ai">
                  <div className="ai-msg-name">ApplyAI</div>
                  <div className="ai-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>

              <div className="ai-chat-input">
                <div className="ai-chat-input-field">Ask anything about your application...</div>
                <div className="ai-send-btn">→</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAdvisorShowcase;
