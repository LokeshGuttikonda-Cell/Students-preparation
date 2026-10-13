'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import {
  Bot,
  Brain,
  Search,
  Cpu,
  Play,
  RotateCcw,
  StepForward,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  Terminal,
  Database,
} from 'lucide-react';

export type AiLabMode = 'REACT_AGENT' | 'HYBRID_RAG' | 'VRAM_SERVING' | 'SPECULATIVE_DECODING';

interface RagDocumentCandidate {
  id: string;
  title: string;
  snippet: string;
  denseSim: number; // 0 to 1
  bm25Score: number; // 0 to 25
  crossEncoderScore: number; // 0 to 1
  category: string;
}

const PRESET_TASKS = [
  {
    id: 'task-n-plus-one',
    title: 'Refactor Database Query (Eliminate N+1 Latency Hazard)',
    initialInstruction: 'Analyze repository user fetch logic and refactor nested SQL lookups into a single batched JOIN with indexed foreign keys.',
    steps: [
      {
        thought: 'Identify the source file containing the user query logic using AST search.',
        tool: 'ast_grep',
        args: { pattern: 'function getUserDetails' },
        observation: 'Found `src/services/userService.ts` lines 42-68: Loop executing `SELECT * FROM profiles WHERE user_id = ?` inside map iterator.',
        tokensConsumed: 1250,
      },
      {
        thought: 'Read the full implementation and surrounding database transaction context.',
        tool: 'read_file',
        args: { path: 'src/services/userService.ts', startLine: '40', endLine: '75' },
        observation: 'Confirmed N+1 query vulnerability: 1 parent query followed by N individual round-trips over TCP connection pool.',
        tokensConsumed: 1840,
      },
      {
        thought: 'Generate an atomic unified diff replacing the loop with `SELECT u.*, p.* FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id IN (?)`.',
        tool: 'apply_patch',
        args: { file: 'src/services/userService.ts' },
        observation: 'Unified diff applied cleanly. 1 file changed, 18 insertions(+), 24 deletions(-).',
        tokensConsumed: 2100,
      },
      {
        thought: 'Run the unit and integration test suites in an isolated sandbox container to verify query correctness.',
        tool: 'run_tests',
        args: { suite: 'userService.test.ts' },
        observation: '✓ 14/14 tests passed (Total time: 240ms). Query count reduced from 51 round-trips to 1.',
        tokensConsumed: 1400,
      },
      {
        thought: 'Verification complete. Task objectives satisfied with 0 linter violations and zero database regressions.',
        tool: 'finish_task',
        args: { status: 'RESOLVED' },
        observation: 'Task successfully resolved. Execution trace committed to repository audit log.',
        tokensConsumed: 850,
      },
    ],
  },
  {
    id: 'task-rate-limiter',
    title: 'Fix Concurrency Race Condition in Token Bucket Limiter',
    initialInstruction: 'Resolve non-atomic read-modify-write race condition under concurrent distributed traffic spikes.',
    steps: [
      {
        thought: 'Search for token refill logic in the rate limiting middleware.',
        tool: 'ast_grep',
        args: { pattern: 'class TokenBucketRateLimiter' },
        observation: 'Located `src/middleware/rateLimiter.ts`: Separate `GET tokens` followed by `SET tokens` without atomic CAS or Lua script.',
        tokensConsumed: 1100,
      },
      {
        thought: 'Inspect Redis interaction commands and check for Lua script execution support.',
        tool: 'read_file',
        args: { path: 'src/middleware/rateLimiter.ts', startLine: '15', endLine: '50' },
        observation: 'Identified window where concurrent requests read identical token counts prior to decrement.',
        tokensConsumed: 1650,
      },
      {
        thought: 'Refactor token consumption to execute as a single atomic EVALSHA Redis script with token refill math calculated on the server.',
        tool: 'apply_patch',
        args: { file: 'src/middleware/rateLimiter.ts' },
        observation: 'Patch applied: Injected atomic Lua evaluation script with TTL expiry refresh.',
        tokensConsumed: 2300,
      },
      {
        thought: 'Run high-concurrency stress test with 50 parallel asynchronous workers.',
        tool: 'run_tests',
        args: { suite: 'rateLimiter.stress.test.ts' },
        observation: '✓ 50/50 concurrent threads correctly bounded to capacity (Zero race conditions or token leaks).',
        tokensConsumed: 1550,
      },
      {
        thought: 'Rate limiter verified under load. Terminal task completion.',
        tool: 'finish_task',
        args: { status: 'RESOLVED' },
        observation: 'Rate limiter patch hardened against race conditions.',
        tokensConsumed: 700,
      },
    ],
  },
];

