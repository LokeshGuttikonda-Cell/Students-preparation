'use client';

import React from 'react';
import { Button } from '../ui/Button';

export interface SubmitConfirmModalProps {
  isOpen: boolean;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  markedCount: number;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  totalQuestions,
  answeredCount,
  unansweredCount,
  markedCount,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-surface rounded-xl border border-border shadow-xl max-w-md w-full p-6 space-y-5"
      >
        <div className="space-y-1.5">
          <h3 id="modal-title" className="text-xl font-bold text-text">
            Submit Assessment?
          </h3>
          <p className="text-sm text-text-muted">
            Are you sure you want to finish this mock test ({totalQuestions} questions)? Once submitted, your answers will be evaluated and you will see your final score.
          </p>
        </div>

        {/* Count Summary Grid */}
        <div className="grid grid-cols-3 gap-3 bg-canvas p-3 rounded-lg border border-border text-center">
          <div className="space-y-0.5">
            <span className="text-2xl font-bold text-success-700 tabular">
              {answeredCount}
            </span>
            <p className="text-xs text-text-muted">Answered</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl font-bold text-error-600 tabular">
              {unansweredCount}
            </span>
            <p className="text-xs text-text-muted">Unanswered</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-2xl font-bold text-review tabular">
              {markedCount}
            </span>
            <p className="text-xs text-text-muted">Marked</p>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="bg-warning-50 border border-warning-200 text-warning-800 p-3 rounded-md text-xs">
            ⚠️ You still have <strong className="tabular">{unansweredCount}</strong> unanswered {unansweredCount === 1 ? 'question' : 'questions'}.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Continue Test
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={isSubmitting}
            onClick={onConfirm}
          >
            Submit Test Now
          </Button>
        </div>
      </div>
    </div>
  );
};
