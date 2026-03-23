import { useStaggeredReveal } from '../hooks/useScrollReveal';
import SpotlightCard from './SpotlightCard';
import '../styles/testimonials.css';

const TestimonialsSection = () => {
    const testimonials = [
        {
            initials: 'AK',
            name: 'Aisha Khan',
            university: 'MIT — Computer Science',
            quote:
                'ApplyAI matched me with scholarships I never would have found on my own. The AI essay reviewer caught mistakes my teachers missed. I honestly don\'t think I\'d have gotten into MIT without it.',
            gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        },
        {
            initials: 'JO',
            name: 'James Okonkwo',
            university: 'University of Oxford — PPE',
            quote:
                'I was juggling 12 applications across 5 countries. The deadline tracker and document organizer saved me from missing my Oxford interview slot. Got my offer letter three weeks later.',
            gradient: 'linear-gradient(135deg, #10b981, #00C9B8)',
        },
        {
            initials: 'SM',
            name: 'Sofia Martinez',
            university: 'Stanford — Data Science',
            quote:
                'The AI advisor helped me rewrite my Statement of Purpose five times until it actually sounded like me. My counselor said it was the strongest SOP she\'d read in ten years.',
            gradient: 'linear-gradient(135deg, #F97316, #EF4444)',
        },
    ];

    const [containerRef, visibleItems] = useStaggeredReveal(testimonials.length, {
        staggerDelay: 150,
    });

    const renderStars = () => (
        <div className="testimonial-stars">
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#f59e0b"
                    stroke="#f59e0b"
                    strokeWidth="1"
                >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </div>
    );

    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                <div className="testimonials-header">
                    <div className="testimonials-badge">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        <span>Student Stories</span>
                    </div>
                    <h2 className="testimonials-headline">
                        Real students. <em>Real results.</em>
                    </h2>
                    <p className="testimonials-subtext">
                        Hear from students who transformed their study abroad journey with
                        ApplyAI.
                    </p>
                </div>

                <div className="testimonials-grid" ref={containerRef}>
                    {testimonials.map((t, index) => (
                        <SpotlightCard
                            key={index}
                            className={`testimonial-card ${visibleItems.has(index) ? 'testimonial-card--visible' : ''}`}
                            spotlightColor="rgba(37, 99, 235, 0.08)"
                        >
                            {renderStars()}
                            <blockquote className="testimonial-quote">"{t.quote}"</blockquote>
                            <div className="testimonial-author">
                                <div
                                    className="testimonial-avatar"
                                    style={{ background: t.gradient }}
                                >
                                    {t.initials}
                                </div>
                                <div className="testimonial-author-info">
                                    <div className="testimonial-name">{t.name}</div>
                                    <div className="testimonial-university">{t.university}</div>
                                </div>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
