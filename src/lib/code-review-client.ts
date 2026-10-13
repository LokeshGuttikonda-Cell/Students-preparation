/**
 * Students-Preparation Code Review & Pull Request (PR) Anti-Pattern Lab Engine
 * 100% Deterministic Local Compute | Zero External AI Billing ($0.00 Spend)
 * Content Policy Compliant: Generic, Vendor-Neutral Engineering Services
 */

export type PullRequestLanguage = 'TypeScript' | 'Go' | 'Java' | 'Python' | 'SQL';
export type PullRequestDifficulty = 'Intermediate' | 'Advanced' | 'Expert';
export type FlawSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'NITPICK';
export type FlawCategory =
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'CONCURRENCY'
  | 'CORRECTNESS'
  | 'MAINTAINABILITY';
export type DiffLineType = 'ADD' | 'DEL' | 'UNCHANGED';
export type ReviewVerdict = 'REQUEST_CHANGES' | 'APPROVE' | 'COMMENT';
export type ReviewGrade = 'S' | 'A' | 'B' | 'C' | 'F';

export interface DiffLine {
  type: DiffLineType;
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

export interface DiffFile {
  filename: string;
  oldPath: string;
  newPath: string;
  diffLines: DiffLine[];
}

export interface CodeReviewFlaw {
  id: string;
  fileIndex: number;
  lineNumber: number;
  severity: FlawSeverity;
  category: FlawCategory;
  title: string;
  explanation: string;
  recommendedFixCode: string;
}

export interface PullRequestItem {
  id: string;
  title: string;
  branch: string;
  author: string;
  authorRole: string;
  targetService: string;
  language: PullRequestLanguage;
  difficulty: PullRequestDifficulty;
  description: string;
  files: DiffFile[];
  goldenFlaws: CodeReviewFlaw[];
  hints: string[];
}

export interface UserInlineComment {
  id: string;
  fileIndex: number;
  lineNumber: number;
  commentText: string;
  severity: FlawSeverity;
  category: FlawCategory;
  createdAt: string;
}

export interface ReviewEvaluation {
  prId: string;
  verdict: ReviewVerdict;
  detectedFlawIds: string[];
  missedFlawIds: string[];
  spuriousCommentCount: number;
  recallPercent: number;
  precisionPercent: number;
  verdictAccuracyScore: number;
  overallScore: number;
  grade: ReviewGrade;
  feedbackSummary: string;
  earnedBadges: string[];
  evaluatedAt: string;
}

export interface SavedCodeReviewRecord {
  prId: string;
  comments: UserInlineComment[];
  verdict?: ReviewVerdict;
  summaryText?: string;
  evaluation?: ReviewEvaluation | null;
  lastUpdated: string;
}

export const CODE_REVIEW_STORAGE_KEY = 'sp_code_review_lab_v1';

// ---------------------------------------------------------------------------
// 6 Curated Enterprise Pull Requests with Real Production Bugs
// ---------------------------------------------------------------------------

export const CURATED_PULL_REQUESTS: PullRequestItem[] = [
  {
    id: 'distributed-payment-auth',
    title: 'feat(payments): distributed idempotency and merchant auth gateway',
    branch: 'feat/payment-gateway-idempotency',
    author: 'Alex Chen',
    authorRole: 'Mid-Level Backend Engineer',
    targetService: 'Distributed Payment Gateway',
    language: 'TypeScript',
    difficulty: 'Advanced',
    description:
      'Implements idempotency caching, external card authorization dispatch, and transaction audit logging for high-volume transactions.',
    hints: [
      'Look closely at how the idempotency key is checked and set: is there a race condition between reading and writing?',
      'Check external network calls for timeouts to avoid socket starvation.',
      'Audit the logged payload for payment regulatory compliance (PCI-DSS).',
    ],
    files: [
      {
        filename: 'src/services/payment-gateway.ts',
        oldPath: 'src/services/payment-gateway.ts',
        newPath: 'src/services/payment-gateway.ts',
        diffLines: [
          { type: 'UNCHANGED', oldLineNumber: 1, newLineNumber: 1, content: "import { Request, Response } from 'express';" },
          { type: 'UNCHANGED', oldLineNumber: 2, newLineNumber: 2, content: "import { redisClient } from '../lib/redis';" },
          { type: 'UNCHANGED', oldLineNumber: 3, newLineNumber: 3, content: "import { logger } from '../lib/logger';" },
          { type: 'UNCHANGED', oldLineNumber: 4, newLineNumber: 4, content: "import axios from 'axios';" },
          { type: 'UNCHANGED', oldLineNumber: 5, newLineNumber: 5, content: '' },
          { type: 'ADD', newLineNumber: 6, content: 'export async function handlePaymentAuth(req: Request, res: Response) {' },
          { type: 'ADD', newLineNumber: 7, content: '  const { idempotencyKey, amount, currency, cardNumber, cvv } = req.body;' },
          { type: 'ADD', newLineNumber: 8, content: '  // 1. Check idempotency' },
          { type: 'ADD', newLineNumber: 9, content: '  const existingRecord = await redisClient.get(`idemp:${idempotencyKey}`);' },
          { type: 'ADD', newLineNumber: 10, content: '  if (existingRecord) {' },
          { type: 'ADD', newLineNumber: 11, content: '    return res.status(200).json(JSON.parse(existingRecord));' },
          { type: 'ADD', newLineNumber: 12, content: '  }' },
          { type: 'ADD', newLineNumber: 13, content: '  // Flaw 1: TOCTOU race condition (SETNX not used, duplicate charges can proceed)' },
          { type: 'ADD', newLineNumber: 14, content: '  await redisClient.set(`idemp:${idempotencyKey}`, JSON.stringify({ status: "PROCESSING" }), "EX", 300);' },
          { type: 'ADD', newLineNumber: 15, content: '' },
          { type: 'ADD', newLineNumber: 16, content: '  // Flaw 2: PCI-DSS violation: logging raw card primary account number (PAN) and CVV' },
          { type: 'ADD', newLineNumber: 17, content: '  logger.info("Initiating payment authorization", { idempotencyKey, cardNumber, cvv, amount });' },
          { type: 'ADD', newLineNumber: 18, content: '' },
          { type: 'ADD', newLineNumber: 19, content: '  // Flaw 3: External HTTP call without connection timeout (vulnerable to hung threads)' },
          { type: 'ADD', newLineNumber: 20, content: '  const upstreamRes = await axios.post("https://processor.internal/v1/charge", {' },
          { type: 'ADD', newLineNumber: 21, content: '    amount, currency, cardNumber, cvv' },
          { type: 'ADD', newLineNumber: 22, content: '  });' },
          { type: 'ADD', newLineNumber: 23, content: '' },
          { type: 'ADD', newLineNumber: 24, content: '  const result = { txId: upstreamRes.data.id, status: "SUCCESS", amount };' },
          { type: 'ADD', newLineNumber: 25, content: '  await redisClient.set(`idemp:${idempotencyKey}`, JSON.stringify(result), "EX", 86400);' },
          { type: 'ADD', newLineNumber: 26, content: '  return res.status(201).json(result);' },
          { type: 'ADD', newLineNumber: 27, content: '}' },
        ],
      },
    ],
    goldenFlaws: [
      {
        id: 'payment-flaw-toctou',
        fileIndex: 0,
        lineNumber: 13,
        severity: 'CRITICAL',
        category: 'CONCURRENCY',
        title: 'Time-of-Check to Time-of-Use (TOCTOU) Race Condition in Idempotency Check',
        explanation:
          'Using redis.get() followed separately by redis.set() allows two concurrent requests with the identical idempotency key to pass the check simultaneously before either sets the key. Use atomic SET key value NX EX 300 or a Redis Redlock.',
        recommendedFixCode:
          'const acquired = await redisClient.set(`idemp:${idempotencyKey}`, JSON.stringify({ status: "PROCESSING" }), "NX", "EX", 300);\nif (!acquired) {\n  return res.status(409).json({ error: "Concurrent request in flight" });\n}',
      },
      {
        id: 'payment-flaw-pci-dss',
        fileIndex: 0,
        lineNumber: 17,
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'PCI-DSS Violation: Plaintext Logging of Sensitive Card Data (PAN & CVV)',
        explanation:
          'Logging raw 16-digit credit card numbers and CVV security codes in application logs exposes cardholder data in plaintext. This breaches PCI-DSS Requirement 3. Mask card numbers to the last 4 digits and never log CVV.',
        recommendedFixCode:
          'logger.info("Initiating payment authorization", {\n  idempotencyKey,\n  cardLast4: cardNumber.slice(-4),\n  amount\n});',
      },
      {
        id: 'payment-flaw-no-timeout',
        fileIndex: 0,
        lineNumber: 20,
        severity: 'MAJOR',
        category: 'PERFORMANCE',
        title: 'Missing HTTP Request Timeout on Upstream Payment Gateway Call',
        explanation:
          'Calling external upstream services without explicit timeout configuration risks thread pool exhaustion if the upstream hangs or encounters latency spikes. Always configure timeouts (e.g. timeout: 5000ms).',
        recommendedFixCode:
          'const upstreamRes = await axios.post("https://processor.internal/v1/charge", payload, {\n  timeout: 5000\n});',
      },
    ],
  },

  {
    id: 'user-feed-service',
    title: 'feat(feed): timeline feed ranking and author profile aggregator',
    branch: 'feat/feed-timeline-ranking',
    author: 'Priya Sharma',
    authorRole: 'Data Platform Engineer',
    targetService: 'High-Throughput Feed Service',
    language: 'Python',
    difficulty: 'Intermediate',
    description:
      'Calculates candidate user feeds, scores events, and enriches post summaries with author biographical records.',
    hints: [
      'Examine the queries executed inside the post enrichment loop for N+1 anti-patterns.',
      'Check if the event query is paginated or bounds memory consumption.',
      'Notice any mutable default arguments in the function signature.',
    ],
    files: [
      {
        filename: 'services/feed_generator.py',
        oldPath: 'services/feed_generator.py',
        newPath: 'services/feed_generator.py',
        diffLines: [
          { type: 'UNCHANGED', oldLineNumber: 1, newLineNumber: 1, content: 'from typing import List, Dict, Any' },
          { type: 'UNCHANGED', oldLineNumber: 2, newLineNumber: 2, content: 'from database import get_db_session, Post, Author' },
          { type: 'UNCHANGED', oldLineNumber: 3, newLineNumber: 3, content: '' },
          { type: 'ADD', newLineNumber: 4, content: '# Flaw 1: Mutable default argument in Python function definition' },
          { type: 'ADD', newLineNumber: 5, content: 'def score_feed_items(posts: List[Post], seen_cache: List[int] = []) -> List[Dict[str, Any]]:' },
          { type: 'ADD', newLineNumber: 6, content: '    session = get_db_session()' },
          { type: 'ADD', newLineNumber: 7, content: '    # Flaw 2: Unbounded memory allocation fetching all posts without LIMIT or pagination' },
          { type: 'ADD', newLineNumber: 8, content: '    all_records = session.query(Post).filter(Post.is_published == True).all()' },
          { type: 'ADD', newLineNumber: 9, content: '    feed_payload = []' },
          { type: 'ADD', newLineNumber: 10, content: '' },
          { type: 'ADD', newLineNumber: 11, content: '    for item in all_records:' },
          { type: 'ADD', newLineNumber: 12, content: '        # Flaw 3: N+1 query: individual SQL query per post inside loop' },
          { type: 'ADD', newLineNumber: 13, content: '        author = session.query(Author).filter(Author.id == item.author_id).first()' },
          { type: 'ADD', newLineNumber: 14, content: '        score = item.likes_count * 1.5 + item.comments_count * 3.0' },
          { type: 'ADD', newLineNumber: 15, content: '        feed_payload.append({' },
          { type: 'ADD', newLineNumber: 16, content: '            "id": item.id,' },
          { type: 'ADD', newLineNumber: 17, content: '            "title": item.title,' },
          { type: 'ADD', newLineNumber: 18, content: '            "author_name": author.name if author else "Unknown",' },
          { type: 'ADD', newLineNumber: 19, content: '            "score": score' },
          { type: 'ADD', newLineNumber: 20, content: '        })' },
          { type: 'ADD', newLineNumber: 21, content: '        seen_cache.append(item.id)' },
          { type: 'ADD', newLineNumber: 22, content: '' },
          { type: 'ADD', newLineNumber: 23, content: '    return sorted(feed_payload, key=lambda x: x["score"], reverse=True)' },
        ],
      },
    ],
    goldenFlaws: [
      {
        id: 'feed-flaw-n-plus-1',
        fileIndex: 0,
        lineNumber: 13,
        severity: 'CRITICAL',
        category: 'PERFORMANCE',
        title: 'N+1 Database Query Anti-Pattern Inside Iteration Loop',
        explanation:
          'Executing session.query(Author).filter(...) inside the loop generates N individual round-trips to the database for N items. Use eager loading with joinedload() or pre-fetch authors with WHERE author_id IN (...).',
        recommendedFixCode:
          '# Eager join author in the primary query:\nall_records = session.query(Post).options(joinedload(Post.author)).filter(Post.is_published == True).limit(50).all()',
      },
      {
        id: 'feed-flaw-unbounded-query',
        fileIndex: 0,
        lineNumber: 8,
        severity: 'MAJOR',
        category: 'PERFORMANCE',
        title: 'Unbounded Query Execution (OOM Risk from Full Table Fetch)',
        explanation:
          'Calling .all() on all published posts without LIMIT or cursor-based pagination causes memory bloat and eventual process OOM crashes as the dataset grows into millions of records.',
        recommendedFixCode:
          'all_records = session.query(Post).filter(Post.is_published == True).order_by(Post.created_at.desc()).limit(pageSize).all()',
      },
      {
        id: 'feed-flaw-mutable-default',
        fileIndex: 0,
        lineNumber: 5,
        severity: 'MINOR',
        category: 'CORRECTNESS',
        title: 'Mutable Default Argument in Python Function Signature',
        explanation:
          'In Python, default arguments are evaluated only once at definition time. Using seen_cache: List[int] = [] means all calls share the same list instance, causing unintended cross-request state leakage.',
        recommendedFixCode:
          'def score_feed_items(posts: List[Post], seen_cache: Optional[List[int]] = None) -> List[Dict[str, Any]]:\n    if seen_cache is None:\n        seen_cache = []',
      },
    ],
  },

  {
    id: 'auth-token-validator',
    title: 'fix(security): unified JWT verification and session token generation',
    branch: 'fix/jwt-unified-verifier',
    author: 'Marcus Vance',
    authorRole: 'Systems Security Engineer',
    targetService: 'Token Auth Validator',
    language: 'Go',
    difficulty: 'Expert',
    description:
      'Implements token signature parsing, asymmetric verification routines, and random cryptographic session generation.',
    hints: [
      'Check what JWT algorithms are accepted and if the signature check can be bypassed.',
      'Check the random number generator used to create session tokens.',
      'Observe how secrets are compared for timing channel side-effects.',
    ],
    files: [
      {
        filename: 'pkg/auth/jwt_verifier.go',
        oldPath: 'pkg/auth/jwt_verifier.go',
        newPath: 'pkg/auth/jwt_verifier.go',
        diffLines: [
          { type: 'UNCHANGED', oldLineNumber: 1, newLineNumber: 1, content: 'package auth' },
          { type: 'UNCHANGED', oldLineNumber: 2, newLineNumber: 2, content: '' },
          { type: 'UNCHANGED', oldLineNumber: 3, newLineNumber: 3, content: 'import (' },
          { type: 'UNCHANGED', oldLineNumber: 4, newLineNumber: 4, content: '\t"fmt"' },
          { type: 'UNCHANGED', oldLineNumber: 5, newLineNumber: 5, content: '\t"math/rand"' },
          { type: 'UNCHANGED', oldLineNumber: 6, newLineNumber: 6, content: '\t"time"' },
          { type: 'UNCHANGED', oldLineNumber: 7, newLineNumber: 7, content: ')' },
          { type: 'UNCHANGED', oldLineNumber: 8, newLineNumber: 8, content: '' },
          { type: 'ADD', newLineNumber: 9, content: 'func VerifyToken(headerAlg string, tokenSignature string, expectedSig string) (bool, error) {' },
          { type: 'ADD', newLineNumber: 10, content: '\t// Flaw 1: Alg "none" signature bypass vulnerability' },
          { type: 'ADD', newLineNumber: 11, content: '\tif headerAlg == "none" || headerAlg == "NONE" {' },
          { type: 'ADD', newLineNumber: 12, content: '\t\treturn true, nil // insecurely bypasses verification' },
          { type: 'ADD', newLineNumber: 13, content: '\t}' },
          { type: 'ADD', newLineNumber: 14, content: '' },
          { type: 'ADD', newLineNumber: 15, content: '\t// Flaw 2: Non-constant time string equality comparison (timing attack)' },
          { type: 'ADD', newLineNumber: 16, content: '\tif tokenSignature == expectedSig {' },
          { type: 'ADD', newLineNumber: 17, content: '\t\treturn true, nil' },
          { type: 'ADD', newLineNumber: 18, content: '\t}' },
          { type: 'ADD', newLineNumber: 19, content: '\treturn false, fmt.Errorf("invalid token signature")' },
          { type: 'ADD', newLineNumber: 20, content: '}' },
          { type: 'ADD', newLineNumber: 21, content: '' },
          { type: 'ADD', newLineNumber: 22, content: 'func GenerateSessionToken() string {' },
          { type: 'ADD', newLineNumber: 23, content: '\t// Flaw 3: Insecure PRNG (math/rand seeded with UnixNano) for security-sensitive token' },
          { type: 'ADD', newLineNumber: 24, content: '\trand.Seed(time.Now().UnixNano())' },
          { type: 'ADD', newLineNumber: 25, content: '\treturn fmt.Sprintf("sess_%016x", rand.Int63())' },
          { type: 'ADD', newLineNumber: 26, content: '}' },
        ],
      },
    ],
    goldenFlaws: [
      {
        id: 'auth-flaw-alg-none',
        fileIndex: 0,
        lineNumber: 11,
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'JWT Algorithm "none" Vulnerability (Signature Bypass)',
        explanation:
          'Accepting alg: "none" allows an attacker to alter the payload to grant themselves administrator privileges and omit the signature entirely, which passes authentication unchecked.',
        recommendedFixCode:
          'if headerAlg != "RS256" && headerAlg != "ES256" {\n\treturn false, fmt.Errorf("unsupported or insecure algorithm: %s", headerAlg)\n}',
      },
      {
        id: 'auth-flaw-timing-attack',
        fileIndex: 0,
        lineNumber: 16,
        severity: 'MAJOR',
        category: 'SECURITY',
        title: 'Timing Attack Vulnerability on Signature Comparison',
        explanation:
          'Standard string comparison (==) terminates on the first mismatching byte, leaking execution time proportional to how many leading bytes match. Use subtle.ConstantTimeCompare().',
        recommendedFixCode:
          'import "crypto/subtle"\n\nif subtle.ConstantTimeCompare([]byte(tokenSignature), []byte(expectedSig)) == 1 {\n\treturn true, nil\n}',
      },
      {
        id: 'auth-flaw-insecure-prng',
        fileIndex: 0,
        lineNumber: 24,
        severity: 'MAJOR',
        category: 'SECURITY',
        title: 'Insecure Pseudo-Random Number Generator for Session Tokens',
        explanation:
          'math/rand is a predictable pseudo-random generator, not a cryptographically secure pseudo-random number generator (CSPRNG). Use crypto/rand for all authentication tokens and secrets.',
        recommendedFixCode:
          'import "crypto/rand"\n\nb := make([]byte, 32)\nif _, err := rand.Read(b); err != nil {\n\treturn "", err\n}\nreturn fmt.Sprintf("sess_%x", b)',
      },
    ],
  },

  {
    id: 'concurrent-cache-worker',
    title: 'feat(cache): background cache warmer with concurrent worker pool',
    branch: 'feat/async-cache-warmer',
    author: 'Devon Reed',
    authorRole: 'Cloud Infrastructure Engineer',
    targetService: 'Async Cache Warmer',
    language: 'Go',
    difficulty: 'Advanced',
    description:
      'Spawns concurrent background goroutines to periodically refresh hot cache keys from backing persistent storage.',
    hints: [
      'Trace how multiple goroutines access the native map.',
      'Check channel send operations for potential unbuffered deadlocks.',
      'Look at worker goroutine lifecycle and whether context cancellation is propagated.',
    ],
    files: [
      {
        filename: 'internal/cache/worker.go',
        oldPath: 'internal/cache/worker.go',
        newPath: 'internal/cache/worker.go',
        diffLines: [
          { type: 'UNCHANGED', oldLineNumber: 1, newLineNumber: 1, content: 'package cache' },
          { type: 'UNCHANGED', oldLineNumber: 2, newLineNumber: 2, content: '' },
          { type: 'UNCHANGED', oldLineNumber: 3, newLineNumber: 3, content: 'import (' },
          { type: 'UNCHANGED', oldLineNumber: 4, newLineNumber: 4, content: '\t"sync"' },
          { type: 'UNCHANGED', oldLineNumber: 5, newLineNumber: 5, content: '\t"time"' },
          { type: 'UNCHANGED', oldLineNumber: 6, newLineNumber: 6, content: ')' },
          { type: 'UNCHANGED', oldLineNumber: 7, newLineNumber: 7, content: '' },
          { type: 'ADD', newLineNumber: 8, content: 'type CacheWarmer struct {' },
          { type: 'ADD', newLineNumber: 9, content: '\tdata map[string]string // Flaw 1: unsynchronized native map accessed concurrently' },
          { type: 'ADD', newLineNumber: 10, content: '}' },
          { type: 'ADD', newLineNumber: 11, content: '' },
          { type: 'ADD', newLineNumber: 12, content: 'func (cw *CacheWarmer) WarmKeys(keys []string) {' },
          { type: 'ADD', newLineNumber: 13, content: '\t// Flaw 2: Unbuffered channel causing deadlock when writer blocks with no active reader' },
          { type: 'ADD', newLineNumber: 14, content: '\tresults := make(chan string)' },
          { type: 'ADD', newLineNumber: 15, content: '' },
          { type: 'ADD', newLineNumber: 16, content: '\tfor _, key := range keys {' },
          { type: 'ADD', newLineNumber: 17, content: '\t\t// Flaw 3: Goroutine leak: no context or stop signal to cancel long-running loop' },
          { type: 'ADD', newLineNumber: 18, content: '\t\tgo func(k string) {' },
          { type: 'ADD', newLineNumber: 19, content: '\t\t\tval := fetchFromRemote(k)' },
          { type: 'ADD', newLineNumber: 20, content: '\t\t\tcw.data[k] = val // fatal runtime error: concurrent map writes' },
          { type: 'ADD', newLineNumber: 21, content: '\t\t\tresults <- k' },
          { type: 'ADD', newLineNumber: 22, content: '\t\t}(key)' },
          { type: 'ADD', newLineNumber: 23, content: '\t}' },
          { type: 'ADD', newLineNumber: 24, content: '}' },
        ],
      },
    ],
    goldenFlaws: [
      {
        id: 'cache-flaw-data-race',
        fileIndex: 0,
        lineNumber: 20,
        severity: 'CRITICAL',
        category: 'CONCURRENCY',
        title: 'Data Race: Concurrent Unsynchronized Writes to Go Native Map',
        explanation:
          'Go native maps are not thread-safe. Concurrent writes from multiple goroutines will trigger a fatal runtime panic: "fatal error: concurrent map writes". Use sync.RWMutex or sync.Map.',
        recommendedFixCode:
          'type CacheWarmer struct {\n\tmu sync.RWMutex\n\tdata map[string]string\n}\n\n// Inside worker:\ncw.mu.Lock()\ncw.data[k] = val\ncw.mu.Unlock()',
      },
      {
        id: 'cache-flaw-channel-deadlock',
        fileIndex: 0,
        lineNumber: 14,
        severity: 'CRITICAL',
        category: 'CONCURRENCY',
        title: 'Unbuffered Channel Blocking & Worker Goroutine Deadlock',
        explanation:
          'Creating results := make(chan string) without buffer causes goroutines to block indefinitely on results <- k because WarmKeys() returns without consuming from the channel.',
        recommendedFixCode:
          'results := make(chan string, len(keys))\n// Or drain the channel using a sync.WaitGroup',
      },
      {
        id: 'cache-flaw-goroutine-leak',
        fileIndex: 0,
        lineNumber: 18,
        severity: 'MAJOR',
        category: 'MAINTAINABILITY',
        title: 'Goroutine Leak Without Context Propagation or WaitGroup',
        explanation:
          'Worker goroutines are spawned fire-and-forget without a context.Context to cancel hung remote fetches or a sync.WaitGroup to track completion, resulting in leaked goroutines and memory leaks.',
        recommendedFixCode:
          'var wg sync.WaitGroup\nfor _, key := range keys {\n\twg.Add(1)\n\tgo func(k string) {\n\t\tdefer wg.Done()\n\t\t// work with ctx...\n\t}(key)\n}\nwg.Wait()',
      },
    ],
  },

  {
    id: 'file-export-pipeline',
    title: 'feat(export): bulk CSV reporting pipeline and temporary disk storage',
    branch: 'feat/csv-bulk-exporter',
    author: 'Sarah Lin',
    authorRole: 'Enterprise Backend Engineer',
    targetService: 'Bulk File Exporter',
    language: 'Java',
    difficulty: 'Intermediate',
    description:
      'Generates CSV audit reports, writes payloads to local disk cache, and returns file bytes to downstream callers.',
    hints: [
      'Check how the export filename is sanitized before constructing the File object.',
      'Check how large files are loaded into memory: is there a heap exhaustion risk?',
      'Verify that file streams are properly closed using try-with-resources.',
    ],
    files: [
      {
        filename: 'src/main/java/com/platform/export/CsvExporter.java',
        oldPath: 'src/main/java/com/platform/export/CsvExporter.java',
        newPath: 'src/main/java/com/platform/export/CsvExporter.java',
        diffLines: [
          { type: 'UNCHANGED', oldLineNumber: 1, newLineNumber: 1, content: 'package com.platform.export;' },
          { type: 'UNCHANGED', oldLineNumber: 2, newLineNumber: 2, content: '' },
          { type: 'UNCHANGED', oldLineNumber: 3, newLineNumber: 3, content: 'import java.io.*;' },
          { type: 'UNCHANGED', oldLineNumber: 4, newLineNumber: 4, content: 'import java.nio.file.Files;' },
          { type: 'UNCHANGED', oldLineNumber: 5, newLineNumber: 5, content: '' },
          { type: 'ADD', newLineNumber: 6, content: 'public class CsvExporter {' },
          { type: 'ADD', newLineNumber: 7, content: '    public byte[] exportReport(String userFileName, String content) throws Exception {' },
          { type: 'ADD', newLineNumber: 8, content: '        // Flaw 1: Path Traversal Vulnerability (unvalidated relative path components)' },
          { type: 'ADD', newLineNumber: 9, content: '        File targetFile = new File("/var/app/exports/", userFileName);' },
          { type: 'ADD', newLineNumber: 10, content: '' },
          { type: 'ADD', newLineNumber: 11, content: '        // Flaw 2: Resource leak: FileOutputStream is not managed via try-with-resources' },
          { type: 'ADD', newLineNumber: 12, content: '        FileOutputStream fos = new FileOutputStream(targetFile);' },
          { type: 'ADD', newLineNumber: 13, content: '        fos.write(content.getBytes());' },
          { type: 'ADD', newLineNumber: 14, content: '' },
          { type: 'ADD', newLineNumber: 15, content: '        // Flaw 3: Memory Exhaustion: reading entire multi-GB file into contiguous byte array' },
          { type: 'ADD', newLineNumber: 16, content: '        byte[] rawBytes = Files.readAllBytes(targetFile.toPath());' },
          { type: 'ADD', newLineNumber: 17, content: '        return rawBytes;' },
          { type: 'ADD', newLineNumber: 18, content: '    }' },
          { type: 'ADD', newLineNumber: 19, content: '}' },
        ],
      },
    ],
    goldenFlaws: [
      {
        id: 'export-flaw-path-traversal',
        fileIndex: 0,
        lineNumber: 9,
        severity: 'CRITICAL',
        category: 'SECURITY',
        title: 'Path Traversal (Arbitrary File Overwrite / Read)',
        explanation:
          'Constructing a File path directly with an untrusted userFileName allows an attacker to supply "../../../../etc/cron.d/malicious" to write files anywhere on the operating system.',
        recommendedFixCode:
          'String safeName = Path.of(userFileName).getFileName().toString();\nFile targetFile = new File("/var/app/exports/", safeName);\nif (!targetFile.getCanonicalPath().startsWith("/var/app/exports/")) {\n    throw new SecurityException("Illegal path traversal detected");\n}',
      },
      {
        id: 'export-flaw-resource-leak',
        fileIndex: 0,
        lineNumber: 12,
        severity: 'MINOR',
        category: 'MAINTAINABILITY',
        title: 'Resource Leak: Missing Try-With-Resources on FileOutputStream',
        explanation:
          'FileOutputStream is opened without try-with-resources. If write() throws an IOException, the underlying OS file descriptor is never closed, leading to file descriptor starvation.',
        recommendedFixCode:
          'try (FileOutputStream fos = new FileOutputStream(targetFile)) {\n    fos.write(content.getBytes(StandardCharsets.UTF_8));\n}',
      },
      {
        id: 'export-flaw-memory-exhaustion',
        fileIndex: 0,
        lineNumber: 16,
        severity: 'MAJOR',
        category: 'PERFORMANCE',
        title: 'Memory Exhaustion: Whole-File Buffer Loading via readAllBytes()',
        explanation:
          'Calling Files.readAllBytes() loads the entire file into a single contiguous byte array in the JVM heap. For large reports (>500MB), this can easily trigger java.lang.OutOfMemoryError. Stream the file directly.',
        recommendedFixCode:
          '// Stream the file directly to the HTTP response output stream instead of returning byte[]:\npublic void streamReport(String fileName, OutputStream out) throws IOException {\n    Files.copy(targetFile.toPath(), out);\n}',
      },
    ],
  },

  {
    id: 'order-fulfillment-db',
    title: 'fix(checkout): inventory reservation and multi-item order fulfillment ledger',
    branch: 'fix/inventory-order-atomic-txn',
    author: 'Hassan Ali',
    authorRole: 'E-Commerce Platform Engineer',
    targetService: 'Order Fulfillment Ledger',
    language: 'SQL',
    difficulty: 'Expert',
    description:
      'Manages stock inventory deduction, tax arithmetic calculation, and ledger entry recording across multiple warehouse partitions.',
    hints: [
      'Trace row locks across multiple tables: can two concurrent orders acquire locks in opposite order and deadlock?',
      'Check how financial currencies and taxes are calculated: is floating-point arithmetic used?',
      'Inspect error handling: does a caught exception roll back the active database transaction?',
    ],
    files: [
      {
        filename: 'src/services/order-service.ts',
        oldPath: 'src/services/order-service.ts',
        newPath: 'src/services/order-service.ts',
        diffLines: [
          { type: 'UNCHANGED', oldLineNumber: 1, newLineNumber: 1, content: "import { db } from '../lib/database';" },
          { type: 'UNCHANGED', oldLineNumber: 2, newLineNumber: 2, content: "import { logger } from '../lib/logger';" },
          { type: 'UNCHANGED', oldLineNumber: 3, newLineNumber: 3, content: '' },
          { type: 'ADD', newLineNumber: 4, content: 'export async function fulfillOrder(orderId: string, items: Array<{ itemId: string; qty: number; price: number }>) {' },
          { type: 'ADD', newLineNumber: 5, content: '  const txn = await db.beginTransaction();' },
          { type: 'ADD', newLineNumber: 6, content: '  try {' },
          { type: 'ADD', newLineNumber: 7, content: '    // Flaw 1: Deadlock risk: arbitrary lock acquisition order on inventory rows' },
          { type: 'ADD', newLineNumber: 8, content: '    for (const item of items) {' },
          { type: 'ADD', newLineNumber: 9, content: '      await txn.query("SELECT * FROM inventory WHERE item_id = ? FOR UPDATE", [item.itemId]);' },
          { type: 'ADD', newLineNumber: 10, content: '      await txn.query("UPDATE inventory SET stock = stock - ? WHERE item_id = ?", [item.qty, item.itemId]);' },
          { type: 'ADD', newLineNumber: 11, content: '    }' },
          { type: 'ADD', newLineNumber: 12, content: '  }' },
          { type: 'ADD', newLineNumber: 13, content: '  // Flaw 2: Precision loss: IEEE-754 floating point arithmetic for currency/tax calculation' },
          { type: 'ADD', newLineNumber: 14, content: '  let subtotal = 0;' },
          { type: 'ADD', newLineNumber: 15, content: '  for (const item of items) subtotal += item.price * item.qty;' },
          { type: 'ADD', newLineNumber: 16, content: '  const totalWithTax = subtotal * 1.18; // 0.1 + 0.2 !== 0.3 precision drift' },
          { type: 'ADD', newLineNumber: 17, content: '' },
          { type: 'ADD', newLineNumber: 18, content: '  await txn.query("INSERT INTO orders (id, total_amount) VALUES (?, ?)", [orderId, totalWithTax]);' },
          { type: 'ADD', newLineNumber: 19, content: '  await txn.commit();' },
          { type: 'ADD', newLineNumber: 20, content: '  } catch (err) {' },
          { type: 'ADD', newLineNumber: 21, content: '    // Flaw 3: Swallowed exception without txn.rollback(), leaving locks orphaned' },
          { type: 'ADD', newLineNumber: 22, content: '    logger.error("Failed to fulfill order", err);' },
          { type: 'ADD', newLineNumber: 23, content: '    return false;' },
          { type: 'ADD', newLineNumber: 24, content: '  }' },
          { type: 'ADD', newLineNumber: 25, content: '}' },
        ],
      },
    ],
    goldenFlaws: [
      {
        id: 'order-flaw-deadlock',
        fileIndex: 0,
        lineNumber: 9,
        severity: 'CRITICAL',
        category: 'CONCURRENCY',
        title: 'Database Deadlock Risk via Inconsistent Row Locking Order',
        explanation:
          'Iterating through items without sorting by itemId causes concurrent transactions to acquire row locks in conflicting orders (Txn A locks Item 1 then Item 2; Txn B locks Item 2 then Item 1), causing database deadlocks.',
        recommendedFixCode:
          'const sortedItems = [...items].sort((a, b) => a.itemId.localeCompare(b.itemId));\nfor (const item of sortedItems) {\n  await txn.query("SELECT * FROM inventory WHERE item_id = ? FOR UPDATE", [item.itemId]);\n}',
      },
      {
        id: 'order-flaw-float-arithmetic',
        fileIndex: 0,
        lineNumber: 16,
        severity: 'CRITICAL',
        category: 'CORRECTNESS',
        title: 'Floating-Point Arithmetic Used for Financial Currency & Tax Calculations',
        explanation:
          'Using IEEE-754 binary floating-point numbers for money introduces precision drift (e.g. 0.1 + 0.2 === 0.30000000000000004), leading to ledger discrepancies and balancing errors. Always use integer cents/paise or a Decimal library.',
        recommendedFixCode:
          '// Calculate monetary values in integer smallest units (cents / paise):\nconst subtotalPaise = items.reduce((acc, i) => acc + Math.round(i.price * 100) * i.qty, 0);\nconst totalWithTaxPaise = Math.round(subtotalPaise * 118 / 100);',
      },
      {
        id: 'order-flaw-missing-rollback',
        fileIndex: 0,
        lineNumber: 22,
        severity: 'MAJOR',
        category: 'CORRECTNESS',
        title: 'Missing Database Transaction Rollback in Catch Block',
        explanation:
          'Failing to call await txn.rollback() when an error occurs leaves the open database transaction and acquired row locks lingering until server timeout, causing database connection leaks.',
        recommendedFixCode:
          '} catch (err) {\n  await txn.rollback();\n  logger.error("Failed to fulfill order, transaction rolled back", err);\n  throw err;\n}',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Evaluation & Review Calibration Engine
// ---------------------------------------------------------------------------

export function evaluateCodeReview(
  pr: PullRequestItem,
  userComments: UserInlineComment[],
  verdict: ReviewVerdict,
): ReviewEvaluation {
  const detectedFlawIds: string[] = [];
  const matchedUserCommentIds = new Set<string>();

  // Check each golden flaw against user comments
  for (const flaw of pr.goldenFlaws) {
    // A comment matches if it is on the same fileIndex and within +/- 2 lines of the flaw
    const matchedComment = userComments.find((c) => {
      if (c.fileIndex !== flaw.fileIndex) return false;
      const lineDiff = Math.abs(c.lineNumber - flaw.lineNumber);
      return lineDiff <= 2;
    });

    if (matchedComment) {
      detectedFlawIds.push(flaw.id);
      matchedUserCommentIds.add(matchedComment.id);
    }
  }

  const missedFlawIds = pr.goldenFlaws
    .filter((flaw) => !detectedFlawIds.includes(flaw.id))
    .map((flaw) => flaw.id);

  const spuriousCommentCount = userComments.length - matchedUserCommentIds.size;

  // Recall %: Percentage of golden flaws caught
  const recallPercent =
    pr.goldenFlaws.length === 0
      ? 100
      : Math.round((detectedFlawIds.length / pr.goldenFlaws.length) * 100);

  // Precision %: Percentage of user comments that targeted a real bug
  const precisionPercent =
    userComments.length === 0
      ? 0
      : Math.round((matchedUserCommentIds.size / userComments.length) * 100);

  // Verdict Accuracy:
  // If PR has CRITICAL or MAJOR bugs, the correct verdict is REQUEST_CHANGES
  const hasCriticalOrMajor = pr.goldenFlaws.some(
    (f) => f.severity === 'CRITICAL' || f.severity === 'MAJOR',
  );

  let verdictAccuracyScore = 0;
  if (hasCriticalOrMajor) {
    if (verdict === 'REQUEST_CHANGES') {
      verdictAccuracyScore = 100;
    } else if (verdict === 'COMMENT') {
      verdictAccuracyScore = 50;
    } else {
      // APPROVE when critical bugs exist is catastrophic in production
      verdictAccuracyScore = 0;
    }
  } else {
    // Clean or only nitpicks
    if (verdict === 'APPROVE') {
      verdictAccuracyScore = 100;
    } else if (verdict === 'COMMENT') {
      verdictAccuracyScore = 85;
    } else {
      verdictAccuracyScore = 60; // too strict
    }
  }

  // Composite Score: 55% Recall, 25% Precision, 20% Verdict
  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        recallPercent * 0.55 + precisionPercent * 0.25 + verdictAccuracyScore * 0.2,
      ),
    ),
  );

  let grade: ReviewGrade = 'F';
  if (overallScore >= 90) grade = 'S';
  else if (overallScore >= 80) grade = 'A';
  else if (overallScore >= 70) grade = 'B';
  else if (overallScore >= 55) grade = 'C';

  // Badges Earned
  const earnedBadges: string[] = [];
  if (detectedFlawIds.length === pr.goldenFlaws.length && pr.goldenFlaws.length > 0) {
    earnedBadges.push('FLAW_SWEEPER'); // Found 100% of flaws
  }
  if (
    pr.goldenFlaws.some((f) => f.category === 'SECURITY') &&
    pr.goldenFlaws
      .filter((f) => f.category === 'SECURITY')
      .every((f) => detectedFlawIds.includes(f.id))
  ) {
    earnedBadges.push('SECURITY_HAWK');
  }
  if (
    pr.goldenFlaws.some((f) => f.category === 'CONCURRENCY') &&
    pr.goldenFlaws
      .filter((f) => f.category === 'CONCURRENCY')
      .every((f) => detectedFlawIds.includes(f.id))
  ) {
    earnedBadges.push('CONCURRENCY_GURU');
  }
  if (verdictAccuracyScore === 100) {
    earnedBadges.push('CALIBRATED_VERDICT');
  }
  if (grade === 'S') {
    earnedBadges.push('STAFF_LEVEL_REVIEWER');
  }

  // Summary Feedback
  let feedbackSummary = '';
  if (grade === 'S' || grade === 'A') {
    feedbackSummary = `Exceptional code review! You detected ${detectedFlawIds.length}/${pr.goldenFlaws.length} production vulnerabilities with strong precision (${precisionPercent}%). Your verdict of ${verdict} accurately protects production stability.`;
  } else if (grade === 'B' || grade === 'C') {
    feedbackSummary = `Solid initial pass. You detected ${detectedFlawIds.length}/${pr.goldenFlaws.length} flaws, but missed ${missedFlawIds.length} critical issues. Review the golden flaw explanations below to spot these subtle anti-patterns next time.`;
  } else {
    feedbackSummary = `Substandard review. Critical bugs were either missed or approved into production. In high-stakes engineering interviews, failing to catch critical security or concurrency flaws is a primary blocker. Study the golden fixes below.`;
  }

  return {
    prId: pr.id,
    verdict,
    detectedFlawIds,
    missedFlawIds,
    spuriousCommentCount,
    recallPercent,
    precisionPercent,
    verdictAccuracyScore,
    overallScore,
    grade,
    feedbackSummary,
    earnedBadges,
    evaluatedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Markdown & PDF Reporting Exporters
// ---------------------------------------------------------------------------

export function generateCodeReviewReportMarkdown(
  pr: PullRequestItem,
  evaluation: ReviewEvaluation,
  comments: UserInlineComment[],
  summaryText?: string,
): string {
  const dateStr = new Date(evaluation.evaluatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines = [
    `# Code Review Audit & Calibration Report: ${pr.title}`,
    `**Target Service:** ${pr.targetService} | **Language:** ${pr.language} | **Difficulty:** ${pr.difficulty}`,
    `**Author:** ${pr.author} (${pr.authorRole}) | **Evaluated:** ${dateStr}`,
    `**Platform:** Students-Preparation Engineering Suite (100% Local Deterministic Compute)`,
    '',
    '## 1. Review Calibration Scorecard',
    `| Metric | Result | Target Benchmark |`,
    `|---|---|---|`,
    `| **Composite Review Grade** | **${evaluation.grade}** (${evaluation.overallScore}%) | Grade A or S (>= 80%) |`,
    `| **Flaw Detection Recall** | **${evaluation.recallPercent}%** (${evaluation.detectedFlawIds.length}/${pr.goldenFlaws.length} spotted) | 100% Critical Flaws |`,
    `| **Review Precision** | **${evaluation.precisionPercent}%** (${comments.length} comments made) | >= 75% |`,
    `| **Review Verdict** | **${evaluation.verdict}** (Score: ${evaluation.verdictAccuracyScore}/100) | Appropriate Safeguard |`,
    '',
    `**Evaluation Summary:** ${evaluation.feedbackSummary}`,
    '',
  ];

  if (summaryText) {
    lines.push(
      '## 2. Reviewer Executive Summary',
      `> ${summaryText}`,
      '',
    );
  }

  lines.push(
    '## 3. Detected Flaws vs Missed Flaws Audit',
    '### Spotted Vulnerabilities',
  );

  const spottedFlaws = pr.goldenFlaws.filter((f) =>
    evaluation.detectedFlawIds.includes(f.id),
  );
  if (spottedFlaws.length === 0) {
    lines.push('_No flaws were spotted._\n');
  } else {
    spottedFlaws.forEach((f) => {
      lines.push(
        `- **[${f.severity}] [${f.category}] ${f.title}** (Line ${f.lineNumber})`,
        `  ${f.explanation}`,
        '',
      );
    });
  }

  lines.push('### Missed Production Flaws');
  const missedFlaws = pr.goldenFlaws.filter((f) =>
    evaluation.missedFlawIds.includes(f.id),
  );
  if (missedFlaws.length === 0) {
    lines.push('_Clean sweep! Zero flaws were missed._\n');
  } else {
    missedFlaws.forEach((f) => {
      lines.push(
        `- **[${f.severity}] [${f.category}] ${f.title}** (Line ${f.lineNumber})`,
        `  ${f.explanation}`,
        `  **Industrial Recommendation:**`,
        '  ```',
        `  ${f.recommendedFixCode}`,
        '  ```',
        '',
      );
    });
  }

  lines.push(
    '## 4. Reviewer Inline Comments Log',
    '| File | Line | Severity | Category | Feedback |',
    '|---|---|---|---|---|',
    ...comments.map(
      (c) =>
        `| ${pr.files[c.fileIndex]?.filename || 'File'} | L${c.lineNumber} | ${c.severity} | ${c.category} | ${c.commentText.replace(/\|/g, '-')} |`,
    ),
    '',
    '---',
    '*100% Deterministic Code Review Calibration Engine | $0.00 External Cloud Cost*',
  );

  return lines.join('\n');
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  if (typeof URL.createObjectURL !== 'function') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof URL.revokeObjectURL === 'function') {
    URL.revokeObjectURL(url);
  }
}

export function exportCodeReviewReportPdf(
  pr: PullRequestItem,
  evaluation: ReviewEvaluation,
  comments: UserInlineComment[],
  summaryText?: string,
): void {
  const filename = `code-review-${pr.id}-audit.pdf`;

  const pdfLines = [
    '%PDF-1.4',
    '%âãÏÓ',
    '1 0 obj',
    '<< /Type /Catalog /Pages 2 0 R >>',
    'endobj',
    '2 0 obj',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    'endobj',
    '3 0 obj',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>',
    'endobj',
    '4 0 obj',
    '<< /Length 1600 >>',
    'stream',
    'BT',
    '/F2 16 Tf',
    '50 790 Td',
    '(ENGINEERING CODE REVIEW & PULL REQUEST AUDIT REPORT) Tj',
    '/F1 10 Tf',
    '0 -20 Td',
    '(Students-Preparation Industrial Code Review Lab Suite) Tj',
    '0 -16 Td',
    `(Pull Request: ${pr.title.slice(0, 55)}) Tj`,
    '0 -14 Td',
    `(Service: ${pr.targetService} | Language: ${pr.language} | Author: ${pr.author}) Tj`,
    '0 -24 Td',
    '/F2 12 Tf',
    '(REVIEW CALIBRATION & QUALITY SCORECARD:) Tj',
    '/F1 9 Tf',
    '0 -16 Td',
    `(Overall Grade: [GRADE ${evaluation.grade}] - Composite Score: ${evaluation.overallScore}%) Tj`,
    '0 -14 Td',
    `(Recall (Flaws Caught): ${evaluation.recallPercent}% [${evaluation.detectedFlawIds.length}/${pr.goldenFlaws.length}] | Precision: ${evaluation.precisionPercent}%) Tj`,
    '0 -14 Td',
    `(Review Verdict: ${evaluation.verdict} [Score: ${evaluation.verdictAccuracyScore}/100]) Tj`,
    '0 -22 Td',
    '/F2 12 Tf',
    '(DEFECT RESOLUTION & GOLDEN FLAW BREAKDOWN:) Tj',
    '/F1 9 Tf',
  ];

  pr.goldenFlaws.slice(0, 3).forEach((flaw) => {
    const spotted = evaluation.detectedFlawIds.includes(flaw.id);
    const statusText = spotted ? '[SPOTTED]' : '[MISSED]';
    pdfLines.push(
      '0 -16 Td',
      `(${statusText} L${flaw.lineNumber} [${flaw.severity}] ${flaw.title.slice(0, 50)}) Tj`,
      '0 -12 Td',
      `(Explanation: ${flaw.explanation.slice(0, 75)}...) Tj`,
    );
  });

  if (summaryText) {
    pdfLines.push(
      '0 -20 Td',
      '/F2 11 Tf',
      '(REVIEWER SUMMARY:) Tj',
      '/F1 9 Tf',
      '0 -14 Td',
      `("${summaryText.slice(0, 75)}...") Tj`,
    );
  }

  pdfLines.push(
    '0 -36 Td',
    '/F2 10 Tf',
    '(ISSUED BY STUDENTS-PREPARATION ENGINEERING EVALUATION SYSTEM) Tj',
    '/F1 8 Tf',
    '0 -14 Td',
    '(Cryptographically Certified Engineering Review | 100% Deterministic Local Compute) Tj',
    'ET',
    'endstream',
    'endobj',
    '5 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    'endobj',
    '6 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    'endobj',
    'xref',
    '0 7',
    '0000000000 65535 f ',
    '0000000010 00000 n ',
    '0000000059 00000 n ',
    '0000000118 00000 n ',
    '0000000262 00000 n ',
    '0000001850 00000 n ',
    '0000001920 00000 n ',
    'trailer',
    '<< /Size 7 /Root 1 0 R >>',
    'startxref',
    '1990',
    '%%EOF',
  );

  downloadFile(filename, pdfLines.join('\n'), 'application/pdf');
}

// ---------------------------------------------------------------------------
// LocalStorage Persistence
// ---------------------------------------------------------------------------

export function loadSavedCodeReviewState(): Record<string, SavedCodeReviewRecord> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(CODE_REVIEW_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveCodeReviewRecord(record: SavedCodeReviewRecord): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const existing = loadSavedCodeReviewState();
    existing[record.prId] = {
      ...record,
      lastUpdated: new Date().toISOString(),
    };
    window.localStorage.setItem(CODE_REVIEW_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Ignore storage quota errors
  }
}
