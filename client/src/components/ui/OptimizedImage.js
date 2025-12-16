import React from 'react';
import { LazyImage } from '../../utils/performance';
import { theme } from '../../theme';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  placeholder,
  loading = 'lazy',
  ...props
}) => {
  const defaultPlaceholder = (
    <div
      style={{
        width: width || '100%',
        height: height || '200px',
        backgroundColor: theme.colors.gray[200],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colors.gray[500],
        fontSize: theme.typography.fontSize.sm,
        borderRadius: theme.borderRadius.md,
      }}
    >
      Loading...
    </div>
  );

  const imageStyle = {
    width: width || '100%',
    height: height || 'auto',
    objectFit: 'cover',
    borderRadius: theme.borderRadius.md,
    ...style,
  };

  if (loading === 'lazy') {
    return (
      <LazyImage
        src={src}
        alt={alt}
        className={className}
        style={imageStyle}
        placeholder={placeholder || defaultPlaceholder}
        {...props}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={imageStyle}
      {...props}
    />
  );
};

export default OptimizedImage;