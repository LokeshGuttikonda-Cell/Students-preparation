'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { exportNotesRevisionGuide } from '../../lib/docs-notes-exporter';

interface DocsNotesDrawerProps {
  topicId: string;
  topicTitle: string;
}

export const DocsNotesDrawer: React.FC<DocsNotesDrawerProps> = ({
  topicId,
  topicTitle,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [copied, setCopied] = useState<boolean>(false);

  // Load existing notes for this topic
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`studentsprep_notes_${topicId}`);
      if (stored !== null) {
        setNotes(stored);
      } else {
        // Check legacy aggregated dictionary
        const allNotes = localStorage.getItem('studentsprep_doc_notes');
        if (allNotes) {
          const parsed = JSON.parse(allNotes);
          if (parsed[topicId]) {
            setNotes(parsed[topicId]);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [topicId]);

  // Autosave notes on change (debounced 400ms)
  useEffect(() => {
    if (notes === '') {
      return;
    }

    setSavedStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`studentsprep_notes_${topicId}`, notes);
        // Also update master dictionary for easy export
        const masterStored = localStorage.getItem('studentsprep_doc_notes');
        const masterDict = masterStored ? JSON.parse(masterStored) : {};
        masterDict[topicId] = notes;
        localStorage.setItem('studentsprep_doc_notes', JSON.stringify(masterDict));
        setSavedStatus('saved');
      } catch {
        setSavedStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [notes, topicId]);

  const handleCopyNotes = useCallback(async () => {
    if (!notes.trim()) return;
    try {
      await navigator.clipboard.writeText(
        `# Notes: ${topicTitle}\n\n${notes}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  }, [notes, topicTitle]);

  const handleClearNotes = () => {
    if (window.confirm('Are you sure you want to clear your notes for this chapter?')) {
      setNotes('');
      try {
        localStorage.removeItem(`studentsprep_notes_${topicId}`);
        const masterStored = localStorage.getItem('studentsprep_doc_notes');
        if (masterStored) {
          const masterDict = JSON.parse(masterStored);
          delete masterDict[topicId];
          localStorage.setItem('studentsprep_doc_notes', JSON.stringify(masterDict));
        }
      } catch {
        // ignore
      }
      setSavedStatus('idle');
    }
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-2xs overflow-hidden print:hidden transition-all">
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-4 flex items-center justify-between bg-surface-subtle hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📝</span>
          <div>
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <span>Personal Engineering Notes</span>
              {notes.trim().length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-900 border border-primary-200">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
              )}
            </h3>
            <p className="text-xs text-text-muted">
              Auto-saved locally for rapid review before technical interviews
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedStatus === 'saved' && (
            <span className="text-[11px] text-green-700 dark:text-green-400 font-semibold hidden sm:inline">
              ✓ Saved locally
            </span>
          )}
          {savedStatus === 'saving' && (
            <span className="text-[11px] text-text-subtle font-semibold hidden sm:inline">
              Saving...
            </span>
          )}
          <span className="text-xs text-text-muted font-bold px-2 py-1 rounded border border-border bg-surface">
            {isOpen ? '▲ Collapse' : '▼ Expand'}
          </span>
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-3 border-t border-border bg-surface">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write key equations, architectural trade-offs, interviewer questions, or personal takeaways here..."
            className="w-full h-44 p-3.5 rounded-xl border border-border bg-surface-subtle text-xs text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono resize-y leading-relaxed"
            aria-label="Personal notes for this chapter"
          />

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs">
            <span className="text-text-subtle font-mono text-[11px]">
              {notes.length} chars • {wordCount} words • Markdown supported
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyNotes}
                disabled={!notes.trim()}
                className="text-xs"
              >
                {copied ? '✓ Copied' : '📋 Copy Notes'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => exportNotesRevisionGuide()}
                title="Export all saved notes as Markdown revision textbook"
                className="text-xs"
              >
                📥 Export All (.md)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearNotes}
                disabled={!notes.trim()}
                className="text-xs text-danger-700 hover:text-danger-900 border-danger-200"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
