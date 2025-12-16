import React from 'react';
import { theme } from '../theme';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerStyles = {
    backgroundColor: theme.colors.gray[800],
    color: theme.colors.text.inverse,
    marginTop: 'auto',
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `${theme.spacing[12]} ${theme.spacing[4]} ${theme.spacing[8]}`,
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing[8],
    marginBottom: theme.spacing[8],
  };

  const sectionStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing[4],
  };

  const titleStyles = {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing[2],
  };

  const linkStyles = {
    color: theme.colors.gray[300],
    textDecoration: 'none',
    fontSize: theme.typography.fontSize.sm,
    transition: `color ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    cursor: 'pointer',
  };

  const textStyles = {
    color: theme.colors.gray[300],
    fontSize: theme.typography.fontSize.sm,
    lineHeight: theme.typography.lineHeight.relaxed,
  };

  const bottomStyles = {
    borderTop: `1px solid ${theme.colors.gray[700]}`,
    paddingTop: theme.spacing[6],
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing[4],
  };

  const logoStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[2],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  };

  const socialLinksStyles = {
    display: 'flex',
    gap: theme.spacing[4],
  };

  const socialLinkStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: theme.colors.gray[700],
    color: theme.colors.gray[300],
    borderRadius: theme.borderRadius.full,
    textDecoration: 'none',
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
  };

  const handleLinkClick = (url) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      // Handle internal navigation
      console.log('Navigate to:', url);
    }
  };

  return (
    <footer style={footerStyles}>
      <div style={containerStyles}>
        {/* Main Footer Content */}
        <div style={gridStyles}>
          {/* Company Info */}
          <div style={sectionStyles}>
            <h3 style={titleStyles}>Waste Management System</h3>
            <p style={textStyles}>
              Streamlining waste collection and management for a cleaner, more sustainable future. 
              Our platform connects residents, collectors, and administrators for efficient waste management.
            </p>
            <div style={socialLinksStyles}>
              <a
                href="#"
                style={socialLinkStyles}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('https://twitter.com');
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.primary[600];
                  e.target.style.color = theme.colors.text.inverse;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.colors.gray[700];
                  e.target.style.color = theme.colors.gray[300];
                }}
                aria-label="Twitter"
              >
                🐦
              </a>
              <a
                href="#"
                style={socialLinkStyles}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('https://facebook.com');
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.primary[600];
                  e.target.style.color = theme.colors.text.inverse;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.colors.gray[700];
                  e.target.style.color = theme.colors.gray[300];
                }}
                aria-label="Facebook"
              >
                📘
              </a>
              <a
                href="#"
                style={socialLinkStyles}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('https://linkedin.com');
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = theme.colors.primary[600];
                  e.target.style.color = theme.colors.text.inverse;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = theme.colors.gray[700];
                  e.target.style.color = theme.colors.gray[300];
                }}
                aria-label="LinkedIn"
              >
                💼
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div style={sectionStyles}>
            <h3 style={titleStyles}>Quick Links</h3>
            <a
              href="#"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('/dashboard');
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.text.inverse}
              onMouseLeave={(e) => e.target.style.color = theme.colors.gray[300]}
            >
              Dashboard
            </a>
            <a
              href="#"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('/collections');
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.text.inverse}
              onMouseLeave={(e) => e.target.style.color = theme.colors.gray[300]}
            >
              Collection Requests
            </a>
            <a
              href="#"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('/routes');
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.text.inverse}
              onMouseLeave={(e) => e.target.style.color = theme.colors.gray[300]}
            >
              Collection Routes
            </a>
            <a
              href="#"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('/help');
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.text.inverse}
              onMouseLeave={(e) => e.target.style.color = theme.colors.gray[300]}
            >
              Help & Support
            </a>
          </div>

          {/* Support */}
          <div style={sectionStyles}>
            <h3 style={titleStyles}>Support</h3>
            <a
              href="#"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('/help/getting-started');
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.text.inverse}
              onMouseLeave={(e) => e.target.style.color = theme.colors.gray[300]}
            >
              Getting Started
            </a>
            <a
              href="#"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('/help/faq');
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.text.inverse}
              onMouseLeave={(e) => e.target.style.color = theme.colors.gray[300]}
            >
              FAQ
            </a>
            <a
              href="#"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('/contact');
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.text.inverse}
              onMouseLeave={(e) => e.target.style.color = theme.colors.gray[300]}
            >
              Contact Us
            </a>
            <a
              href="#"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('mailto:support@wastemanagement.com');
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.text.inverse}
              onMouseLeave={(e) => e.target.style.color = theme.colors.gray[300]}
            >
              support@wastemanagement.com
            </a>
          </div>

          {/* Contact Info */}
          <div style={sectionStyles}>
            <h3 style={titleStyles}>Contact Information</h3>
            <div style={textStyles}>
              <p style={{ margin: `0 0 ${theme.spacing[2]} 0` }}>
                📍 123 Green Street<br />
                Eco City, EC 12345
              </p>
              <p style={{ margin: `0 0 ${theme.spacing[2]} 0` }}>
                📞 (555) 123-WASTE<br />
                📞 (555) 123-9278
              </p>
              <p style={{ margin: 0 }}>
                🕒 Monday - Friday: 8:00 AM - 6:00 PM<br />
                🕒 Saturday: 9:00 AM - 4:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div style={bottomStyles}>
          <div style={logoStyles}>
            <span style={{ fontSize: theme.typography.fontSize['2xl'] }}>♻️</span>
            <span>Waste Management System</span>
          </div>
          
          <div style={{ display: 'flex', gap: theme.spacing[6], flexWrap: 'wrap' }}>
            <a
              href="#"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('/privacy');
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.text.inverse}
              onMouseLeave={(e) => e.target.style.color = theme.colors.gray[300]}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('/terms');
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.text.inverse}
              onMouseLeave={(e) => e.target.style.color = theme.colors.gray[300]}
            >
              Terms of Service
            </a>
            <a
              href="#"
              style={linkStyles}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick('/accessibility');
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.text.inverse}
              onMouseLeave={(e) => e.target.style.color = theme.colors.gray[300]}
            >
              Accessibility
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: theme.spacing[6],
          paddingTop: theme.spacing[6],
          borderTop: `1px solid ${theme.colors.gray[700]}`,
          color: theme.colors.gray[400],
          fontSize: theme.typography.fontSize.sm,
        }}>
          <p style={{ margin: 0 }}>
            © {currentYear} Waste Management System. All rights reserved. | Version 1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;