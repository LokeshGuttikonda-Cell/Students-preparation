'use client';

import React, { useEffect, useState, useRef } from 'react';

export interface TimerCountdownProps {
  expiresAt: string;
  serverNow: string;
  onExpire?: () => void;
  className?: string;
}

export const TimerCountdown: React.FC<TimerCountdownProps> = ({
  expiresAt,
  serverNow,
  onExpire,
  className = '',
}) => {
  // Calculate clock skew between client device and server
  const clientMountTime = useRef(Date.now());
  const serverTimeOffset = useRef(
    new Date(serverNow).getTime() - clientMountTime.current,
  );
  const targetExpiry = useRef(new Date(expiresAt).getTime());
  const hasExpiredRef = useRef(false);

  const calculateRemaining = () => {
    const estimatedServerNow = Date.now() + serverTimeOffset.current;
    const diff = Math.max(0, targetExpiry.current - estimatedServerNow);
    return Math.floor(diff / 1000);
  };

  const [remainingSeconds, setRemainingSeconds] = useState(calculateRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);

      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onExpire]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = remainingSeconds <= 300; // 5 minutes or less

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        aria-live="polite"
        className={`tabular font-semibold transition-colors ${
          isUrgent ? 'text-error-600 text-2xl sm:text-3xl' : 'text-primary-900 text-xl sm:text-2xl'
        }`}
      >
        {formattedTime}
      </span>
      {isUrgent && remainingSeconds > 0 && (
        <span className="bg-error-50 text-error-700 border border-error-500/30 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          Time Running Out
        </span>
      )}
    </div>
  );
};
