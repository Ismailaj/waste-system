import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui';
import { AppLayout } from '../layout';
import { theme } from '../../theme';

const HelpPage = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = {
    'getting-started': {
      title: 'Getting Started',
      icon: '🚀',
      content: {
        resident: [
          {
            title: 'Creating Your First Collection Request',
            content: 'Learn how to submit a waste collection request and track its progress.',
            steps: [
              'Navigate to your dashboard',
              'Click "New Collection Request" button',
              'Fill in the waste category and pickup location',
              'Add any special instructions',
              'Submit your request and track its status'
            ]
          },
          {
            title: 'Understanding Waste Categories',
            content: 'Different types of waste require different handling procedures.',
            steps: [
              'Organic: Food scraps, garden waste, compostable materials',
              'Recyclable: Paper, plastic, glass, metal containers',
              'Hazardous: Batteries, chemicals, electronic waste',
              'General: Non-recyclable household waste'
            ]
          }
        ],
        collector: [
          {
            title: 'Managing Your Routes',
            content: 'Efficiently handle your assigned collection routes.',
            steps: [
              'Check your daily route assignments',
              'Follow the optimized pickup sequence',
              'Update collection status as you progress',
              'Mark collections as completed when finished',
              'Report any issues or delays'
            ]
          },
          {
            title: 'Updating Collection Status',
            content: 'Keep residents and administrators informed of your progress.',
            steps: [
              'Access your assigned collections',
              'Change status from "assigned" to "in-progress"',
              'Update to "completed" when pickup is finished',
              'Add notes for any special circumstances'
            ]
          }
        ],
        admin: [
          {
            title: 'System Administration',
            content: 'Manage users, routes, and system operations.',
            steps: [
              'Monitor system dashboard for overview',
              'Manage user accounts and roles',
              'Assign collections to collectors',
              'Generate reports and analytics',
              'Configure system settings'
            ]
          },
          {
            title: 'Route Management',
            content: 'Optimize collection routes for efficiency.',
            steps: [
              'Create new routes for collectors',
              'Assign collections to routes',
              'Optimize pickup sequences',
              'Monitor route completion',
              'Adjust routes based on performance'
            ]
          }
        ]
      }
    },
    'faq': {
      title: 'Frequently Asked Questions',
      icon: '❓',
      content: {
        general: [
          {
            question: 'How do I reset my password?',
            answer: 'Contact your system administrator to reset your password. For security reasons, password resets must be handled by administrative staff.'
          },
          {
            question: 'What browsers are supported?',
            answer: 'The system works best with modern browsers including Chrome, Firefox, Safari, and Edge. Make sure your browser is up to date for the best experience.'
          },
          {
            question: 'Can I use the system on mobile devices?',
            answer: 'Yes! The system is fully responsive and works on smartphones and tablets. You can access all features from any device with an internet connection.'
          }
        ],
        resident: [
          {
            question: 'How long does it take for my request to be processed?',
            answer: 'Collection requests are typically assigned to collectors within 24 hours. You\'ll receive updates as your request progresses through the system.'
          },
          {
            question: 'Can I cancel a collection request?',
            answer: 'You can cancel pending requests from your dashboard. Once a request has been assigned to a collector, contact them directly or reach out to an administrator.'
          },
          {
            question: 'What if I need to change my pickup location?',
            answer: 'Edit your profile to update your default address, or add specific instructions when creating a new request for a different location.'
          }
        ],
        collector: [
          {
            question: 'What if I can\'t complete a collection?',
            answer: 'Update the collection status with detailed notes explaining the issue. Contact your supervisor or system administrator for guidance on rescheduling.'
          },
          {
            question: 'How are routes optimized?',
            answer: 'Routes are automatically optimized based on location proximity and traffic patterns to minimize travel time and fuel consumption.'
          }
        ],
        admin: [
          {
            question: 'How do I add new users to the system?',
            answer: 'Use the user management interface to create new accounts. You can assign roles and set initial permissions during account creation.'
          },
          {
            question: 'Can I generate custom reports?',
            answer: 'Yes, the reports section allows you to generate various analytics including collection statistics, user activity, and performance metrics.'
          }
        ]
      }
    },
    'contact': {
      title: 'Contact Support',
      icon: '📞',
      content: {
        general: [
          {
            title: 'Technical Support',
            content: 'Get help with technical issues and system problems.',
            contact: {
              email: 'support@wastemanagement.com',
              phone: '(555) 123-TECH',
              hours: 'Monday - Friday: 8:00 AM - 6:00 PM'
            }
          },
          {
            title: 'General Inquiries',
            content: 'Questions about services, billing, or general information.',
            contact: {
              email: 'info@wastemanagement.com',
              phone: '(555) 123-INFO',
              hours: 'Monday - Friday: 9:00 AM - 5:00 PM'
            }
          },
          {
            title: 'Emergency Support',
            content: 'Urgent issues requiring immediate attention.',
            contact: {
              phone: '(555) 123-URGENT',
              hours: '24/7 Emergency Line'
            }
          }
        ]
      }
    }
  };

  const sidebarStyles = {
    width: '250px',
    flexShrink: 0,
  };

  const contentStyles = {
    flex: 1,
    marginLeft: theme.spacing[6],
  };

  const sectionButtonStyles = (isActive) => ({
    width: '100%',
    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
    border: 'none',
    backgroundColor: isActive ? theme.colors.primary[50] : 'transparent',
    color: isActive ? theme.colors.primary[600] : theme.colors.text.secondary,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing[3],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'left',
    transition: `all ${theme.transitions.duration[200]} ${theme.transitions.timing.inOut}`,
    marginBottom: theme.spacing[1],
  });

  const titleStyles = {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: `0 0 ${theme.spacing[6]} 0`,
  };

  const getCurrentContent = () => {
    const section = sections[activeSection];
    if (!section) return null;

    if (activeSection === 'faq') {
      const userRole = user?.role || 'general';
      const generalFAQ = section.content.general || [];
      const roleFAQ = section.content[userRole] || [];
      return [...generalFAQ, ...roleFAQ];
    }

    if (activeSection === 'contact') {
      return section.content.general || [];
    }

    return section.content[user?.role] || [];
  };

  const renderContent = () => {
    const content = getCurrentContent();
    const section = sections[activeSection];

    if (activeSection === 'faq') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[4] }}>
          {content.map((item, index) => (
            <Card key={index} variant="outlined" padding="lg">
              <h4 style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                margin: `0 0 ${theme.spacing[3]} 0`,
              }}>
                {item.question}
              </h4>
              <p style={{
                color: theme.colors.text.secondary,
                lineHeight: theme.typography.lineHeight.relaxed,
                margin: 0,
              }}>
                {item.answer}
              </p>
            </Card>
          ))}
        </div>
      );
    }

    if (activeSection === 'contact') {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: theme.spacing[6],
        }}>
          {content.map((item, index) => (
            <Card key={index} variant="elevated" padding="lg">
              <h4 style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                margin: `0 0 ${theme.spacing[3]} 0`,
              }}>
                {item.title}
              </h4>
              <p style={{
                color: theme.colors.text.secondary,
                margin: `0 0 ${theme.spacing[4]} 0`,
              }}>
                {item.content}
              </p>
              <div style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
              }}>
                {item.contact.email && (
                  <p style={{ margin: `0 0 ${theme.spacing[1]} 0` }}>
                    <strong>Email:</strong> {item.contact.email}
                  </p>
                )}
                {item.contact.phone && (
                  <p style={{ margin: `0 0 ${theme.spacing[1]} 0` }}>
                    <strong>Phone:</strong> {item.contact.phone}
                  </p>
                )}
                {item.contact.hours && (
                  <p style={{ margin: 0 }}>
                    <strong>Hours:</strong> {item.contact.hours}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[6] }}>
        {content.map((item, index) => (
          <Card key={index} variant="outlined" padding="lg">
            <h4 style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              margin: `0 0 ${theme.spacing[3]} 0`,
            }}>
              {item.title}
            </h4>
            <p style={{
              color: theme.colors.text.secondary,
              margin: `0 0 ${theme.spacing[4]} 0`,
            }}>
              {item.content}
            </p>
            {item.steps && (
              <ol style={{
                color: theme.colors.text.secondary,
                paddingLeft: theme.spacing[5],
                margin: 0,
              }}>
                {item.steps.map((step, stepIndex) => (
                  <li key={stepIndex} style={{ marginBottom: theme.spacing[1] }}>
                    {step}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <AppLayout showBreadcrumbs={true}>
      <h1 style={titleStyles}>Help & Support</h1>
      
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <div style={sidebarStyles}>
          <Card variant="outlined" padding="md">
            <h3 style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              margin: `0 0 ${theme.spacing[4]} 0`,
            }}>
              Help Topics
            </h3>
            
            {Object.entries(sections).map(([key, section]) => (
              <button
                key={key}
                style={sectionButtonStyles(activeSection === key)}
                onClick={() => setActiveSection(key)}
                onMouseEnter={(e) => {
                  if (activeSection !== key) {
                    e.target.style.backgroundColor = theme.colors.gray[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== key) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: theme.typography.fontSize.lg }}>
                  {section.icon}
                </span>
                {section.title}
              </button>
            ))}
          </Card>
        </div>

        {/* Content */}
        <div style={contentStyles}>
          <Card variant="elevated" padding="lg">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[3],
              marginBottom: theme.spacing[6],
            }}>
              <span style={{ fontSize: theme.typography.fontSize['2xl'] }}>
                {sections[activeSection]?.icon}
              </span>
              <h2 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                margin: 0,
              }}>
                {sections[activeSection]?.title}
              </h2>
            </div>
            
            {renderContent()}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default HelpPage;