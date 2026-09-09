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
    "articlesCount": 12
  },
  {
    "slug": "operating-systems-internals",
    "name": "Operating Systems & Systems Programming",
    "description": "Kernel architectures, process scheduling, virtual memory, paging algorithms, deadlocks, and Linux cgroups.",
    "icon": "💻",
    "articlesCount": 6
  },
  {
    "slug": "computer-networks-protocols",
    "name": "Computer Networks & Communications",
    "description": "OSI/TCP-IP models, TCP congestion control, UDP/QUIC, DNS hierarchies, TLS 1.3, and modern HTTP/3.",
    "icon": "🌐",
    "articlesCount": 4
  },
  {
    "slug": "database-storage-engines",
    "name": "Database Management Systems & Storage",
    "description": "Relational algebra, B+ Trees vs LSM Trees, ACID transactions, MVCC concurrency, and query plan optimization.",
    "icon": "🗄️",
    "articlesCount": 4
  },
  {
    "slug": "cloud-infrastructure-architecture",
    "name": "Cloud Computing & Enterprise Infrastructure",
    "description": "VPC network topologies, serverless event-driven compute, IAM least privilege, and disaster recovery strategies.",
    "icon": "☁️",
    "articlesCount": 5
  },
  {
    "slug": "devops-sre-kubernetes",
    "name": "DevOps, SRE & Container Orchestration",
    "description": "Docker multi-stage builds, Kubernetes pod scheduling and services, Helm templating, and observability SLI/SLO.",
    "icon": "🚀",
    "articlesCount": 7
  },
  {
    "slug": "fullstack-web-engineering",
    "name": "Full-Stack Web Engineering & Modern APIs",
    "description": "Browser rendering engine, JavaScript Event Loop, React Fiber reconciliation, Next.js RSC, and REST/GraphQL/gRPC.",
    "icon": "🌐",
    "articlesCount": 5
  },
  {
    "slug": "machine-learning-ai-systems",
    "name": "Machine Learning, AI & LLM Systems",
    "description": "Transformers, multi-head attention, fine-tuning with LoRA, Retrieval-Augmented Generation (RAG), and MLOps.",
    "icon": "🤖",
    "articlesCount": 5
  },
  {
    "slug": "data-engineering-pipelines",
    "name": "Data Engineering & Streaming Pipelines",
    "description": "Apache Spark DAG execution, Kafka event streaming, Lakehouse ACID architectures, and Airflow orchestration.",
    "icon": "📊",
    "articlesCount": 4
  },
  {
    "slug": "cybersecurity-cryptography",
    "name": "Cybersecurity, AppSec & Cryptography",
    "description": "OWASP Top 10 vulnerabilities, asymmetric cryptography, PKI, OAuth 2.0 with PKCE, and Zero-Trust network models.",
    "icon": "🛡️",
    "articlesCount": 3
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
,
  {
    "id": "art-sys-caching-redis",
    "slug": "distributed-caching-strategies-and-redis-cluster",
    "domainSlug": "system-design-architecture",
    "domainName": "System Design & Software Architecture",
    "title": "Distributed Caching: Patterns, Cache Stampedes & Redis Cluster Hash Slots",
    "level": "ADVANCED",
    "readTimeMinutes": 20,
    "summary": "Master enterprise caching topologies: Cache-Aside, Write-Through, Write-Behind, Probabilistic Early Expiration (XFetch algorithm) to prevent Cache Stampedes, and Redis Cluster 16,384 Hash Slot mechanics with zero-downtime resharding.",
    "keyConcepts": [
      "Cache-Aside vs Write-Through vs Write-Behind",
      "Cache Stampede & XFetch Probabilistic Expiry",
      "Cache Penetration (Bloom Filters) & Avalanche",
      "Redis Cluster 16,384 Hash Slots (CRC16 mod 16384)",
      "Hash Tags & Multi-Key Slot Locality"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "cloud-architect",
      "data-engineer"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-sys-event-driven-kafka",
    "slug": "event-driven-architectures-kafka-and-rabbitmq",
    "domainSlug": "system-design-architecture",
    "domainName": "System Design & Software Architecture",
    "title": "Event-Driven Architecture: Kafka Log Streaming vs RabbitMQ AMQP Queues",
    "level": "ADVANCED",
    "readTimeMinutes": 22,
    "summary": "Architecting resilient asynchronous systems: append-only immutable commit logs (Apache Kafka) versus smart-broker message queues (RabbitMQ), Exactly-Once Semantics (EOS), Transactional Outbox pattern, and Cooperative Sticky Rebalance.",
    "keyConcepts": [
      "Distributed Commit Log vs AMQP Message Queue",
      "At-Least-Once vs Exactly-Once Semantics (EOS)",
      "Transactional Outbox Pattern & Change Data Capture (CDC)",
      "Kafka Consumer Groups & Partition Assignment",
      "Cooperative Sticky Rebalance Protocol"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "data-engineer",
      "cloud-architect"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-sys-db-scaling-sharding",
    "slug": "database-scaling-replication-and-sharding",
    "domainSlug": "system-design-architecture",
    "domainName": "System Design & Software Architecture",
    "title": "Database Scaling: Asynchronous vs Semi-Sync Replication, Lag & Sharding",
    "level": "ADVANCED",
    "readTimeMinutes": 23,
    "summary": "Scale data persistence beyond single-node bottlenecks. Compare asynchronous vs semi-synchronous replication, mitigate Replication Lag anomalies (Read-Your-Writes), and implement Range, Hash, and Directory sharding with Consistent Hashing.",
    "keyConcepts": [
      "Asynchronous vs Semi-Synchronous Replication",
      "Replication Lag Anomalies (Read-Your-Writes)",
      "Range-Based vs Hash-Based Database Sharding",
      "Consistent Hashing & Virtual Nodes for Shard Balancing",
      "Cross-Shard Distributed Join & Two-Phase Commit Mitigation"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "data-engineer",
      "cloud-architect"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-sys-api-gateway-resilience",
    "slug": "api-gateway-architecture-and-resilience",
    "domainSlug": "system-design-architecture",
    "domainName": "System Design & Software Architecture",
    "title": "API Gateway Architecture: Reverse Proxies, Rate Limiting & Circuit Breakers",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 19,
    "summary": "The front door of modern distributed systems: reverse proxying, TLS termination, unified JWT authentication, Token Bucket vs Sliding Window rate limiting, and Circuit Breakers (Closed, Open, Half-Open) with exponential backoff and jitter.",
    "keyConcepts": [
      "API Gateway Reverse Proxy & TLS Termination",
      "Token Bucket vs Sliding Window Rate Limiting",
      "Circuit Breaker State Machine (Closed, Open, Half-Open)",
      "Exponential Backoff with Full Jitter",
      "Bulkhead Pattern & Resource Isolation"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "fullstack-javascript-developer",
      "devops-engineer"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-sys-dist-transactions-tracing",
    "slug": "distributed-transactions-and-observability",
    "domainSlug": "system-design-architecture",
    "domainName": "System Design & Software Architecture",
    "title": "Distributed Transactions: 2PC vs Saga Pattern, Idempotency & Distributed Tracing",
    "level": "ADVANCED",
    "readTimeMinutes": 24,
    "summary": "Eliminate split-brain and partial failures in microservices: Two-Phase Commit (2PC) blocking coordinator hazards versus Saga Choreography and Orchestration with compensating transactions, Idempotency Keys, and W3C Trace Context propagation.",
    "keyConcepts": [
      "Two-Phase Commit (2PC) Blocking Coordinator Hazard",
      "Saga Pattern (Choreography vs Orchestration)",
      "Compensating Transactions & Backward Recovery",
      "Idempotency Keys & Distributed Deduplication",
      "W3C Trace Context & OpenTelemetry Distributed Spans"
    ],
    "relatedRoleSlugs": [
      "backend-systems-engineer",
      "cloud-architect",
      "devops-engineer"
    ],
    "practiceMcqsCount": 5
  }
,
  {
    "id": "art-k8s-control-plane",
    "slug": "kubernetes-control-plane-internals-and-scheduling",
    "domainSlug": "devops-sre-kubernetes",
    "domainName": "DevOps, SRE & Container Orchestration",
    "title": "Kubernetes Architecture: Control Plane, Kube-Scheduler & Node Components",
    "level": "ADVANCED",
    "readTimeMinutes": 22,
    "summary": "Deep dive into Kubernetes architecture: declarative reconciliation loops, etcd Raft storage, Kube-Scheduler two-phase filtering and priority scoring, Kubelet CRI/CNI/CSI plugins, and Kube-proxy IPVS load balancing.",
    "keyConcepts": [
      "Declarative Reconciliation & Controllers",
      "etcd Distributed Raft State Storage",
      "Kube-Scheduler Filtering & Scoring Phases",
      "Kubelet CRI, CNI & CSI Plugin Topologies",
      "Kube-Proxy iptables vs IPVS Modes"
    ],
    "relatedRoleSlugs": [
      "devops-engineer",
      "cloud-architect",
      "backend-systems-engineer"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-containers-namespaces-cgroups",
    "slug": "container-internals-namespaces-cgroups-overlayfs",
    "domainSlug": "devops-sre-kubernetes",
    "domainName": "DevOps, SRE & Container Orchestration",
    "title": "Container Internals: Linux Namespaces, cgroups v2 & OverlayFS",
    "level": "ADVANCED",
    "readTimeMinutes": 21,
    "summary": "Deconstruct what a Linux container actually is: process isolation via Linux Namespaces (PID, Mount, Net, IPC, UTS, User), resource throttling via cgroups v2 (CFS quotas and OOM killers), and OverlayFS copy-up union filesystems.",
    "keyConcepts": [
      "Linux Namespaces (PID, Mount, Net, IPC, UTS, User)",
      "Control Groups (cgroups v2) CPU Quotas & Memory Limits",
      "OverlayFS Lower, Upper, and Merged Layer Architecture",
      "Copy-up Mutation Semantics",
      "Rootless Containers & User Namespace Mapping"
    ],
    "relatedRoleSlugs": [
      "devops-engineer",
      "backend-systems-engineer",
      "cloud-architect"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-cloud-iam-zero-trust",
    "slug": "cloud-security-iam-and-zero-trust",
    "domainSlug": "cloud-infrastructure-architecture",
    "domainName": "Cloud Computing & Enterprise Infrastructure",
    "title": "Cloud Security Architecture: IAM Least Privilege, ABAC & OIDC Federation",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 19,
    "summary": "Zero Trust architecture in public clouds: Role-Based vs Attribute-Based Access Control (RBAC vs ABAC), IAM policy evaluation algorithms (Explicit Deny override), and keyless OpenID Connect (OIDC) identity federation in CI/CD.",
    "keyConcepts": [
      "Principle of Least Privilege (PoLP)",
      "RBAC vs Attribute-Based Access Control (ABAC)",
      "IAM Policy Evaluation Engine (Explicit Deny > Allow)",
      "Keyless OIDC Token Federation for CI/CD",
      "Zero Trust Defense-in-Depth Model"
    ],
    "relatedRoleSlugs": [
      "cloud-architect",
      "devops-engineer",
      "cybersecurity-specialist"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-sre-slis-slos-budgets",
    "slug": "site-reliability-engineering-slis-slos-and-error-budgets",
    "domainSlug": "cloud-infrastructure-architecture",
    "domainName": "Cloud Computing & Enterprise Infrastructure",
    "title": "Site Reliability Engineering (SRE): SLIs, SLOs, Error Budgets & Burn Rates",
    "level": "INTERMEDIATE",
    "readTimeMinutes": 20,
    "summary": "Master the quantitative discipline of Site Reliability Engineering: formulating valid Service Level Indicators (SLIs), setting defensible Service Level Objectives (SLOs), calculating Error Budget consumption, and alerting on multi-window burn rates.",
    "keyConcepts": [
      "SLIs, SLOs, and SLAs Distinction",
      "Error Budget Mathematical Formulation (1 - SLO)",
      "Multi-Window Multi-Burn-Rate Alerting",
      "Automated Feature Deployment Freezes",
      "High-Cardinality Observability Metrics"
    ],
    "relatedRoleSlugs": [
      "devops-engineer",
      "cloud-architect",
      "backend-systems-engineer"
    ],
    "practiceMcqsCount": 5
  },
  {
    "id": "art-cicd-gitops-security",
    "slug": "cicd-pipeline-security-gitops-and-immutable-infrastructure",
    "domainSlug": "devops-sre-kubernetes",
    "domainName": "DevOps, SRE & Container Orchestration",
    "title": "Modern CI/CD Security: GitOps, Supply Chain Security & Minimal Containers",
    "level": "ADVANCED",
    "readTimeMinutes": 22,
    "summary": "Secure the modern software supply chain: GitOps pull-based declarative synchronization (ArgoCD/Flux), Software Bill of Materials (SBOM), cryptographic container signing (Sigstore/Cosign), and distroless minimal container images.",
    "keyConcepts": [
      "GitOps Pull-Based Reconciliation Loops",
      "Automated Configuration Drift Correction",
      "Software Bill of Materials (SBOM) Generation",
      "Cryptographic Image Signing (Sigstore / Cosign)",
      "Distroless & Multi-Stage Scratch Base Images"
    ],
    "relatedRoleSlugs": [
      "devops-engineer",
      "cloud-architect",
      "cybersecurity-specialist"
    ],
    "practiceMcqsCount": 5
  },
  {
    id: "ml-opt-foundations",
    slug: "machine-learning-foundations-and-optimization",
    domainSlug: "machine-learning-ai-systems",
    domainName: "Machine Learning, AI & LLM Systems",
    title: "Mathematical Foundations of ML: Loss Landscapes, Backpropagation & AdamW Optimization",
    level: "ADVANCED",
    readTimeMinutes: 24,
    summary: "Master gradient descent mechanics, loss surfaces, computational graph backpropagation calculus, and the mathematical convergence of AdamW with decoupled weight decay.",
    keyConcepts: ["Stochastic Gradient Descent","Loss Functions & Gradients","Backpropagation Graph","AdamW Optimization","Regularization & Batch Norm"],
    relatedRoleSlugs: ["machine-learning-engineer","data-scientist","ai-systems-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "deep-transformers-attn",
    slug: "deep-learning-and-transformer-architectures",
    domainSlug: "machine-learning-ai-systems",
    domainName: "Machine Learning, AI & LLM Systems",
    title: "Transformer Architecture Deep Dive: Scaled Dot-Product Attention, RoPE & KV Caching",
    level: "ADVANCED",
    readTimeMinutes: 28,
    summary: "Deconstruct transformer architectures from first principles: scaled dot-product attention math, Rotary Position Embeddings (RoPE), FlashAttention GPU memory tiling, and autoregressive KV cache mechanics.",
    keyConcepts: ["Scaled Dot-Product Attention","Multi-Head Attention (MHA/GQA)","Rotary Position Embeddings (RoPE)","Autoregressive KV Cache","FlashAttention Tiling"],
    relatedRoleSlugs: ["machine-learning-engineer","ai-systems-engineer","llm-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "vector-rag-pipelines",
    slug: "vector-databases-and-rag-pipelines",
    domainSlug: "machine-learning-ai-systems",
    domainName: "Machine Learning, AI & LLM Systems",
    title: "Vector Databases, ANN Indexing (HNSW) & Production RAG Pipeline Engineering",
    level: "ADVANCED",
    readTimeMinutes: 25,
    summary: "Architect enterprise Retrieval-Augmented Generation (RAG): Hierarchical Navigable Small World (HNSW) graphs, IVFFlat inverted indexing, Reciprocal Rank Fusion hybrid search, and Cross-Encoder reranking.",
    keyConcepts: ["Dense Vector Embeddings","HNSW Graph Indexing","IVFFlat Inverted Lists","Reciprocal Rank Fusion (RRF)","Cross-Encoder Reranking"],
    relatedRoleSlugs: ["machine-learning-engineer","ai-systems-engineer","full-stack-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "spark-lakehouse-acid",
    slug: "distributed-data-engineering-spark-and-lakehouse",
    domainSlug: "data-engineering-pipelines",
    domainName: "Data Engineering & Streaming Pipelines",
    title: "Distributed Data Engineering: Apache Spark Catalyst Optimizer & Lakehouse ACID Internals",
    level: "ADVANCED",
    readTimeMinutes: 26,
    summary: "Master large-scale distributed analytics: Catalyst query optimization, Tungsten off-heap memory management, wide shuffle skew mitigation, and Lakehouse ACID commit logs (Parquet & metadata snapshots).",
    keyConcepts: ["Catalyst Logical & Physical Optimizer","Tungsten Memory Engine","Shuffle Partition Skew & Salting","Lakehouse ACID Transactions","Compaction & Z-Ordering"],
    relatedRoleSlugs: ["data-engineer","big-data-architect","analytics-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "stream-flink-cdc",
    slug: "realtime-stream-processing-flink-and-cdc",
    domainSlug: "data-engineering-pipelines",
    domainName: "Data Engineering & Streaming Pipelines",
    title: "Real-Time Stream Processing: Apache Flink Chandy-Lamport Snapshots & Database CDC",
    level: "ADVANCED",
    readTimeMinutes: 25,
    summary: "Build fault-tolerant stateful streaming systems: Event Time vs Processing Time, Watermark heuristics, Chandy-Lamport distributed snapshotting, and transaction log Change Data Capture (CDC).",
    keyConcepts: ["Event Time vs Processing Time","Bounded Watermarks","Chandy-Lamport Snapshots","RocksDB State Backend","Log-Based Change Data Capture"],
    relatedRoleSlugs: ["data-engineer","streaming-systems-engineer","backend-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "gof-design-patterns",
    slug: "design-patterns-gof-in-modern-engineering",
    domainSlug: "system-design-architecture",
    domainName: "System Design & Software Architecture",
    title: "GoF Design Patterns in Modern Software Engineering: Principles, Idioms & Anti-Patterns",
    level: "INTERMEDIATE",
    readTimeMinutes: 24,
    summary: "Master practical software design patterns: Creational (Factory, Builder), Structural (Adapter, Decorator, Proxy), and Behavioral (Strategy, Observer, State), avoiding over-engineering antipatterns.",
    keyConcepts: ["Factory & Builder Patterns","Decorator & Proxy Decorators","Strategy & State Machines","Observer & Pub-Sub","Anti-Patterns & Premature Abstraction"],
    relatedRoleSlugs: ["software-engineer","backend-engineer","systems-architect"],
    practiceMcqsCount: 5,
  },
  {
    id: "clean-arch-ddd",
    slug: "clean-architecture-and-domain-driven-design",
    domainSlug: "system-design-architecture",
    domainName: "System Design & Software Architecture",
    title: "Clean Architecture, Hexagonal Ports & Adapters and Domain-Driven Design (DDD)",
    level: "ADVANCED",
    readTimeMinutes: 26,
    summary: "Architect enterprise domain boundaries: Hexagonal/Ports & Adapters isolation, Aggregates, Entities vs Value Objects, Domain Events, Repositories, and Bounded Contexts.",
    keyConcepts: ["Dependency Inversion Principle","Hexagonal Ports & Adapters","Aggregates & Invariants","Entities vs Value Objects","Domain Events & Bounded Contexts"],
    relatedRoleSlugs: ["systems-architect","backend-engineer","tech-lead"],
    practiceMcqsCount: 5,
  },
  {
    id: "api-protocols-comparison",
    slug: "api-design-rest-graphql-and-grpc",
    domainSlug: "fullstack-web-engineering",
    domainName: "Full-Stack Web Engineering & Modern APIs",
    title: "API Architecture Trade-offs: REST, GraphQL, and gRPC with HTTP/2 Multiplexing",
    level: "ADVANCED",
    readTimeMinutes: 25,
    summary: "Evaluate modern API paradigms: REST Richardson Maturity Model, GraphQL schemas & the N+1 DataLoader problem, and gRPC Protobuf binary framing over HTTP/2 streams.",
    keyConcepts: ["REST Richardson Maturity Model","GraphQL AST & Resolvers","DataLoader Batching & Caching","gRPC Protobuf Wire Format","HTTP/2 Flow Control & Streaming"],
    relatedRoleSlugs: ["full-stack-engineer","backend-engineer","api-architect"],
    practiceMcqsCount: 5,
  },
  {
    id: "cbo-query-optimizer",
    slug: "database-query-optimizer-and-cbo-internals",
    domainSlug: "database-storage-engines",
    domainName: "Database Management Systems & Storage",
    title: "Database Query Optimizers: System R Dynamic Programming & Cost-Based Optimization (CBO)",
    level: "ADVANCED",
    readTimeMinutes: 27,
    summary: "Deconstruct relational database query engines: System R dynamic programming join enumeration, Cardinality estimation via HyperLogLog & Equi-Width histograms, and Volcano physical plan generation.",
    keyConcepts: ["System R Dynamic Programming","HyperLogLog Cardinality Estimation","Equi-Depth Histograms","Join Reordering Search Space","Physical Operator Selection"],
    relatedRoleSlugs: ["database-administrator","systems-engineer","backend-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "enterprise-crypto-auth",
    slug: "enterprise-security-cryptography-and-oauth2",
    domainSlug: "cloud-infrastructure-architecture",
    domainName: "Cloud Computing & Enterprise Infrastructure",
    title: "Enterprise Cryptography & Identity: AES-GCM, Argon2 Hashing, and OAuth 2.0 with PKCE",
    level: "ADVANCED",
    readTimeMinutes: 25,
    summary: "Implement military-grade application security: Symmetric AES-256-GCM authenticated encryption, memory-hard Argon2id password hashing, and OAuth 2.0 Authorization Code flow with PKCE.",
    keyConcepts: ["AES-GCM Authenticated Ciphers","Argon2id Memory-Hard Hashing","OAuth 2.0 Authorization Code & PKCE","JWT Claims & Signature Verification","Constant-Time String Comparison"],
    relatedRoleSlugs: ["cybersecurity-specialist","cloud-architect","backend-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-s85-raft-paxos",
    slug: "raft-and-paxos-consensus-internals",
    domainSlug: "system-design-architecture",
    domainName: "System Design & Scalable Architecture",
    title: "Raft and Paxos Consensus Internals",
    level: "ADVANCED",
    readTimeMinutes: 18,
    summary: "A definitive guide to distributed consensus algorithms, contrasting Paxos dual-phase synod rounds with Raft leader election, log replication invariants, and safety proofs.",
    keyConcepts: ["State Machine Replication","Paxos Proposer/Acceptor/Learner","Raft Term & Election Timers","Log Matching Invariant","Joint Consensus Reconfiguration"],
    relatedRoleSlugs: ["backend-engineer","systems-architect","infrastructure-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-s85-event-sourcing",
    slug: "event-sourcing-and-cqrs-architectures",
    domainSlug: "system-design-architecture",
    domainName: "System Design & Scalable Architecture",
    title: "Event Sourcing and CQRS Architectures",
    level: "ADVANCED",
    readTimeMinutes: 17,
    summary: "A deep dive into Event Sourcing and Command Query Responsibility Segregation (CQRS), covering immutable event streams, projections, eventual consistency, and schema evolution.",
    keyConcepts: ["Event Sourcing (ES)","CQRS Separation","Append-Only Event Store","Materialized Projections","Event Upcasters"],
    relatedRoleSlugs: ["backend-engineer","systems-architect","infrastructure-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-s85-dist-locks",
    slug: "distributed-lock-managers-and-chubby-redlock",
    domainSlug: "system-design-architecture",
    domainName: "System Design & Scalable Architecture",
    title: "Distributed Lock Managers, Chubby, and Fencing Tokens",
    level: "ADVANCED",
    readTimeMinutes: 16,
    summary: "An authoritative study of distributed mutual exclusion, exploring consensus-backed locks, lease times, the Martin Kleppmann Redlock critique, and monotonic fencing tokens.",
    keyConcepts: ["Distributed Mutual Exclusion","Fencing Tokens","Lease Heartbeats & Keep-Alives","Process Pauses (GC/Page Faults)","Redlock Algorithm Critique"],
    relatedRoleSlugs: ["backend-engineer","systems-architect","infrastructure-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-s85-ebpf-otel",
    slug: "network-observability-ebpf-and-opentelemetry",
    domainSlug: "devops-sre-kubernetes",
    domainName: "DevOps, SRE & Kubernetes",
    title: "Network Observability, eBPF Tracing, and OpenTelemetry",
    level: "ADVANCED",
    readTimeMinutes: 17,
    summary: "A deep dive into in-kernel Linux observability with eBPF, XDP packet filtering, kprobes/uprobes, and standardized distributed tracing via OpenTelemetry and W3C Trace Context.",
    keyConcepts: ["eBPF In-Kernel Virtual Machine","Bytecode Verifier & Safety","XDP (eXpress Data Path)","OpenTelemetry (OTel)","W3C Trace Context"],
    relatedRoleSlugs: ["devops-engineer","sre-engineer","cloud-architect"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-s85-kafka-zerocopy",
    slug: "high-throughput-messaging-kafka-internals-and-zero-copy",
    domainSlug: "data-engineering-pipelines",
    domainName: "Data Engineering & Big Data",
    title: "High-Throughput Messaging, Kafka Internals, and OS Zero-Copy",
    level: "ADVANCED",
    readTimeMinutes: 18,
    summary: "An architectural investigation of Apache Kafka performance mechanics: sequential disk I/O, PageCache leveraging, sendfile() zero-copy network transfer, and consumer rebalancing.",
    keyConcepts: ["Sequential vs Random Disk I/O","Linux PageCache Utilization","Zero-Copy (sendfile syscall)","Cooperative Sticky Rebalance","Idempotent & Transactional Producer"],
    relatedRoleSlugs: ["data-engineer","backend-systems-engineer","streaming-architect"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-s86-zero-downtime",
    slug: "zero-downtime-deployments-and-traffic-shifting",
    domainSlug: "devops-sre-kubernetes",
    domainName: "DevOps, SRE & Kubernetes",
    title: "Zero-Downtime Deployments, Canary Rollouts, and Traffic Shifting",
    level: "ADVANCED",
    readTimeMinutes: 18,
    summary: "A master guide to progressive delivery: Blue-Green environments, automated Canary percentage shifting with Envoy service meshes, shadow traffic mirroring, and metric-based rollback gates.",
    keyConcepts: ["Blue-Green Deployments","Canary Rollouts","L7 Traffic Routing & Envoy","Shadow Traffic Mirroring","Automated Metric Rollback Gates"],
    relatedRoleSlugs: ["devops-engineer","sre-engineer","cloud-architect"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-s86-dist-caching",
    slug: "distributed-caching-topologies-and-coherence",
    domainSlug: "system-design-architecture",
    domainName: "System Design & Scalable Architecture",
    title: "Distributed Caching Topologies, Cache Coherence & Dogpile Mitigation",
    level: "ADVANCED",
    readTimeMinutes: 17,
    summary: "Analyze caching topologies: In-Process vs Out-of-Process, Near-Cache invalidation, Write-Through/Write-Behind patterns, and the XFetch probabilistic early recomputation algorithm.",
    keyConcepts: ["In-Process vs Out-of-Process Caching","Near-Cache & Invalidation Events","Write-Behind with WAL","Dogpile Effect / Thundering Herd","XFetch Probabilistic Algorithm"],
    relatedRoleSlugs: ["backend-engineer","systems-architect","performance-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-s86-db-sharding",
    slug: "database-sharding-repartitioning-and-resharding",
    domainSlug: "database-storage-engines",
    domainName: "Database Management Systems & Storage",
    title: "Database Sharding Strategies, Online Resharding & Distributed IDs",
    level: "ADVANCED",
    readTimeMinutes: 19,
    summary: "Master database horizontal scaling: Hash, Range, and Directory sharding, cross-shard transaction hazards, zero-downtime online resharding pipelines, and 64-bit Snowflake ID generation.",
    keyConcepts: ["Horizontal Partitioning (Sharding)","Shard Key Selection Criteria","Cross-Shard Joins & Fanout","Zero-Downtime Online Resharding","Snowflake 64-bit Distributed IDs"],
    relatedRoleSlugs: ["database-administrator","systems-architect","backend-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-s86-epoll-iouring",
    slug: "linux-kernel-io-subsystems-epoll-and-io-uring",
    domainSlug: "operating-systems-internals",
    domainName: "Operating Systems & Kernel Internals",
    title: "Linux High-Performance I/O: From select/poll and epoll to io_uring",
    level: "ADVANCED",
    readTimeMinutes: 19,
    summary: "Trace the evolution of Linux high-performance network runtimes: the O(N) limitations of select/poll, epoll Red-Black trees and ready lists, and the revolutionary zero-syscall io_uring architecture.",
    keyConcepts: ["select() and poll() O(N) Bottlenecks","epoll_create, epoll_ctl, epoll_wait","Edge-Triggered (EPOLLET) vs Level-Triggered (EPOLLLT)","io_uring Submission & Completion Queues","Zero-Syscall Async I/O (IORING_SETUP_SQPOLL)"],
    relatedRoleSlugs: ["systems-programmer","linux-kernel-engineer","backend-systems-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-s86-actor-reactive",
    slug: "actor-model-and-reactive-stream-processing",
    domainSlug: "fullstack-web-engineering",
    domainName: "Full-Stack Web Engineering & Modern APIs",
    title: "The Actor Model, Reactive Streams, and Asynchronous Concurrency",
    level: "ADVANCED",
    readTimeMinutes: 18,
    summary: "A definitive study of message-driven concurrency: Carl Hewitt's Actor Model, supervision hierarchies (\"Let It Crash\"), Location Transparency, and Reactive Streams dynamic backpressure flow control.",
    keyConcepts: ["Carl Hewitt's Actor Model","Mailbox & Message Immutability","Supervision Trees (\"Let It Crash\")","Location Transparency","Reactive Streams Backpressure (Demand Signaling)"],
    relatedRoleSlugs: ["full-stack-engineer","backend-systems-engineer","distributed-systems-architect"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-os-virtual-memory-mmu",
    slug: "virtual-memory-internals-paging-and-mmu",
    domainSlug: "operating-systems-internals",
    domainName: "Operating Systems & Systems Programming",
    title: "Virtual Memory Architecture, Paging & MMU Translation Internals",
    level: "ADVANCED",
    readTimeMinutes: 20,
    summary: "Comprehensive analysis of modern virtual memory subsystems: hardware MMU address translation, 4-level and 5-level page table radix trees, TLB shootdowns across multicore SMP architectures, HugePages (2MB/1GB) allocation, and NUMA memory tiering.",
    keyConcepts: ["MMU Address Translation","4-Level & 5-Level Page Table Radix Walk (PGD/P4D/PUD/PMD/PTE)","Translation Lookaside Buffer (TLB) & Multicore IPI Shootdowns","Transparent Huge Pages (THP) vs Explicit 1GB HugePages","NUMA First-Touch & Interleave Allocation Policies"],
    relatedRoleSlugs: ["systems-architect","backend-engineer","sre-infrastructure"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-os-linux-vfs-ext4",
    slug: "linux-virtual-file-system-vfs-and-ext4",
    domainSlug: "operating-systems-internals",
    domainName: "Operating Systems & Systems Programming",
    title: "Linux Virtual File System (VFS) & Ext4 Journaling Storage Internals",
    level: "ADVANCED",
    readTimeMinutes: 19,
    summary: "An architectural exploration of the Linux Virtual File System (VFS) abstraction layer, directory entry (dentry) hash caches, Inode lifecycle, PageCache writeback dirty page flushing, and Ext4 JBD2 journaling guarantees.",
    keyConcepts: ["VFS Abstraction Layer (Superblock, Inode, Dentry, File)","Dentry Hash Cache & Lockless RCU Path Resolution","Ext4 JBD2 Journaling Modes (Data=Journal, Ordered, Writeback)","PageCache Dirty Flusher Daemons (dirty_ratio / dirty_background_ratio)","Direct I/O (O_DIRECT) vs Buffered I/O & fsync/fdatasync Semantics"],
    relatedRoleSlugs: ["systems-architect","backend-engineer","sre-infrastructure"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-net-kernel-bypass-dpdk-xdp",
    slug: "high-performance-network-bypass-dpdk-and-xdp",
    domainSlug: "computer-networks-protocols",
    domainName: "Computer Networks & Communications",
    title: "Kernel-Bypass Networking: DPDK Poll-Mode Drivers & XDP eBPF Acceleration",
    level: 'ADVANCED',
    readTimeMinutes: 21,
    summary: "Master high-throughput, sub-microsecond networking through kernel-bypass paradigms: DPDK Poll-Mode Drivers (PMD) running in userspace via VFIO, and eXpress Data Path (XDP) in-driver eBPF programmable packet processing.",
    keyConcepts: ["Linux Kernel Network Stack Bottlenecks (sk_buff, softirq, context switches)","DPDK Architecture (PMD 100% CPU pinning, Lockless Ring, Hugepages)","VFIO / UIO & IOMMU Direct Memory Access (DMA)","eXpress Data Path (XDP) In-Driver Hooks & XDP Actions","AF_XDP Zero-Copy UMEM Rings (Fill, Rx, Tx, Completion)"],
    relatedRoleSlugs: ["systems-architect","backend-engineer","sre-infrastructure"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-sec-post-quantum-zkp",
    slug: "modern-cryptography-post-quantum-and-zkp",
    domainSlug: "cybersecurity-cryptography",
    domainName: "Cybersecurity, AppSec & Cryptography",
    title: "Modern Cryptography: Post-Quantum Lattices & Zero-Knowledge Proofs (ZKP)",
    level: "ADVANCED",
    readTimeMinutes: 22,
    summary: "Deep exploration of next-generation cryptography: the Shor algorithm threat to RSA/ECC, NIST post-quantum lattice standards (ML-KEM/Kyber, ML-DSA/Dilithium), and non-interactive Zero-Knowledge Proofs (ZK-SNARKs vs ZK-STARKs).",
    keyConcepts: ["The Quantum Threat: Shor's Algorithm vs RSA/ECC Factorization","Lattice-Based Cryptography & Learning With Errors (LWE)","NIST Post-Quantum Standards (ML-KEM / Kyber, ML-DSA / Dilithium)","Zero-Knowledge Foundations (Completeness, Soundness, Zero-Knowledge)","ZK-SNARKs (Arithmetic Circuits, QAP, Groth16) vs ZK-STARKs (FRI)"],
    relatedRoleSlugs: ["systems-architect","security-engineer","backend-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-db-storage-engines-lsm-btree",
    slug: "distributed-database-storage-engines-lsm-vs-btree",
    domainSlug: "database-storage-engines",
    domainName: "Database Management Systems & Storage",
    title: "Storage Engine Architecture: WiredTiger B+ Trees vs RocksDB Log-Structured Merge (LSM)",
    level: "ADVANCED",
    readTimeMinutes: 20,
    summary: "Comprehensive comparative dissection of foundational database storage engines: WiredTiger B+ Tree in-place modification, hazard pointers, and page reconciliation vs RocksDB LSM-Tree append-only MemTables, SSTables, and Leveled Compaction.",
    keyConcepts: ["In-Place Update (B+ Tree) vs Append-Only (LSM-Tree)","WiredTiger Hazard Pointers & Eviction Server Threads","RocksDB MemTable SkipList, WAL & Immutable MemTables","Leveled vs Universal Compaction & Write Amplification Factor (WAF)","Bloom Filters, Block Cache & Prefix Seek Optimization"],
    relatedRoleSlugs: ["systems-architect","backend-engineer","database-administrator"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-web-wasm-component-model",
    slug: "webassembly-internals-and-component-model",
    domainSlug: "fullstack-web-engineering",
    domainName: "Full-Stack Web Engineering & Modern APIs",
    title: "WebAssembly Architecture: Stack Machine Bytecode, Linear Memory & The Component Model",
    level: "ADVANCED",
    readTimeMinutes: 20,
    summary: "An architectural deep dive into WebAssembly (Wasm): stack-based virtual machine semantics, sandboxed linear memory safety, WebAssembly System Interface (WASI), SIMD-128 vector execution, and the Wasm Component Model.",
    keyConcepts: ["Stack-Based Virtual Machine Execution Model","Sandboxed Linear Memory & ArrayBuffer Bounds Checking","WebAssembly System Interface (WASI preview 1 & 2)","SIMD-128 (Single Instruction, Multiple Data) Vectorization","The WebAssembly Component Model & WIT (Wasm Interface Type)"],
    relatedRoleSlugs: ["fullstack-developer","systems-architect","backend-engineer"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-web-rsc-streaming-ssr",
    slug: "react-server-components-and-streaming-ssr",
    domainSlug: "fullstack-web-engineering",
    domainName: "Full-Stack Web Engineering & Modern APIs",
    title: "React Server Components (RSC) & Streaming SSR: Wire Protocol, Boundaries & Hydration",
    level: "ADVANCED",
    readTimeMinutes: 21,
    summary: "Master the architectural foundations of React Server Components (RSC) and Streaming Server-Side Rendering: the RSC flight wire format, client-server serialization boundaries, selective progressive hydration, and HTTP/1.1 chunked streaming.",
    keyConcepts: ["React Server Components (RSC) vs Traditional Client Components","The RSC Flight Wire Protocol Format","The \"use client\" Serialization Boundary & Props Contract","Progressive Selective Hydration with React Suspense","Streaming HTML Chunking (Transfer-Encoding: chunked)"],
    relatedRoleSlugs: ["fullstack-developer","frontend-engineer","systems-architect"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-sre-slo-error-budgets",
    slug: "site-reliability-engineering-slo-and-error-budgets",
    domainSlug: "devops-sre-kubernetes",
    domainName: "DevOps, SRE & Container Orchestration",
    title: "Site Reliability Engineering: SLI/SLO Calculus, Multi-Window Burn Rate Alerts & Error Budgets",
    level: "ADVANCED",
    readTimeMinutes: 20,
    summary: "The formal engineering calculus of Site Reliability Engineering (SRE): Service Level Indicators (SLIs), Service Level Objectives (SLOs), Error Budget depletion mechanics, and multi-window multi-burn-rate alerting algorithms.",
    keyConcepts: ["The Reliability Triad: SLI, SLO, and SLA","Error Budget Calculus & Mathematical Derivation","The Pitfalls of Traditional Threshold-Based Alerting","Multi-Window Multi-Burn-Rate Alerting Algorithms","Error Budget Policy & Release Freeze Enforcement"],
    relatedRoleSlugs: ["sre-infrastructure","devops-engineer","systems-architect"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-sys-cell-architecture-resilience",
    slug: "microservices-resilience-cell-based-architecture",
    domainSlug: "system-design-architecture",
    domainName: "System Design & Software Architecture",
    title: "Microservices Resilience: Cell-Based Architecture, Shuffle Sharding & Bulkheads",
    level: "ADVANCED",
    readTimeMinutes: 21,
    summary: "Architecting ultra-resilient distributed platforms using Cell-Based Architecture: deterministic blast radius containment, shuffle sharding client isolation, bulkhead patterns, and cascading failure circuit breakers.",
    keyConcepts: ["Cell-Based Architecture & Complete Failure Domain Isolation","Shuffle Sharding: Combinatorial Fault Isolation","The Bulkhead Pattern (Thread Pool & Resource Partitioning)","Cascading Failure Dynamics & Circuit Breakers (Resilience4j)","Stateless Ingress Routing & Cell Mapping Tables"],
    relatedRoleSlugs: ["systems-architect","backend-engineer","sre-infrastructure"],
    practiceMcqsCount: 5,
  },
  {
    id: "art-sre-tracing-high-cardinality",
    slug: "distributed-tracing-and-high-cardinality-metrics",
    domainSlug: "devops-sre-kubernetes",
    domainName: "DevOps, SRE & Container Orchestration",
    title: "Distributed Tracing & High-Cardinality Metrics: Gorilla Compression, W3C Context & M3DB",
    level: "ADVANCED",
    readTimeMinutes: 21,
    summary: "An architectural investigation of large-scale observability engines: W3C Trace Context propagation, tail-based trace sampling, high-cardinality metric explosion, Gorilla floating-point XOR time-series compression, and Thanos/M3DB storage.",
    keyConcepts: ["W3C Trace Context (traceparent & tracestate)","Head-Based vs Tail-Based Trace Sampling","The High-Cardinality Metric Explosion Problem","Facebook Gorilla Time-Series Compression (Delta-of-Delta & XOR Floating Point)","Distributed TSDB Architectures (M3DB & Thanos Object Tiering)"],
    relatedRoleSlugs: ["sre-infrastructure","devops-engineer","systems-architect"],
    practiceMcqsCount: 5,
  },
{
  "id": "art-comp-jit-internals-deopt",
  "slug": "jit-compiler-internals-and-deoptimization",
  "domainSlug": "programming-languages-compilers",
  "domainName": "Programming Languages, Compilers & Runtimes",
  "title": "JIT Compiler Internals: Tiered Compilation, Sea-of-Nodes IR & Deoptimization",
  "level": "ADVANCED",
  "readTimeMinutes": 22,
  "summary": "An exhaustive investigation into modern JIT compiler architectures: tiered execution pipelines (Ignition/Sparkplug/TurboFan, HotSpot C1/C2), Sea-of-Nodes Intermediate Representation (IR), speculative optimization, Inline Caches (IC), and On-Stack Replacement (OSR) deoptimization bailouts.",
  "keyConcepts": [
    "Tiered Compilation Architecture (Interpreter vs Baseline vs Optimizing JIT)",
    "Inline Caches (Monomorphic, Polymorphic, and Megamorphic Call Sites)",
    "Sea-of-Nodes Intermediate Representation (Control & Data Flow Graph)",
    "Speculative Optimization & Type Feedback Vectors",
    "Deoptimization Bailouts & On-Stack Replacement (OSR)"
  ],
  "relatedRoleSlugs": [
    "fullstack-engineer",
    "backend-engineer",
    "systems-architect"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-os-ebpf-internals-core",
  "slug": "linux-ebpf-internals-and-co-re",
  "domainSlug": "operating-systems-internals",
  "domainName": "Operating Systems & Linux Kernel Internals",
  "title": "Linux eBPF Internals: Bytecode Verifier, BPF Maps & CO-RE (Compile Once - Run Everywhere)",
  "level": "ADVANCED",
  "readTimeMinutes": 21,
  "summary": "A deep kernel-level exploration of extended Berkeley Packet Filter (eBPF): in-kernel virtual machine bytecode, register constraints, DAG static safety verifier, BPF maps, BTF (BPF Type Format), and CO-RE (Compile Once – Run Everywhere) portability.",
  "keyConcepts": [
    "eBPF Architecture (In-Kernel RISC Virtual Machine)",
    "The Static Bytecode Verifier (Acyclic Directed Graph Proofs & Safety Invariants)",
    "BPF Maps & Ring Buffers (Kernel-to-Userspace IPC)",
    "BPF Type Format (BTF) & Field Relocation Offsets",
    "CO-RE (Compile Once - Run Everywhere) Portability"
  ],
  "relatedRoleSlugs": [
    "systems-architect",
    "sre-infrastructure",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-os-zero-copy-iouring",
  "slug": "zero-copy-io-and-io-uring",
  "domainSlug": "operating-systems-internals",
  "domainName": "Operating Systems & Linux Kernel Internals",
  "title": "Zero-Copy I/O & Linux io_uring: Ring Buffers, SQPOLL & High-Performance Storage",
  "level": "ADVANCED",
  "readTimeMinutes": 22,
  "summary": "A comprehensive architectural breakdown of modern Linux asynchronous I/O: the cost of classical POSIX syscalls, kernel-to-userspace page copying, splice and sendfile zero-copy primitives, and Jens Axboe's lockless io_uring Submission/Completion Queue architecture.",
  "keyConcepts": [
    "The Cost of POSIX I/O (Syscall Traps, Context Switches & Cache Pollution)",
    "Zero-Copy Transfer Primitives (sendfile, splice, and vmsplice)",
    "io_uring Ring Pair Architecture (Submission Queue & Completion Queue)",
    "Kernel Submission Polling (IORING_SETUP_SQPOLL)",
    "Fixed Buffers & Pre-Registered File Descriptors"
  ],
  "relatedRoleSlugs": [
    "systems-architect",
    "sre-infrastructure",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-dist-epaxos-raft-optimizations",
  "slug": "distributed-consensus-epaxos-and-raft-optimizations",
  "domainSlug": "distributed-systems-architecture",
  "domainName": "Distributed Systems & Cloud Architecture",
  "title": "Egalitarian Paxos (EPaxos) & Advanced Raft Optimizations: Leaderless Consensus & Read Leases",
  "level": "ADVANCED",
  "readTimeMinutes": 23,
  "summary": "A rigorous exploration of next-generation distributed consensus algorithms: Egalitarian Paxos (EPaxos) leaderless commit paths and dependency graph topological sorting, compared with advanced Raft optimizations including Pre-Vote phases, leader lease reads, and ReadIndex batching.",
  "keyConcepts": [
    "The Leader Bottleneck in Classical Consensus (Multi-Paxos & Raft)",
    "Egalitarian Paxos (EPaxos) Fast Path Quorum (1 RTT Consensus)",
    "Dynamic Dependency Graphs & Topological Sort Linearization",
    "Raft Pre-Vote Protocol & Disrupted Partition Protection",
    "Leader Leases vs ReadIndex Batching for Lock-Free Consensus Reads"
  ],
  "relatedRoleSlugs": [
    "systems-architect",
    "backend-engineer",
    "sre-infrastructure"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-db-columnar-vectorized-execution",
  "slug": "columnar-storage-and-vectorized-execution",
  "domainSlug": "database-storage-query-engines",
  "domainName": "Database Internals & Advanced Storage Engines",
  "title": "Columnar Storage Engines & SIMD Vectorized Execution: Parquet, Arrow & ClickHouse Internals",
  "level": "ADVANCED",
  "readTimeMinutes": 22,
  "summary": "A deep engineering inquiry into analytical OLAP query engines: Row-oriented (NSM) vs Columnar (DSM/PAX) storage layouts, lightweight compression encodings (RLE, Bit-Packing, Dictionary), SIMD vectorized execution vectors (AVX-512), and Apache Arrow zero-copy memory layouts.",
  "keyConcepts": [
    "Row-Oriented (NSM) vs Columnar (DSM / PAX) Memory Layouts",
    "Lightweight Columnar Compression (Run-Length, Dictionary, and Bit-Packing)",
    "Volcano Iterator Model vs Block-at-a-Time Vectorized Execution",
    "SIMD Hardware Parallelism (AVX-512 & Neon Vector Registers)",
    "Apache Arrow In-Memory Format & IPC Zero-Copy Serialization"
  ],
  "relatedRoleSlugs": [
    "database-administrator",
    "systems-architect",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-dist-byzantine-pbft",
  "slug": "byzantine-fault-tolerance-and-pbft",
  "domainSlug": "distributed-systems-architecture",
  "domainName": "Distributed Systems & Cloud Architecture",
  "title": "Byzantine Fault Tolerance & PBFT: The 3f+1 Proof, 3-Phase Commits & View Changes",
  "level": "ADVANCED",
  "readTimeMinutes": 24,
  "summary": "A rigorous mathematical exploration of Byzantine Fault Tolerance (BFT) in adversarial distributed environments: Crash Fault Tolerance (CFT) vs BFT, Castro & Liskov's Practical Byzantine Fault Tolerance (PBFT), the formal 3f+1 quorum derivation, the 3-phase commit protocol, and authenticated view changes.",
  "keyConcepts": [
    "Crash Fault Tolerance (CFT) vs Byzantine Fault Tolerance (BFT)",
    "The 3f+1 Lower Bound Quorum Derivation",
    "The PBFT 3-Phase Protocol (Pre-Prepare, Prepare, and Commit)",
    "Cryptographic Watermarking & Digest Verification",
    "PBFT View Change Protocol & Liveness Invariants"
  ],
  "relatedRoleSlugs": [
    "systems-architect",
    "backend-engineer",
    "sre-infrastructure"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-sec-oauth2-spiffe-spire",
  "slug": "oauth2-token-exchange-and-spiffe-spire",
  "domainSlug": "cybersecurity-secure-coding",
  "domainName": "Cybersecurity & Secure Coding Practices",
  "title": "Workload Identity & Token Exchange: SPIFFE/SPIRE, mTLS Attestation & RFC 8693",
  "level": "ADVANCED",
  "readTimeMinutes": 23,
  "summary": "An architectural deep-dive into zero-trust workload identity: Secure Production Identity Framework for Everyone (SPIFFE), SPIRE attestation lifecycles, short-lived X.509/JWT SVIDs, automated mutual TLS, and OAuth 2.0 Token Exchange (RFC 8693) for cross-domain delegation.",
  "keyConcepts": [
    "Zero-Trust Workload Identity vs Static Long-Lived Secrets",
    "SPIFFE ID URI Format & Trust Domains",
    "SPIRE Server/Agent Architecture (Node & Workload Attestation)",
    "SPIFFE Verifiable Identity Documents (X.509 & JWT SVIDs)",
    "OAuth 2.0 Token Exchange (RFC 8693 Delegation Semantics)"
  ],
  "relatedRoleSlugs": [
    "security-engineer",
    "systems-architect",
    "devops-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-sys-caching-thundering-herd",
  "slug": "distributed-caching-cache-aside-vs-write-behind-and-thundering-herd",
  "domainSlug": "system-design-architecture",
  "domainName": "System Design & Software Architecture",
  "title": "Distributed Caching Internals: Cache-Aside, Write-Behind, XFetch & Thundering Herd",
  "level": "ADVANCED",
  "readTimeMinutes": 23,
  "summary": "An in-depth systems design inquiry into high-throughput distributed caching architectures: Cache-Aside vs Write-Through vs Write-Behind, Cache Stampede (Thundering Herd) mathematical mitigation via the XFetch algorithm, and Change Data Capture (CDC) cache invalidation.",
  "keyConcepts": [
    "Caching Topologies (Cache-Aside, Read-Through, Write-Through, Write-Behind)",
    "The Cache Stampede / Thundering Herd Collapse Dynamics",
    "Probabilistic Early Recomputation: The XFetch Algorithm",
    "Distributed Mutex Locks vs Singleflight Request Collapsing",
    "CDC (Change Data Capture) Cache Consistency with Debezium & Kafka"
  ],
  "relatedRoleSlugs": [
    "systems-architect",
    "backend-engineer",
    "sre-infrastructure"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-db-ansi-isolation-berenson",
  "slug": "database-isolation-levels-ansi-vs-berenson-critique",
  "domainSlug": "database-storage-query-engines",
  "domainName": "Database Internals & Advanced Storage Engines",
  "title": "Database Isolation Levels: The ANSI SQL-92 Critique, Berenson Anomalies & SSI",
  "level": "ADVANCED",
  "readTimeMinutes": 24,
  "summary": "A rigorous exploration of transactional concurrency control: the historical ANSI SQL-92 isolation standard, the seminal 1995 Berenson critique, formal definitions of anomalies (Dirty Read, Non-Repeatable Read, Phantom, Write Skew), Snapshot Isolation (SI), and Serializable Snapshot Isolation (SSI).",
  "keyConcepts": [
    "The ANSI SQL-92 Isolation Matrix (P1, P2, P3 Phenomena)",
    "The 1995 Berenson Critique: Ambiguities & Missed Anomalies",
    "Generalized Concurrency Anomalies (G0, G1a, G1b, G2)",
    "Snapshot Isolation (SI) & The Write Skew Anomaly",
    "Serializable Snapshot Isolation (SSI) & SIREAD Dependency Tracking"
  ],
  "relatedRoleSlugs": [
    "database-administrator",
    "systems-architect",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-sec-post-quantum-pki",
  "slug": "quantum-resistant-pki-and-post-quantum-tls",
  "domainSlug": "cybersecurity-secure-coding",
  "domainName": "Cybersecurity & Secure Coding Practices",
  "title": "Quantum-Resistant PKI & Post-Quantum TLS: NIST Standards, Lattice Cryptography & ML-KEM",
  "level": "ADVANCED",
  "readTimeMinutes": 24,
  "summary": "An architectural analysis of post-quantum cryptography (PQC) transitions: Shor's algorithm threat to RSA/ECC, Harvest-Now-Decrypt-Later (HNDL) state-sponsored adversaries, NIST standardization (FIPS 203 ML-KEM, FIPS 204 ML-DSA), hybrid X.509 digital certificates, and hybrid TLS 1.3 Key Encapsulation Mechanisms.",
  "keyConcepts": [
    "The Quantum Cryptographic Threat: Shor's vs Grover's Algorithms",
    "Harvest-Now-Decrypt-Later (HNDL) Adversary Dynamics",
    "Lattice-Based Cryptography & Learning With Errors (LWE)",
    "NIST Standards: FIPS 203 (ML-KEM / Kyber) & FIPS 204 (ML-DSA / Dilithium)",
    "Hybrid TLS 1.3 Handshakes & X.509 Digital Certificate Migration"
  ],
  "relatedRoleSlugs": [
    "security-engineer",
    "systems-architect",
    "devops-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-ai-gpu-cuda-tensor-cores",
  "slug": "gpu-architecture-cuda-and-tensor-cores",
  "domainSlug": "machine-learning-ai-systems",
  "domainName": "Machine Learning & AI Systems Engineering",
  "title": "GPU Architecture Internals: CUDA Execution Model, Warp Divergence & Tensor Cores",
  "level": "ADVANCED",
  "readTimeMinutes": 24,
  "summary": "A deep hardware-level investigation of modern GPU computing: Streaming Multiprocessors (SMs), SIMT warp execution (32 threads), warp divergence penalties, shared memory bank conflicts, Tensor Core mixed-precision matrix multiplication (WMMA), and HBM3 memory coalescing.",
  "keyConcepts": [
    "Streaming Multiprocessor (SM) Architecture & SIMT Execution",
    "Warp Scheduling (32 Threads) & Warp Divergence Penalties",
    "Shared Memory Bank Conflicts & Memory Coalescing",
    "Tensor Cores & Warp Matrix Multiply and Accumulate (WMMA)",
    "High Bandwidth Memory (HBM3) vs SRAM Roofline Model"
  ],
  "relatedRoleSlugs": [
    "mlops-engineer",
    "systems-architect",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-ai-transformer-kvcache-pagedattn",
  "slug": "transformer-inference-kv-cache-and-pagedattention",
  "domainSlug": "machine-learning-ai-systems",
  "domainName": "Machine Learning & AI Systems Engineering",
  "title": "Transformer LLM Inference: KV-Cache Bottlenecks, PagedAttention & vLLM Architecture",
  "level": "ADVANCED",
  "readTimeMinutes": 24,
  "summary": "An architectural deep-dive into autoregressive Large Language Model (LLM) serving: the Prefill vs Decode phase, memory bandwidth bounds, Key-Value (KV) cache memory explosion, internal memory fragmentation, and vLLM's PagedAttention virtual memory block allocation.",
  "keyConcepts": [
    "Prefill (Compute-Bound) vs Decode (Memory-Bound) Phases",
    "The Key-Value (KV) Cache Memory Calculus",
    "Memory Fragmentation in Classical LLM Serving (Internal vs External)",
    "vLLM PagedAttention Virtual Memory Block Mapping",
    "Continuous Batching & Chunked Prefill Scheduling"
  ],
  "relatedRoleSlugs": [
    "mlops-engineer",
    "systems-architect",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-ai-distributed-training-3d-parallelism",
  "slug": "distributed-model-training-data-tensor-pipeline-parallelism",
  "domainSlug": "machine-learning-ai-systems",
  "domainName": "Machine Learning & AI Systems Engineering",
  "title": "Distributed Model Training: 3D Parallelism (ZeRO, Tensor Parallelism & Pipeline Schedules)",
  "level": "ADVANCED",
  "readTimeMinutes": 25,
  "summary": "A comprehensive systems architectural breakdown of distributed deep learning training for multi-billion parameter models: Data Parallelism with DeepSpeed ZeRO (Stages 1, 2, 3), Megatron-LM Tensor Parallelism (column/row linear splits), Pipeline Parallelism (GPipe vs 1F1B schedules), and collective communication primitives (All-Reduce, All-Gather, Reduce-Scatter).",
  "keyConcepts": [
    "The Model State Memory Equation (Weights, Gradients, Optimizer States)",
    "DeepSpeed ZeRO Stages 1, 2, and 3 Memory Partitioning",
    "Megatron-LM Tensor Parallelism (Column & Row Parallel Linear Layers)",
    "Pipeline Parallelism & The 1F1B Schedule Bubble Problem",
    "Collective Communications: Ring All-Reduce vs Tree All-Reduce"
  ],
  "relatedRoleSlugs": [
    "mlops-engineer",
    "systems-architect",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-ai-flashattention-io-aware",
  "slug": "flashattention-and-io-aware-exact-attention",
  "domainSlug": "machine-learning-ai-systems",
  "domainName": "Machine Learning & AI Systems Engineering",
  "title": "FlashAttention Internals: I/O-Aware Exact Attention, Online Softmax & SRAM Tiling",
  "level": "ADVANCED",
  "readTimeMinutes": 24,
  "summary": "A rigorous mathematical and systems exploration of Tri Dao et al.'s FlashAttention algorithms (FlashAttention-1, 2, and 3): overcoming the O(N^2) memory wall of classical attention, GPU memory hierarchy exploitation (HBM vs fast SRAM), the online softmax scaling trick, forward pass kernel fusion, and backward recomputation.",
  "keyConcepts": [
    "The Classical Attention Memory Wall ($O(N^2)$ HBM Read/Write Bottleneck)",
    "GPU Memory Hierarchy Roofline: High Bandwidth Memory (HBM) vs SRAM",
    "Online Softmax Scaling Mathematics (Milakov & Gimelshein)",
    "SRAM Tiling & Kernel Fusion Algorithm",
    "FlashAttention-2 & 3 Optimizations (Warp Partitioning & Asynchronous Copy)"
  ],
  "relatedRoleSlugs": [
    "mlops-engineer",
    "systems-architect",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-ai-vector-db-hnsw-ann",
  "slug": "vector-databases-hnsw-and-approximate-nearest-neighbors",
  "domainSlug": "machine-learning-ai-systems",
  "domainName": "Machine Learning & AI Systems Engineering",
  "title": "Vector Databases & HNSW Internals: Hierarchical Graphs, Quantization & ANN Search",
  "level": "ADVANCED",
  "readTimeMinutes": 23,
  "summary": "An in-depth systems design exploration of vector indexing and similarity retrieval engines: the curse of dimensionality in exact k-NN, Hierarchical Navigable Small World (HNSW) graph skip-layers, vector compression via Product Quantization (PQ) and Scalar Quantization (SQ), and inverted file indexing (IVF).",
  "keyConcepts": [
    "The Curse of Dimensionality & Exact vs Approximate Nearest Neighbors (ANN)",
    "Hierarchical Navigable Small World (HNSW) Multi-Layer Graph Architecture",
    "Greedy Routing & Heuristic Edge Selection Invariants",
    "Vector Quantization Primitives: Scalar (SQ) vs Product Quantization (PQ)",
    "Inverted File Indexing (IVF-PQ) & Memory-Mapped Storage Engines"
  ],
  "relatedRoleSlugs": [
    "mlops-engineer",
    "systems-architect",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-crypto-zkp-snarks-starks",
  "slug": "zero-knowledge-proofs-snarks-vs-starks",
  "domainSlug": "cybersecurity-secure-coding",
  "domainName": "Cybersecurity & Secure Coding Practices",
  "title": "Zero-Knowledge Proofs: SNARKs vs STARKs, Arithmetization & KZG Commitments",
  "level": "ADVANCED",
  "readTimeMinutes": 25,
  "summary": "A rigorous mathematical exploration of Zero-Knowledge Proofs (ZKP): Completeness, Soundness, and Zero-Knowledge invariants; arithmetization via Rank-1 Constraint Systems (R1CS) and Quadratic Arithmetic Programs (QAP); trusted setups vs transparent proofs; and polynomial commitment schemes (KZG vs FRI).",
  "keyConcepts": [
    "The Three ZKP Invariants: Completeness, Soundness, and Zero-Knowledge",
    "Arithmetization: Rank-1 Constraint Systems (R1CS) & QAP",
    "Trusted Setup (Powers of Tau) vs Transparent Proofs",
    "Polynomial Commitment Schemes: KZG Pairings vs FRI Merkle Paths",
    "zk-SNARKs vs zk-STARKs Engineering Comparison Matrix"
  ],
  "relatedRoleSlugs": [
    "security-engineer",
    "systems-architect",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-crypto-fhe-smpc",
  "slug": "homomorphic-encryption-and-secure-multi-party-computation",
  "domainSlug": "cybersecurity-secure-coding",
  "domainName": "Cybersecurity & Secure Coding Practices",
  "title": "Privacy-Preserving Computation: Homomorphic Encryption (FHE) & Secure MPC",
  "level": "ADVANCED",
  "readTimeMinutes": 24,
  "summary": "An architectural exploration of computing on confidential data without decryption: Partially vs Somewhat vs Fully Homomorphic Encryption (FHE: BGV, BFV, CKKS), ciphertext noise budgets and Gentry's bootstrapping theorem, paired with Secure Multi-Party Computation (SMPC: Shamir Secret Sharing, Yao's Garbled Circuits, and Oblivious Transfer).",
  "keyConcepts": [
    "Computing on Encrypted Data: The Homomorphic Property",
    "Lattice-Based FHE Schemes: BGV, BFV, and CKKS (Approximate Numbers)",
    "Ciphertext Noise Accumulation & Craig Gentry's Bootstrapping",
    "Secure Multi-Party Computation (SMPC) via Shamir's Secret Sharing",
    "Yao's Garbled Circuits & Oblivious Transfer (OT)"
  ],
  "relatedRoleSlugs": [
    "security-engineer",
    "systems-architect",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-crypto-pos-slashing-consensus",
  "slug": "consensus-in-proof-of-stake-and-slashing-conditions",
  "domainSlug": "distributed-systems-architecture",
  "domainName": "Distributed Systems & Cloud Architecture",
  "title": "Proof-of-Stake Consensus: LMD-GHOST Fork Choice, Casper FFG & Slashing Protocols",
  "level": "ADVANCED",
  "readTimeMinutes": 24,
  "summary": "A comprehensive investigation of modern Proof-of-Stake (PoS) distributed consensus: resolving the Nothing-at-Stake vulnerability, LMD-GHOST (Latest Message Driven GHOST) fork choice rules, Casper FFG finality gadgets, 2/3 supermajority checkpoints, and slashing condition enforcement against double signing and surround voting.",
  "keyConcepts": [
    "Proof-of-Work vs Proof-of-Stake: Energy & Security Sybil Defense",
    "The 'Nothing-at-Stake' Problem & Economic Security Bounds",
    "LMD-GHOST (Latest Message Driven Greediest Heaviest Observed Subtree)",
    "Casper FFG (Friendly Finality Gadget) Supermajority Checkpoints",
    "Slashing Protocol Violations (Double Proposal & Surround Voting)"
  ],
  "relatedRoleSlugs": [
    "systems-architect",
    "security-engineer",
    "backend-engineer"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-dist-ipfs-content-addressing",
  "slug": "decentralized-storage-ipfs-and-content-addressing",
  "domainSlug": "distributed-systems-architecture",
  "domainName": "Distributed Systems & Cloud Architecture",
  "title": "Decentralized Storage & IPFS: Content Addressing (CIDs), Merkle DAGs & Bitswap",
  "level": "ADVANCED",
  "readTimeMinutes": 23,
  "summary": "An architectural deep-dive into content-addressed distributed file systems: Location-based addressing (URLs) vs Content-based addressing (CIDs), the Multihash / Multicodec standard, Merkle Directed Acyclic Graphs (Merkle DAGs) for immutable deduplication, Kademlia Distributed Hash Tables (DHT), and the Bitswap peer-to-peer data exchange protocol.",
  "keyConcepts": [
    "Location-Based Addressing (URLs) vs Content-Based Addressing (CIDs)",
    "The Anatomy of a CIDv1 (Multibase, Multicodec, Multihash)",
    "UnixFS & Merkle DAGs (Directed Acyclic Graphs) for File Chunking",
    "Kademlia Distributed Hash Table (DHT) & XOR Metric Routing",
    "Bitswap Peer-to-Peer Block Exchange Protocol (Wantlists & Ledger)"
  ],
  "relatedRoleSlugs": [
    "systems-architect",
    "backend-engineer",
    "sre-infrastructure"
  ],
  "practiceMcqsCount": 5
},
{
  "id": "art-sec-hsm-confidential-compute",
  "slug": "hardware-security-modules-and-confidential-compute-attestation",
  "domainSlug": "cybersecurity-secure-coding",
  "domainName": "Cybersecurity & Secure Coding Practices",
  "title": "Hardware Security Modules (HSM) & Confidential Computing: TPM 2.0 & Enclaves",
  "level": "ADVANCED",
  "readTimeMinutes": 24,
  "summary": "An in-depth systems security analysis of Hardware Roots of Trust: Hardware Security Modules (HSM), Trusted Platform Module (TPM 2.0) Platform Configuration Registers (PCRs), cryptographic remote attestation quotes, sealed storage, and Confidential Computing memory encryption enclaves (Intel SGX, AMD SEV-SNP).",
  "keyConcepts": [
    "Hardware Root of Trust (RoT) & Tamper-Resistant Silicon",
    "TPM 2.0 Architecture: Endorsement Keys (EK) & PCR Registers",
    "Cryptographic Remote Attestation & Signed Quote Verification",
    "Sealed Storage: Cryptographic Binding to Boot State",
    "Confidential Computing Enclaves: Intel SGX vs AMD SEV-SNP"
  ],
  "relatedRoleSlugs": [
    "security-engineer",
    "systems-architect",
    "devops-engineer"
  ],
  "practiceMcqsCount": 5
},
];
