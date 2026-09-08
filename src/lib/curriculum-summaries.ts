/**
 * Lightweight Curriculum Summaries and Metadata Catalog
 *
 * Provides domain metadata and article summary descriptors without bundling
 * full-text multi-section theory, code snippets, or practice MCQs.
 * Used by list views (/curriculum, /roles/[slug]) to maintain optimal first-load JS.
 */

export interface CurriculumDomain {
  slug: string;
  name: string;
  description: string;
  icon: string;
  articlesCount: number;
}

export interface CurriculumArticleSummary {
  id: string;
  slug: string;
  domainSlug: string;
  domainName: string;
  title: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  readTimeMinutes: number;
  summary: string;
  keyConcepts: string[];
  relatedRoleSlugs: string[];
  sandboxChallengeId?: string;
  practiceMcqsCount?: number;
}

export const CURRICULUM_DOMAINS: CurriculumDomain[] = [
  {
    "slug": "data-structures-algorithms",
    "name": "Data Structures & Algorithms",
    "description": "Master asymptotic complexity, linear structures, binary search trees, graph traversals, and dynamic programming.",
    "icon": "⚡",
    "articlesCount": 8
  },
  {
    "slug": "system-design-architecture",
    "name": "System Design & Software Architecture",
    "description": "Low-level object-oriented design patterns, SOLID principles, concurrency models, and scalable distributed systems.",
    "icon": "🏛️",
    "articlesCount": 4
  },
  {
    "slug": "operating-systems-internals",
    "name": "Operating Systems & Systems Programming",
    "description": "Kernel architectures, process scheduling, virtual memory, paging algorithms, deadlocks, and Linux cgroups.",
    "icon": "💻",
    "articlesCount": 4
  },
  {
    "slug": "computer-networks-protocols",
    "name": "Computer Networks & Communications",
    "description": "OSI/TCP-IP models, TCP congestion control, UDP/QUIC, DNS hierarchies, TLS 1.3, and modern HTTP/3.",
    "icon": "🌐",
    "articlesCount": 3
  },
  {
    "slug": "database-storage-engines",
    "name": "Database Management Systems & Storage",
    "description": "Relational algebra, B+ Trees vs LSM Trees, ACID transactions, MVCC concurrency, and query plan optimization.",
    "icon": "🗄️",
    "articlesCount": 2
  },
  {
    "slug": "cloud-infrastructure-architecture",
    "name": "Cloud Computing & Enterprise Infrastructure",
    "description": "VPC network topologies, serverless event-driven compute, IAM least privilege, and disaster recovery strategies.",
    "icon": "☁️",
    "articlesCount": 2
  },
  {
    "slug": "devops-sre-kubernetes",
    "name": "DevOps, SRE & Container Orchestration",
    "description": "Docker multi-stage builds, Kubernetes pod scheduling and services, Helm templating, and observability SLI/SLO.",
    "icon": "🚀",
    "articlesCount": 2
  },
  {
    "slug": "fullstack-web-engineering",
    "name": "Full-Stack Web Engineering & Modern APIs",
    "description": "Browser rendering engine, JavaScript Event Loop, React Fiber reconciliation, Next.js RSC, and REST/GraphQL/gRPC.",
    "icon": "🌐",
    "articlesCount": 2
  },
  {
    "slug": "machine-learning-ai-systems",
    "name": "Machine Learning, AI & LLM Systems",
    "description": "Transformers, multi-head attention, fine-tuning with LoRA, Retrieval-Augmented Generation (RAG), and MLOps.",
    "icon": "🤖",
    "articlesCount": 2
  },
  {
    "slug": "data-engineering-pipelines",
    "name": "Data Engineering & Streaming Pipelines",
    "description": "Apache Spark DAG execution, Kafka event streaming, Lakehouse ACID architectures, and Airflow orchestration.",
    "icon": "📊",
    "articlesCount": 2
  },
  {
    "slug": "cybersecurity-cryptography",
    "name": "Cybersecurity, AppSec & Cryptography",
    "description": "OWASP Top 10 vulnerabilities, asymmetric cryptography, PKI, OAuth 2.0 with PKCE, and Zero-Trust network models.",
    "icon": "🛡️",
    "articlesCount": 2
  },
  {
    "slug": "qa-test-automation-engineering",
    "name": "QA Automation & Software Test Engineering",
    "description": "The Test Automation Pyramid, Test-Driven Development (TDD), Playwright CDP architecture, and k6 load testing.",
    "icon": "🧪",
    "articlesCount": 2
  },
  {
    "slug": "quantitative-aptitude-numerical-logic",
    "name": "Quantitative Aptitude & Numerical Logic",
    "description": "Number theory, percentage scaling, time and work mechanics, probability distributions, and speed-time equations.",
    "icon": "📐",
    "articlesCount": 3
  },
  {
    "slug": "logical-reasoning-deduction",
    "name": "Logical Reasoning & Analytical Deduction",
    "description": "Categorical syllogisms, blood relation graphs, circular seating arrangements, and pattern decoding.",
    "icon": "🧩",
    "articlesCount": 2
  }
];

