import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  harvestStudentNotes,
  harvestBookmarkedTopicIds,
  hasPersonalNotes,
  generateMarkdownRevisionGuide,
  exportNotesRevisionGuide,
} from './docs-notes-exporter';

describe('Docs Notes Exporter Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('harvests empty notes map when localStorage is empty', () => {
    const notes = harvestStudentNotes();
    expect(Object.keys(notes).length).toBe(0);
    expect(hasPersonalNotes()).toBe(false);
  });

  it('harvests notes from individual topic keys and aggregated dictionary', () => {
    localStorage.setItem(
      'studentsprep_notes_top-java-jvm-architecture',
      'Remember: JVM classloader follows parent-delegation model.'
    );
    localStorage.setItem(
      'studentsprep_doc_notes',
      JSON.stringify({
        'top-go-gmp-channels': 'M:N scheduling with work-stealing queues.',
      })
    );

    const notes = harvestStudentNotes();
    expect(notes['top-java-jvm-architecture']).toContain('parent-delegation model');
    expect(notes['top-go-gmp-channels']).toContain('work-stealing queues');
    expect(hasPersonalNotes()).toBe(true);
  });

  it('harvests bookmarked topic IDs from localStorage', () => {
    localStorage.setItem(
      'studentsprep_bookmarked_topics',
      JSON.stringify(['top-java-jvm-architecture', 'top-rust-borrow-checker'])
    );

    const bookmarks = harvestBookmarkedTopicIds();
    expect(bookmarks.size).toBe(2);
    expect(bookmarks.has('top-java-jvm-architecture')).toBe(true);
    expect(bookmarks.has('top-rust-borrow-checker')).toBe(true);
  });

  it('generates structured Markdown revision guide with personal notes and table of contents', () => {
    localStorage.setItem(
      'studentsprep_notes_top-java-jvm-architecture',
      'Classloader delegation prevents duplicate core java.lang classes.'
    );
    localStorage.setItem(
      'studentsprep_bookmarked_topics',
      JSON.stringify(['top-java-jvm-architecture'])
    );

    const { markdown, noteCount, bookmarkedCount } = generateMarkdownRevisionGuide();

    expect(noteCount).toBeGreaterThanOrEqual(1);
    expect(bookmarkedCount).toBeGreaterThanOrEqual(1);
    expect(markdown).toContain('# Technical Engineering Revision Guide');
    expect(markdown).toContain('## Table of Contents');
    expect(markdown).toContain('Modern Java & JVM Internals');
    expect(markdown).toContain('JVM Architecture, ClassLoader Subsystem & Bytecode Execution Lifecycle');
    expect(markdown).toContain('##### Personal Engineering Notes:');
    expect(markdown).toContain('Classloader delegation prevents duplicate');
  });

  it('generates starter curriculum blueprint when student has no saved notes or bookmarks', () => {
    const { markdown, noteCount, bookmarkedCount } = generateMarkdownRevisionGuide();

    expect(noteCount).toBe(0);
    expect(bookmarkedCount).toBe(0);
    expect(markdown).toContain('Starter Curriculum Study Blueprint');
    expect(markdown).toContain('Modern Java & JVM Internals');
  });

  it('executes client-side download without throwing errors', () => {
    const origCreateObjectURL = global.URL.createObjectURL;
    const origRevokeObjectURL = global.URL.revokeObjectURL;
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-uuid');
    global.URL.revokeObjectURL = vi.fn();

    const createElementSpy = vi.spyOn(document, 'createElement');
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => document.createElement('div'));
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => document.createElement('div'));

    const success = exportNotesRevisionGuide('test-guide.md');
    expect(success).toBe(true);
    expect(createElementSpy).toHaveBeenCalledWith('a');

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    global.URL.createObjectURL = origCreateObjectURL;
    global.URL.revokeObjectURL = origRevokeObjectURL;
  });
});
