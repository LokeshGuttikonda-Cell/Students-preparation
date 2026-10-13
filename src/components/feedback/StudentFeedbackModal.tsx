'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  X,
  CheckCircle2,
  MessageSquareHeart,
  Sparkles,
  Clock,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  FeedbackCategory,
  FeedbackContextTrigger,
  recordFeedbackDismissed,
  submitStudentFeedback,
  type StudentFeedbackRecord,
} from '../../lib/telemetry-client';

export interface StudentFeedbackModalProps {
  isOpen: boolean;
  trigger: FeedbackContextTrigger;
  metadata?: Record<string, unknown>;
  onClose: () => void;
  onSubmitted?: (feedback: StudentFeedbackRecord) => void;
}

const TRIGGER_HEADERS: Record<
  FeedbackContextTrigger,
  { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }
> = {
  [FeedbackContextTrigger.MCQ_PRACTICE]: {
    title: 'How was your practice session?',
    subtitle: 'Help us improve question quality, explanations, and concept clarity.',
    icon: HelpCircle,
  },
  [FeedbackContextTrigger.QUIZ_MOCK]: {
    title: 'How was this Mock Assessment?',
    subtitle: 'Share your feedback on question balance, difficulty, and timing.',
    icon: GraduationCap,
  },
  [FeedbackContextTrigger.MOCK_INTERVIEW]: {
    title: 'How was your Socratic Interview?',
    subtitle: 'Tell us how closely the interview mirrored a real senior architect screening.',
    icon: Sparkles,
  },
  [FeedbackContextTrigger.TIME_SPENT_1HR]: {
    title: 'Great work studying for over an hour!',
    subtitle: 'We would love your thoughts on how your learning session is going so far.',
    icon: Clock,
  },
  [FeedbackContextTrigger.GENERAL]: {
    title: 'Help Us Improve Students Preparation',
    subtitle: 'Share your experience, feature ideas, or issues you encountered.',
    icon: MessageSquareHeart,
  },
};

const CATEGORY_OPTIONS: Array<{ value: FeedbackCategory; label: string }> = [
  { value: FeedbackCategory.CONTENT_QUALITY, label: 'Content Quality' },
  { value: FeedbackCategory.DIFFICULTY, label: 'Difficulty Level' },
  { value: FeedbackCategory.PLATFORM_UI, label: 'UI & Usability' },
  { value: FeedbackCategory.FEATURE_REQUEST, label: 'Feature Request' },
  { value: FeedbackCategory.BUG_REPORT, label: 'Issue / Bug' },
];

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Exceptional',
};

export const StudentFeedbackModal: React.FC<StudentFeedbackModalProps> = ({
  isOpen,
  trigger,
  metadata,
  onClose,
  onSubmitted,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<FeedbackCategory>(
    FeedbackCategory.CONTENT_QUALITY,
  );
  const [comment, setComment] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] =
    useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSubmittedSuccessfully(false);
      setErrorMsg(null);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        e.preventDefault();
        recordFeedbackDismissed(trigger);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose, trigger]);

  if (!isOpen) return null;

  const headerInfo = TRIGGER_HEADERS[trigger] || TRIGGER_HEADERS[FeedbackContextTrigger.GENERAL];
  const IconComponent = headerInfo.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please enter a brief comment before submitting.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const record = await submitStudentFeedback({
        contextTrigger: trigger,
        rating,
        category,
        comment: comment.trim(),
        userName: userName.trim() || undefined,
        metadata,
      });

      setSubmittedSuccessfully(true);
      if (onSubmitted) {
        onSubmitted(record);
      }

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch {
      setErrorMsg('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    recordFeedbackDismissed(trigger);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleDismiss();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="bg-surface rounded-2xl border border-border shadow-2xl max-w-lg w-full p-6 space-y-5 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-canvas transition-colors"
          aria-label="Close feedback modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedSuccessfully ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-text">Thank You for Your Feedback!</h3>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              Your insights help us continuously polish question explanations, architectural deep dives, and simulation fidelity.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3.5 pr-8">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 id="feedback-title" className="text-lg font-bold text-text">
                  {headerInfo.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed mt-0.5">
                  {headerInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-text uppercase tracking-wider block">
                Overall Satisfaction
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = (hoverRating || rating) >= starValue;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => setRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 rounded-md text-text-muted hover:scale-110 transition-transform focus:outline-hidden"
                      aria-label={`Rate ${starValue} stars`}
                    >
                      <Star
                        className={`w-7 h-7 ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-border hover:text-amber-400'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-medium text-text-muted ml-2">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text uppercase tracking-wider block">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                      category === opt.value
                        ? 'bg-primary/10 border-primary text-primary font-semibold'
                        : 'bg-canvas border-border text-text-muted hover:border-text-muted hover:text-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Textarea */}
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-comment"
                className="text-xs font-semibold text-text uppercase tracking-wider block"
              >
                Your Thoughts
              </label>
              <textarea
                id="feedback-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What was helpful? What could be clearer or more in-depth? Any topics or questions you'd like added?"
                rows={3}
                className="w-full text-sm rounded-lg border border-border bg-canvas p-2.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-hidden transition-colors"
                maxLength={2000}
                required
              />
              <div className="flex justify-between items-center text-xs text-text-muted">
                <span>Constructive feedback directly shapes future updates.</span>
                <span>{comment.length}/2000</span>
              </div>
            </div>

            {/* Optional User Name */}
            <div className="space-y-1">
              <label
                htmlFor="feedback-user-name"
                className="text-xs font-medium text-text-muted block"
              >
                Your Name or Handle (optional)
              </label>
              <input
                id="feedback-user-name"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Maya / DevOps Aspirant"
                className="w-full text-xs rounded-lg border border-border bg-canvas px-3 py-1.5 text-text placeholder:text-text-muted focus:border-primary focus:outline-hidden"
                maxLength={100}
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-rose-500">{errorMsg}</p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                disabled={isSubmitting}
              >
                Maybe Later
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting || !comment.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Send Feedback'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
