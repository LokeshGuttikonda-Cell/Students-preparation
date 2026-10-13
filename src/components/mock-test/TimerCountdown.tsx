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
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const calculateRemaining = () => {
    const estimatedServerNow = Date.now() + serverTimeOffset.current;
    const diff = Math.max(0, targetExpiry.current - estimatedServerNow);
    return Math.floor(diff / 1000);
  };

  const [remainingSeconds, setRemainingSeconds] = useState(calculateRemaining);

  useEffect(() => {
    serverTimeOffset.current = new Date(serverNow).getTime() - Date.now();
    targetExpiry.current = new Date(expiresAt).getTime();
    hasExpiredRef.current = false;
    setRemainingSeconds(calculateRemaining());
  }, [serverNow, expiresAt]);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setRemainingSeconds(remaining);

      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(interval);
        onExpireRef.current?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
        className={`tabular font-mono font-bold tracking-wider transition-colors ${
          isUrgent ? 'text-rose-400 text-2xl sm:text-3xl' : 'text-lime-400 text-xl sm:text-2xl'
        }`}
      >
        {formattedTime}
      </span>
      {isUrgent && remainingSeconds > 0 && (
        <span className="bg-rose-950/50 text-rose-300 border border-rose-500/40 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Time Running Out
        </span>
      )}
    </div>
  );
};