const MOCK_DOCS_CORPUS: RagDocumentCandidate[] = [
  {
    id: 'doc-1',
    title: 'HNSW Vector Graph Indexing: M and efConstruction Hyperparameters',
    snippet: 'Hierarchical Navigable Small World graphs construct multi-layer proximity graphs. Parameter M limits bidirectional links, while efConstruction governs neighbor exploration during index build.',
    denseSim: 0.94,
    bm25Score: 14.8,
    crossEncoderScore: 0.96,
    category: 'Vector Search',
  },
  {
    id: 'doc-2',
    title: 'PostgreSQL GIN and GiST Index Internal Structures',
    snippet: 'GIN indexes utilize inverted lists optimal for array containment and full-text search, while GiST provides balanced tree structures for geometric ranges.',
    denseSim: 0.62,
    bm25Score: 18.2,
    crossEncoderScore: 0.45,
    category: 'Relational DB',
  },
  {
    id: 'doc-3',
    title: 'Reciprocal Rank Fusion (RRF) and Cross-Encoder Reranking Architecture',
    snippet: 'RRF combines ordinal rankings from dense and sparse retrievers via formula 1 / (60 + rank), avoiding score calibration errors prior to cross-encoder evaluation.',
    denseSim: 0.89,
    bm25Score: 16.5,
    crossEncoderScore: 0.93,
    category: 'Retrieval Systems',
  },
  {
    id: 'doc-4',
    title: 'PagedAttention: Virtual Memory Paging for KV Caches in High-Throughput LLM Serving',
    snippet: 'Allocates non-contiguous physical memory blocks to eliminate internal fragmentation, allowing continuous batching and 2-4x higher token generation concurrency.',
    denseSim: 0.78,
    bm25Score: 8.4,
    crossEncoderScore: 0.82,
    category: 'LLMOps',
  },
  {
    id: 'doc-5',
    title: 'Full-Text Search Lexical Inverted Index: TF-IDF and BM25 Formula',
    snippet: 'BM25 ranks documents based on term frequency and inverse document frequency with document length normalization constants k1 and b.',
    denseSim: 0.55,
    bm25Score: 22.1,
    crossEncoderScore: 0.51,
    category: 'Information Retrieval',
  },
];

