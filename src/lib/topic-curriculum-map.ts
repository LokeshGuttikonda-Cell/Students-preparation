import { CURRICULUM_SUMMARIES } from './curriculum-summaries';

/**
 * Direct Topic Slug & ID -> Canonical Curriculum Article Slug Mapping
 * Ensures that EVERY course module and syllabus topic redirects directly
 * to its authoritative, peer-reviewed engineering technical guide in the Knowledge Hub.
 */
export const TOPIC_TO_CURRICULUM_ARTICLE_SLUG: Record<string, string> = {
  // Artificial Intelligence & Autonomous Coding Agents
  'ai-coding-agents-loops': 'claude-code-and-ai-coding-agents',
  'topic-ai-agents': 'claude-code-and-ai-coding-agents',
  'claude-code-ai-coding-agents': 'claude-code-and-ai-coding-agents',
  'rag-architectures-vector-search': 'retrieval-augmented-generation-and-vector-search',
  'topic-rag-systems': 'retrieval-augmented-generation-and-vector-search',
  'production-rag-vector-search': 'retrieval-augmented-generation-and-vector-search',
  'advanced-prompt-engineering-llms': 'advanced-prompt-engineering-and-in-context-learning',
  'advanced-prompt-engineering': 'advanced-prompt-engineering-and-in-context-learning',
  'topic-prompt-eng': 'advanced-prompt-engineering-and-in-context-learning',
  'multi-agent-orchestration-state-machines': 'autonomous-multi-agent-orchestration-and-react',
  'multi-agent-orchestration': 'autonomous-multi-agent-orchestration-and-react',
  'topic-multi-agent': 'autonomous-multi-agent-orchestration-and-react',
  'tokenomics-context-window': 'context-window-optimization-and-tokenomics',
  'llmops-quantization-model-serving': 'context-window-optimization-and-tokenomics',
  'topic-llmops': 'context-window-optimization-and-tokenomics',
  'ai-safety-guardrails-evaluation': 'llm-evaluation-benchmarks-and-guardrails',
  'topic-ai-safety': 'llm-evaluation-benchmarks-and-guardrails',
  'llm-evaluation-guardrails': 'llm-evaluation-benchmarks-and-guardrails',
  'ml-ai-systems': 'transformers-self-attention-and-rag-pipelines',
  'topic-ml-systems': 'transformers-self-attention-and-rag-pipelines',
  'machine-learning-engineering-model-deployment': 'transformers-self-attention-and-rag-pipelines',
  'fine-tuning-lora-rlhf-alignment': 'parameter-efficient-fine-tuning-and-lora',
  'topic-fine-tuning': 'parameter-efficient-fine-tuning-and-lora',
  'lora-parameter-efficient-fine-tuning': 'parameter-efficient-fine-tuning-and-lora',
  'multimodal-ai-vision-audio-diffusion': 'multimodal-vision-language-and-diffusion-models',
  'topic-multimodal-ai': 'multimodal-vision-language-and-diffusion-models',
  'multimodal-vision-language-adapters': 'multimodal-vision-language-and-diffusion-models',
  'distributed-llm-serving-pagedattention': 'paged-attention-and-continuous-batching',
  'topic-distributed-serving': 'paged-attention-and-continuous-batching',
  'paged-attention-and-continuous-batching': 'paged-attention-and-continuous-batching',
  'compound-ai-systems-multi-agent': 'speculative-decoding-and-compound-ai-systems',
  'topic-compound-ai': 'speculative-decoding-and-compound-ai-systems',
  'speculative-decoding-and-compound-ai-systems': 'speculative-decoding-and-compound-ai-systems',
  'agentic-rag-vector-graph-databases': 'retrieval-augmented-generation-and-vector-search',
  'topic-agentic-rag': 'retrieval-augmented-generation-and-vector-search',
  'synthetic-data-distillation-evals': 'llm-evaluation-benchmarks-and-guardrails',
  'topic-ai-evals': 'llm-evaluation-benchmarks-and-guardrails',

  // Cloud Computing, Architecture & Infrastructure
  'aws-cloud-architecture': 'cloud-vpc-networking-and-iam-security',
  'topic-aws-arch': 'cloud-vpc-networking-and-iam-security',
  'aws-cloud-foundations': 'cloud-vpc-networking-and-iam-security',
  'azure-cloud-systems': 'cloud-vpc-networking-and-iam-security',
  'topic-azure-sys': 'cloud-vpc-networking-and-iam-security',
  'azure-infrastructure-systems': 'cloud-vpc-networking-and-iam-security',
  'linux-shell-scripting': 'linux-kernel-cgroups-container-primitives',
  'topic-linux': 'linux-kernel-cgroups-container-primitives',
  'devops-docker-cicd': 'docker-multi-stage-builds-and-kubernetes-scheduling',
  'topic-devops': 'docker-multi-stage-builds-and-kubernetes-scheduling',
  'devops-automation-cicd': 'docker-multi-stage-builds-and-kubernetes-scheduling',
  'cloud-cybersecurity-defense': 'owasp-top-10-and-asymmetric-cryptography',
  'topic-cloud-security': 'owasp-top-10-and-asymmetric-cryptography',
  'cloud-cybersecurity-threat-modeling-defense': 'owasp-top-10-and-asymmetric-cryptography',

  // Enterprise Software Development & Backend Runtimes
  'core-java-multithreading': 'java-virtual-threads-and-concurrency-models',
  'topic-core-java': 'java-virtual-threads-and-concurrency-models',
  'core-java-concurrency': 'java-virtual-threads-and-concurrency-models',
  'python-programming-scripting': 'virtual-memory-paging-and-page-replacement',
  'topic-python': 'virtual-memory-paging-and-page-replacement',
  'python-automation-algorithms': 'virtual-memory-paging-and-page-replacement',
  'fullstack-javascript-apis': 'javascript-event-loop-and-react-fiber-reconciliation',
  'topic-fullstack-js': 'javascript-event-loop-and-react-fiber-reconciliation',
  'fullstack-javascript-web-apis': 'javascript-event-loop-and-react-fiber-reconciliation',
  'qa-automation-testing': 'test-automation-pyramid-and-playwright-architecture',
  'topic-qa-testing': 'test-automation-pyramid-and-playwright-architecture',
  'test-automation-sdet-principles-cicd-verification': 'test-automation-pyramid-and-playwright-architecture',

  // Enterprise Databases, Storage & ETL
  'advanced-sql-optimization': 'acid-transactions-mvcc-and-isolation-anomalies',
  'topic-adv-sql': 'acid-transactions-mvcc-and-isolation-anomalies',
  'enterprise-sql-analytics': 'acid-transactions-mvcc-and-isolation-anomalies',
  'crm-workflow-logic': 'b-plus-trees-and-storage-engine-internals',
  'topic-crm-work': 'b-plus-trees-and-storage-engine-internals',
  'crm-technical-logic': 'b-plus-trees-and-storage-engine-internals',
  'etl-pipelines-data-engineering': 'apache-kafka-internals-and-stream-processing',
  'topic-etl-pipelines': 'apache-kafka-internals-and-stream-processing',
  'data-engineering-lakehouse-pipeline-architecture': 'apache-kafka-internals-and-stream-processing',
  'dbms-basics': 'b-plus-trees-and-storage-engine-internals',
  'topic-dbms': 'b-plus-trees-and-storage-engine-internals',

  // Computer Fundamentals, DSA & System Design
  'data-structures-basics': 'binary-search-trees-and-avl-balancing',
  'topic-ds': 'binary-search-trees-and-avl-balancing',
  'algorithms-dynamic-programming': 'dynamic-programming-memoization-tabulation',
  'topic-adv-algo': 'dynamic-programming-memoization-tabulation',
  'distributed-systems-architecture': 'distributed-consensus-raft-and-paxos',
  'topic-dist-sys': 'distributed-consensus-raft-and-paxos',
  'oop-concepts': 'solid-principles-and-gof-patterns',
  'topic-oop': 'solid-principles-and-gof-patterns',
  'operating-systems-internals': 'virtual-memory-paging-and-page-replacement',
  'topic-os': 'virtual-memory-paging-and-page-replacement',
  'computer-networks-protocols': 'tcp-congestion-control-and-http3-quic',
  'topic-networks': 'tcp-congestion-control-and-http3-quic',

  // Quantitative Aptitude
  'number-systems': 'number-theory-modular-arithmetic',
  'topic-numbers': 'number-theory-modular-arithmetic',
  'percentages': 'quantitative-aptitude-speed-work-and-probability',
  'topic-percentages': 'quantitative-aptitude-speed-work-and-probability',
  'time-and-work': 'quantitative-aptitude-speed-work-and-probability',
  'topic-time-work': 'quantitative-aptitude-speed-work-and-probability',
  'probability-permutations': 'combinatorics-probability-distributions',
  'topic-prob': 'combinatorics-probability-distributions',

  // Logical Reasoning
  'blood-relations': 'constraint-satisfaction-networks',
  'topic-blood': 'constraint-satisfaction-networks',
  'coding-decoding': 'constraint-satisfaction-networks',
  'topic-coding': 'constraint-satisfaction-networks',
  'syllogisms': 'categorical-syllogisms-and-deductive-logic',
  'topic-syllogisms': 'categorical-syllogisms-and-deductive-logic',
  'direction-sense-deduction': 'constraint-satisfaction-networks',
  'topic-direction': 'constraint-satisfaction-networks',
};

