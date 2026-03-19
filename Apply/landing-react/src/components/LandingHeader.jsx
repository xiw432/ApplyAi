import StaggeredMenu from './StaggeredMenu';

const LandingHeader = () => {
  // Menu items
  const menuItems = [
    { 
      label: 'Features', 
      ariaLabel: 'View Features',
      link: '#features'
    },
    { 
      label: 'About', 
      ariaLabel: 'About Us',
      link: '#about'
    },
    { 
      label: 'Pricing', 
      ariaLabel: 'View Pricing',
      link: '#pricing'
    },
    { 
      label: 'Community', 
      ariaLabel: 'Join Community',
      link: '#community'
    },
    { 
      label: 'Sign Up', 
      ariaLabel: 'Sign Up',
      link: '/auth/signup.html'
    }
  ];

  const socialItems = [
    { label: 'Login', link: '/auth/login.html' },
    { label: 'Dashboard', link: '/Dashboard/dashboard.html' }
  ];

  return (
    <>
      {/* Custom Logo */}
      <div style={{ 
        position: 'absolute', 
        top: '2em', 
        left: '2em', 
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: 'pointer',
        pointerEvents: 'auto'
      }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 16px rgba(96, 165, 250, 0.3)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>
        <span style={{ 
          fontSize: '20px', 
          fontWeight: '800', 
          color: '#ffffff',
          letterSpacing: '-0.5px',
          fontFamily: 'Fraunces, serif'
        }}>ApplyAI</span>
      </div>

      <StaggeredMenu
        position="right"
        items={menuItems}
        socialItems={socialItems}
        displaySocials={true}
        displayItemNumbering={true}
        logoUrl=""
        menuButtonColor="#ffffff"
        openMenuButtonColor="#000000"
        changeMenuColorOnOpen={true}
        colors={['#3b82f6', '#2563eb']}
        accentColor="#3b82f6"
        isFixed={false}
        closeOnClickAway={true}
        onMenuOpen={() => console.log('Menu opened')}
        onMenuClose={() => console.log('Menu closed')}
      />
    </>
  );
};

export default LandingHeader;
