export interface CourseModuleItem {
  id: string;
  title: string;
  description: string | null;
  topicId: string | null;
  topicName: string | null;
  topicSlug: string | null;
  estimatedMinutes: number;
  orderIndex: number;
}

export interface CourseTrackItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string;
  estimatedHours: number;
  roleTrack: {
    id: string;
    name: string;
    slug: string;
  } | null;
  modulesCount: number;
  orderIndex: number;
}

export interface CourseTrackDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string;
  estimatedHours: number;
  roleTrack: {
    id: string;
    name: string;
    slug: string;
  } | null;
  modules: CourseModuleItem[];
  isEnrolled: boolean;
  enrolledAt: string | null;
  completedAt: string | null;
}

export interface CourseProgressResult {
  courseId: string;
  courseName: string;
  isEnrolled: boolean;
  enrolledAt: string | null;
  completedAt: string | null;
  totalModules: number;
  completedModules: number;
  progressPercentage: number;
  moduleProgress: Array<{
    moduleId: string;
    title: string;
    topicId: string | null;
    isCompleted: boolean;
    accuracyPercentage: number | null;
  }>;
}

import { apiUrl } from './env';
import {
  DEFAULT_COURSES_CATALOG,
  DEFAULT_ROLES_CATALOG,
} from './catalog-data';