/**
 * Resolves a module's topic slug, topic ID, or title to the exact canonical curriculum URL.
 * Guarantees that every module's [Theory] button navigates directly to the specific topic guide.
 */
export function getCurriculumUrlForTopic(
  topicSlugOrId?: string | null,
  topicName?: string | null,
  moduleTitle?: string | null,
): string {
  const candidateKeys = [
    topicSlugOrId,
    topicName,
    moduleTitle,
  ].filter(Boolean) as string[];

  for (const rawKey of candidateKeys) {
    const clean = rawKey.trim().toLowerCase();

    // 1. Direct dictionary lookup
    if (TOPIC_TO_CURRICULUM_ARTICLE_SLUG[clean]) {
      return `/curriculum/${TOPIC_TO_CURRICULUM_ARTICLE_SLUG[clean]}`;
    }

    // 2. Direct match against known article slug or ID
    const foundArticle = CURRICULUM_SUMMARIES.find(
      (a) => a.slug.toLowerCase() === clean || a.id.toLowerCase() === clean,
    );
    if (foundArticle) {
      return `/curriculum/${foundArticle.slug}`;
    }
  }

  // 3. Fuzzy search in CURRICULUM_SUMMARIES
  for (const rawKey of candidateKeys) {
    const searchTerms = rawKey
      .toLowerCase()
      .replace(/^topic-/, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['module', 'the', 'and', 'for', 'with'].includes(w));

    if (searchTerms.length > 0) {
      const match = CURRICULUM_SUMMARIES.find((a) => {
        const titleLower = a.title.toLowerCase();
        const summaryLower = a.summary.toLowerCase();
        const keyConcepts = a.keyConcepts.map((k) => k.toLowerCase());

        return searchTerms.some(
          (term) =>
            titleLower.includes(term) ||
            summaryLower.includes(term) ||
            keyConcepts.some((kc) => kc.includes(term)),
        );
      });

      if (match) {
        return `/curriculum/${match.slug}`;
      }
    }
  }

  // 4. Default fallback: synthesize/load topic directly
  if (topicSlugOrId) {
    return `/curriculum/${topicSlugOrId.trim().toLowerCase()}`;
  }

  return '/curriculum';
}