export const CURRICULUM_SUMMARIES: CurriculumArticleSummary[] = [
  {
    "id": "art-dsa-trees",
    "slug": "binary-search-trees-and-avl-balancing",
    "domainSlug": "data-structures-algorithms",
    "domainName": "Data Structures & Algorithms",
    "title": "Binary Search Trees & AVL Self-Balancing Mechanics",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 14,
    "summary": "A deep dive into Binary Search Trees (BST) properties, degenerated tree failure modes, and self-balancing rotations in AVL Trees to maintain strict O(log N) operations.",
    "keyConcepts": [
      "BST Invariants",
      "Tree Rotations (LL, RR, LR, RL)",
      "Balance Factor",
      "Height-Balanced Proof"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "fullstack-javascript-developer"
    ],
    "practiceMcqsCount": 2,
    "sandboxChallengeId": "code-two-sum"
  },
  {
    "id": "art-dsa-dp",
    "slug": "dynamic-programming-memoization-tabulation",
    "domainSlug": "data-structures-algorithms",
    "domainName": "Data Structures & Algorithms",
    "title": "Dynamic Programming: Optimal Substructure & Overlapping Subproblems",
    "level": "ADVANCED",
    "readTimeMinutes": 16,
    "summary": "Deconstructing Dynamic Programming from top-down recursive memoization to bottom-up state tabulation and space-optimization techniques.",
    "keyConcepts": [
      "Optimal Substructure",
      "Overlapping Subproblems",
      "Memoization Cache",
      "Tabulation Array",
      "Space Compression"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "ml-ai-engineer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-lld-solid",
    "slug": "solid-principles-and-gof-patterns",
    "domainSlug": "system-design-architecture",
    "domainName": "System Design & Architecture",
    "title": "SOLID Principles & GoF Design Patterns in Enterprise Systems",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 15,
    "summary": "Master the 5 SOLID object-oriented design principles and core Gang of Four (GoF) behavioral, structural, and creational patterns with TypeScript implementations.",
    "keyConcepts": [
      "Single Responsibility",
      "Open/Closed",
      "Liskov Substitution",
      "Interface Segregation",
      "Dependency Inversion",
      "Factory",
      "Strategy",
      "Observer"
    ],
    "relatedRoleSlugs": [
      "fullstack-javascript-developer",
      "backend-systems-engineer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-os-memory",
    "slug": "virtual-memory-paging-and-page-replacement",
    "domainSlug": "operating-systems-internals",
    "domainName": "Operating Systems & Systems Programming",
    "title": "Virtual Memory, Multi-Level Paging & Page Replacement Algorithms",
    "level": "ADVANCED",
    "readTimeMinutes": 15,
    "summary": "Understand the hardware-software boundary: Translation Lookaside Buffers (TLB), multi-level page tables, page faults, and LRU vs Clock page replacement.",
    "keyConcepts": [
      "Page Table Entry (PTE)",
      "TLB Hit/Miss",
      "Page Fault Handler",
      "LRU vs Belady Anomaly",
      "Thrashing"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "devops-engineer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-net-tcp",
    "slug": "tcp-congestion-control-and-http3-quic",
    "domainSlug": "computer-networks-protocols",
    "domainName": "Computer Networks & Communications",
    "title": "TCP Congestion Control & The Paradigm Shift to HTTP/3 QUIC",
    "level": "ADVANCED",
    "readTimeMinutes": 16,
    "summary": "Analyze Slow Start, Congestion Avoidance, Fast Retransmit, TCP head-of-line blocking, and how UDP-based QUIC and HTTP/3 revolutionize web transport.",
    "keyConcepts": [
      "TCP 3-Way Handshake",
      "Congestion Window (cwnd)",
      "AIMD",
      "Head-of-Line Blocking",
      "QUIC UDP Transport",
      "0-RTT Handshake"
    ],
    "relatedRoleSlugs": [
      "fullstack-javascript-developer",
      "backend-systems-engineer",
      "cloud-architect"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-db-bplus",
    "slug": "b-plus-trees-and-storage-engine-internals",
    "domainSlug": "database-storage-engines",
    "domainName": "Database Management Systems & Storage",
    "title": "B+ Tree Indexing & Relational Storage Engine Internals",
    "level": "ADVANCED",
    "readTimeMinutes": 15,
    "summary": "Explore page layouts, slotted pages, B+ Tree node splitting and merging, write-ahead logging (WAL), and MVCC transaction isolation.",
    "keyConcepts": [
      "Slotted Page Architecture",
      "B+ Tree Branching Factor",
      "Covering Index",
      "Write-Ahead Logging (WAL)",
      "MVCC Read View"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "data-analyst",
      "data-engineer"
    ],
    "practiceMcqsCount": 1,
    "sandboxChallengeId": "sql-top-earner"
  },
  {
    "id": "art-cloud-vpc",
    "slug": "cloud-vpc-networking-and-iam-security",
    "domainSlug": "cloud-infrastructure-architecture",
    "domainName": "Cloud Computing & Enterprise Infrastructure",
    "title": "Enterprise VPC Topologies & IAM Least-Privilege Architecture",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 14,
    "summary": "Design multi-AZ secure VPC architectures with public and private subnets, NAT gateways, Network Access Control Lists (NACLs), Security Groups, and least-privilege IAM policies.",
    "keyConcepts": [
      "VPC CIDR",
      "Public vs Private Subnet",
      "NAT Gateway",
      "Security Groups (Stateful) vs NACL (Stateless)",
      "IAM ABAC & RBAC"
    ],
    "relatedRoleSlugs": [
      "aws-cloud-engineer",
      "azure-cloud-engineer",
      "cybersecurity-specialist"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-devops-k8s",
    "slug": "docker-multi-stage-builds-and-kubernetes-scheduling",
    "domainSlug": "devops-sre-kubernetes",
    "domainName": "DevOps, SRE & Container Orchestration",
    "title": "Production Docker Multi-Stage Builds & Kubernetes Pod Scheduling",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 15,
    "summary": "Eliminate container bloat with multi-stage Dockerfiles, understand PID 1 signal propagation, and dissect the Kubernetes kube-scheduler filtering and scoring cycle.",
    "keyConcepts": [
      "Multi-Stage Dockerfiles",
      "Distroless Images",
      "PID 1 Zombie Reaping",
      "kube-scheduler Predicates & Priorities",
      "Pod Anti-Affinity"
    ],
    "relatedRoleSlugs": [
      "devops-engineer",
      "cloud-architect",
      "backend-systems-engineer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-fullstack-fiber",
    "slug": "javascript-event-loop-and-react-fiber-reconciliation",
    "domainSlug": "fullstack-web-engineering",
    "domainName": "Full-Stack Web Engineering & Modern APIs",
    "title": "The V8 Event Loop & React Fiber Concurrent Reconciliation",
    "level": "ADVANCED",
    "readTimeMinutes": 16,
    "summary": "A deep dive into microtasks vs macrotasks in the JavaScript runtime, and how React Fiber transformed synchronous recursive diffing into interruptible work units.",
    "keyConcepts": [
      "Call Stack",
      "Microtask Queue",
      "Macrotask Queue",
      "React Fiber Tree",
      "Time Slicing",
      "Concurrent Mode"
    ],
    "relatedRoleSlugs": [
      "fullstack-javascript-developer",
      "qa-automation-engineer"
    ],
    "practiceMcqsCount": 1,
    "sandboxChallengeId": "code-longest-substr"
  },
  {
    "id": "art-ml-rag",
    "slug": "transformers-self-attention-and-rag-pipelines",
    "domainSlug": "machine-learning-ai-systems",
    "domainName": "Machine Learning, AI & LLM Systems",
    "title": "Transformers, Scaled Dot-Product Attention & Production RAG Pipelines",
    "level": "ADVANCED",
    "readTimeMinutes": 17,
    "summary": "Deconstruct Query, Key, Value attention matrices, vector embeddings, cosine similarity metrics, and chunking strategies in enterprise RAG systems.",
    "keyConcepts": [
      "Scaled Dot-Product Attention",
      "Multi-Head Attention",
      "Dense Vector Embeddings",
      "Cosine Similarity",
      "RAG Retrieval vs Generation"
    ],
    "relatedRoleSlugs": [
      "ml-ai-engineer",
      "data-engineer",
      "python-developer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-sec-owasp",
    "slug": "owasp-top-10-and-asymmetric-cryptography",
    "domainSlug": "cybersecurity-cryptography",
    "domainName": "Cybersecurity, AppSec & Cryptography",
    "title": "OWASP Top 10 Web Vulnerabilities & Cryptographic Key Exchanges",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 15,
    "summary": "Analyze Broken Object Level Authorization (BOLA), SQL Injection, Cross-Site Scripting (XSS), RSA vs Elliptic Curve cryptography, and Diffie-Hellman forward secrecy.",
    "keyConcepts": [
      "BOLA / IDOR",
      "Stored vs Reflected XSS",
      "Content Security Policy (CSP)",
      "RSA vs ECC (Ed25519)",
      "Perfect Forward Secrecy (PFS)"
    ],
    "relatedRoleSlugs": [
      "cybersecurity-specialist",
      "backend-systems-engineer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-quant-logic",
    "slug": "quantitative-aptitude-speed-work-and-probability",
    "domainSlug": "quantitative-aptitude-numerical-logic",
    "domainName": "Quantitative Aptitude & Numerical Logic",
    "title": "Quantitative Aptitude: Work Rate Mechanics, Relative Speed & Bayes Theorem",
    "level": "BEGINNER",
    "readTimeMinutes": 14,
    "summary": "Master the unitary method for work rates, relative speed equations for opposing and parallel motion, and conditional probability with Bayes Theorem.",
    "keyConcepts": [
      "Unitary Work Rate",
      "Pipes and Cisterns",
      "Relative Speed",
      "Independent Events",
      "Bayes Theorem"
    ],
    "relatedRoleSlugs": [
      "data-analyst",
      "python-developer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-de-kafka",
    "slug": "apache-kafka-internals-and-stream-processing",
    "domainSlug": "data-engineering-pipelines",
    "domainName": "Data Engineering & Streaming Pipelines",
    "title": "Distributed Log Storage Internals: Kafka Partitions, Rebalance & Exactly-Once Semantics",
    "level": "ADVANCED",
    "readTimeMinutes": 18,
    "summary": "Master distributed append-only commit logs, In-Sync Replicas (ISR), consumer group rebalance protocols, and Exactly-Once Semantics (EOS) with transactional producers.",
    "keyConcepts": [
      "Append-Only Commit Log",
      "Zero-Copy (sendfile)",
      "In-Sync Replicas (ISR)",
      "Consumer Group Protocol",
      "Exactly-Once Semantics (EOS)"
    ],
    "relatedRoleSlugs": [
      "data-engineer",
      "backend-systems-engineer"
    ],
    "practiceMcqsCount": 2
  },
  {
    "id": "art-qa-playwright",
    "slug": "test-automation-pyramid-and-playwright-architecture",
    "domainSlug": "qa-test-automation-engineering",
    "domainName": "QA Automation & Software Test Engineering",
    "title": "The Test Automation Pyramid & Modern CDP Browser Orchestration",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 15,
    "summary": "Explore the mathematical distribution of the Test Automation Pyramid, Chrome DevTools Protocol (CDP) WebSocket orchestration, and auto-waiting resilience against UI test flakiness.",
    "keyConcepts": [
      "Test Pyramid Economics",
      "CDP vs WebDriver Architecture",
      "Auto-Waiting Locators",
      "Hermetic Test Isolation",
      "Network Route Mocking"
    ],
    "relatedRoleSlugs": [
      "qa-automation-engineer",
      "fullstack-javascript-developer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-logic-syllogisms",
    "slug": "categorical-syllogisms-and-deductive-logic",
    "domainSlug": "logical-reasoning-deduction",
    "domainName": "Logical Reasoning & Analytical Deduction",
    "title": "Formal Deductive Logic: Categorical Syllogisms & Venn Diagram Proofs",
    "level": "BEGINNER",
    "readTimeMinutes": 12,
    "summary": "Deconstruct formal deductive syllogisms, term distribution rules, mood and figure classifications, and Venn diagrammatic proofs for campus technical assessments.",
    "keyConcepts": [
      "Categorical Propositions (A, E, I, O)",
      "Term Distribution",
      "Middle Term Fallacy",
      "Venn Diagram Modeling"
    ],
    "relatedRoleSlugs": [
      "python-developer",
      "data-analyst"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-sys-consensus",
    "slug": "distributed-consensus-raft-and-paxos",
    "domainSlug": "system-design-architecture",
    "domainName": "System Design & Software Architecture",
    "title": "Distributed Consensus: Raft Protocol State Machines & Majority Quorums",
    "level": "ADVANCED",
    "readTimeMinutes": 20,
    "summary": "Deconstruct how distributed systems achieve fault-tolerant state machine replication through Raft leader election, randomized election timers, log matching invariants, and majority quorum proofs.",
    "keyConcepts": [
      "State Machine Replication (SMR)",
      "Majority Quorum (N/2 + 1)",
      "Randomized Heartbeat Timers",
      "Raft Log Matching Property",
      "Joint Consensus Reconfiguration"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "devops-engineer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-db-mvcc",
    "slug": "acid-transactions-mvcc-and-isolation-anomalies",
    "domainSlug": "database-storage-engines",
    "domainName": "Database Management Systems & Storage",
    "title": "ACID Internals: MVCC Read Views, WAL ARIES & Concurrency Anomalies",
    "level": "ADVANCED",
    "readTimeMinutes": 19,
    "summary": "Explore Multi-Version Concurrency Control (MVCC) row versioning, Write-Ahead Logging (WAL) durability, and isolation anomalies from Dirty Reads to Write Skew.",
    "keyConcepts": [
      "Write-Ahead Logging (WAL)",
      "MVCC Visibility Rules",
      "Non-Repeatable Read vs Phantom Read",
      "Write Skew Phenomenon",
      "Snapshot Isolation vs Serializable"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "data-analyst"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-dsa-graphs",
    "slug": "graph-algorithms-dijkstra-and-topological-sort",
    "domainSlug": "data-structures-algorithms",
    "domainName": "Data Structures & Algorithms",
    "title": "Graph Theory Internals: Dijkstra Shortest Path, Kahn Topological Sort & Cycle Invariants",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 16,
    "summary": "Master single-source shortest path relaxation with min-heaps, directed acyclic graph (DAG) topological ordering via Kahn’s in-degree queue, and cycle detection state machines.",
    "keyConcepts": [
      "Edge Relaxation Invariant",
      "Dijkstra with Priority Queue O((V + E) log V)",
      "Kahn In-Degree Queue",
      "Cycle Detection via 3-State DFS",
      "Negative Weight Edge Failure Mode"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "python-developer"
    ],
    "practiceMcqsCount": 2
  },
  {
    "id": "art-sys-ratelimit",
    "slug": "rate-limiting-algorithms-and-distributed-caching",
    "domainSlug": "system-design-architecture",
    "domainName": "System Design & Software Architecture",
    "title": "High-Throughput Rate Limiting: Token Bucket, Sliding Window & Distributed Cache Topologies",
    "level": "ADVANCED",
    "readTimeMinutes": 18,
    "summary": "Deconstruct Token Bucket, Leaky Bucket, Sliding Window Counter algorithms, Redis cluster hash slot sharding, and Cache Stampede mitigation via XFetch probabilistic early expiration.",
    "keyConcepts": [
      "Token Bucket Refill Math",
      "Sliding Window Counter",
      "Cache-Aside vs Write-Through",
      "Cache Stampede / Thundering Herd",
      "XFetch Probabilistic Early Expiration"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "cloud-architect"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-sys-concurrency",
    "slug": "java-virtual-threads-and-concurrency-models",
    "domainSlug": "system-design-architecture",
    "domainName": "System Design & Software Architecture",
    "title": "Modern Concurrency: Java Virtual Threads, Continuation Passing & Lock-Free Atomic Memory",
    "level": "ADVANCED",
    "readTimeMinutes": 17,
    "summary": "Deconstruct Project Loom virtual threads, carrier thread scheduling, continuation unmounting, thread pinning hazards, and lock-free Compare-And-Swap (CAS) data structures.",
    "keyConcepts": [
      "Platform vs Virtual Threads (M:N)",
      "Carrier Thread Mounting",
      "Thread Pinning Hazard",
      "Compare-And-Swap (CAS)",
      "Memory Barriers & Volatile"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "java-backend-developer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-net-tls",
    "slug": "tls-13-handshake-and-cryptographic-security",
    "domainSlug": "computer-networks-protocols",
    "domainName": "Computer Networks & Communications",
    "title": "Network Security: TLS 1.3 1-RTT Handshake, Ephemeral Diffie-Hellman & Forward Secrecy",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 15,
    "summary": "Master the TLS 1.3 1-RTT handshake protocol, Ephemeral Elliptic Curve Diffie-Hellman (ECDHE), Perfect Forward Secrecy, and 0-RTT replay attack mitigations.",
    "keyConcepts": [
      "1-RTT Handshake Optimization",
      "Ephemeral Diffie-Hellman (ECDHE)",
      "Perfect Forward Secrecy (PFS)",
      "Authenticated Encryption with Associated Data (AEAD)",
      "0-RTT Anti-Replay"
    ],
    "relatedRoleSlugs": [
      "cybersecurity-specialist",
      "cloud-architect"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-sys-compiler",
    "slug": "compiler-design-ast-and-jit-compilation",
    "domainSlug": "operating-systems-internals",
    "domainName": "Operating Systems & Systems Programming",
    "title": "Language Runtime Internals: Lexical Analysis, AST Generation & JIT Tiered Compilation",
    "level": "ADVANCED",
    "readTimeMinutes": 18,
    "summary": "Deconstruct language processing pipelines from tokenization and recursive descent AST parsing to bytecode interpretation and multi-tiered JIT dynamic optimization.",
    "keyConcepts": [
      "Lexical Tokenization",
      "Abstract Syntax Tree (AST)",
      "Recursive Descent Parsing",
      "JIT Tiered Compilation (Baseline vs Optimizing)",
      "De-optimization Bailout"
    ],
    "relatedRoleSlugs": [
      "fullstack-javascript-developer",
      "backend-systems-engineer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-quant-number-theory",
    "slug": "number-theory-modular-arithmetic",
    "domainSlug": "quantitative-aptitude-numerical-logic",
    "domainName": "Quantitative Aptitude & Numerical Logic",
    "title": "Number Theory, Modular Arithmetic & Cryptographic Primes",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 14,
    "summary": "Master the mathematical foundations of modular arithmetic, Euclidean algorithms for greatest common divisor, Bézout’s identity, modular multiplicative inverse, and the Chinese Remainder Theorem.",
    "keyConcepts": [
      "Euclidean Algorithm for GCD",
      "Extended Euclidean Algorithm & Bézout Identity",
      "Modular Multiplicative Inverse",
      "Fermat’s Little Theorem",
      "Chinese Remainder Theorem (CRT)",
      "Fast Modular Exponentiation"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "cybersecurity-analyst"
    ],
    "practiceMcqsCount": 2
  },
  {
    "id": "art-quant-combinatorics",
    "slug": "combinatorics-probability-distributions",
    "domainSlug": "quantitative-aptitude-numerical-logic",
    "domainName": "Quantitative Aptitude & Numerical Logic",
    "title": "Combinatorics, Permutations & Probability Distributions",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 15,
    "summary": "Master combinatorial counting principles, permutations vs combinations, the Pigeonhole Principle, Inclusion-Exclusion, conditional probability, and Bayes’ theorem.",
    "keyConcepts": [
      "Fundamental Counting Principle",
      "Permutations vs Combinations (nPr vs nCr)",
      "Dirichlet Pigeonhole Principle",
      "Inclusion-Exclusion Principle",
      "Bayes’ Theorem & Posterior Probability",
      "Binomial Distribution Mechanics"
    ],
    "relatedRoleSlugs": [
      "data-analytics-engineer",
      "machine-learning-engineer"
    ],
    "practiceMcqsCount": 2
  },
  {
    "id": "art-logic-constraint-graphs",
    "slug": "constraint-satisfaction-networks",
    "domainSlug": "logical-reasoning-deduction",
    "domainName": "Logical Reasoning & Analytical Deduction",
    "title": "Constraint Satisfaction Networks & Graph-Based Deductions",
    "level": "ADVANCED",
    "readTimeMinutes": 16,
    "summary": "Explore constraint propagation networks, arc consistency (AC-3), 2-Satisfiability reduced to strongly connected components, topological ordering, and bipartite matching.",
    "keyConcepts": [
      "Constraint Satisfaction Problems (CSP)",
      "AC-3 Arc Consistency Algorithm",
      "2-SAT & Implication Graphs",
      "Strongly Connected Components (Kosaraju / Tarjan)",
      "Topological Dependency Ordering (Kahn’s Algorithm)",
      "Maximum Bipartite Matching (Hopcroft-Karp)"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "data-analytics-engineer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-cloud-kernel-primitives",
    "slug": "linux-kernel-cgroups-container-primitives",
    "domainSlug": "cloud-infrastructure-architecture",
    "domainName": "Cloud Computing & Enterprise Infrastructure",
    "title": "Linux Kernel Subsystems, Cgroups v2 & Container Isolation Primitives",
    "level": "ADVANCED",
    "readTimeMinutes": 18,
    "summary": "Deconstruct the Linux kernel subsystems powering containers: namespaces, cgroups v2 resource accounting, seccomp syscall filtering, and pivot_root virtual file hierarchies.",
    "keyConcepts": [
      "Containers vs Virtual Machines",
      "Linux Kernel Namespaces (PID, NET, MNT, IPC, UTS, USER)",
      "Cgroups v2 Unified Hierarchy",
      "OOM Killer & memory.max / memory.high",
      "Syscall Filtering via seccomp-bpf",
      "OverlayFS Storage Driver Mechanics"
    ],
    "relatedRoleSlugs": [
      "devops-engineer",
      "cloud-solutions-architect"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-de-columnar-storage",
    "slug": "columnar-storage-parquet-arrow",
    "domainSlug": "data-engineering-pipelines",
    "domainName": "Data Engineering & Streaming Pipelines",
    "title": "Vectorized Memory & Columnar Storage Engines (Parquet & Arrow)",
    "level": "ADVANCED",
    "readTimeMinutes": 17,
    "summary": "Compare row-oriented OLTP vs columnar OLAP formats, explore Apache Parquet physical layout, run-length and dictionary encodings, Apache Arrow in-memory zero-copy IPC, and SIMD CPU vectorization.",
    "keyConcepts": [
      "Row-Oriented (OLTP) vs Column-Oriented (OLAP)",
      "Apache Parquet Physical Structure (Row Groups & Pages)",
      "Dictionary Encoding & Run-Length Encoding (RLE)",
      "Predicate Pushdown & Min/Max Statistics",
      "Apache Arrow In-Memory Columnar Layout",
      "SIMD Vectorized Query Processing"
    ],
    "relatedRoleSlugs": [
      "data-engineer",
      "data-analytics-engineer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-ml-attention-kvcache",
    "slug": "attention-mechanisms-kv-caching",
    "domainSlug": "machine-learning-ai-systems",
    "domainName": "Machine Learning, AI & LLM Systems",
    "title": "Attention Mechanisms, KV-Caching & Transformer Inference Dynamics",
    "level": "ADVANCED",
    "readTimeMinutes": 19,
    "summary": "Master the mathematical mechanics of Scaled Dot-Product Attention, Multi-Head projections, the quadratic computational bottleneck, Key-Value (KV) caching, and PagedAttention memory management.",
    "keyConcepts": [
      "Scaled Dot-Product Attention Formulation",
      "Multi-Head Attention (MHA) Projections",
      "The Quadratic Computational Bottleneck O(N²)",
      "Key-Value (KV) Caching in Autoregressive Generation",
      "Multi-Query (MQA) & Grouped-Query Attention (GQA)",
      "PagedAttention & Virtual Memory VRAM Paging"
    ],
    "relatedRoleSlugs": [
      "machine-learning-engineer",
      "data-engineer"
    ],
    "practiceMcqsCount": 1
  },
  {
    "id": "art-devops-cni-ingress",
    "slug": "kubernetes-networking-cni-and-ingress-controllers",
    "domainSlug": "devops-sre-kubernetes",
    "domainName": "DevOps, SRE & Container Orchestration",
    "title": "Kubernetes CNI Networking, CoreDNS Resolution & Ingress Routing",
    "level": "ADVANCED",
    "readTimeMinutes": 16,
    "summary": "A deep dive into the Kubernetes IP-per-Pod networking model, Container Network Interface (CNI) overlay vs eBPF implementations, CoreDNS FQDN resolution pipelines, kube-proxy iptables/IPVS service discovery, and Ingress Controller reverse-proxy routing.",
    "keyConcepts": [
      "IP-per-Pod Invariant",
      "CNI Plugins (Calico VXLAN vs Cilium eBPF)",
      "CoreDNS FQDN Search Path",
      "kube-proxy (iptables vs IPVS)",
      "Ingress Controller SNI Routing",
      "Default-Deny NetworkPolicy"
    ],
    "relatedRoleSlugs": [
      "devops-engineer",
      "cloud-infrastructure-architect",
      "backend-systems-engineer"
    ],
    "practiceMcqsCount": 2
  },
  {
    "id": "art-fullstack-rsc-streaming",
    "slug": "react-server-components-streaming-ssr-and-hydration",
    "domainSlug": "fullstack-web-engineering",
    "domainName": "Full-Stack Web Engineering & Modern APIs",
    "title": "React Server Components (RSC), Streaming SSR & Selective Hydration",
    "level": "ADVANCED",
    "readTimeMinutes": 16,
    "summary": "Dissect the architecture of React Server Components (RSC), the streaming wire protocol, zero-bundle-size server execution, progressive streaming with React Suspense, and Selective Hydration mechanics.",
    "keyConcepts": [
      "RSC vs SSR Distinction",
      "RSC Wire Format Stream",
      "Zero-Bundle Size Invariant",
      "Streaming HTML (renderToPipeableStream)",
      "Selective Hydration",
      "Server/Client Boundary Serialization"
    ],
    "relatedRoleSlugs": [
      "fullstack-javascript-developer",
      "frontend-developer",
      "backend-systems-engineer"
    ],
    "practiceMcqsCount": 2
  },
  {
    "id": "art-sec-pki-oauth",
    "slug": "public-key-infrastructure-tls-handshake-and-oauth-pkce",
    "domainSlug": "cybersecurity-cryptography",
    "domainName": "Cybersecurity, AppSec & Cryptography",
    "title": "Public Key Infrastructure (PKI), TLS 1.3 Cryptographic Handshake & OAuth 2.0 PKCE",
    "level": "ADVANCED",
    "readTimeMinutes": 15,
    "summary": "Examine X.509 certificate chains, OCSP Stapling, the TLS 1.3 1-RTT handshake protocol with Ephemeral Diffie-Hellman Key Exchange (ECDHE), Perfect Forward Secrecy, and the OAuth 2.0 Authorization Code Flow with PKCE.",
    "keyConcepts": [
      "Root & Intermediate Certificate Authorities",
      "OCSP Stapling vs CRL",
      "TLS 1.3 1-RTT Handshake Protocol",
      "ECDHE & Perfect Forward Secrecy (PFS)",
      "OAuth 2.0 Authorization Code Flow",
      "PKCE (code_verifier vs code_challenge)"
    ],
    "relatedRoleSlugs": [
      "cybersecurity-specialist",
      "backend-systems-engineer",
      "cloud-infrastructure-architect"
    ],
    "practiceMcqsCount": 2
  },
  {
    "id": "art-qa-contract-testing",
    "slug": "contract-testing-pact-and-distributed-system-mocking",
    "domainSlug": "qa-test-automation-engineering",
    "domainName": "QA Automation & Software Test Engineering",
    "title": "Consumer-Driven Contract Testing with Pact & Distributed System Mocking",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 14,
    "summary": "Master Consumer-Driven Contract Testing (CDCT) using the Pact protocol, eliminate brittle staging environment end-to-end gridlock, and design hermetic microservice mocking strategies.",
    "keyConcepts": [
      "Consumer-Driven Contract Testing (CDCT)",
      "Pact Specification Protocol",
      "Pact Broker & can-i-deploy Matrix",
      "Provider State Handlers",
      "Hermetic Service Virtualization"
    ],
    "relatedRoleSlugs": [
      "qa-automation-engineer",
      "backend-systems-engineer",
      "fullstack-javascript-developer"
    ],
    "practiceMcqsCount": 2
  }
,
  {
    "id": "art-dsa-dsu-mst",
    "slug": "disjoint-set-union-and-minimum-spanning-trees",
    "domainSlug": "data-structures-algorithms",
    "domainName": "Data Structures & Algorithms",
    "title": "Disjoint Set Union (DSU) & Minimum Spanning Trees (Kruskal & Prim)",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 18,
    "summary": "Comprehensive mastery of Disjoint Set Union (DSU) with Union-by-Rank and Path Compression achieving near-constant O(alpha(N)) amortized time, alongside Kruskal's and Prim's Minimum Spanning Tree algorithms.",
    "keyConcepts": [
      "Union-by-Rank & Path Compression",
      "Inverse Ackermann Function O(alpha(N))",
      "Kruskal's Greedy MST with Edge Sorting",
      "Prim's Cut Property with Priority Queues",
      "Dynamic Cycle Detection"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "data-engineer",
      "python-developer"
    ],
    "practiceMcqsCount": 5,
    "sandboxChallengeId": "code-two-sum"
  },
  {
    "id": "art-dsa-kmp-rabin",
    "slug": "string-matching-kmp-and-rabin-karp",
    "domainSlug": "data-structures-algorithms",
    "domainName": "Data Structures & Algorithms",
    "title": "String Matching Automata: Knuth-Morris-Pratt (KMP) & Rabin-Karp Rolling Hash",
    "level": "ADVANCED",
    "readTimeMinutes": 20,
    "summary": "Eliminate wasteful backtracking in string search. Deep dive into the KMP Longest Proper Prefix which is also Suffix (LPS/pi table) automaton and the Rabin-Karp polynomial rolling hash technique with Horner's method.",
    "keyConcepts": [
      "KMP Prefix Function (pi-table / LPS)",
      "Finite State Deterministic Automata",
      "Rabin-Karp Rolling Polynomial Hash",
      "Modular Arithmetic & Spurious Collisions",
      "Linear O(N + M) Worst-Case Guarantees"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "fullstack-javascript-developer",
      "python-developer"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-dsa-segment-fenwick",
    "slug": "segment-trees-and-fenwick-trees",
    "domainSlug": "data-structures-algorithms",
    "domainName": "Data Structures & Algorithms",
    "title": "Advanced Range Queries: Segment Trees with Lazy Propagation & Fenwick Trees",
    "level": "ADVANCED",
    "readTimeMinutes": 22,
    "summary": "Solve static and dynamic range queries in O(log N) time. Discover Binary Indexed Trees (Fenwick Trees) using bit twiddling (x & -x), followed by full Segment Trees featuring Lazy Propagation for O(log N) range updates.",
    "keyConcepts": [
      "Fenwick Tree (Binary Indexed Tree)",
      "Bit Twiddling Lowbit (x & -x)",
      "Segment Tree Canonical Recursive Layout",
      "Lazy Propagation Postponed Updates",
      "Point Update vs Range Query Invariants"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "ml-ai-engineer",
      "data-engineer"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-dsa-adv-dp",
    "slug": "dynamic-programming-advanced-optimizations",
    "domainSlug": "data-structures-algorithms",
    "domainName": "Data Structures & Algorithms",
    "title": "Advanced Dynamic Programming: Bitmask State Compression & Convex Hull Optimization",
    "level": "ADVANCED",
    "readTimeMinutes": 24,
    "summary": "Take DP beyond standard memoization into bitmask state compression for NP-hard subset problems (like TSP in O(N^2 * 2^N)), and linear-time Convex Hull Trick (CHT) for eliminating nested loops in quadratic DP recurrences.",
    "keyConcepts": [
      "Bitmask State Compression (Subset DP)",
      "Traveling Salesperson Formulation",
      "Convex Hull Trick (CHT) Line Envelopes",
      "Monotonic Slope Optimization",
      "Subproblem DAG Topological Invariants"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "ml-ai-engineer",
      "python-developer"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-dsa-greedy-proofs",
    "slug": "greedy-algorithms-matroids-and-exchange-proofs",
    "domainSlug": "data-structures-algorithms",
    "domainName": "Data Structures & Algorithms",
    "title": "Greedy Choice Mechanics: Matroid Theory, Exchange Arguments & Huffman Coding",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 17,
    "summary": "Rigorous mathematical proofs for greedy paradigms: understand why greedy fails for 0/1 Knapsack but succeeds in Interval Scheduling and Huffman Prefix-Free Codes. Introduction to Matroid Theory and Rado-Edmonds theorem.",
    "keyConcepts": [
      "Greedy Choice Property & Optimal Substructure",
      "Proof by Exchange Argument",
      "Matroid Theory & Independent Sets",
      "Huffman Coding Entropy Optimality",
      "Interval Scheduling Greedy Sorting"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "data-engineer",
      "fullstack-javascript-developer"
    ],
    "practiceMcqsCount": 5
  }
,
  {
    "id": "art-os-concurrency-banker",
    "slug": "os-concurrency-deadlocks-and-bankers-algorithm",
    "domainSlug": "operating-systems-internals",
    "domainName": "Operating Systems & Systems Programming",
    "title": "Operating Systems Concurrency: Deadlocks, Coffman Conditions & Banker's Algorithm",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 19,
    "summary": "Master concurrency synchronization primitives, the 4 Coffman deadlock conditions, resource allocation graphs, Priority Inversion protocols, and Dijkstra's Banker's Algorithm for safe resource allocation.",
    "keyConcepts": [
      "Mutexes, Semaphores & Condition Variables",
      "Priority Inversion & Priority Inheritance",
      "4 Coffman Deadlock Conditions",
      "Resource Allocation Graphs (RAG)",
      "Banker's Algorithm Safe State Safety Vector"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "devops-engineer",
      "python-developer"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-db-transactions-mvcc",
    "slug": "relational-dbms-isolation-levels-and-anomalies",
    "domainSlug": "database-storage-engines",
    "domainName": "Database Storage Engines & Internals",
    "title": "Relational DBMS Transactions: ACID, ANSI Isolation Levels & Concurrency Anomalies",
    "level": "ADVANCED",
    "readTimeMinutes": 21,
    "summary": "Deconstruct transaction guarantees beyond high-level theory. Master ANSI isolation levels, modern snapshot isolation, write skew, lost updates, Strict 2-Phase Locking (S2PL), and Serializable Snapshot Isolation (SSI).",
    "keyConcepts": [
      "ACID Formal First-Principles",
      "ANSI SQL-92 Isolation Levels",
      "Concurrency Anomalies: Dirty, Non-Repeatable, Phantom, Write Skew",
      "Strict Two-Phase Locking (S2PL)",
      "Serializable Snapshot Isolation (SSI)"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "data-analyst",
      "data-engineer"
    ],
    "practiceMcqsCount": 5,
    "sandboxChallengeId": "sql-top-earner"
  },
  {
    "id": "art-net-tcp-transport",
    "slug": "tcp-transport-internals-handshake-and-flow-control",
    "domainSlug": "computer-networks-protocols",
    "domainName": "Computer Networks & Communications",
    "title": "Computer Networks: TCP Transport Internals, State Machine & Sliding Window Flow Control",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 20,
    "summary": "Demystify TCP transport layer internals: 3-way handshake, graceful teardown, TIME_WAIT socket exhaustion, SYN cookies flood mitigation, and receiver sliding window flow control vs congestion control.",
    "keyConcepts": [
      "TCP Segment Header Anatomy",
      "3-Way Handshake & Sequence Number Negotiation",
      "TIME_WAIT 2*MSL Rationale & Socket Reuse",
      "SYN Flood Mitigation with SYN Cookies",
      "Sliding Window Flow Control (rwnd vs cwnd)"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "cloud-architect",
      "devops-engineer"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-os-syscalls-ipc",
    "slug": "linux-kernel-syscalls-interrupts-and-ipc",
    "domainSlug": "operating-systems-internals",
    "domainName": "Operating Systems & Systems Programming",
    "title": "Linux Kernel Architecture: System Calls, Context Switches, Interrupts & IPC",
    "level": "ADVANCED",
    "readTimeMinutes": 22,
    "summary": "Journey from Ring 3 user space to Ring 0 kernel mode. Understand hardware context switching overhead, interrupt top-half vs bottom-half workqueues, and high-performance POSIX shared memory vs Unix domain sockets.",
    "keyConcepts": [
      "User-Kernel Transition (syscall / Ring 0)",
      "Context Switch CPU Overhead & TLB Invalidation",
      "Interrupt Top-Half vs Bottom-Half Workqueues",
      "Unix Domain Sockets vs Anonymous Pipes",
      "POSIX Shared Memory (shm_open & mmap)"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "devops-engineer",
      "cloud-architect"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-db-lsm-trees",
    "slug": "log-structured-merge-trees-and-storage-engines",
    "domainSlug": "database-storage-engines",
    "domainName": "Database Storage Engines & Internals",
    "title": "Distributed Storage Engines: LSM-Trees, Write-Ahead Logging (WAL) & Leveled Compaction",
    "level": "ADVANCED",
    "readTimeMinutes": 23,
    "summary": "Why modern distributed databases (Cassandra, RocksDB, Bigtable) abandon B+ Trees for write-heavy workloads. Master Log-Structured Merge-Trees, in-memory Memtables, Write-Ahead Logs, SSTables, Bloom filters, and leveled compaction.",
    "keyConcepts": [
      "Write Amplification & Random I/O Bottlenecks",
      "Append-Only Write-Ahead Log (WAL)",
      "In-Memory Memtable (Concurrent SkipList)",
      "Immutable SSTables & Block-Level Indexing",
      "Leveled Compaction & Bloom Filter Read Acceleration"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "data-engineer",
      "cloud-architect"
    ],
    "practiceMcqsCount": 5
  }
];
