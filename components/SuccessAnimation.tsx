'use client';

import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export default function SuccessAnimation({ show, onComplete }: SuccessAnimationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    if (show) {
      // Generate confetti particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50, // -50 to 50
        y: Math.random() * -100 - 50, // -50 to -150
        delay: Math.random() * 0.2,
        duration: 0.8 + Math.random() * 0.4,
      }));
      setParticles(newParticles);

      // Auto-hide after animation
      const timeout = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  if (!show && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {/* Success checkmark */}
      <div className="success-checkmark">
        <svg
          className="h-24 w-24 text-primary"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" fill="white" stroke="currentColor" strokeWidth={2} />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>

      {/* Confetti particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="confetti-particle"
          style={{
            '--x': `${particle.x}vw`,
            '--y': `${particle.y}vh`,
            '--delay': `${particle.delay}s`,
            '--duration': `${particle.duration}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
