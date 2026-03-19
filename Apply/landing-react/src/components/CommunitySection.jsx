const CommunitySection = () => {
  const discussions = [
    {
      avatar: '🧑‍🎓',
      author: 'Ahmed K.',
      time: '2h ago',
      content: 'Just got accepted to TU Berlin with full funding! The DAAD tips from this community saved my application. 🙌',
      tags: [
        { label: '✓ Accepted', color: 'green' },
        { label: 'Germany', color: 'default' }
      ]
    },
    {
      avatar: '👩‍💻',
      author: 'Sara M.',
      time: '5h ago',
      content: 'Does anyone know if the CSC scholarship covers living expenses in Wuhan? My acceptance letter says "full scholarship" but the form is confusing.',
      tags: [
        { label: 'China CSC', color: 'default' },
        { label: 'Help Needed', color: 'default' }
      ]
    },
    {
      avatar: '🌍',
      author: 'James O.',
      time: '1d ago',
      content: 'Sharing my Chevening SOP that got me in. Feel free to use it as inspiration. Remember—tell your story, not just your achievements.',
      tags: [
        { label: 'Resource Shared', color: 'green' },
        { label: 'UK', color: 'default' }
      ]
    }
  ];

  return (
    <section id="community" className="community-section">
      <div className="community-container">
        <div className="community-grid">
          {/* Left: Content */}
          <div className="community-content">
            <div className="community-badge">
              <span>👥</span>
              <span>Community</span>
            </div>
            <h2 className="community-headline">
              Join a Community of Future Global Students
            </h2>
            <p className="community-subtext">
              Connect with students who've been accepted, are applying, or are just starting their journey. 
              Share tips, get advice, and celebrate wins together.
            </p>

            <div className="community-avatars">
              <div className="community-avatar">A</div>
              <div className="community-avatar">S</div>
              <div className="community-avatar">M</div>
              <div className="community-avatar">K</div>
              <div className="community-avatar community-avatar-more">+2k</div>
            </div>

            <div className="community-stats">
              <div className="community-stat">
                <div className="community-stat-num">12,000+</div>
                <div className="community-stat-label">Students joined</div>
              </div>
              <div className="community-stat">
                <div className="community-stat-num">480+</div>
                <div className="community-stat-label">Success stories</div>
              </div>
              <div className="community-stat">
                <div className="community-stat-num">60+</div>
                <div className="community-stat-label">Countries</div>
              </div>
            </div>

            <button className="btn-community-cta" onClick={() => window.location.href = '/auth/signup.html'}>
              <span>Join the Community</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {/* Right: Discussion Cards */}
          <div className="community-discussions">
            {discussions.map((discussion, index) => (
              <div key={index} className="discussion-card">
                <div className="discussion-header">
                  <div className="discussion-avatar">{discussion.avatar}</div>
                  <div className="discussion-author">{discussion.author}</div>
                  <div className="discussion-time">{discussion.time}</div>
                </div>
                <div className="discussion-content">{discussion.content}</div>
                <div className="discussion-tags">
                  {discussion.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className={`discussion-tag discussion-tag-${tag.color}`}>
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
