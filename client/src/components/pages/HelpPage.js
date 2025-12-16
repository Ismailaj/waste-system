import React from 'react';
import SimplePage from './SimplePage';
import { Card } from '../ui';
import { theme } from '../../theme';

const HelpPage = () => {
  const helpSections = [
    {
      title: "Getting Started",
      icon: "🚀",
      content: "Learn how to use the waste management system effectively."
    },
    {
      title: "Collection Requests",
      icon: "📋",
      content: "How to request waste collection and track your requests."
    },
    {
      title: "Account Management",
      icon: "⚙️",
      content: "Manage your profile, settings, and preferences."
    },
    {
      title: "Contact Support",
      icon: "💬",
      content: "Get help from our support team when you need it."
    }
  ];

  const helpContent = (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: theme.spacing[4] 
    }}>
      {helpSections.map((section, index) => (
        <Card key={index} padding="lg" variant="outlined">
          <div style={{ textAlign: 'center', marginBottom: theme.spacing[3] }}>
            <div style={{ fontSize: '2rem', marginBottom: theme.spacing[2] }}>
              {section.icon}
            </div>
            <h3 style={{ 
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
              margin: 0
            }}>
              {section.title}
            </h3>
          </div>
          <p style={{ 
            color: theme.colors.text.secondary,
            lineHeight: theme.typography.lineHeight.relaxed,
            margin: 0
          }}>
            {section.content}
          </p>
        </Card>
      ))}
    </div>
  );

  return (
    <SimplePage
      title="Help & Support"
      description="Find answers to common questions and get help with using the system"
      icon="❓"
    >
      {helpContent}
    </SimplePage>
  );
};

export default HelpPage;