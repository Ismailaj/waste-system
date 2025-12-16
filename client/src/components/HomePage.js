import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from './ui';
import { AppLayout } from './layout';
import { theme } from '../theme';
import { LazyLoad } from '../utils/performance';
import { useStaggerAnimation, smoothScrollTo } from '../utils/animations';
import { ScrollToTopButton } from './ui/VisualFeedback';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = React.useState(false);

  // If user is authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Trigger entrance animation
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Features data - memoized to prevent infinite re-renders
  const features = React.useMemo(() => [
    {
      icon: '🏠',
      title: 'For Residents',
      description: 'Easily request waste collection, track pickup status, and manage your waste disposal needs from one convenient platform.',
    },
    {
      icon: '🚛',
      title: 'For Collectors',
      description: 'Optimize your routes, update collection status in real-time, and efficiently manage your daily pickup schedules.',
    },
    {
      icon: '👑',
      title: 'For Administrators',
      description: 'Oversee operations, assign collections, generate reports, and ensure smooth system-wide waste management.',
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Get insights into collection patterns, performance metrics, and system efficiency to optimize operations.',
    },
    {
      icon: '🌱',
      title: 'Eco-Friendly',
      description: 'Promote sustainable waste management practices with proper categorization and recycling tracking.',
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Access the system from any device with our responsive design that works on desktop, tablet, and mobile.',
    },
  ], []);

  // Stagger animation for features
  const visibleFeatures = useStaggerAnimation(features, 150);

  const heroStyles = {
    background: `linear-gradient(135deg, ${theme.colors.primary[600]} 0%, ${theme.colors.secondary[500]} 100%)`,
    color: theme.colors.text.inverse,
    padding: `${theme.spacing[20]} 0`,
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const heroContentStyles = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[4]}`,
    position: 'relative',
    zIndex: 2,
  };

  const heroTitleStyles = {
    fontSize: theme.typography.fontSize['5xl'],
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[6],
    lineHeight: theme.typography.lineHeight.tight,
  };

  const heroSubtitleStyles = {
    fontSize: theme.typography.fontSize.xl,
    marginBottom: theme.spacing[8],
    opacity: 0.9,
    lineHeight: theme.typography.lineHeight.relaxed,
  };

  const ctaButtonsStyles = {
    display: 'flex',
    gap: theme.spacing[4],
    justifyContent: 'center',
    flexWrap: 'wrap',
  };

  const sectionStyles = {
    padding: `${theme.spacing[16]} 0`,
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: `0 ${theme.spacing[4]}`,
  };

  const sectionTitleStyles = {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
    color: theme.colors.text.primary,
  };

  const sectionSubtitleStyles = {
    fontSize: theme.typography.fontSize.lg,
    textAlign: 'center',
    marginBottom: theme.spacing[12],
    color: theme.colors.text.secondary,
    maxWidth: '600px',
    margin: `0 auto ${theme.spacing[12]}`,
  };

  const featuresGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: theme.spacing[8],
    marginBottom: theme.spacing[16],
  };

  const featureCardStyles = {
    textAlign: 'center',
    padding: theme.spacing[6],
  };

  const featureIconStyles = {
    fontSize: '3rem',
    marginBottom: theme.spacing[4],
    display: 'block',
  };

  const featureTitleStyles = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[3],
    color: theme.colors.text.primary,
  };

  const featureDescriptionStyles = {
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed,
  };

  const statsStyles = {
    backgroundColor: theme.colors.primary[50],
    padding: `${theme.spacing[16]} 0`,
  };

  const statsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing[8],
    textAlign: 'center',
  };

  const statNumberStyles = {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    display: 'block',
  };

  const statLabelStyles = {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[2],
  };

  const ctaSectionStyles = {
    backgroundColor: theme.colors.gray[800],
    color: theme.colors.text.inverse,
    padding: `${theme.spacing[16]} 0`,
    textAlign: 'center',
  };

  const stats = React.useMemo(() => [
    { number: '10K+', label: 'Collections Completed' },
    { number: '500+', label: 'Active Users' },
    { number: '50+', label: 'Waste Collectors' },
    { number: '99.9%', label: 'System Uptime' },
  ], []);

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    // Smooth scroll to features section
    smoothScrollTo('#features');
  };

  return (
    <>
      <AppLayout showHeader={true} showFooter={true}>
      {/* Hero Section */}
      <section style={heroStyles}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div 
          style={{
            ...heroContentStyles,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            opacity: isVisible ? 1 : 0,
            transition: 'all 0.8s ease-out',
          }}
        >
          <h1 
            style={{
              ...heroTitleStyles,
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s ease-out 0.2s',
            }}
          >
            Smart Waste Management
            <br />
            Made Simple
          </h1>
          <p 
            style={{
              ...heroSubtitleStyles,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s ease-out 0.4s',
            }}
          >
            Streamline your waste collection process with our comprehensive platform. 
            Connect residents, collectors, and administrators for efficient, sustainable waste management.
          </p>
          <div 
            style={{
              ...ctaButtonsStyles,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              opacity: isVisible ? 1 : 0,
              transition: 'all 0.8s ease-out 0.6s',
            }}
          >
            <Button
              size="lg"
              variant="secondary"
              onClick={handleGetStarted}
              ripple={false}
              className="smooth-hover"
              style={{
                fontSize: theme.typography.fontSize.lg,
                padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
              }}
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleLogin}
              ripple={false}
              style={{
                fontSize: theme.typography.fontSize.lg,
                padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: theme.colors.text.inverse,
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={sectionStyles}>
        <div style={containerStyles}>
          <h2 style={sectionTitleStyles}>
            Everything You Need for Efficient Waste Management
          </h2>
          <p style={sectionSubtitleStyles}>
            Our platform provides role-based access and specialized tools for every stakeholder 
            in the waste management process.
          </p>
          
          <div style={featuresGridStyles}>
            {visibleFeatures.map((feature, index) => (
              <LazyLoad
                key={index}
                className="animate-slide-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card
                  variant="elevated"
                  shadow="md"
                  hover={true}
                  className="smooth-hover"
                  style={featureCardStyles}
                >
                  <span style={featureIconStyles}>{feature.icon}</span>
                  <h3 style={featureTitleStyles}>{feature.title}</h3>
                  <p style={featureDescriptionStyles}>{feature.description}</p>
                </Card>
              </LazyLoad>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleLearnMore}
            >
              Learn More About Our Features
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={statsStyles}>
        <div style={containerStyles}>
          <h2 style={sectionTitleStyles}>
            Trusted by Communities Worldwide
          </h2>
          <div style={statsGridStyles}>
            {stats.map((stat, index) => (
              <div key={index}>
                <span style={statNumberStyles}>{stat.number}</span>
                <div style={statLabelStyles}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={sectionStyles}>
        <div style={containerStyles}>
          <h2 style={sectionTitleStyles}>
            How It Works
          </h2>
          <p style={sectionSubtitleStyles}>
            Get started in three simple steps and transform your waste management process.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: theme.spacing[8],
            marginTop: theme.spacing[12],
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: theme.colors.primary[100],
                color: theme.colors.primary[600],
                borderRadius: theme.borderRadius.full,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                margin: `0 auto ${theme.spacing[4]}`,
              }}>
                1
              </div>
              <h3 style={featureTitleStyles}>Sign Up</h3>
              <p style={featureDescriptionStyles}>
                Create your account and select your role: Resident, Collector, or Administrator.
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: theme.colors.secondary[100],
                color: theme.colors.secondary[600],
                borderRadius: theme.borderRadius.full,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                margin: `0 auto ${theme.spacing[4]}`,
              }}>
                2
              </div>
              <h3 style={featureTitleStyles}>Start Managing</h3>
              <p style={featureDescriptionStyles}>
                Request collections, manage routes, or oversee operations based on your role.
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: theme.colors.accent[100],
                color: theme.colors.accent[600],
                borderRadius: theme.borderRadius.full,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                margin: `0 auto ${theme.spacing[4]}`,
              }}>
                3
              </div>
              <h3 style={featureTitleStyles}>Track Progress</h3>
              <p style={featureDescriptionStyles}>
                Monitor collection status, view analytics, and optimize your waste management process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={ctaSectionStyles}>
        <div style={containerStyles}>
          <h2 style={{
            ...sectionTitleStyles,
            color: theme.colors.text.inverse,
            marginBottom: theme.spacing[4],
          }}>
            Ready to Transform Your Waste Management?
          </h2>
          <p style={{
            ...sectionSubtitleStyles,
            color: theme.colors.gray[300],
            marginBottom: theme.spacing[8],
          }}>
            Join thousands of users who have streamlined their waste collection process. 
            Get started today and see the difference.
          </p>
          <div style={ctaButtonsStyles}>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleGetStarted}
              style={{
                fontSize: theme.typography.fontSize.lg,
                padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
              }}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate('/contact')}
              style={{
                fontSize: theme.typography.fontSize.lg,
                padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
                color: theme.colors.text.inverse,
                borderColor: theme.colors.gray[500],
              }}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
      </AppLayout>
      
      {/* Scroll to top button */}
      <ScrollToTopButton threshold={400} />
    </>
  );
};

export default HomePage;