import { ReactNode } from 'react';
import classes from '../styles/animations.module.css';

type AnimatedSectionProps = {
  children: ReactNode;
  delay?: number;
  variant?: 'fadeInUp' | 'fadeIn' | 'scaleIn';
  className?: string;
};

export function AnimatedSection({
  children,
  delay = 0,
  variant = 'fadeInUp',
  className = '',
}: AnimatedSectionProps) {
  return (
    <div
      className={`${classes[variant]} ${className}`.trim()}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
