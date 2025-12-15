import { memo, useEffect, useState } from 'react';
import { cx } from '../utils/classnames';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Fade In Animation Component
 * Animación de aparición suave
 */
export const FadeIn = memo(function FadeIn({
  children,
  delay = 0,
  duration = 300,
  className
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cx(
        'transition-all',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </div>
  );
});

interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Slide In Animation Component
 * Animación de deslizamiento desde un lado
 */
export const SlideIn = memo(function SlideIn({
  children,
  direction = 'left',
  delay = 0,
  duration = 400,
  className
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';
    
    switch (direction) {
      case 'left': return 'translate(-100%, 0)';
      case 'right': return 'translate(100%, 0)';
      case 'up': return 'translate(0, -100%)';
      case 'down': return 'translate(0, 100%)';
    }
  };

  return (
    <div
      className={cx('transition-all', className)}
      style={{
        transform: getTransform(),
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </div>
  );
});

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Scale In Animation Component
 * Animación de escalado desde pequeño a normal
 */
export const ScaleIn = memo(function ScaleIn({
  children,
  delay = 0,
  duration = 300,
  className
}: ScaleInProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cx('transition-all', className)}
      style={{
        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' // Spring easing
      }}
    >
      {children}
    </div>
  );
});

interface StaggeredListProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

/**
 * Staggered List Animation
 * Animación escalonada para listas de elementos
 */
export const StaggeredList = memo(function StaggeredList({
  children,
  staggerDelay = 50,
  className
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
});

/**
 * Pulse Animation Component
 * Animación de pulso para indicar actividad
 */
export const Pulse = memo(function Pulse({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('animate-pulse', className)}>
      {children}
    </div>
  );
});

/**
 * Bounce Animation Component
 * Animación de rebote
 */
export const Bounce = memo(function Bounce({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('animate-bounce', className)}>
      {children}
    </div>
  );
});

/**
 * Spin Animation Component
 * Animación de rotación (para loaders)
 */
export const Spin = memo(function Spin({
  children,
  className,
  speed = 'normal'
}: {
  children: React.ReactNode;
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
}) {
  const duration = speed === 'slow' ? '3s' : speed === 'fast' ? '0.5s' : '1s';

  return (
    <div
      className={cx('inline-block', className)}
      style={{
        animation: `spin ${duration} linear infinite`
      }}
    >
      {children}
    </div>
  );
});

