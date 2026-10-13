import { DOC_TRACKS } from './docs-catalog';

/**
 * Technical Revision Guide Exporter
 * Harvests student inline notes and bookmarks across all tracks and compiles
 * a pristine textbook-grade Markdown revision document for offline review.
 */

export interface RevisionGuideExportResult {
  markdown: string;
  noteCount: number;
  bookmarkedCount: number;
}

/**
 * Scans localStorage for student notes and returns a topicId -> note content map
 */
export function harvestStudentNotes(): Record<string, string> {
  const notesMap: Record<string, string> = {};

  if (typeof window === 'undefined' || !window.localStorage) {
    return notesMap;
  }

  try {
    // 1. Check aggregated dictionary first
    const aggregated = localStorage.getItem('studentsprep_doc_notes');
    if (aggregated) {
      const parsed = JSON.parse(aggregated);
      for (const [id, content] of Object.entries(parsed)) {
        if (typeof content === 'string' && content.trim()) {
          notesMap[id] = content.trim();
        }
      }
    }

    // 2. Scan individual topic keys (e.g. studentsprep_notes_top-java-jvm)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('studentsprep_notes_')) {
        const topicId = key.replace('studentsprep_notes_', '');
        const val = localStorage.getItem(key);
        if (val && val.trim() && !notesMap[topicId]) {
          notesMap[topicId] = val.trim();
        }
      }
    }
  } catch {
    // ignore
  }

  return notesMap;
}

/**
 * Harvests bookmarked topic IDs from localStorage
 */
export function harvestBookmarkedTopicIds(): Set<string> {
  const bookmarkedSet = new Set<string>();

  if (typeof window === 'undefined' || !window.localStorage) {
    return bookmarkedSet;
  }

  try {
    const raw = localStorage.getItem('studentsprep_bookmarked_topics');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((id) => bookmarkedSet.add(id));
      }
    }
  } catch {
    // ignore
  }

  return bookmarkedSet;
}

/**
 * Checks if the student has authored any notes
 */
export function hasPersonalNotes(): boolean {
  const notes = harvestStudentNotes();
  return Object.keys(notes).length > 0;
}

/**
 * Compiles a structured, textbook-grade Markdown revision guide
 */
export function generateMarkdownRevisionGuide(): RevisionGuideExportResult {
  const notes = harvestStudentNotes();
  const bookmarks = harvestBookmarkedTopicIds();
  const exportDate = new Date().toISOString().split('T')[0];

  const lines: string[] = [];

  lines.push('# Technical Engineering Revision Guide & Personal Notes');
  lines.push(`> Generated on ${exportDate} • Compiled from StudentsPrep Documentation Portal`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Table of Contents
  lines.push('## Table of Contents');
  for (const track of DOC_TRACKS) {
    const trackTopics = track.modules.flatMap((m) => m.topics);
    const hasContent = trackTopics.some(
      (t) => notes[t.id] || bookmarks.has(t.id)
    );

    if (hasContent) {
      lines.push(`- [${track.title}](#${track.slug})`);
      for (const mod of track.modules) {
        const modTopicsWithContent = mod.topics.filter(
          (t) => notes[t.id] || bookmarks.has(t.id)
        );
        for (const top of modTopicsWithContent) {
          lines.push(`  - [${top.title}](#${top.slug})`);
        }
      }
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  let noteCount = 0;
  let bookmarkedCount = 0;

  // Track Sections
  for (const track of DOC_TRACKS) {
    const trackTopics = track.modules.flatMap((m) => m.topics);
    const relevantTopics = trackTopics.filter(
      (t) => notes[t.id] || bookmarks.has(t.id)
    );

    if (relevantTopics.length === 0) {
      continue;
    }

    lines.push(`<a id="${track.slug}"></a>`);
    lines.push(`## ${track.title}`);
    lines.push(`*${track.tagline}*`);
    lines.push('');
    lines.push(`${track.description}`);
    lines.push('');

    for (const mod of track.modules) {
      const modTopics = mod.topics.filter(
        (t) => notes[t.id] || bookmarks.has(t.id)
      );

      if (modTopics.length === 0) continue;

      lines.push(`### ${mod.title}`);
      lines.push('');

      for (const topic of modTopics) {
        const hasNote = Boolean(notes[topic.id]);
        const isBookmarked = bookmarks.has(topic.id);

        if (hasNote) noteCount++;
        if (isBookmarked) bookmarkedCount++;

        lines.push(`<a id="${topic.slug}"></a>`);
        lines.push(`#### ${topic.title} ${isBookmarked ? '★ [Bookmarked]' : ''}`);
        lines.push(`- **Difficulty**: ${topic.difficulty}`);
        lines.push(`- **Estimated Read Time**: ${topic.readTimeMinutes} mins`);
        lines.push('');
        lines.push(`**Architectural Overview:**`);
        lines.push(`${topic.shortDescription}`);
        lines.push('');

        if (topic.invariants && topic.invariants.length > 0) {
          lines.push(`**Key Invariants:**`);
          for (const inv of topic.invariants) {
            lines.push(`- ${inv}`);
          }
          lines.push('');
        }

        if (hasNote) {
          lines.push('##### Personal Engineering Notes:');
          lines.push('```markdown');
          lines.push(notes[topic.id]);
          lines.push('```');
          lines.push('');
        } else {
          lines.push('*(No personal notes authored for this chapter yet.)*');
          lines.push('');
        }

        lines.push('---');
        lines.push('');
      }
    }
  }

  // If no notes or bookmarks exist at all, generate a complete curriculum blueprint
  if (noteCount === 0 && bookmarkedCount === 0) {
    lines.push('## Starter Curriculum Study Blueprint');
    lines.push('*(No personal notes or bookmarks found. Showing all track fundamentals.)*');
    lines.push('');

    for (const track of DOC_TRACKS.slice(0, 5)) {
      lines.push(`### ${track.title}`);
      for (const mod of track.modules) {
        for (const topic of mod.topics) {
          lines.push(`- **${topic.title}** (${topic.difficulty}, ${topic.readTimeMinutes}m)`);
          lines.push(`  ${topic.shortDescription}`);
        }
      }
      lines.push('');
    }
  }

  return {
    markdown: lines.join('\n'),
    noteCount,
    bookmarkedCount,
  };
}

/**
 * Triggers a client-side Markdown file download
 */
export function exportNotesRevisionGuide(filename = 'studentsprep-revision-guide.md'): boolean {
  if (typeof window === 'undefined' || !window.document) {
    return false;
  }

  try {
    const { markdown } = generateMarkdownRevisionGuide();
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Failed to export revision guide:', error);
    return false;
  }
}
