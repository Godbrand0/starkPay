'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: Date;
  onExpire?: () => void;
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;
      return Math.max(0, Math.floor(difference / 1000)); // seconds
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0 && onExpire) {
        onExpire();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isExpiringSoon = timeLeft > 0 && timeLeft <= 60; // Last minute
  const isExpired = timeLeft === 0;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
      isExpired
        ? 'bg-red-100 text-red-800'
        : isExpiringSoon
        ? 'bg-orange-100 text-orange-800 animate-pulse'
        : 'bg-blue-100 text-blue-800'
    }`}>
      <Clock className="h-4 w-4" />
      <span className="text-sm font-medium">
        {isExpired ? (
          'Expired'
        ) : (
          <>
            {minutes}:{seconds.toString().padStart(2, '0')} remaining
          </>
        )}
      </span>
    </div>
  );
}
