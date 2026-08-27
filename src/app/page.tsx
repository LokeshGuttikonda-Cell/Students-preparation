/**
 * Session 1 placeholder page.
 *
 * Its only job is to prove the app boots and that the design tokens in
 * globals.css resolve to real Tailwind utilities. It is not a product screen
 * and carries no business logic. Session 2 replaces it with the real home page.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col justify-center px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-text-subtle">
        Session 1 &middot; Scaffold
      </p>

      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-primary-700">
        Students-preparation
      </h1>

      <p className="mt-4 max-w-xl text-base text-text-muted">
        Interview and placement preparation. Topic-wise MCQ practice, timed mock
        tests, and scored results with weak-area analysis. The platform is not
        built yet &mdash; this page exists to confirm the application boots and
        the design tokens resolve.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-md bg-primary-700 px-5 py-2.5 text-sm font-medium text-text-inverse">
          Primary action
        </span>
        <span className="inline-flex items-center rounded-md bg-accent-400 px-5 py-2.5 text-sm font-medium text-primary-950">
          Accent action
        </span>
        <span className="inline-flex items-center rounded-md border border-border-strong bg-surface px-5 py-2.5 text-sm font-medium text-text">
          Secondary action
        </span>
      </div>

      <section
        aria-label="Design token check"
        className="mt-12 rounded-lg border border-border bg-surface-muted p-6"
      >
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-text-subtle">
          Token check
        </h2>

        <dl className="mt-5 grid gap-6 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-text-subtle">
              Tabular numerals
            </dt>
            <dd className="tabular mt-1 text-3xl font-semibold text-text">
              29:00
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-text-subtle">
              Answer states
            </dt>
            <dd className="mt-2 flex gap-2">
              <span className="rounded-md border border-success-200 bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700">
                Correct
              </span>
              <span className="rounded-md border border-error-200 bg-error-50 px-2.5 py-1 text-xs font-medium text-error-700">
                Incorrect
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-text-subtle">
              Marked for review
            </dt>
            <dd className="mt-2">
              {/* Ring, not fill — keeps the palette tight. */}
              <span className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium text-text ring-2 ring-review">
                Q7
              </span>
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
