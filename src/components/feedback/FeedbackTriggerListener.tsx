'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  FeedbackContextTrigger,
  canShowFeedback,
  triggerFeedbackPrompt,
  trackTimeSpent,
  trackPageView,
} from '../../lib/telemetry-client';
import { StudentFeedbackModal } from './StudentFeedbackModal';

interface FeedbackEventDetail {
  trigger: FeedbackContextTrigger;
  metadata?: Record<string, unknown>;
}

export const FeedbackTriggerListener: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState<FeedbackContextTrigger>(
    FeedbackContextTrigger.GENERAL,
  );
  const [modalMetadata, setModalMetadata] = useState<
    Record<string, unknown> | undefined
  >(undefined);

  const activeSecondsRef = useRef<number>(0);
  const lastActiveTimestampRef = useRef<number>(Date.now());

  // Handle triggered feedback events
  const handleFeedbackEvent = useCallback((e: Event) => {
    const customEvent = e as CustomEvent<FeedbackEventDetail>;
    if (!customEvent.detail || !customEvent.detail.trigger) return;

    const { trigger, metadata } = customEvent.detail;
    if (canShowFeedback(trigger)) {
      setActiveTrigger(trigger);
      setModalMetadata(metadata);
      setIsOpen(true);
    }
  }, []);

  // Listen for custom trigger events and handle active duration
  useEffect(() => {
    window.addEventListener('app:trigger-feedback', handleFeedbackEvent);

    // Track initial page view
    trackPageView(window.location.pathname);

    // Track user activity to increment active seconds counter
    const handleUserActivity = () => {
      lastActiveTimestampRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });

    // Load active seconds from sessionStorage if user navigates across pages
    try {
      const storedSecs = sessionStorage.getItem('sp_active_study_seconds');
      if (storedSecs) {
        activeSecondsRef.current = parseInt(storedSecs, 10) || 0;
      }
    } catch {
      // Non-blocking
    }

    // Interval ticker every 10 seconds:
    // If active in the last 60s, increment study seconds
    const interval = window.setInterval(() => {
      const isUserActive = Date.now() - lastActiveTimestampRef.current < 60000;
      if (isUserActive) {
        activeSecondsRef.current += 10;
        try {
          sessionStorage.setItem(
            'sp_active_study_seconds',
            activeSecondsRef.current.toString(),
          );
        } catch {
          // Non-blocking
        }

        // Send telemetry heartbeat every 60 active seconds
        if (activeSecondsRef.current % 60 === 0) {
          trackTimeSpent(60, 'study_platform', window.location.pathname);
        }

        // When user crosses 60 minutes (3600 seconds) of active learning, trigger 1-hour feedback
        if (activeSecondsRef.current >= 3600) {
          if (canShowFeedback(FeedbackContextTrigger.TIME_SPENT_1HR)) {
            triggerFeedbackPrompt(FeedbackContextTrigger.TIME_SPENT_1HR, {
              activeMinutes: Math.round(activeSecondsRef.current / 60),
            });
          }
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener('app:trigger-feedback', handleFeedbackEvent);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      clearInterval(interval);
    };
  }, [handleFeedbackEvent]);

  return (
    <StudentFeedbackModal
      isOpen={isOpen}
      trigger={activeTrigger}
      metadata={modalMetadata}
      onClose={() => setIsOpen(false)}
    />
  );
};
