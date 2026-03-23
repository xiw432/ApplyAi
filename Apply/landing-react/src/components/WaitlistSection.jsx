import { useState } from 'react';
import '../styles/waitlist.css';

const WaitlistSection = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubmitted(true);
        }
    };

    const avatars = [
        { initials: 'AK', gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)' },
        { initials: 'SM', gradient: 'linear-gradient(135deg, #10b981, #00C9B8)' },
        { initials: 'JO', gradient: 'linear-gradient(135deg, #7c3aed, #EC4899)' },
        { initials: 'LW', gradient: 'linear-gradient(135deg, #F97316, #EF4444)' },
        { initials: 'RK', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    ];

    return (
        <section className="waitlist-section">
            <div className="waitlist-container">
                <div className="waitlist-status-badge">
                    <span className="waitlist-status-dot"></span>
                    <span>Accepting applications now</span>
                </div>

                <h2 className="waitlist-headline">
                    Join 2,400+ students already on the waitlist
                </h2>

                {!submitted ? (
                    <form className="waitlist-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            className="waitlist-input"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="waitlist-button">
                            Get Early Access
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                    </form>
                ) : (
                    <div className="waitlist-success">
                        <div className="waitlist-success-icon">
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <p className="waitlist-success-text">
                            You're on the list! We'll be in touch soon.
                        </p>
                    </div>
                )}

                <div className="waitlist-social-proof">
                    <div className="waitlist-avatars">
                        {avatars.map((a, i) => (
                            <div
                                key={i}
                                className="waitlist-avatar"
                                style={{ background: a.gradient }}
                            >
                                {a.initials}
                            </div>
                        ))}
                    </div>
                    <span className="waitlist-proof-text">
                        Students from 40+ countries have already signed up
                    </span>
                </div>
            </div>
        </section>
    );
};

export default WaitlistSection;