export function AiAgentLabSandbox() {
  const [activeMode, setActiveMode] = useState<AiLabMode>('REACT_AGENT');

  // --- Module 1: ReAct Agent Loop State ---
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSimulatingCycleHazard, setIsSimulatingCycleHazard] = useState(false);
  const [cycleDetected, setCycleDetected] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // --- Module 2: Hybrid RAG & RRF State ---
  const [searchQuery, setSearchQuery] = useState('HNSW vector index and Reciprocal Rank Fusion');
  const [alphaWeight, setAlphaWeight] = useState(0.5); // 0 = BM25, 1 = Dense
  const [rrfKConstant, setRrfKConstant] = useState(60);
  const [isRerankerEnabled, setIsRerankerEnabled] = useState(true);

  // --- Module 3: VRAM Serving & Quantization State ---
  const [modelParamBillion, setModelParamBillion] = useState(70);
  const [quantizationBits, setQuantizationBits] = useState(4); // 16, 8, 4
  const [contextTokens, setContextTokens] = useState(32768);
  const [batchConcurrency, setBatchConcurrency] = useState(16);

  // --- Module 4: Speculative Decoding & PagedAttention State ---
  const [targetModelBillion, setTargetModelBillion] = useState(70);
  const [draftModelBillion, setDraftModelBillion] = useState(1);
  const [lookaheadK, setLookaheadK] = useState(4);
  const [acceptanceBeta, setAcceptanceBeta] = useState(0.75);
  const [targetTokensToGen, setTargetTokensToGen] = useState(100);

  const activeTask = PRESET_TASKS[selectedTaskIndex];

  // ReAct Step Progression
  const currentStep = activeTask.steps[Math.min(currentStepIndex, activeTask.steps.length - 1)];
  const isFinished = currentStepIndex >= activeTask.steps.length - 1;

  const totalTokensUsed = useMemo(() => {
    let sum = 0;
    for (let i = 0; i <= currentStepIndex; i++) {
      if (activeTask.steps[i]) {
        sum += activeTask.steps[i].tokensConsumed;
      }
    }
    return sum;
  }, [activeTask, currentStepIndex]);

  const handleStepForward = useCallback(() => {
    if (isSimulatingCycleHazard) {
      setCycleDetected(true);
      return;
    }
    if (currentStepIndex < activeTask.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [isSimulatingCycleHazard, currentStepIndex, activeTask.steps.length]);

  const handleResetAgent = () => {
    setCurrentStepIndex(0);
    setCycleDetected(false);
    setIsAutoPlaying(false);
    setIsSimulatingCycleHazard(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying && !isFinished && !cycleDetected) {
      timer = setTimeout(() => {
        handleStepForward();
      }, 1200);
    } else if (isFinished || cycleDetected) {
      setIsAutoPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, isFinished, cycleDetected, handleStepForward]);

  // Hybrid RAG Calculations
  const scoredDocuments = useMemo(() => {
    // 1. Sort by dense similarity for dense rank
    const sortedByDense = [...MOCK_DOCS_CORPUS].sort((a, b) => b.denseSim - a.denseSim);
    const denseRanks = new Map<string, number>();
    sortedByDense.forEach((d, idx) => denseRanks.set(d.id, idx + 1));

    // 2. Sort by BM25 score for sparse rank
    const sortedByBM25 = [...MOCK_DOCS_CORPUS].sort((a, b) => b.bm25Score - a.bm25Score);
    const bm25Ranks = new Map<string, number>();
    sortedByBM25.forEach((d, idx) => bm25Ranks.set(d.id, idx + 1));

    // 3. Calculate RRF and Weighted Hybrid Scores
    return MOCK_DOCS_CORPUS.map((doc) => {
      const denseRank = denseRanks.get(doc.id) || 1;
      const bm25Rank = bm25Ranks.get(doc.id) || 1;

      // RRF: 1 / (k + rank_dense) + 1 / (k + rank_bm25)
      const rrfScore = (1 / (rrfKConstant + denseRank)) + (1 / (rrfKConstant + bm25Rank));

      // Weighted Min-Max Score
      const normalizedBm25 = doc.bm25Score / 25;
      const hybridLinearScore = (alphaWeight * doc.denseSim) + ((1 - alphaWeight) * normalizedBm25);

      // Final Rank Score (use Cross-Encoder if enabled, else RRF)
      const finalScore = isRerankerEnabled ? doc.crossEncoderScore : rrfScore * 100;

      return {
        ...doc,
        denseRank,
        bm25Rank,
        rrfScore,
        hybridLinearScore,
        finalScore,
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }, [alphaWeight, rrfKConstant, isRerankerEnabled]);

  // VRAM Serving Calculations
  const vramBreakdown = useMemo(() => {
    // Model Weights (GB): Params (Billion) * (bits / 8)
    const weightsGb = modelParamBillion * (quantizationBits / 8);

    // KV Cache (GB):
    // Standard LLaMA-3 architecture: 32 or 80 layers, 8 KV heads (GQA), head_dim 128
    // Bytes per token = 2 (Key + Value) * layers (e.g. 32 for 7B/14B, 80 for 70B) * num_kv_heads (8) * head_dim (128) * 2 bytes (FP16)
    const layers = modelParamBillion >= 70 ? 80 : 32;
    const kvHeads = 8;
    const headDim = 128;
    const bytesPerToken = 2 * layers * kvHeads * headDim * 2; // FP16 KV cache

    const totalKvBytes = bytesPerToken * contextTokens * batchConcurrency;
    const kvCacheGb = totalKvBytes / (1024 * 1024 * 1024);

    // Activations overhead (FlashAttention buffers) ~ 20% of weights
    const activationsGb = Math.max(2.5, weightsGb * 0.15);

    const totalVramGb = weightsGb + kvCacheGb + activationsGb;

    // Hardware Sizing Recommendation
    let hardwareRec = '1x NVIDIA RTX 4090 (24 GB)';
    if (totalVramGb > 160) {
      hardwareRec = '4x NVIDIA H100 (80 GB SXM5) [TP=4]';
    } else if (totalVramGb > 80) {
      hardwareRec = '2x NVIDIA H100 (80 GB SXM5) [TP=2]';
    } else if (totalVramGb > 48) {
      hardwareRec = '1x NVIDIA H100 / A100 (80 GB SXM5)';
    } else if (totalVramGb > 24) {
      hardwareRec = '2x NVIDIA RTX 4090 (24 GB) or 1x A6000 (48 GB)';
    }

    return {
      weightsGb,
      kvCacheGb,
      activationsGb,
      totalVramGb,
      hardwareRec,
    };
  }, [modelParamBillion, quantizationBits, contextTokens, batchConcurrency]);

  // Speculative Decoding Calculations
  const specMetrics = useMemo(() => {
    const targetLatencyMap: Record<number, number> = { 8: 6.8, 14: 11.5, 32: 21.0, 70: 42.5 };
    const draftLatencyMap: Record<number, number> = { 1: 1.8, 2: 3.1, 3: 4.4 };

    const tTarget = targetLatencyMap[targetModelBillion] || 42.5;
    const tDraft = draftLatencyMap[draftModelBillion] || 1.8;

    const beta = acceptanceBeta;
    const k = lookaheadK;
    const expectedAccepted = beta === 1.0 ? k + 1 : (1 - Math.pow(beta, k + 1)) / (1 - beta);

    const tSpecStep = k * tDraft + tTarget;
    const tBaseStep = expectedAccepted * tTarget;

    const speedupFactor = tBaseStep / tSpecStep;
    const totalStepsNeeded = Math.ceil(targetTokensToGen / expectedAccepted);
    const specTotalTimeMs = totalStepsNeeded * tSpecStep;
    const baseTotalTimeMs = targetTokensToGen * tTarget;
    const timeSavedMs = Math.max(0, baseTotalTimeMs - specTotalTimeMs);
    const targetPassReductionPct = ((1 - (totalStepsNeeded / targetTokensToGen)) * 100);

    return {
      tTarget,
      tDraft,
      expectedAccepted,
      speedupFactor,
      totalStepsNeeded,
      specTotalTimeMs,
      baseTotalTimeMs,
      timeSavedMs,
      targetPassReductionPct,
    };
  }, [targetModelBillion, draftModelBillion, lookaheadK, acceptanceBeta, targetTokensToGen]);

  return (
    <div className="space-y-6 bg-canvas text-text rounded-xl border border-border p-6 shadow-sm">
      {/* Header & Subtitle */}
      <div className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-primary-50 text-primary-700 border border-primary-200">
              <Bot className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-primary-950">
              AI Agent &amp; LLM Systems Engineering Laboratory
            </h2>
          </div>
          <p className="text-sm text-text-muted mt-1 max-w-3xl">
            Interactive experimentation studio for autonomous ReAct execution loops, hybrid RAG retrieval fusion, GPU VRAM serving quantization, and speculative decoding acceleration.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-surface-muted p-1 rounded-lg border border-border self-start">
          <button
            onClick={() => setActiveMode('REACT_AGENT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeMode === 'REACT_AGENT'
                ? 'bg-surface text-primary-900 shadow-sm border border-border font-extrabold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>1. ReAct Agent Loop</span>
          </button>
          <button
            onClick={() => setActiveMode('HYBRID_RAG')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeMode === 'HYBRID_RAG'
                ? 'bg-surface text-primary-900 shadow-sm border border-border font-extrabold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>2. Hybrid RAG &amp; RRF</span>
          </button>
          <button
            onClick={() => setActiveMode('VRAM_SERVING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeMode === 'VRAM_SERVING'
                ? 'bg-surface text-primary-900 shadow-sm border border-border font-extrabold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>3. VRAM &amp; Quantization</span>
          </button>
          <button
            onClick={() => setActiveMode('SPECULATIVE_DECODING')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeMode === 'SPECULATIVE_DECODING'
                ? 'bg-surface text-primary-900 shadow-sm border border-border font-extrabold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>4. Speculative Decoding &amp; PagedAttention</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: REACT AUTONOMOUS AGENT LOOP STUDIO                   */}
      {/* ============================================================ */}
      {activeMode === 'REACT_AGENT' && (
        <div className="space-y-6">
          {/* Top Controls Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-surface p-4 rounded-lg border border-border space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Engineering Task Objective
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_TASKS.map((task, idx) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskIndex(idx);
                      handleResetAgent();
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border text-left transition-all ${
                      selectedTaskIndex === idx
                        ? 'bg-primary-900 text-white border-primary-900 shadow-sm'
                        : 'bg-surface-muted text-text-muted border-border hover:bg-surface hover:text-text'
                    }`}
                  >
                    {task.title}
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-muted bg-surface-muted p-2 rounded border border-border font-mono">
                {activeTask.initialInstruction}
              </p>
            </div>

            {/* Token Budget & Prefix Cache Meter */}
            <div className="bg-surface p-4 rounded-lg border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="text-text-muted uppercase">Context Token Usage</span>
                  <span className="font-mono text-primary-900">{totalTokensUsed.toLocaleString()} / 128,000</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden border border-border">
                  <div
                    className="bg-primary-600 h-2 transition-all duration-300"
                    style={{ width: `${Math.min(100, (totalTokensUsed / 128000) * 100 * 8)}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted">Prefix Cache Locality:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Sparkles className="w-3 h-3" />
                  <span>92.4% KV Hit (Sub-Second TTFT)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Agent Step Flow */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Step Timeline Sidebar */}
            <div className="bg-surface p-4 rounded-lg border border-border space-y-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">
                Execution Steps ({currentStepIndex + 1}/{activeTask.steps.length})
              </span>
              {activeTask.steps.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                const isPassed = idx < currentStepIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`p-2.5 rounded-md border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-primary-50 border-primary-300 text-primary-950 font-bold shadow-sm'
                        : isPassed
                        ? 'bg-surface text-text-muted border-border hover:bg-surface-muted'
                        : 'opacity-40 border-dashed border-border'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                      isActive ? 'bg-primary-900 text-white' : isPassed ? 'bg-emerald-600 text-white' : 'bg-surface-muted border'
                    }`}>
                      {isPassed ? '✓' : idx + 1}
                    </span>
                    <span className="truncate">{step.tool}</span>
                  </div>
                );
              })}
            </div>

            {/* Main Step Detail Inspector */}
            <div className="lg:col-span-3 bg-surface p-5 rounded-lg border border-border space-y-4">
              {/* Status Header */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Phase:</span>
                  <span className="text-xs font-mono font-bold bg-primary-100 text-primary-900 px-2.5 py-0.5 rounded border border-primary-200">
                    Step {currentStepIndex + 1}: {currentStep.tool}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {cycleDetected ? (
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 inline-flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Cycle Detected (Loop Terminated)</span>
                    </span>
                  ) : isFinished ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Task Completed</span>
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted font-mono">
                      State Hash: 0x{((currentStepIndex + 1) * 314159).toString(16).slice(0, 6)}
                    </span>
                  )}
                </div>
              </div>

              {/* Thought Box */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-primary-900 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-primary-700" />
                  <span>Agent Reasoning &amp; Plan (Thought)</span>
                </span>
                <div className="bg-primary-50/50 p-3 rounded-md border border-primary-100 text-xs text-primary-950 font-medium leading-relaxed">
                  {cycleDetected
                    ? 'CYCLE DETECTED: Agent generated an action identical to Step 1 without progress. Circuit breaker tripped to prevent token exhaustion. Initiating reflex prompt rollback.'
                    : currentStep.thought}
                </div>
              </div>

              {/* Tool Call & Observation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-text-muted" />
                    <span>Tool Invocation (Action)</span>
                  </span>
                  <pre className="bg-canvas p-3 rounded-md border border-border text-[11px] font-mono text-text overflow-x-auto">
                    {JSON.stringify({ tool: currentStep.tool, arguments: currentStep.args }, null, 2)}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Runtime Output (Observation)</span>
                  </span>
                  <div className="bg-surface-muted p-3 rounded-md border border-border text-xs text-text font-mono leading-relaxed h-[115px] overflow-y-auto">
                    {cycleDetected ? 'ERROR: State oscillation hash collision detected. Tool invocation aborted.' : currentStep.observation}
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleStepForward}
                    disabled={isFinished || cycleDetected}
                    className="gap-1.5"
                  >
                    <StepForward className="w-3.5 h-3.5" />
                    <span>Next Step</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    disabled={isFinished || cycleDetected}
                    className="gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isAutoPlaying ? 'Pause' : 'Auto Play'}</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleResetAgent}
                    className="gap-1.5 text-text-muted"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsSimulatingCycleHazard(true);
                      setCycleDetected(true);
                    }}
                    disabled={cycleDetected || isFinished}
                    className="px-2.5 py-1 text-xs font-semibold rounded border border-rose-300 text-rose-800 bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    Inject Oscillation Hazard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: HYBRID RAG & RECIPROCAL RANK FUSION STUDIO           */}
      {/* ============================================================ */}
      {activeMode === 'HYBRID_RAG' && (
        <div className="space-y-6">
          {/* Query & Parameter Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-surface p-4 rounded-lg border border-border space-y-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Information Retrieval Query
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-md border border-border bg-canvas text-text focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                  placeholder="Enter technical query..."
                />
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text-muted">Dense vs BM25 Alpha (α)</span>
                    <span className="font-mono text-primary-900 font-bold">{alphaWeight.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={alphaWeight}
                    onChange={(e) => setAlphaWeight(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>0.0 (Pure BM25)</span>
                    <span>0.5 (Balanced)</span>
                    <span>1.0 (Pure Dense)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text-muted">RRF Constant (k)</span>
                    <span className="font-mono text-primary-900 font-bold">{rrfKConstant}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={rrfKConstant}
                    onChange={(e) => setRrfKConstant(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>k=10 (Aggressive)</span>
                    <span>k=60 (Standard)</span>
                    <span>k=120 (Smooth)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cross-Encoder Toggle Box */}
            <div className="bg-surface p-4 rounded-lg border border-border flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                  Cross-Encoder Reranker
                </span>
                <p className="text-xs text-text-muted leading-relaxed">
                  Evaluates full query-document token interactions via joint cross-attention, eliminating false lexical positives.
                </p>
              </div>

              <button
                onClick={() => setIsRerankerEnabled(!isRerankerEnabled)}
                className={`w-full py-2 px-3 rounded-md text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  isRerankerEnabled
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-surface-muted border-border text-text-muted'
                }`}
              >
                <span>Cross-Encoder: {isRerankerEnabled ? 'ENABLED (High Precision)' : 'DISABLED (Raw RRF)'}</span>
              </button>
            </div>
          </div>

          {/* Results Comparison Table */}
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Candidate Document Scoring &amp; Fusion Rankings
              </span>
              <span className="text-xs text-text-muted font-mono">
                Formula: RRF_Score = 1/(k + Rank_Dense) + 1/(k + Rank_BM25)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-muted text-text-muted uppercase font-bold text-[10px] border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4">Rank</th>
                    <th className="py-2.5 px-4">Document Title</th>
                    <th className="py-2.5 px-4">Dense Cosine</th>
                    <th className="py-2.5 px-4">Sparse BM25</th>
                    <th className="py-2.5 px-4">RRF Score</th>
                    <th className="py-2.5 px-4">Cross-Encoder</th>
                    <th className="py-2.5 px-4">Final Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {scoredDocuments.map((doc, idx) => {
                    const isTopCandidate = idx === 0;
                    return (
                      <tr key={doc.id} className={isTopCandidate ? 'bg-primary-50/40 font-semibold' : 'hover:bg-surface-muted/50'}>
                        <td className="py-3 px-4">
                          <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                            isTopCandidate ? 'bg-primary-900 text-white' : 'bg-surface-muted text-text'
                          }`}>
                            #{idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans max-w-xs">
                          <p className="font-bold text-text truncate">{doc.title}</p>
                          <p className="text-[11px] text-text-muted truncate font-normal">{doc.snippet}</p>
                        </td>
                        <td className="py-3 px-4 text-primary-800">
                          {doc.denseSim.toFixed(2)} (Rank #{doc.denseRank})
                        </td>
                        <td className="py-3 px-4 text-amber-800">
                          {doc.bm25Score.toFixed(1)} (Rank #{doc.bm25Rank})
                        </td>
                        <td className="py-3 px-4 text-text">
                          {(doc.rrfScore * 1000).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">
                          {doc.crossEncoderScore.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          {isTopCandidate ? (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              ✓ INJECT IN PROMPT
                            </span>
                          ) : (
                            <span className="text-[10px] text-text-muted">Context Excluded</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 3: VRAM SERVING & QUANTIZATION PHYSICS CALCULATOR       */}
      {/* ============================================================ */}
      {activeMode === 'VRAM_SERVING' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Input Parameter Sliders */}
            <div className="bg-surface p-5 rounded-lg border border-border space-y-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Serving Engine Parameters
              </span>

              {/* Model Parameter Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-text-muted">Model Size</span>
                  <span className="font-mono text-primary-900 font-bold">{modelParamBillion}B Params</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[7, 14, 32, 70].map((size) => (
                    <button
                      key={size}
                      onClick={() => setModelParamBillion(size)}
                      className={`py-1 text-xs font-bold rounded border ${
                        modelParamBillion === size
                          ? 'bg-primary-900 text-white border-primary-900'
                          : 'bg-surface-muted border-border text-text hover:bg-surface'
                      }`}
                    >
                      {size}B
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantization Mode */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-text-muted">Weight Precision</span>
                  <span className="font-mono text-primary-900 font-bold">
                    {quantizationBits === 16 ? 'FP16 (16-bit)' : quantizationBits === 8 ? 'INT8 (8-bit)' : 'AWQ (4-bit)'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[16, 8, 4].map((bits) => (
                    <button
                      key={bits}
                      onClick={() => setQuantizationBits(bits)}
                      className={`py-1 text-xs font-bold rounded border ${
                        quantizationBits === bits
                          ? 'bg-primary-900 text-white border-primary-900'
                          : 'bg-surface-muted border-border text-text hover:bg-surface'
                      }`}
                    >
                      {bits === 16 ? 'FP16' : bits === 8 ? 'INT8' : '4-bit AWQ'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Length */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-text-muted">Context Window Length</span>
                  <span className="font-mono text-primary-900 font-bold">{(contextTokens / 1024).toFixed(0)}k Tokens</span>
                </div>
                <input
                  type="range"
                  min="4096"
                  max="131072"
                  step="4096"
                  value={contextTokens}
                  onChange={(e) => setContextTokens(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Batch Concurrency */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-text-muted">Concurrent Requests</span>
                  <span className="font-mono text-primary-900 font-bold">{batchConcurrency} Concurrent</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="64"
                  step="1"
                  value={batchConcurrency}
                  onChange={(e) => setBatchConcurrency(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            </div>

            {/* VRAM Breakdown Display & Hardware Sizing */}
            <div className="lg:col-span-3 bg-surface p-5 rounded-lg border border-border space-y-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-3">
                  GPU VRAM Memory Allocation Breakdown
                </span>

                {/* VRAM Visual Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-surface-muted h-6 rounded-lg overflow-hidden flex border border-border">
                    <div
                      className="bg-primary-700 h-full flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ width: `${(vramBreakdown.weightsGb / vramBreakdown.totalVramGb) * 100}%` }}
                    >
                      Weights ({vramBreakdown.weightsGb.toFixed(1)} GB)
                    </div>
                    <div
                      className="bg-amber-600 h-full flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ width: `${(vramBreakdown.kvCacheGb / vramBreakdown.totalVramGb) * 100}%` }}
                    >
                      KV Cache ({vramBreakdown.kvCacheGb.toFixed(1)} GB)
                    </div>
                    <div
                      className="bg-emerald-600 h-full flex items-center justify-center text-[10px] text-white font-bold"
                      style={{ width: `${(vramBreakdown.activationsGb / vramBreakdown.totalVramGb) * 100}%` }}
                    >
                      Act ({vramBreakdown.activationsGb.toFixed(1)} GB)
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs pt-1 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-primary-700 inline-block" />
                      Model Weights: <strong>{vramBreakdown.weightsGb.toFixed(1)} GB</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-600 inline-block" />
                      Paged KV Cache: <strong>{vramBreakdown.kvCacheGb.toFixed(1)} GB</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
                      Activations &amp; Buffers: <strong>{vramBreakdown.activationsGb.toFixed(1)} GB</strong>
                    </span>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
                  <div className="bg-surface-muted p-3.5 rounded-lg border border-border">
                    <span className="text-[11px] text-text-muted block">Total VRAM Required</span>
                    <span className="text-xl font-black text-primary-950 font-mono">
                      {vramBreakdown.totalVramGb.toFixed(1)} GB
                    </span>
                  </div>

                  <div className="bg-surface-muted p-3.5 rounded-lg border border-border">
                    <span className="text-[11px] text-text-muted block">KV Cache / Token</span>
                    <span className="text-xl font-black text-amber-700 font-mono">
                      {(vramBreakdown.kvCacheGb / (contextTokens * batchConcurrency) * 1e6).toFixed(2)} KB
                    </span>
                  </div>

                  <div className="bg-surface-muted p-3.5 rounded-lg border border-border">
                    <span className="text-[11px] text-text-muted block">Serving Bottleneck</span>
                    <span className="text-xs font-bold text-text mt-1 block">
                      {batchConcurrency > 16 ? 'Compute-Bound (Prefill)' : 'Memory-Bandwidth Bound (Decode)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hardware Recommendation Card */}
              <div className="bg-gradient-to-r from-primary-950 to-primary-900 text-white p-4 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-accent-300 block">
                    Recommended Production Hardware Topology
                  </span>
                  <span className="text-base font-bold">{vramBreakdown.hardwareRec}</span>
                </div>
                <span className="text-xs bg-white/10 px-3 py-1.5 rounded border border-white/20 font-mono">
                  SLA: &lt;45ms TTFT
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 4: SPECULATIVE DECODING & PAGEDATTENTION STUDIO         */}
      {/* ============================================================ */}
      {activeMode === 'SPECULATIVE_DECODING' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Parameters Column */}
            <div className="bg-surface p-5 rounded-lg border border-border space-y-4">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                Speculative Decoding Engine Config
              </span>

              {/* Target Model Selector */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-text-muted">Target Model (Compute-Dense)</span>
                  <span className="font-bold text-primary-900 font-mono">{targetModelBillion}B Params</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[8, 14, 32, 70].map((size) => (
                    <button
                      key={size}
                      onClick={() => setTargetModelBillion(size)}
                      className={`py-1 text-xs font-bold rounded border transition-colors ${
                        targetModelBillion === size
                          ? 'bg-primary-900 text-white border-primary-900'
                          : 'bg-surface-muted text-text-muted border-border hover:bg-surface'
                      }`}
                    >
                      {size}B
                    </button>
                  ))}
                </div>
              </div>

              {/* Draft Model Selector */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-text-muted">Draft Model (Compute-Light)</span>
                  <span className="font-bold text-primary-900 font-mono">{draftModelBillion}B Params</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[1, 2, 3].map((size) => (
                    <button
                      key={size}
                      onClick={() => setDraftModelBillion(size)}
                      className={`py-1 text-xs font-bold rounded border transition-colors ${
                        draftModelBillion === size
                          ? 'bg-primary-900 text-white border-primary-900'
                          : 'bg-surface-muted text-text-muted border-border hover:bg-surface'
                      }`}
                    >
                      {size}B
                    </button>
                  ))}
                </div>
              </div>

              {/* Lookahead Horizon K */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-text-muted">Lookahead Horizon (K Draft Tokens)</span>
                  <span className="font-mono text-primary-900 font-bold">{lookaheadK} Tokens</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={lookaheadK}
                  onChange={(e) => setLookaheadK(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>K=1</span>
                  <span>K=4 (Balanced)</span>
                  <span>K=8</span>
                </div>
              </div>

              {/* Acceptance Rate Beta */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-text-muted">Token Acceptance Probability (β)</span>
                  <span className="font-mono text-primary-900 font-bold">{(acceptanceBeta * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="0.95"
                  step="0.05"
                  value={acceptanceBeta}
                  onChange={(e) => setAcceptanceBeta(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>30% (Divergent)</span>
                  <span>75% (Standard Alignment)</span>
                  <span>95% (High Alignment)</span>
                </div>
              </div>

              {/* Target Sequence Length */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-text-muted">Generation Sequence Length</span>
                  <span className="font-mono text-primary-900 font-bold">{targetTokensToGen} Tokens</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="25"
                  value={targetTokensToGen}
                  onChange={(e) => setTargetTokensToGen(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>
            </div>

            {/* Live Acceleration Dashboard */}
            <div className="lg:col-span-2 space-y-4">
              {/* Top KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-surface p-3.5 rounded-lg border border-border">
                  <span className="text-[11px] text-text-muted block">Speedup Factor</span>
                  <span className="text-2xl font-black text-emerald-700 font-mono">
                    {specMetrics.speedupFactor.toFixed(2)}×
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                    Wall-Clock Acceleration
                  </span>
                </div>

                <div className="bg-surface p-3.5 rounded-lg border border-border">
                  <span className="text-[11px] text-text-muted block">Expected Tokens / Step</span>
                  <span className="text-2xl font-black text-primary-900 font-mono">
                    {specMetrics.expectedAccepted.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-text-muted font-semibold block mt-0.5">
                    E[N] = (1 - β^(K+1)) / (1 - β)
                  </span>
                </div>

                <div className="bg-surface p-3.5 rounded-lg border border-border">
                  <span className="text-[11px] text-text-muted block">Target Pass Reduction</span>
                  <span className="text-2xl font-black text-primary-900 font-mono">
                    {specMetrics.targetPassReductionPct.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-text-muted font-semibold block mt-0.5">
                    {specMetrics.totalStepsNeeded} passes vs {targetTokensToGen}
                  </span>
                </div>

                <div className="bg-surface p-3.5 rounded-lg border border-border">
                  <span className="text-[11px] text-text-muted block">Latency Saved</span>
                  <span className="text-2xl font-black text-amber-700 font-mono">
                    {(specMetrics.timeSavedMs / 1000).toFixed(2)}s
                  </span>
                  <span className="text-[10px] text-text-muted font-semibold block mt-0.5">
                    {(specMetrics.specTotalTimeMs / 1000).toFixed(2)}s vs {(specMetrics.baseTotalTimeMs / 1000).toFixed(2)}s
                  </span>
                </div>
              </div>

              {/* Token Proposal & Rejection Sampling Stream */}
              <div className="bg-surface p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
                    Mathematical Rejection Sampling Waterfall Simulation
                  </span>
                  <span className="text-[10px] font-mono text-text-muted bg-surface-muted px-2 py-0.5 rounded border border-border">
                    p(x) Target vs q(x) Draft
                  </span>
                </div>

                <div className="space-y-2">
                  {[1, 2, 3].map((cycleIdx) => {
                    const sampleAcceptedCount = Math.min(
                      lookaheadK,
                      Math.max(1, Math.round(specMetrics.expectedAccepted) - (cycleIdx % 2))
                    );
                    return (
                      <div key={cycleIdx} className="p-2.5 rounded-md bg-canvas border border-border text-xs font-mono space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-text-muted">
                          <span className="font-bold text-text">Speculative Iteration #{cycleIdx}</span>
                          <span>Draft: {draftModelBillion}B ({specMetrics.tDraft}ms × {lookaheadK}) + Target: {targetModelBillion}B ({specMetrics.tTarget}ms)</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-text-muted font-sans font-semibold">Proposals:</span>
                          {Array.from({ length: lookaheadK }).map((_, tokenIdx) => {
                            const isAccepted = tokenIdx < sampleAcceptedCount;
                            const isResampled = tokenIdx === sampleAcceptedCount;
                            return (
                              <span
                                key={tokenIdx}
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold border flex items-center gap-1 ${
                                  isAccepted
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                    : isResampled
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 line-through opacity-60'
                                }`}
                              >
                                {isAccepted && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />}
                                {isResampled && <RotateCcw className="w-2.5 h-2.5 text-amber-600" />}
                                {isAccepted ? `tok_${tokenIdx + 1} (✓)` : isResampled ? `resample (α)` : `tok_${tokenIdx + 1} (✗)`}
                              </span>
                            );
                          })}
                          <span className="text-[10px] text-text-muted font-sans ml-auto">
                            +{sampleAcceptedCount + (sampleAcceptedCount < lookaheadK ? 1 : 0)} tokens yielded
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PagedAttention Memory Block Table */}
              <div className="bg-surface p-4 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary-700" />
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      PagedAttention Physical Block Allocation Table (Zero Internal Fragmentation)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Fragmentation Waste: &lt;3.2% (vs 68% in Contiguous)
                  </span>
                </div>

                {/* 16-block memory grid */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1 font-mono text-[11px]">
                  {[
                    { id: 0, tag: 'Seq-A (P0)', type: 'active' },
                    { id: 1, tag: 'FREE', type: 'free' },
                    { id: 2, tag: 'Seq-B (P0)', type: 'active-b' },
                    { id: 3, tag: 'FREE', type: 'free' },
                    { id: 4, tag: 'Seq-A (P1)', type: 'active' },
                    { id: 5, tag: 'FREE', type: 'free' },
                    { id: 6, tag: 'FREE', type: 'free' },
                    { id: 7, tag: 'Seq-A (CoW)', type: 'cow' },
                    { id: 8, tag: 'FREE', type: 'free' },
                    { id: 9, tag: 'Seq-B (P1)', type: 'active-b' },
                    { id: 10, tag: 'FREE', type: 'free' },
                    { id: 11, tag: 'Fork-1 (W)', type: 'fork' },
                    { id: 12, tag: 'FREE', type: 'free' },
                    { id: 13, tag: 'FREE', type: 'free' },
                    { id: 14, tag: 'FREE', type: 'free' },
                    { id: 15, tag: 'FREE', type: 'free' },
                  ].map((blk) => (
                    <div
                      key={blk.id}
                      className={`p-2 rounded border text-center transition-all ${
                        blk.type === 'active'
                          ? 'bg-primary-50 text-primary-950 border-primary-300 font-bold'
                          : blk.type === 'active-b'
                          ? 'bg-indigo-50 text-indigo-950 border-indigo-300 font-bold'
                          : blk.type === 'cow'
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-300 font-bold'
                          : blk.type === 'fork'
                          ? 'bg-amber-50 text-amber-950 border-amber-300 font-bold'
                          : 'bg-surface-muted text-text-muted border-border'
                      }`}
                    >
                      <span className="text-[9px] block text-text-muted">Block #{blk.id}</span>
                      <span className="text-[10px] block truncate">{blk.tag}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[10px] text-text-muted pt-2 border-t border-border">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-primary-200 border border-primary-400"></span> Seq A (Prompt/Decode)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-200 border border-indigo-400"></span> Seq B (Concurrent)</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-200 border border-emerald-400"></span> CoW Shared Prompt</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-200 border border-amber-400"></span> Diverging Generation</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-surface-muted border border-border"></span> Free Memory Page</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