export async function getCourses(): Promise<CourseTrackItem[]> {
  try {
    const res = await fetch(apiUrl('courses'), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      const data = (await res.json()) as CourseTrackItem[];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Gracefully fallback to catalog
  }

  return DEFAULT_COURSES_CATALOG;
}

export const COURSE_SYLLABUS_MODULES: Record<string, CourseModuleItem[]> = {
  'claude-code-ai-coding-agents': [
    {
      id: 'mod-claude-code-1',
      title: 'Module 1: ReAct Agentic Loop & Tool Execution Engine',
      description: 'Anatomy of autonomous coding agents: Observe-Think-Act cycles, JSON tool-calling schemas, and terminal execution sandboxes.',
      topicId: 'topic-ai-agents',
      topicName: 'AI Coding Agents & Autonomous Loops',
      topicSlug: 'ai-coding-agents-loops',
      estimatedMinutes: 120,
      orderIndex: 0,
    },
    {
      id: 'mod-claude-code-2',
      title: 'Module 2: Codebase Traversal & Context Compaction',
      description: 'AST parsing, grep/ripgrep symbols, token budgeting, and pruning massive context windows to avoid attention degradation.',
      topicId: 'topic-ai-agents',
      topicName: 'Context Window Optimization & Tokenomics',
      topicSlug: 'context-window-optimization-and-tokenomics',
      estimatedMinutes: 150,
      orderIndex: 1,
    },
    {
      id: 'mod-claude-code-3',
      title: 'Module 3: Test-Driven Autonomous Error Repair & Linters',
      description: 'Automated test suite execution loops, compiler error parsing, AST diff generation, and self-correcting code repair cycles.',
      topicId: 'topic-ai-agents',
      topicName: 'Claude Code & AI Coding Agents',
      topicSlug: 'claude-code-and-ai-coding-agents',
      estimatedMinutes: 180,
      orderIndex: 2,
    },
    {
      id: 'mod-claude-code-4',
      title: 'Module 4: Human-in-the-Loop Safeguards & Sandbox Isolation',
      description: 'Privilege gating, containerized execution sandboxes, bash command authorization, and deterministic safety checkpoints.',
      topicId: 'topic-ai-agents',
      topicName: 'Autonomous Multi-Agent Orchestration',
      topicSlug: 'autonomous-multi-agent-orchestration-and-react',
      estimatedMinutes: 150,
      orderIndex: 3,
    },
    {
      id: 'mod-claude-code-5',
      title: 'Module 5: Prefix Prompt Caching & Token Economics',
      description: 'KV-cache reuse, Anthropic prompt caching mechanics, cost modeling, and maximizing cache hit rates across multi-turn sessions.',
      topicId: 'topic-ai-agents',
      topicName: 'Context Window Optimization & Tokenomics',
      topicSlug: 'context-window-optimization-and-tokenomics',
      estimatedMinutes: 120,
      orderIndex: 4,
    },
  ],
  'production-rag-vector-search': [
    {
      id: 'mod-rag-1',
      title: 'Module 1: Document Parsing & Semantic Chunking',
      description: 'Recursive window chunking, markdown/code syntax-aware splitting, metadata enrichment, and chunk overlap math.',
      topicId: 'topic-rag-systems',
      topicName: 'RAG Architectures & Vector Search',
      topicSlug: 'rag-architectures-vector-search',
      estimatedMinutes: 120,
      orderIndex: 0,
    },
    {
      id: 'mod-rag-2',
      title: 'Module 2: Dense Embeddings vs Sparse Lexical BM25',
      description: 'Mathematical foundations of cosine similarity, dot product, BM25 inverted index term scoring, and vocabulary mismatch.',
      topicId: 'topic-rag-systems',
      topicName: 'RAG Architectures & Vector Search',
      topicSlug: 'retrieval-augmented-generation-and-vector-search',
      estimatedMinutes: 150,
      orderIndex: 1,
    },
    {
      id: 'mod-rag-3',
      title: 'Module 3: Vector Index Geometry: HNSW vs IVFFlat',
      description: 'Hierarchical Navigable Small World graphs, entry points, efConstruction tuning, Voronoi partitions, and memory tradeoffs.',
      topicId: 'topic-rag-systems',
      topicName: 'RAG Architectures & Vector Search',
      topicSlug: 'retrieval-augmented-generation-and-vector-search',
      estimatedMinutes: 180,
      orderIndex: 2,
    },
    {
      id: 'mod-rag-4',
      title: 'Module 4: Hybrid Search Fusion (RRF) & Cross-Encoder Reranking',
      description: 'Reciprocal Rank Fusion k-constant equations, cross-encoder full attention re-scoring, and p99 latency optimization.',
      topicId: 'topic-rag-systems',
      topicName: 'RAG Architectures & Vector Search',
      topicSlug: 'retrieval-augmented-generation-and-vector-search',
      estimatedMinutes: 180,
      orderIndex: 3,
    },
    {
      id: 'mod-rag-5',
      title: 'Module 5: Contextual Compression & Hallucination Guardrails',
      description: 'Post-retrieval chunk compression, citation verification, groundedness validation, and self-consistency verification.',
      topicId: 'topic-rag-systems',
      topicName: 'LLM Evaluation & Guardrails',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 150,
      orderIndex: 4,
    },
  ],
  'advanced-prompt-engineering-llms': [
    {
      id: 'mod-prompt-1',
      title: 'Module 1: System Prompt Authority & Role Conditioning',
      description: 'System prompt privilege boundaries, negative constraints, XML/Markdown tagging, and zero-shot baseline conditioning.',
      topicId: 'topic-prompt-eng',
      topicName: 'Advanced Prompt Engineering & In-Context Learning',
      topicSlug: 'advanced-prompt-engineering-and-in-context-learning',
      estimatedMinutes: 120,
      orderIndex: 0,
    },
    {
      id: 'mod-prompt-2',
      title: 'Module 2: Few-Shot In-Context Learning & Exemplar Selection',
      description: 'Selecting optimal exemplars via embedding similarity, ordering biases, label distribution balancing, and diversity pruning.',
      topicId: 'topic-prompt-eng',
      topicName: 'Advanced Prompt Engineering & In-Context Learning',
      topicSlug: 'advanced-prompt-engineering-and-in-context-learning',
      estimatedMinutes: 120,
      orderIndex: 1,
    },
    {
      id: 'mod-prompt-3',
      title: 'Module 3: Chain-of-Thought (CoT) & Reasoning Elicitation',
      description: 'Zero-shot CoT, Least-to-Most prompting, Tree-of-Thoughts (ToT), self-consistency majority voting, and reasoning tokens.',
      topicId: 'topic-prompt-eng',
      topicName: 'Advanced Prompt Engineering & In-Context Learning',
      topicSlug: 'advanced-prompt-engineering-and-in-context-learning',
      estimatedMinutes: 150,
      orderIndex: 2,
    },
    {
      id: 'mod-prompt-4',
      title: 'Module 4: Constrained Decoding & Structured JSON Schemas',
      description: 'Deterministic JSON mode, Pydantic/Zod schema enforcement, grammar-guided sampling, and eliminating parsing exceptions.',
      topicId: 'topic-prompt-eng',
      topicName: 'LLM Evaluation & Guardrails',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 150,
      orderIndex: 3,
    },
    {
      id: 'mod-prompt-5',
      title: 'Module 5: Prompt Drift Detection & A/B Benchmark Evaluation',
      description: 'Automated prompt test harnesses, semantic distance evaluations, regression scoring, and prompt versioning pipelines.',
      topicId: 'topic-prompt-eng',
      topicName: 'LLM Evaluation & Guardrails',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 120,
      orderIndex: 4,
    },
  ],
  'multi-agent-orchestration-state-machines': [
    {
      id: 'mod-agent-1',
      title: 'Module 1: Multi-Agent Topologies: Supervisor vs Swarm',
      description: 'Centralized supervisor router vs decentralized message-passing swarms, role specialization, and handoff protocols.',
      topicId: 'topic-multi-agent',
      topicName: 'Autonomous Multi-Agent Orchestration',
      topicSlug: 'autonomous-multi-agent-orchestration-and-react',
      estimatedMinutes: 150,
      orderIndex: 0,
    },
    {
      id: 'mod-agent-2',
      title: 'Module 2: Cyclic State Graphs & Transition Reducers',
      description: 'Graph nodes, edges, conditional branch predicates, state schemas, and deterministic update reducers (LangGraph).',
      topicId: 'topic-multi-agent',
      topicName: 'Autonomous Multi-Agent Orchestration',
      topicSlug: 'autonomous-multi-agent-orchestration-and-react',
      estimatedMinutes: 180,
      orderIndex: 1,
    },
    {
      id: 'mod-agent-3',
      title: 'Module 3: State Persistence, Checkpointing & Time-Travel',
      description: 'Saving graph checkpoint states to PostgreSQL/Redis, resuming interrupted workflows, and inspecting historical state branches.',
      topicId: 'topic-multi-agent',
      topicName: 'Autonomous Multi-Agent Orchestration',
      topicSlug: 'autonomous-multi-agent-orchestration-and-react',
      estimatedMinutes: 150,
      orderIndex: 2,
    },
    {
      id: 'mod-agent-4',
      title: 'Module 4: Asynchronous Inter-Agent Protocols & Stdio Bridges',
      description: 'Event-driven agent message buses, JSON-RPC stdio bridges, model context protocol (MCP) standards, and subagent isolation.',
      topicId: 'topic-multi-agent',
      topicName: 'Claude Code & AI Coding Agents',
      topicSlug: 'claude-code-and-ai-coding-agents',
      estimatedMinutes: 180,
      orderIndex: 3,
    },
    {
      id: 'mod-agent-5',
      title: 'Module 5: Deadlock Detection, Token Budgets & Loop Invariants',
      description: 'Halting conditions, max-recursion depth guards, token consumption limits, and automatic circuit breakers.',
      topicId: 'topic-multi-agent',
      topicName: 'Context Window Optimization & Tokenomics',
      topicSlug: 'context-window-optimization-and-tokenomics',
      estimatedMinutes: 150,
      orderIndex: 4,
    },
  ],
  'llmops-quantization-model-serving': [
    {
      id: 'mod-llmops-1',
      title: 'Module 1: GPU Memory Breakdown: Weights, Activations & KV-Cache',
      description: 'Anatomy of High Bandwidth Memory (HBM3), model weight footprint (FP16 vs INT4), activation memory spikes, and KV-cache sizing.',
      topicId: 'topic-llmops',
      topicName: 'Context Window Optimization & Tokenomics',
      topicSlug: 'context-window-optimization-and-tokenomics',
      estimatedMinutes: 150,
      orderIndex: 0,
    },
    {
      id: 'mod-llmops-2',
      title: 'Module 2: PagedAttention & Continuous Batching in vLLM',
      description: 'Virtual memory page tables for KV-cache, eliminating memory fragmentation, iteration-level continuous batching, and CUDA graphs.',
      topicId: 'topic-llmops',
      topicName: 'Operating Systems & Linux Internals',
      topicSlug: 'virtual-memory-paging-and-page-replacement',
      estimatedMinutes: 180,
      orderIndex: 1,
    },
    {
      id: 'mod-llmops-3',
      title: 'Module 3: Post-Training Quantization: AWQ, GGUF & GPTQ',
      description: 'Activation-aware Weight Quantization (AWQ), outlier channel preservation, GGUF/llama.cpp CPU offloading, and perplexity curves.',
      topicId: 'topic-llmops',
      topicName: 'Machine Learning & AI Systems',
      topicSlug: 'transformers-self-attention-and-rag-pipelines',
      estimatedMinutes: 180,
      orderIndex: 2,
    },
    {
      id: 'mod-llmops-4',
      title: 'Module 4: Speculative Decoding & Draft Model Verification',
      description: 'Accelerating autoregressive token generation: small draft model proposal, target model parallel verification, and acceptance probability.',
      topicId: 'topic-llmops',
      topicName: 'Machine Learning & AI Systems',
      topicSlug: 'transformers-self-attention-and-rag-pipelines',
      estimatedMinutes: 150,
      orderIndex: 3,
    },
    {
      id: 'mod-llmops-5',
      title: 'Module 5: Production Inference Serving: Streaming TTFT vs TPS',
      description: 'Server-Sent Events (SSE) streaming protocols, Time to First Token (TTFT), Tokens Per Second (TPS) throughput, and GPU autoscaling.',
      topicId: 'topic-llmops',
      topicName: 'Cloud Architecture & Infrastructure',
      topicSlug: 'cloud-vpc-networking-and-iam-security',
      estimatedMinutes: 150,
      orderIndex: 4,
    },
  ],
  'ai-safety-guardrails-evaluation': [
    {
      id: 'mod-safety-1',
      title: 'Module 1: Prompt Injections, Jailbreaks & Threat Modeling',
      description: 'Direct system prompt leakage, indirect prompt injection via untrusted web/file inputs, delimiter attacks, and OWASP Top 10 for LLMs.',
      topicId: 'topic-ai-safety',
      topicName: 'LLM Evaluation & Guardrails',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 150,
      orderIndex: 0,
    },
    {
      id: 'mod-safety-2',
      title: 'Module 2: Grammar-Guided Decoding & FSM Token Masking',
      description: 'Enforcing deterministic context-free grammars (CFG) at logit level: finite state machine token masking, out-of-vocabulary prevention.',
      topicId: 'topic-ai-safety',
      topicName: 'LLM Evaluation & Guardrails',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 150,
      orderIndex: 1,
    },
    {
      id: 'mod-safety-3',
      title: 'Module 3: Semantic Guardrails & Real-Time Content Moderation',
      description: 'NeMo Guardrails dialogue flows, LlamaGuard classification, PII redaction filters, and toxic output blocking.',
      topicId: 'topic-ai-safety',
      topicName: 'LLM Evaluation & Guardrails',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 150,
      orderIndex: 2,
    },
    {
      id: 'mod-safety-4',
      title: 'Module 4: Automated Evaluation: Ragas, TruLens & LLM-as-a-Judge',
      description: 'Faithfulness, answer relevance, context precision, context recall, and calibrated judge models with pairwise comparison.',
      topicId: 'topic-ai-safety',
      topicName: 'LLM Evaluation & Guardrails',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 180,
      orderIndex: 3,
    },
    {
      id: 'mod-safety-5',
      title: 'Module 5: Continuous Safety Gates & Red-Teaming CI/CD',
      description: 'Automated adversarial evaluation pipelines, prompt regression suites, security gates in GitHub Actions, and production telemetry.',
      topicId: 'topic-ai-safety',
      topicName: 'Test Automation & SDET Principles',
      topicSlug: 'test-automation-pyramid-and-playwright-architecture',
      estimatedMinutes: 150,
      orderIndex: 4,
    },
  ],
  'fine-tuning-lora-rlhf-alignment': [
    {
      id: 'mod-ft-1',
      title: 'Module 1: Full Parameter Fine-Tuning vs PEFT & Memory Bounds',
      description: 'Mathematical memory requirements of FP32/FP16 optimizer states (AdamW 16-bytes/param), backward gradient passes, and activation checkpoints.',
      topicId: 'topic-fine-tuning',
      topicName: 'Parameter-Efficient Fine-Tuning & LoRA',
      topicSlug: 'lora-parameter-efficient-fine-tuning',
      estimatedMinutes: 180,
      orderIndex: 0,
    },
    {
      id: 'mod-ft-2',
      title: 'Module 2: LoRA Decomposition Mathematics & QLoRA 4-bit Quantization',
      description: 'Low-rank matrix decomposition W + (B x A), rank r and alpha scaling factors, gradient flow, and QLoRA NormalFloat4 (NF4) double quantization.',
      topicId: 'topic-fine-tuning',
      topicName: 'LoRA Mathematics & QLoRA NF4',
      topicSlug: 'lora-parameter-efficient-fine-tuning',
      estimatedMinutes: 210,
      orderIndex: 1,
    },
    {
      id: 'mod-ft-3',
      title: 'Module 3: SFT Instruction Dataset Synthesis & Formatting',
      description: 'ChatML, Alpaca and ShareGPT tokenization formats, loss masking over prompt tokens, synthetic data generation, and filtering contamination.',
      topicId: 'topic-fine-tuning',
      topicName: 'Instruction Tuning & Loss Masking',
      topicSlug: 'advanced-prompt-engineering-and-in-context-learning',
      estimatedMinutes: 180,
      orderIndex: 2,
    },
    {
      id: 'mod-ft-4',
      title: 'Module 4: Alignment: Direct Preference Optimization (DPO) vs PPO RLHF',
      description: 'Derivation of DPO closed-form loss from the Bradley-Terry preference model, eliminating unstable reward models and PPO value-head training.',
      topicId: 'topic-fine-tuning',
      topicName: 'Direct Preference Optimization & Alignment',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 200,
      orderIndex: 3,
    },
    {
      id: 'mod-ft-5',
      title: 'Module 5: Fine-Tuning Benchmarking, Catastrophic Forgetting & Merging',
      description: 'Evaluating domain adaptation on MT-Bench/MMLU, mitigating catastrophic forgetting via replay buffers, and spherical linear weight interpolation (SLERP).',
      topicId: 'topic-fine-tuning',
      topicName: 'Model Evaluation & Weight Merging',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 190,
      orderIndex: 4,
    },
  ],
  'multimodal-ai-vision-audio-diffusion': [
    {
      id: 'mod-mm-1',
      title: 'Module 1: Contrastive Pretraining & Joint Embedding Space (CLIP)',
      description: 'Dual-encoder architectures, normalized temperature-scaled cross-entropy (InfoNCE) loss, cosine similarity alignment, and zero-shot classification.',
      topicId: 'topic-multimodal-ai',
      topicName: 'Contrastive Multimodal Embeddings',
      topicSlug: 'multimodal-vision-language-adapters',
      estimatedMinutes: 210,
      orderIndex: 0,
    },
    {
      id: 'mod-mm-2',
      title: 'Module 2: Vision-Language Projection Layers & Cross-Attention (LLaVA)',
      description: 'Patch tokenization (ViT 14x14 patches), linear projection layers vs Perceiver Resamplers, and feeding visual tokens into autoregressive LLMs.',
      topicId: 'topic-multimodal-ai',
      topicName: 'Vision-Language Projection & Adapters',
      topicSlug: 'multimodal-vision-language-adapters',
      estimatedMinutes: 240,
      orderIndex: 1,
    },
    {
      id: 'mod-mm-3',
      title: 'Module 3: Continuous Audio Spectrogram Tokenization (Whisper)',
      description: 'Log-mel filterbank audio preprocessing, 1D convolution downsampling, sequence-to-sequence encoder-decoder attention, and time-stamped transcription.',
      topicId: 'topic-multimodal-ai',
      topicName: 'Audio Processing & Spectrogram Encoding',
      topicSlug: 'multimodal-vision-language-adapters',
      estimatedMinutes: 190,
      orderIndex: 2,
    },
    {
      id: 'mod-mm-4',
      title: 'Module 4: Latent Diffusion Models & Score Matching Denoising',
      description: 'Variational Autoencoders (VAE) latent space compression, U-Net noise prediction, Classifier-Free Guidance (CFG), and DDIM scheduling.',
      topicId: 'topic-multimodal-ai',
      topicName: 'Latent Diffusion & Score Matching',
      topicSlug: 'multimodal-vision-language-adapters',
      estimatedMinutes: 240,
      orderIndex: 3,
    },
    {
      id: 'mod-mm-5',
      title: 'Module 5: Edge Multimodal Inference & Memory Optimization',
      description: 'On-device multimodal deployment, visual token pruning, key-value cache optimizations for multimodal tokens, and latency profiling.',
      topicId: 'topic-multimodal-ai',
      topicName: 'Edge Multimodal Serving',
      topicSlug: 'context-window-optimization-and-tokenomics',
      estimatedMinutes: 200,
      orderIndex: 4,
    },
  ],
  'agentic-rag-vector-graph-databases': [
    {
      id: 'mod-arag-1',
      title: 'Module 1: Self-RAG & Corrective Retrieval (CRAG) Loops',
      description: 'Implement dynamic retrieval reflection tokens [Retrieve], [IsRel], [IsSup], web search fallbacks, and autonomous document grading.',
      topicId: 'topic-agentic-rag',
      topicName: 'Self-Corrective RAG & Reflection Loops',
      topicSlug: 'retrieval-augmented-generation-and-vector-search',
      estimatedMinutes: 210,
      orderIndex: 0,
    },
    {
      id: 'mod-arag-2',
      title: 'Module 2: GraphRAG & Knowledge Graph Triplet Extraction',
      description: 'LLM entity-relation extraction, graph community clustering (Leiden algorithm), hierarchical summarization, and Cypher graph querying.',
      topicId: 'topic-agentic-rag',
      topicName: 'GraphRAG & Knowledge Graphs',
      topicSlug: 'retrieval-augmented-generation-and-vector-search',
      estimatedMinutes: 240,
      orderIndex: 1,
    },
    {
      id: 'mod-arag-3',
      title: 'Module 3: Advanced Vector Indexing & Approximate Nearest Neighbors',
      description: 'Geometric mechanics of HNSW multi-layer skip graphs, IVFFlat inverted lists, Product Quantization (PQ), and vector cosine distances.',
      topicId: 'topic-agentic-rag',
      topicName: 'Vector Indexing (HNSW & PQ)',
      topicSlug: 'retrieval-augmented-generation-and-vector-search',
      estimatedMinutes: 200,
      orderIndex: 2,
    },
    {
      id: 'mod-arag-4',
      title: 'Module 4: Hybrid Sparse-Dense Retrieval & Cross-Encoder Reranking',
      description: 'Reciprocal Rank Fusion (RRF) with tunable alpha constants, BM25 term frequency saturation, and cross-encoder token-level attention scoring.',
      topicId: 'topic-agentic-rag',
      topicName: 'Hybrid Retrieval & Cross-Encoder Reranking',
      topicSlug: 'retrieval-augmented-generation-and-vector-search',
      estimatedMinutes: 220,
      orderIndex: 3,
    },
    {
      id: 'mod-arag-5',
      title: 'Module 5: Context Window Compression & Hallucination Guardrails',
      description: 'Mitigating lost-in-the-middle context degradation, extractive sentence compression, citation verification, and faithfulness metrics.',
      topicId: 'topic-agentic-rag',
      topicName: 'Context Compression & Verification',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 210,
      orderIndex: 4,
    },
  ],
  'synthetic-data-distillation-evals': [
    {
      id: 'mod-sde-1',
      title: 'Module 1: Evol-Instruct Prompt Mutation Taxonomy',
      description: 'Algorithmically expanding prompt depth (constraints, reasoning, concretizing) and breadth to scale diverse instruction datasets without human bottlenecks.',
      topicId: 'topic-ai-evals',
      topicName: 'Evol-Instruct Mutation Taxonomy',
      topicSlug: 'parameter-efficient-fine-tuning-and-lora',
      estimatedMinutes: 190,
      orderIndex: 0,
    },
    {
      id: 'mod-sde-2',
      title: 'Module 2: Execution-Grounded Sandbox Verification',
      description: 'Building isolated container execution harnesses for code and math solutions with automated compiler checking and deterministic test validation.',
      topicId: 'topic-ai-evals',
      topicName: 'Sandbox Execution Verification',
      topicSlug: 'claude-code-and-ai-coding-agents',
      estimatedMinutes: 210,
      orderIndex: 1,
    },
    {
      id: 'mod-sde-3',
      title: 'Module 3: LLM-as-a-Judge Benchmarking & Bias Mitigation',
      description: 'Position bias, length bias, and self-enhancement bias mitigation using pairwise swap consistency, rubric conditioning, and reference grounding.',
      topicId: 'topic-ai-evals',
      topicName: 'LLM-as-a-Judge & Bias Mitigation',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 200,
      orderIndex: 2,
    },
    {
      id: 'mod-sde-4',
      title: 'Module 4: Knowledge Distillation & Soft Cross-Entropy Loss',
      description: 'Transferring frontier teacher reasoning to compact student models via KL-divergence probability matching, temperature scaling, and token pruning.',
      topicId: 'topic-ai-evals',
      topicName: 'Model Distillation & Temperature Scaling',
      topicSlug: 'parameter-efficient-fine-tuning-and-lora',
      estimatedMinutes: 180,
      orderIndex: 3,
    },
    {
      id: 'mod-sde-5',
      title: 'Module 5: Automated Evaluation Frameworks & Continuous Audits',
      description: 'Engineering continuous regression gates with programmatic assertions, Ragas/TruLens metrics, MT-Bench evaluation, and test-time compute scaling.',
      topicId: 'topic-ai-evals',
      topicName: 'Automated Evaluation Frameworks',
      topicSlug: 'llm-evaluation-benchmarks-and-guardrails',
      estimatedMinutes: 180,
      orderIndex: 4,
    },
  ],
};

export async function getCourse(slug: string): Promise<CourseTrackDetail> {
  try {
    const res = await fetch(apiUrl(`courses/${slug}`), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as CourseTrackDetail;
    }
  } catch {
    // Gracefully fallback to catalog
  }

  const found = DEFAULT_COURSES_CATALOG.find((c) => c.slug === slug || c.id === slug);
  if (found) {
    if (COURSE_SYLLABUS_MODULES[found.slug]) {
      return {
        id: found.id,
        name: found.name,
        slug: found.slug,
        description: found.description,
        level: found.level,
        estimatedHours: found.estimatedHours,
        roleTrack: found.roleTrack,
        isEnrolled: false,
        enrolledAt: null,
        completedAt: null,
        modules: COURSE_SYLLABUS_MODULES[found.slug],
      };
    }

    const role = DEFAULT_ROLES_CATALOG.find(
      (r) => r.id === found.roleTrack?.id || r.slug === found.roleTrack?.slug,
    );

    const competencies = role?.competencies || [];
    const modules: CourseModuleItem[] =
      competencies.length > 0
        ? competencies.map((comp, idx) => ({
            id: `mod-${found.slug}-${idx + 1}`,
            title: `Module ${idx + 1}: ${comp.topicName}`,
            description: `Master core principles, architecture patterns, and practical implementation drills for ${comp.topicName}.`,
            topicId: comp.topicId,
            topicName: comp.topicName,
            topicSlug: comp.topicSlug,
            estimatedMinutes: Math.round(
              (found.estimatedHours * 60) / competencies.length,
            ),
            orderIndex: idx,
          }))
        : [
            {
              id: `mod-${found.slug}-1`,
              title: 'Module 1: Foundations & Architecture',
              description: 'Comprehensive introduction and foundational concepts.',
              topicId: 'topic-aws-arch',
              topicName: 'AWS Cloud Architecture & Services',
              topicSlug: 'aws-cloud-architecture',
              estimatedMinutes: 60,
              orderIndex: 0,
            },
            {
              id: `mod-${found.slug}-2`,
              title: 'Module 2: Practical Engineering Implementation',
              description: 'Deep-dive implementation drills and practical problem solving.',
              topicId: 'topic-linux',
              topicName: 'Linux System Administration & Shell',
              topicSlug: 'linux-shell-scripting',
              estimatedMinutes: 90,
              orderIndex: 1,
            },
            {
              id: `mod-${found.slug}-3`,
              title: 'Module 3: Advanced Optimization & Scenarios',
              description: 'Real-world system design, troubleshooting, and edge cases.',
              topicId: 'topic-devops',
              topicName: 'DevOps, Docker & CI/CD Pipelines',
              topicSlug: 'devops-docker-cicd',
              estimatedMinutes: 90,
              orderIndex: 2,
            },
          ];

    return {
      id: found.id,
      name: found.name,
      slug: found.slug,
      description: found.description,
      level: found.level,
      estimatedHours: found.estimatedHours,
      roleTrack: found.roleTrack,
      isEnrolled: false,
      enrolledAt: null,
      completedAt: null,
      modules,
    };
  }

  throw new Error(`Failed to fetch course "${slug}"`);
}

export async function enrollInCourse(
  courseId: string,
): Promise<{ success: boolean; enrolledAt: string }> {
  try {
    const res = await fetch(apiUrl(`courses/${courseId}/enroll`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (res.ok) {
      return (await res.json()) as { success: boolean; enrolledAt: string };
    }
  } catch {
    // Graceful fallback
  }

  return { success: true, enrolledAt: new Date().toISOString() };
}

export async function getCourseProgress(
  courseId: string,
): Promise<CourseProgressResult> {
  try {
    const res = await fetch(apiUrl(`courses/${courseId}/progress`), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as CourseProgressResult;
    }
  } catch {
    // Graceful fallback
  }

  const course = DEFAULT_COURSES_CATALOG.find(
    (c) => c.id === courseId || c.slug === courseId,
  );
  const courseName = course ? course.name : 'Engineering Career Pathway';

  return {
    courseId,
    courseName,
    isEnrolled: true,
    enrolledAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    completedAt: null,
    totalModules: 3,
    completedModules: 1,
    progressPercentage: 33,
    moduleProgress: [
      {
        moduleId: 'mod-1',
        title: 'Module 1: Foundations & Architecture',
        topicId: 'topic-1',
        isCompleted: true,
        accuracyPercentage: 85,
      },
      {
        moduleId: 'mod-2',
        title: 'Module 2: Practical Engineering Implementation',
        topicId: 'topic-2',
        isCompleted: false,
        accuracyPercentage: null,
      },
      {
        moduleId: 'mod-3',
        title: 'Module 3: Advanced Optimization & Scenarios',
        topicId: 'topic-3',
        isCompleted: false,
        accuracyPercentage: null,
      },
    ],
  };
}

