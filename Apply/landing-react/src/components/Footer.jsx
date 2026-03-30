const Footer = () => {
  const currentYear = new Date().getFullYear();

  const mainLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Universities', href: '/Dashboard/university.html' }
  ];

  const accountLinks = [
    { label: 'Sign Up', href: '/auth/signup.html' },
    { label: 'Login', href: '/auth/login.html' }
  ];

  const legalLinks = [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Contact', href: '#' }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <span className="footer-logo-text">ApplyAI</span>
            </div>
            <p className="footer-tagline">
              Your intelligent guide to studying abroad
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-links-column">
              <h4 className="footer-links-title">Product</h4>
              <ul className="footer-links-list">
                {mainLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-column">
              <h4 className="footer-links-title">Account</h4>
              <ul className="footer-links-list">
                {accountLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-links-column">
              <h4 className="footer-links-title">Legal</h4>
              <ul className="footer-links-list">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} ApplyAI. All rights reserved.
          </p>
          <p className="footer-made-with">
            Made with care for students worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
