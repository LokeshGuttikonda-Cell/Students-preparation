export interface CurriculumArticle {
  id: string;
  slug: string;
  domainSlug: string;
  domainName: string;
  title: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  readTimeMinutes: number;
  summary: string;
  prerequisites: string[];
  keyConcepts: string[];
  overview: string;
  theorySections: Array<{
    heading: string;
    content: string;
    codeSnippet?: {
      language: string;
      code: string;
      explanation: string;
    };
  }>;
  trapsAndAntiPatterns: Array<{
    trap: string;
    misconception: string;
    correction: string;
  }>;
  practiceMcqs: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  relatedRoleSlugs: string[];
  sandboxChallengeId?: string;
}

export interface CurriculumDomain {
  slug: string;
  name: string;
  description: string;
  icon: string;
  articlesCount: number;
}

export const CURRICULUM_DOMAINS: CurriculumDomain[] = [
  {
    slug: 'data-structures-algorithms',
    name: 'Data Structures & Algorithms',
    description: 'Master asymptotic complexity, linear structures, binary search trees, graph traversals, and dynamic programming.',
    icon: '⚡',
    articlesCount: 3,
  },
  {
    slug: 'system-design-architecture',
    name: 'System Design & Software Architecture',
    description: 'Low-level object-oriented design patterns, SOLID principles, concurrency models, and scalable distributed systems.',
    icon: '🏛️',
    articlesCount: 2,
  },
  {
    slug: 'operating-systems-internals',
    name: 'Operating Systems & Systems Programming',
    description: 'Kernel architectures, process scheduling, virtual memory, paging algorithms, deadlocks, and Linux cgroups.',
    icon: '💻',
    articlesCount: 2,
  },
  {
    slug: 'computer-networks-protocols',
    name: 'Computer Networks & Communications',
    description: 'OSI/TCP-IP models, TCP congestion control, UDP/QUIC, DNS hierarchies, TLS 1.3, and modern HTTP/3.',
    icon: '🌐',
    articlesCount: 2,
  },
  {
    slug: 'database-storage-engines',
    name: 'Database Management Systems & Storage',
    description: 'Relational algebra, B+ Trees vs LSM Trees, ACID transactions, MVCC concurrency, and query plan optimization.',
    icon: '🗄️',
    articlesCount: 2,
  },
  {
    slug: 'cloud-infrastructure-architecture',
    name: 'Cloud Computing & Enterprise Infrastructure',
    description: 'VPC network topologies, serverless event-driven compute, IAM least privilege, and disaster recovery strategies.',
    icon: '☁️',
    articlesCount: 2,
  },
  {
    slug: 'devops-sre-kubernetes',
    name: 'DevOps, SRE & Container Orchestration',
    description: 'Docker multi-stage builds, Kubernetes pod scheduling and services, Helm templating, and observability SLI/SLO.',
    icon: '🚀',
    articlesCount: 2,
  },
  {
    slug: 'fullstack-web-engineering',
    name: 'Full-Stack Web Engineering & Modern APIs',
    description: 'Browser rendering engine, JavaScript Event Loop, React Fiber reconciliation, Next.js RSC, and REST/GraphQL/gRPC.',
    icon: '🌐',
    articlesCount: 2,
  },
  {
    slug: 'machine-learning-ai-systems',
    name: 'Machine Learning, AI & LLM Systems',
    description: 'Transformers, multi-head attention, fine-tuning with LoRA, Retrieval-Augmented Generation (RAG), and MLOps.',
    icon: '🤖',
    articlesCount: 2,
  },
  {
    slug: 'data-engineering-pipelines',
    name: 'Data Engineering & Streaming Pipelines',
    description: 'Apache Spark DAG execution, Kafka event streaming, Lakehouse ACID architectures, and Airflow orchestration.',
    icon: '📊',
    articlesCount: 2,
  },
  {
    slug: 'cybersecurity-cryptography',
    name: 'Cybersecurity, AppSec & Cryptography',
    description: 'OWASP Top 10 vulnerabilities, asymmetric cryptography, PKI, OAuth 2.0 with PKCE, and Zero-Trust network models.',
    icon: '🛡️',
    articlesCount: 2,
  },
  {
    slug: 'qa-test-automation-engineering',
    name: 'QA Automation & Software Test Engineering',
    description: 'The Test Automation Pyramid, Test-Driven Development (TDD), Playwright CDP architecture, and k6 load testing.',
    icon: '🧪',
    articlesCount: 2,
  },
  {
    slug: 'quantitative-aptitude-numerical-logic',
    name: 'Quantitative Aptitude & Numerical Logic',
    description: 'Number theory, percentage scaling, time and work mechanics, probability distributions, and speed-time equations.',
    icon: '📐',
    articlesCount: 2,
  },
  {
    slug: 'logical-reasoning-deduction',
    name: 'Logical Reasoning & Analytical Deduction',
    description: 'Categorical syllogisms, blood relation graphs, circular seating arrangements, and pattern decoding.',
    icon: '🧩',
    articlesCount: 2,
  },
];

export const CURRICULUM_ARTICLES: CurriculumArticle[] = [
  // 1. DATA STRUCTURES: Binary Search Trees & Self-Balancing Trees
  {
    id: 'art-dsa-trees',
    slug: 'binary-search-trees-and-avl-balancing',
    domainSlug: 'data-structures-algorithms',
    domainName: 'Data Structures & Algorithms',
    title: 'Binary Search Trees & AVL Self-Balancing Mechanics',
    level: 'INTERMEDIATE',
    readTimeMinutes: 14,
    summary: 'A deep dive into Binary Search Trees (BST) properties, degenerated tree failure modes, and self-balancing rotations in AVL Trees to maintain strict O(log N) operations.',
    prerequisites: ['Recursion and Call Stacks', 'Pointer/Reference Semantics in Memory'],
    keyConcepts: ['BST Invariants', 'Tree Rotations (LL, RR, LR, RL)', 'Balance Factor', 'Height-Balanced Proof'],
    overview: 'A Binary Search Tree provides an intuitive hierarchical data model where every node adheres to the BST invariant: all keys in the left subtree are strictly less than the node key, and all keys in the right subtree are strictly greater. However, naive BST insertion can cause the tree to degenerate into an O(N) linked list under sorted inputs. AVL trees enforce the balance invariant: for any node, |height(left) - height(right)| <= 1.',
    theorySections: [
      {
        heading: '1. The BST Invariant & The Degeneracy Problem',
        content: `In an ideal balanced BST of N nodes, the height H is bounded by floor(log2(N)), yielding O(log N) lookup, insertion, and deletion.
When keys are inserted in strictly monotonic ascending order (e.g. [1, 2, 3, 4, 5]), each new node becomes the right child of its predecessor. The resulting height is N - 1. Lookup collapses to an O(N) linear search, exhausting call stack limits during recursive traversal.`,
      },
      {
        heading: '2. AVL Tree Rotations & Rebalancing',
        content: `To guarantee O(log N) worst-case time, an AVL Tree computes the Balance Factor (BF) for every node:
  BalanceFactor(node) = height(node.left) - height(node.right)
A node is in violation if |BF| > 1. There are four canonical rotation cases:
- Left-Left (LL): Solved with a single Right Rotation.
- Right-Right (RR): Solved with a single Left Rotation.
- Left-Right (LR): Solved with a Left Rotation on the left child, followed by a Right Rotation on the parent.
- Right-Left (RL): Solved with a Right Rotation on the right child, followed by a Left Rotation on the parent.`,
        codeSnippet: {
          language: 'typescript',
          code: `class AVLNode<T> {
  value: T;
  left: AVLNode<T> | null = null;
  right: AVLNode<T> | null = null;
  height: number = 1;

  constructor(val: T) {
    this.value = val;
  }
}

function getHeight<T>(node: AVLNode<T> | null): number {
  return node ? node.height : 0;
}

function getBalanceFactor<T>(node: AVLNode<T> | null): number {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

function rotateRight<T>(y: AVLNode<T>): AVLNode<T> {
  const x = y.left!;
  const T2 = x.right;

  // Perform rotation
  x.right = y;
  y.left = T2;

  // Update heights
  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;

  return x; // New root
}`,
          explanation: 'Standard right rotation transforming node y into the right child of node x, reattaching subtree T2 and recalculating heights in O(1) time.',
        },
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Assuming in-order traversal of a BST is always sorted if duplicates exist',
        misconception: 'If duplicates are allowed without strict left/right convention, duplicate keys can appear on both sides of a node.',
        correction: 'Strictly define duplicate rules: either store a frequency counter on each node, or mandate all duplicates go to the left subtree.',
      },
      {
        trap: 'Neglecting to update height values during AVL node rotations',
        misconception: 'Developers assume tree structure rotation automatically preserves height attributes.',
        correction: 'Heights must be recomputed bottom-up starting from the rotated child before the new subtree root is returned.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-dsa-avl-1',
        question: 'What is the maximum height of an AVL tree containing N nodes, expressed asymptotically?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correctIndex: 1,
        explanation: 'AVL trees maintain the height invariant |height(left) - height(right)| <= 1 at every node. Mathematically, the height is strictly bounded by approximately 1.44 * log2(N), which is O(log N).',
      },
      {
        id: 'q-dsa-avl-2',
        question: 'In an AVL tree, inserting a key into the right subtree of a left child creates which rotation requirement?',
        options: ['Single Right Rotation (LL)', 'Single Left Rotation (RR)', 'Left-Right Double Rotation (LR)', 'Right-Left Double Rotation (RL)'],
        correctIndex: 2,
        explanation: 'An insertion into the right subtree of a left child creates an LR imbalance. It requires a Left rotation on the left child, followed by a Right rotation on the parent.',
      },
    ],
    relatedRoleSlugs: ['backend-systems-engineer', 'fullstack-javascript-developer'],
    sandboxChallengeId: 'code-two-sum',
  },

  // 2. DATA STRUCTURES: Dynamic Programming & Memoization
  {
    id: 'art-dsa-dp',
    slug: 'dynamic-programming-memoization-tabulation',
    domainSlug: 'data-structures-algorithms',
    domainName: 'Data Structures & Algorithms',
    title: 'Dynamic Programming: Optimal Substructure & Overlapping Subproblems',
    level: 'ADVANCED',
    readTimeMinutes: 16,
    summary: 'Deconstructing Dynamic Programming from top-down recursive memoization to bottom-up state tabulation and space-optimization techniques.',
    prerequisites: ['Recursion and Recursion Trees', 'Mathematical Induction'],
    keyConcepts: ['Optimal Substructure', 'Overlapping Subproblems', 'Memoization Cache', 'Tabulation Array', 'Space Compression'],
    overview: 'Dynamic Programming (DP) is an algorithmic paradigm that solves complex problems by breaking them down into simpler subproblems. It is applicable exclusively when a problem exhibits two critical properties: Optimal Substructure (an optimal solution to the problem contains within it optimal solutions to subproblems) and Overlapping Subproblems (a naive recursive algorithm revisits the same subproblems repeatedly rather than generating new subproblems).',
    theorySections: [
      {
        heading: '1. The 0/1 Knapsack Problem: State Transition Equations',
        content: `Given N items, each with a weight w_i and a value v_i, and a knapsack of capacity W, maximize the total value without exceeding capacity.
Let DP[i][w] be the maximum value achievable using a subset of the first i items with a maximum weight constraint of w.
The state recurrence is:
- If item i cannot fit (w_i > w): DP[i][w] = DP[i-1][w]
- If item i can fit (w_i <= w): DP[i][w] = max(DP[i-1][w], v_i + DP[i-1][w - w_i])`,
        codeSnippet: {
          language: 'typescript',
          code: `function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  // Space-optimized 1D tabulation array (iterating backwards to avoid using same item twice)
  const dp = new Array(capacity + 1).fill(0);

  for (let i = 0; i < n; i++) {
    const w = weights[i];
    const v = values[i];
    for (let currentCap = capacity; currentCap >= w; currentCap--) {
      dp[currentCap] = Math.max(dp[currentCap], v + dp[currentCap - w]);
    }
  }

  return dp[capacity];
}`,
          explanation: 'Space-optimized 0/1 knapsack running in O(N * W) time and O(W) auxiliary memory instead of O(N * W) 2D memory.',
        },
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Iterating forward in 1D array 0/1 knapsack tabulation',
        misconception: 'Assuming looping from w to capacity behaves identically to 2D array transitions.',
        correction: 'Forward iteration allows an item to be selected multiple times, transforming the problem into the Unbounded Knapsack problem. 0/1 Knapsack requires backward iteration.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-dsa-dp-1',
        question: 'Which of the following problems can be solved in polynomial time using Dynamic Programming?',
        options: ['Longest Common Subsequence (LCS)', 'Travelling Salesperson Problem (Optimal)', 'Graph Coloring (Optimal Chromatic Number)', 'Boolean Satisfiability (3-SAT)'],
        correctIndex: 0,
        explanation: 'Longest Common Subsequence of two sequences of lengths M and N can be solved in O(M * N) polynomial time using a 2D dynamic programming grid. The other options are NP-Hard.',
      },
    ],
    relatedRoleSlugs: ['backend-systems-engineer', 'ml-ai-engineer'],
  },

  // 3. LOW-LEVEL DESIGN: SOLID & GoF Design Patterns
  {
    id: 'art-lld-solid',
    slug: 'solid-principles-and-gof-patterns',
    domainSlug: 'system-design-architecture',
    domainName: 'System Design & Architecture',
    title: 'SOLID Principles & GoF Design Patterns in Enterprise Systems',
    level: 'INTERMEDIATE',
    readTimeMinutes: 15,
    summary: 'Master the 5 SOLID object-oriented design principles and core Gang of Four (GoF) behavioral, structural, and creational patterns with TypeScript implementations.',
    prerequisites: ['Object-Oriented Programming', 'Interfaces and Abstract Classes'],
    keyConcepts: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Interface Segregation', 'Dependency Inversion', 'Factory', 'Strategy', 'Observer'],
    overview: 'Writing maintainable enterprise software requires decoupling high-level business rules from low-level implementation details. The SOLID principles provide architectural guidelines to prevent code rot, fragility, and tight coupling. When combined with canonical GoF design patterns (such as Strategy, Factory, and Observer), systems become resilient to evolving requirements.',
    theorySections: [
      {
        heading: '1. Dependency Inversion Principle (DIP) & Inversion of Control',
        content: `DIP mandates two rules:
1. High-level modules should not depend on low-level modules; both should depend on abstractions.
2. Abstractions should not depend on details; details should depend on abstractions.
This eliminates direct class instantiations (e.g. 'new MySQLDatabase()') within business controllers, enabling seamless unit testing with test doubles.`,
        codeSnippet: {
          language: 'typescript',
          code: `interface NotificationService {
  send(recipient: string, message: string): Promise<void>;
}

class EmailNotificationService implements NotificationService {
  async send(recipient: string, message: string): Promise<void> {
    // Dispatch email via SMTP
  }
}

class UserRegistrationWorkflow {
  // Depends on abstraction, not concrete EmailNotificationService
  constructor(private readonly notifier: NotificationService) {}

  async registerUser(email: string): Promise<void> {
    // Database save logic ...
    await this.notifier.send(email, 'Welcome to the platform!');
  }
}`,
          explanation: 'Demonstration of Dependency Inversion: UserRegistrationWorkflow is decoupled from the concrete notification transport.',
        },
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Violating Liskov Substitution Principle by throwing UnsupportedOperationException in derived classes',
        misconception: 'Developers inherit from an interface or base class and leave unimplemented methods throwing runtime exceptions.',
        correction: 'Use Interface Segregation (ISP) to break down bulky interfaces into fine-grained contracts so classes only implement relevant methods.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-lld-solid-1',
        question: 'Which GoF design pattern defines a family of interchangeable algorithms, encapsulates each one, and makes them interchangeable at runtime?',
        options: ['Factory Pattern', 'Strategy Pattern', 'Decorator Pattern', 'Singleton Pattern'],
        correctIndex: 1,
        explanation: 'The Strategy Pattern enables selecting an algorithm at runtime without altering the context class that uses it.',
      },
    ],
    relatedRoleSlugs: ['fullstack-javascript-developer', 'backend-systems-engineer'],
  },

  // 4. OPERATING SYSTEMS: Virtual Memory & Page Replacement
  {
    id: 'art-os-memory',
    slug: 'virtual-memory-paging-and-page-replacement',
    domainSlug: 'operating-systems-internals',
    domainName: 'Operating Systems & Systems Programming',
    title: 'Virtual Memory, Multi-Level Paging & Page Replacement Algorithms',
    level: 'ADVANCED',
    readTimeMinutes: 15,
    summary: 'Understand the hardware-software boundary: Translation Lookaside Buffers (TLB), multi-level page tables, page faults, and LRU vs Clock page replacement.',
    prerequisites: ['Binary Arithmetic', 'CPU Registers & RAM Architecture'],
    keyConcepts: ['Page Table Entry (PTE)', 'TLB Hit/Miss', 'Page Fault Handler', 'LRU vs Belady Anomaly', 'Thrashing'],
    overview: 'Virtual memory creates the illusion of a contiguous, private address space for each running process, protected from other processes and bounded only by the processor architecture (e.g. 48-bit canonical addressing on x86-64). The Memory Management Unit (MMU) translates virtual addresses to physical frame numbers using page tables and TLB hardware caches.',
    theorySections: [
      {
        heading: '1. Virtual Address Translation & The TLB',
        content: `A virtual address is partitioned into a Virtual Page Number (VPN) and an Offset.
The MMU checks the Translation Lookaside Buffer (TLB), an associative hardware cache of recent VPN-to-Physical Frame Number (PFN) mappings.
- TLB Hit: Address translated in < 1 clock cycle.
- TLB Miss: MMU walks the multi-level page table (e.g., PML4 -> PDPT -> PD -> PT in x86-64), taking up to 4 memory accesses.`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Beladys Anomaly in Page Replacement',
        misconception: 'Believing that increasing physical memory frame allocation always reduces or maintains the same page fault rate.',
        correction: 'In FIFO page replacement, adding more frames can actually INCREASE page faults for certain access strings. LRU and Optimal algorithms are stack algorithms and are immune to Beladys anomaly.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-os-vm-1',
        question: 'Which page replacement algorithm is mathematically proven to be immune to Beladys Anomaly?',
        options: ['FIFO (First-In, First-Out)', 'LRU (Least Recently Used)', 'Second-Chance Clock', 'Random Replacement'],
        correctIndex: 1,
        explanation: 'LRU is a stack algorithm; the set of pages in an N-frame memory is always a strict subset of the pages in an (N+1)-frame memory. Therefore, increasing frame count can never increase page faults.',
      },
    ],
    relatedRoleSlugs: ['backend-systems-engineer', 'devops-engineer'],
  },

  // 5. NETWORKS: TCP Congestion Control & Modern HTTP/3
  {
    id: 'art-net-tcp',
    slug: 'tcp-congestion-control-and-http3-quic',
    domainSlug: 'computer-networks-protocols',
    domainName: 'Computer Networks & Communications',
    title: 'TCP Congestion Control & The Paradigm Shift to HTTP/3 QUIC',
    level: 'ADVANCED',
    readTimeMinutes: 16,
    summary: 'Analyze Slow Start, Congestion Avoidance, Fast Retransmit, TCP head-of-line blocking, and how UDP-based QUIC and HTTP/3 revolutionize web transport.',
    prerequisites: ['OSI 7-Layer Model', 'Socket API Basics'],
    keyConcepts: ['TCP 3-Way Handshake', 'Congestion Window (cwnd)', 'AIMD', 'Head-of-Line Blocking', 'QUIC UDP Transport', '0-RTT Handshake'],
    overview: 'TCP provides reliable, ordered, byte-stream delivery over an unreliable IP fabric. However, because TCP enforces strict sequential byte ordering at the transport layer, a single lost packet blocks all subsequent data streams in HTTP/2. HTTP/3 solves this by replacing TCP and TLS with QUIC running over UDP, multiplexing independent streams without transport head-of-line blocking.',
    theorySections: [
      {
        heading: '1. TCP Congestion Window Mechanics (AIMD)',
        content: `TCP adjusts its transmission rate via the Congestion Window (cwnd):
- Slow Start: cwnd starts at initial window (e.g. 10 MSS) and doubles every Round Trip Time (RTT) until reaching ssthresh.
- Congestion Avoidance: cwnd grows linearly by 1 MSS per RTT (Additive Increase).
- Packet Loss Detection:
  - 3 Duplicate ACKs: Fast Retransmit cuts ssthresh in half and initiates Fast Recovery.
  - Timeout: cwnd collapses back to 1 MSS, reverting to Slow Start (Multiplicative Decrease).`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Assuming HTTP/2 multiplexing eliminates all Head-of-Line (HoL) blocking',
        misconception: 'HTTP/2 multiplexes HTTP streams onto a single TCP connection, so developers think HoL blocking is eliminated.',
        correction: 'HTTP/2 eliminates application-level HoL blocking, but TCP-level HoL blocking remains: if one packet is dropped, TCP pauses delivery of all multiplexed streams until that packet is retransmitted. HTTP/3 QUIC over UDP resolves this.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-net-tcp-1',
        question: 'What transport layer protocol does HTTP/3 operate over?',
        options: ['TCP', 'SCTP', 'QUIC over UDP', 'TLS over Raw IP'],
        correctIndex: 2,
        explanation: 'HTTP/3 runs over QUIC, which is built on top of UDP to provide native stream multiplexing and independent stream recovery without TCP head-of-line blocking.',
      },
    ],
    relatedRoleSlugs: ['fullstack-javascript-developer', 'backend-systems-engineer', 'cloud-architect'],
  },

  // 6. DATABASES: B+ Trees & Storage Engine Internals
  {
    id: 'art-db-bplus',
    slug: 'b-plus-trees-and-storage-engine-internals',
    domainSlug: 'database-storage-engines',
    domainName: 'Database Management Systems & Storage',
    title: 'B+ Tree Indexing & Relational Storage Engine Internals',
    level: 'ADVANCED',
    readTimeMinutes: 15,
    summary: 'Explore page layouts, slotted pages, B+ Tree node splitting and merging, write-ahead logging (WAL), and MVCC transaction isolation.',
    prerequisites: ['Binary Trees', 'Disk Block / Page I/O Mechanics'],
    keyConcepts: ['Slotted Page Architecture', 'B+ Tree Branching Factor', 'Covering Index', 'Write-Ahead Logging (WAL)', 'MVCC Read View'],
    overview: 'Relational database engines organize disk storage into fixed-size pages (typically 4KB to 16KB). To minimize expensive mechanical or SSD random I/O, database indices use B+ Trees. Unlike standard B-trees, all actual data records or row pointers are stored strictly in leaf nodes linked horizontally, while internal nodes store only guiding keys and child pointers to maximize branching factor.',
    theorySections: [
      {
        heading: '1. B+ Tree High Branching Factor & I/O Reduction',
        content: `In a B+ Tree with page size 16KB and key-pointer pairs averaging 32 bytes:
Each internal node can hold over 500 child pointers (Fan-Out F = 500).
- Root Node (Level 1): 1 page = 500 keys
- Level 2: 500 pages = 250,000 keys
- Level 3 (Leaves): 250,000 pages = 125,000,000 rows!
A 3-level tree indexes 125 million rows with at most 3 page reads. Since the root and level 2 are cached in memory (Buffer Pool), finding any row requires at most 1 physical disk read.`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Using a high-cardinality random UUID as the clustered index primary key',
        misconception: 'Developers choose random v4 UUIDs for security or uniqueness without realizing the impact on storage engine page splits.',
        correction: 'Random UUIDs scatter insertions unpredictably across the entire B+ Tree, causing frequent 50/50 page splits, page fragmentation, and severe disk write amplification. Use sequential IDs (UUIDv7, ULID, or BIGSERIAL).',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-db-bplus-1',
        question: 'Why are all record pointers stored exclusively in leaf nodes of a B+ Tree rather than distributed across internal nodes?',
        options: ['To allow leaf nodes to be cached in CPU registers', 'To maximize the branching factor (fan-out) of internal nodes, minimizing tree height and disk I/O', 'To eliminate the need for write-ahead logging', 'To make delete operations execute in O(1) time'],
        correctIndex: 1,
        explanation: 'By omitting data payloads from internal nodes, each page can store far more keys and pointers, maximizing the branching factor and keeping tree height to 3 or 4 levels for hundreds of millions of rows.',
      },
    ],
    relatedRoleSlugs: ['backend-systems-engineer', 'data-analyst', 'data-engineer'],
    sandboxChallengeId: 'sql-top-earner',
  },

  // 7. CLOUD: High-Availability VPC Networking & IAM Least Privilege
  {
    id: 'art-cloud-vpc',
    slug: 'cloud-vpc-networking-and-iam-security',
    domainSlug: 'cloud-infrastructure-architecture',
    domainName: 'Cloud Computing & Enterprise Infrastructure',
    title: 'Enterprise VPC Topologies & IAM Least-Privilege Architecture',
    level: 'INTERMEDIATE',
    readTimeMinutes: 14,
    summary: 'Design multi-AZ secure VPC architectures with public and private subnets, NAT gateways, Network Access Control Lists (NACLs), Security Groups, and least-privilege IAM policies.',
    prerequisites: ['CIDR Subnetting Basics', 'IP Routing Principles'],
    keyConcepts: ['VPC CIDR', 'Public vs Private Subnet', 'NAT Gateway', 'Security Groups (Stateful) vs NACL (Stateless)', 'IAM ABAC & RBAC'],
    overview: 'Enterprise cloud architectures mandate strict network perimeter isolation. Workloads such as database instances and application microservices must never reside on public subnets with direct internet-routable IP addresses. Instead, multi-Availability-Zone VPCs route inbound traffic through public load balancers and isolate internal compute in private subnets with egress-only NAT gateways.',
    theorySections: [
      {
        heading: '1. Stateful Security Groups vs Stateless Network ACLs',
        content: `Understanding the defense-in-depth boundary:
- Security Groups (Instance-Level, Stateful):
  If an inbound rule allows traffic on port 443, the return outbound traffic is automatically permitted regardless of outbound rules.
- Network ACLs (Subnet-Level, Stateless):
  Traffic must be explicitly allowed in both directions. Inbound rules permitting port 443 must be paired with outbound rules permitting ephemeral return ports (1024-65535).`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Placing database instances in public subnets with 0.0.0.0/0 security group ingress',
        misconception: 'Relying on database username and password alone for security while exposing port 5432 to the public internet.',
        correction: 'Isolate databases in isolated private subnets with no internet gateway route. Only allow inbound connections on port 5432 from the specific security group of the backend application tier.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-cloud-vpc-1',
        question: 'Why does a client connection through a Stateless Network ACL require an outbound rule allowing ephemeral ports (1024-65535)?',
        options: ['Because cloud providers randomize the destination port on every packet', 'Because client operating systems allocate random dynamic ports for return traffic, and stateless filters do not track connection state', 'Because HTTPS traffic switches from TCP to UDP dynamically', 'To allow DNS resolution during the SSL handshake'],
        correctIndex: 1,
        explanation: 'Stateless firewalls (NACLs) evaluate each packet independently without connection state memory. While the inbound request arrives on port 443, the client initiated the connection from a random ephemeral port (1024-65535), which must be explicitly allowed outbound.',
      },
    ],
    relatedRoleSlugs: ['aws-cloud-engineer', 'azure-cloud-engineer', 'cybersecurity-specialist'],
  },

  // 8. DEVOPS: Docker Multi-Stage Optimization & Kubernetes Scheduling
  {
    id: 'art-devops-k8s',
    slug: 'docker-multi-stage-builds-and-kubernetes-scheduling',
    domainSlug: 'devops-sre-kubernetes',
    domainName: 'DevOps, SRE & Container Orchestration',
    title: 'Production Docker Multi-Stage Builds & Kubernetes Pod Scheduling',
    level: 'INTERMEDIATE',
    readTimeMinutes: 15,
    summary: 'Eliminate container bloat with multi-stage Dockerfiles, understand PID 1 signal propagation, and dissect the Kubernetes kube-scheduler filtering and scoring cycle.',
    prerequisites: ['Linux Shell & Process Basics', 'Basic Container Syntax'],
    keyConcepts: ['Multi-Stage Dockerfiles', 'Distroless Images', 'PID 1 Zombie Reaping', 'kube-scheduler Predicates & Priorities', 'Pod Anti-Affinity'],
    overview: 'Production container engineering balances minimal attack surface with predictable runtime orchestration. Naive Dockerfiles bundle compilers, SDKs, and build dependencies into final images, ballooning image sizes to gigabytes and introducing hundreds of CVE vulnerabilities. Multi-stage builds compile artifacts in an ephemeral builder stage and copy only runtime binaries into minimal or distroless base images.',
    theorySections: [
      {
        heading: '1. Anatomy of an Optimized Multi-Stage Node.js Dockerfile',
        content: `By separating dependencies, build steps, and production runtime:
1. Stage 'deps': Install development dependencies needed to compile TypeScript.
2. Stage 'builder': Compile source code to JavaScript.
3. Stage 'runner': Copy only compiled dist/ and production dependencies onto a minimal Alpine or Distroless image. Run as a non-root user.`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Running containers as root user in production',
        misconception: 'Assuming container namespaces provide complete security boundaries even if a process runs as UID 0.',
        correction: 'Container breakouts can escalate to root privileges on the host kernel if UID 0 inside the container maps to UID 0 on the host. Always define USER node or USER nonroot.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-devops-k8s-1',
        question: 'What is the primary operational benefit of multi-stage Docker builds?',
        options: ['Enables running multiple operating systems concurrently in one container', 'Dramatically reduces final production image size and security vulnerabilities by excluding compilers and build tools', 'Bypasses the need for Kubernetes cluster ingress controllers', 'Enables automatic horizontal pod autoscaling'],
        correctIndex: 1,
        explanation: 'Multi-stage builds leave compilers, headers, and build dependencies behind in intermediate stages, producing minimal production images with minimal attack surfaces and faster deployment pull times.',
      },
    ],
    relatedRoleSlugs: ['devops-engineer', 'cloud-architect', 'backend-systems-engineer'],
  },

  // 9. FULLSTACK: JavaScript Event Loop & React Fiber Architecture
  {
    id: 'art-fullstack-fiber',
    slug: 'javascript-event-loop-and-react-fiber-reconciliation',
    domainSlug: 'fullstack-web-engineering',
    domainName: 'Full-Stack Web Engineering & Modern APIs',
    title: 'The V8 Event Loop & React Fiber Concurrent Reconciliation',
    level: 'ADVANCED',
    readTimeMinutes: 16,
    summary: 'A deep dive into microtasks vs macrotasks in the JavaScript runtime, and how React Fiber transformed synchronous recursive diffing into interruptible work units.',
    prerequisites: ['JavaScript Promises & Asynchronous Code', 'React Component Tree Basics'],
    keyConcepts: ['Call Stack', 'Microtask Queue', 'Macrotask Queue', 'React Fiber Tree', 'Time Slicing', 'Concurrent Mode'],
    overview: 'JavaScript is single-threaded: one call stack processes synchronous execution frames to completion. Asynchronous operations rely on the browser/Node event loop, which prioritizes microtasks (Promises, queueMicrotask) over macrotasks (setTimeout, setImmediate). In UI rendering, React 16+ replaced the legacy synchronous recursive reconciler (Stack Reconciler) with Fiber, breaking tree reconciliation into interruptible units of work scheduled across requestIdleCallback time slices.',
    theorySections: [
      {
        heading: '1. Microtask Queue Starvation Invariant',
        content: `The Event Loop execution order in each tick:
1. Execute the current synchronous task on the Call Stack.
2. Drain the ENTIRE Microtask Queue until empty. If a microtask schedules another microtask, it runs in the SAME tick!
3. Check if rendering is required (RAF callback).
4. Dequeue and execute ONE Macrotask from the task queue.
Notice: an infinite loop of Promises (e.g. function loop() { Promise.resolve().then(loop); }) completely starves the Event Loop, freezing DOM updates and user input events.`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Assuming setTimeout(fn, 0) executes before Promise.resolve().then(fn)',
        misconception: 'Developers assume a timer set to 0 milliseconds executes immediately before subsequent promises.',
        correction: 'Promise callbacks are microtasks, which always execute immediately after the current synchronous frame and before ANY queued macrotasks (such as setTimeout).',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-fullstack-fiber-1',
        question: 'What happens if a recursive promise chain continuously schedules microtasks without returning control to the Event Loop?',
        options: ['The browser terminates the tab with an Out-of-Memory exception', 'The microtask queue continuously drains, starving macrotasks, user input, and rendering frames (UI freezes)', 'The browser automatically promotes setTimeout to a microtask', 'The Event Loop executes the microtasks in parallel on Web Workers'],
        correctIndex: 1,
        explanation: 'Because the Event Loop drains all pending microtasks before processing the next macrotask or rendering frame, a continuous chain of microtasks starves all subsequent phases, locking the UI thread.',
      },
    ],
    relatedRoleSlugs: ['fullstack-javascript-developer', 'qa-automation-engineer'],
    sandboxChallengeId: 'code-longest-substr',
  },

  // 10. AI/ML: Transformers & Retrieval-Augmented Generation (RAG)
  {
    id: 'art-ml-rag',
    slug: 'transformers-self-attention-and-rag-pipelines',
    domainSlug: 'machine-learning-ai-systems',
    domainName: 'Machine Learning, AI & LLM Systems',
    title: 'Transformers, Scaled Dot-Product Attention & Production RAG Pipelines',
    level: 'ADVANCED',
    readTimeMinutes: 17,
    summary: 'Deconstruct Query, Key, Value attention matrices, vector embeddings, cosine similarity metrics, and chunking strategies in enterprise RAG systems.',
    prerequisites: ['Linear Algebra (Matrix Multiplication)', 'Probability & Softmax Function'],
    keyConcepts: ['Scaled Dot-Product Attention', 'Multi-Head Attention', 'Dense Vector Embeddings', 'Cosine Similarity', 'RAG Retrieval vs Generation'],
    overview: 'The Transformer architecture revolutionized artificial intelligence by replacing sequential recurrent connections (RNNs/LSTMs) with parallelizable Scaled Dot-Product Attention: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V. In enterprise systems, Large Language Models suffer from hallucination and knowledge staleness. Retrieval-Augmented Generation (RAG) grounds generation by fetching relevant document chunks from vector databases using embedding distance metrics.',
    theorySections: [
      {
        heading: '1. The Scaled Dot-Product Attention Equation',
        content: `Why divide by sqrt(d_k)?
When dimension d_k is large, the dot products Q * K^T grow large in magnitude, pushing the softmax function into regions with extremely small gradients (vanishing gradient problem).
Dividing by sqrt(d_k) scales the variance back to 1, preserving healthy gradients during backpropagation.`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Arbitrary chunking of structured documents without metadata preservation',
        misconception: 'Splitting documents blindly at fixed character boundaries (e.g. every 500 characters) regardless of syntax.',
        correction: 'Fixed-width slicing splits code blocks, tables, and sentence structures in half, destroying semantic embedding vectors. Use recursive semantic chunking with overlapping windows.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-ml-rag-1',
        question: 'In the Transformer Attention mechanism, why is the matrix product Q * K^T divided by sqrt(d_k)?',
        options: ['To convert dense vectors into sparse matrices', 'To prevent dot products from growing excessively large, which pushes softmax into regions with vanishing gradients', 'To enforce positive definite matrix properties', 'To reduce memory consumption from O(N^2) to O(N)'],
        correctIndex: 1,
        explanation: 'For large vector dimensions d_k, the dot product variance grows proportionally to d_k. Scaling by sqrt(d_k) stabilizes the variance at 1, preventing softmax saturation and vanishing gradients during training.',
      },
    ],
    relatedRoleSlugs: ['ml-ai-engineer', 'data-engineer', 'python-developer'],
  },

  // 11. CYBERSECURITY: OWASP Top 10 & Asymmetric Cryptography
  {
    id: 'art-sec-owasp',
    slug: 'owasp-top-10-and-asymmetric-cryptography',
    domainSlug: 'cybersecurity-cryptography',
    domainName: 'Cybersecurity, AppSec & Cryptography',
    title: 'OWASP Top 10 Web Vulnerabilities & Cryptographic Key Exchanges',
    level: 'INTERMEDIATE',
    readTimeMinutes: 15,
    summary: 'Analyze Broken Object Level Authorization (BOLA), SQL Injection, Cross-Site Scripting (XSS), RSA vs Elliptic Curve cryptography, and Diffie-Hellman forward secrecy.',
    prerequisites: ['HTTP Protocol Semantics', 'Basic Modular Arithmetic'],
    keyConcepts: ['BOLA / IDOR', 'Stored vs Reflected XSS', 'Content Security Policy (CSP)', 'RSA vs ECC (Ed25519)', 'Perfect Forward Secrecy (PFS)'],
    overview: 'Modern application security requires defense-in-depth across software logic and network layers. Broken Object Level Authorization (BOLA/IDOR) remains the #1 vulnerability in RESTful microservices, where endpoints validate user identity but fail to assert ownership of requested object IDs. At the cryptographic layer, asymmetric algorithms enable secure key exchange over untrusted networks.',
    theorySections: [
      {
        heading: '1. BOLA / IDOR Vulnerability Mechanics',
        content: `A candidate requests their exam attempt:
GET /api/v1/mock-tests/attempts/1042
The server checks that the JWT is valid (Authentication), but fails to verify that attempt 1042 belongs to the logged-in student (Authorization). An attacker can iterate IDs (1043, 1044) to extract other students test results.
Fix: Scope every query by user:
SELECT * FROM attempts WHERE id = $1 AND user_id = $2;`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Using simple SHA-256 for password hashing',
        misconception: 'Assuming fast cryptographic hashes are suitable for storing user passwords.',
        correction: 'SHA-256 is designed to be extremely fast in hardware. Modern GPUs can calculate billions of SHA-256 hashes per second, enabling rapid rainbow table and brute-force attacks. Use memory-hard key derivation functions: Argon2id or bcrypt.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-sec-owasp-1',
        question: 'Why is Argon2id strictly preferred over MD5 or SHA-256 for password hashing?',
        options: ['Because Argon2id produces shorter hash digests', 'Because Argon2id is memory-hard and computationally expensive, making GPU and ASIC brute-force attacks economically unfeasible', 'Because Argon2id is a reversible symmetric cipher', 'Because SHA-256 cannot run on 64-bit operating systems'],
        correctIndex: 1,
        explanation: 'Argon2id introduces configurable memory and CPU iteration costs. Attackers cannot parallelize brute-force attacks across thousands of GPU cores because each candidate evaluation requires significant RAM allocation.',
      },
    ],
    relatedRoleSlugs: ['cybersecurity-specialist', 'backend-systems-engineer'],
  },

  // 12. QUANTITATIVE APTITUDE: Time & Work, Speed & Probability
  {
    id: 'art-quant-logic',
    slug: 'quantitative-aptitude-speed-work-and-probability',
    domainSlug: 'quantitative-aptitude-numerical-logic',
    domainName: 'Quantitative Aptitude & Numerical Logic',
    title: 'Quantitative Aptitude: Work Rate Mechanics, Relative Speed & Bayes Theorem',
    level: 'BEGINNER',
    readTimeMinutes: 14,
    summary: 'Master the unitary method for work rates, relative speed equations for opposing and parallel motion, and conditional probability with Bayes Theorem.',
    prerequisites: ['Basic Arithmetic & Fractions', 'Linear Equations'],
    keyConcepts: ['Unitary Work Rate', 'Pipes and Cisterns', 'Relative Speed', 'Independent Events', 'Bayes Theorem'],
    overview: 'Quantitative aptitude tests assess analytical dexterity, numerical speed, and structured problem modeling. Whether calculating work completion times when workers join or leave, determining train crossing times via relative velocities, or updating probability beliefs through Bayes theorem, mastery stems from converting word problems into invariant algebraic equations.',
    theorySections: [
      {
        heading: '1. The Unitary Work Invariant',
        content: `If Person A completes a job in T_A days, their work rate is R_A = 1 / T_A of the job per day.
If Person B completes the job in T_B days, their rate is R_B = 1 / T_B.
Working together, their combined rate is:
  R_combined = R_A + R_B = (T_A + T_B) / (T_A * T_B)
Total time required: T_together = 1 / R_combined = (T_A * T_B) / (T_A + T_B).`,
      },
      {
        heading: '2. Relative Speed Mechanics',
        content: `When two objects move towards each other (opposite directions), their relative speed is the SUM of their speeds:
  S_rel = S_1 + S_2
When moving in the same direction, their relative speed is the ABSOLUTE DIFFERENCE:
  S_rel = |S_1 - S_2|`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Averaging speeds directly to find average speed over equal distances',
        misconception: 'If a car travels at 40 km/h and returns at 60 km/h, candidates guess the average speed is (40 + 60) / 2 = 50 km/h.',
        correction: 'Average speed is Total Distance / Total Time. Because more time is spent traveling at the slower speed, the average is the harmonic mean: 2 * (40 * 60) / (40 + 60) = 48 km/h.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-quant-work-1',
        question: 'Worker A can complete a project in 12 days, and Worker B can complete the same project in 24 days. How many days will they take working together?',
        options: ['6 days', '8 days', '10 days', '18 days'],
        correctIndex: 1,
        explanation: 'Combined rate = 1/12 + 1/24 = 2/24 + 1/24 = 3/24 = 1/8. Therefore, the project will be completed in 1 / (1/8) = 8 days.',
      },
    ],
    relatedRoleSlugs: ['data-analyst', 'python-developer'],
  },
  // 13. DATA ENGINEERING: Apache Kafka Internals & Stream Processing
  {
    id: 'art-de-kafka',
    slug: 'apache-kafka-internals-and-stream-processing',
    domainSlug: 'data-engineering-pipelines',
    domainName: 'Data Engineering & Streaming Pipelines',
    title: 'Distributed Log Storage Internals: Kafka Partitions, Rebalance & Exactly-Once Semantics',
    level: 'ADVANCED',
    readTimeMinutes: 18,
    summary: 'Master distributed append-only commit logs, In-Sync Replicas (ISR), consumer group rebalance protocols, and Exactly-Once Semantics (EOS) with transactional producers.',
    prerequisites: ['Operating System Page Cache & Disk I/O', 'Network Socket Communication'],
    keyConcepts: ['Append-Only Commit Log', 'Zero-Copy (sendfile)', 'In-Sync Replicas (ISR)', 'Consumer Group Protocol', 'Exactly-Once Semantics (EOS)'],
    overview: 'Unlike traditional message brokers that rely on random-access disk indexing or in-memory queues with transient destructive dequeues, modern distributed stream platforms model data streams as immutable, distributed, append-only partitioned commit logs. By leveraging sequential disk I/O, OS page caching, and the Linux sendfile() zero-copy syscall, brokers achieve multi-gigabyte throughput with microsecond latency.',
    theorySections: [
      {
        heading: '1. Log Segment Storage & Zero-Copy Efficiency',
        content: `Each topic partition is represented on the filesystem as a sequence of segment files (.log) with corresponding sparse index (.index) and time index (.timeindex) files.
Sequential disk writes bypass random head seeks on HDDs and avoid write amplification on SSDs. Furthermore, when serving consumers, brokers read from the Linux page cache and invoke the sendfile() system call:
  Kernel Space: Disk -> OS Page Cache -> Socket Buffer -> NIC
This eliminates intermediate user-space buffer copies and context switches, allowing network transfer at line rate.`,
        codeSnippet: {
          language: 'typescript',
          code: `// Conceptual model of an append-only commit log partition
interface LogEntry {
  offset: number;
  timestamp: number;
  key: string;
  value: Uint8Array;
}

class PartitionCommitLog {
  private entries: LogEntry[] = [];
  private nextOffset: number = 0;

  public append(key: string, value: Uint8Array): number {
    const assignedOffset = this.nextOffset++;
    this.entries.push({
      offset: assignedOffset,
      timestamp: Date.now(),
      key,
      value,
    });
    return assignedOffset;
  }

  public readFrom(offset: number, maxCount: number): LogEntry[] {
    return this.entries.filter(e => e.offset >= offset).slice(0, maxCount);
  }
}`,
          explanation: 'Demonstrates append-only offset assignment where entries are immutable once written and indexed sequentially.',
        },
      },
      {
        heading: '2. High-Watermark (HW) & In-Sync Replicas (ISR)',
        content: `Data durability is governed by replication factor R and the ISR set. The partition leader accepts writes and replicates them to follower brokers.
- Log End Offset (LEO): The offset of the next record to be written in a broker's local replica.
- High-Watermark (HW): The highest offset replicated across ALL in-sync replicas in the ISR.
Consumers are only permitted to read records up to the High-Watermark, preventing uncommitted data from being exposed if the leader fails before replication finishes.`,
      },
      {
        heading: '3. Consumer Group Coordination & Rebalance Protocols',
        content: `Consumers form consumer groups to scale consumption across partitions. When a consumer joins, leaves, or fails a heartbeat check:
1. The Group Coordinator triggers a Rebalance.
2. Under Eager Rebalance, all consumers stop processing and revoke assignments (Stop-the-World).
3. Under Cooperative Sticky Rebalance, consumers continue processing unaffected partitions while only reassigned partitions are migrated, drastically slashing rebalance latency.`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Confusing auto.offset.reset = earliest with reprocessing all historical data on restart',
        misconception: 'Developers assume setting auto.offset.reset=earliest will cause a restarting consumer to re-read all messages from offset 0.',
        correction: 'auto.offset.reset only applies when NO committed offset exists for that consumer group. If a committed offset is stored in __consumer_offsets, the consumer resumes from the committed offset regardless of this setting.',
      },
      {
        trap: 'Assuming acks=all guarantees zero data loss with min.insync.replicas=1',
        misconception: 'If producer sets acks=all, messages are safe from broker failure even if other replicas are offline.',
        correction: 'If min.insync.replicas is 1, acks=all considers the write successful as soon as only the leader acknowledges it. If the leader crashes before other brokers recover, the message is permanently lost.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-de-kafka-1',
        question: 'Under a Kafka topic with replication-factor=3 and min.insync.replicas=2, what happens if 2 follower replicas crash and a producer attempts to write with acks=all?',
        options: [
          'The write succeeds because the leader is still online and accepts messages.',
          'The write fails with NotEnoughReplicasException because fewer than 2 replicas are in the ISR.',
          'The leader automatically buffers messages in RAM until followers recover.',
          'The cluster shuts down to prevent data corruption.',
        ],
        correctIndex: 1,
        explanation: 'When min.insync.replicas=2 and 2 out of 3 brokers are offline, the ISR contains only 1 replica (the leader). A write with acks=all requires at least 2 in-sync replicas, so the broker rejects the produce request with NotEnoughReplicasException.',
      },
      {
        id: 'q-de-kafka-2',
        question: 'How does Kafka achieve high consumer read throughput using the Linux kernel?',
        options: [
          'By compressing messages in CPU L1 cache before sending to clients',
          'By using sendfile() system call to transfer page cache buffers directly to the network socket without user-space copying',
          'By spinning up a separate worker thread for each client read socket',
          'By writing all messages into an in-memory Redis cluster',
        ],
        correctIndex: 1,
        explanation: 'Kafka relies on the zero-copy sendfile() system call. Data is transferred directly from the OS page cache to the network socket buffer inside kernel space, avoiding context switches and user-space memory copies.',
      },
    ],
    relatedRoleSlugs: ['data-engineer', 'backend-systems-engineer'],
  },

  // 14. QA AUTOMATION: Test Pyramid & Playwright Architecture
  {
    id: 'art-qa-playwright',
    slug: 'test-automation-pyramid-and-playwright-architecture',
    domainSlug: 'qa-test-automation-engineering',
    domainName: 'QA Automation & Software Test Engineering',
    title: 'The Test Automation Pyramid & Modern CDP Browser Orchestration',
    level: 'INTERMEDIATE',
    readTimeMinutes: 15,
    summary: 'Explore the mathematical distribution of the Test Automation Pyramid, Chrome DevTools Protocol (CDP) WebSocket orchestration, and auto-waiting resilience against UI test flakiness.',
    prerequisites: ['JavaScript/TypeScript Async/Await', 'Document Object Model (DOM) Event Propagation'],
    keyConcepts: ['Test Pyramid Economics', 'CDP vs WebDriver Architecture', 'Auto-Waiting Locators', 'Hermetic Test Isolation', 'Network Route Mocking'],
    overview: 'Automated testing suites fail in production when organizations invert the Test Pyramid into an "Ice Cream Cone" or "Cupcake Anti-Pattern", relying predominantly on brittle, slow, end-to-end browser tests. By establishing a 70% Unit, 20% Integration, and 10% E2E distribution, and leveraging bi-directional browser WebSocket protocols, engineering teams achieve high defect escape prevention with near-zero flakiness.',
    theorySections: [
      {
        heading: '1. Test Pyramid Economics & Defect Escape Cost',
        content: `The cost of defect remediation increases by an order of magnitude across each development stage:
- Unit Test: Sub-millisecond execution, runs on git commit hooks, pinpoint line-level fault localization.
- Integration Test: Evaluates component boundaries, database queries, and service contracts in 10-100ms.
- End-to-End (E2E) Test: Drives complete browser runtimes with network rendering, taking 1-10s per test case.
Maintaining a 70/20/10 pyramid ensures total build pipeline runtime remains under 10 minutes while preserving complete regression coverage.`,
      },
      {
        heading: '2. Chrome DevTools Protocol (CDP) vs Legacy WebDriver',
        content: `Legacy testing tools used JSON Wire Protocol over HTTP, requiring a round-trip HTTP POST for every individual DOM query or click action. This created race conditions against dynamic JavaScript client hydration.
Modern browser automation engines communicate directly over persistent WebSockets using Chrome DevTools Protocol (CDP). This grants:
- Native event loop interception
- Real-time DOM mutation observers
- Bi-directional network request interception and mocking
- Automatic awaiting of actionable states (visible, stable, enabled, clickable) before executing actions.`,
        codeSnippet: {
          language: 'typescript',
          code: `import { test, expect } from '@playwright/test';

test('hermetic checkout flow with intercepted payment gateway', async ({ page }) => {
  // Mock external payment gateway network call
  await page.route('**/api/v1/payments/process', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ transactionId: 'tx-test-999', status: 'SUCCESS' }),
    });
  });

  await page.goto('/checkout');
  // Auto-waits for visibility and interactability without arbitrary sleep()
  await page.getByRole('button', { name: 'Complete Order' }).click();

  await expect(page.getByText('Payment Confirmed')).toBeVisible();
});`,
          explanation: 'Demonstrates resilient locator actionability and hermetic network mocking to avoid external third-party flakiness.',
        },
      },
      ],
    trapsAndAntiPatterns: [
      {
        trap: 'Inserting arbitrary setTimeout or sleep delays to resolve flakiness',
        misconception: 'Adding sleep(3000) allows the UI animation or network request to finish reliably.',
        correction: 'Arbitrary timeouts accumulate to hours of CI runtime and still fail when CI runner CPU throttles under load. Use auto-waiting assertions or explicit event-driven waits (e.g. waitForResponse, waitForSelector).',
      },
      {
        trap: 'Testing third-party external services in automated CI regression runs',
        misconception: 'A real E2E test must hit live payment providers or SMS gateways.',
        correction: 'External services introduce rate limits, downtime, and nondeterminism. Mock third-party external endpoints at the network boundary during automated CI suites.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-qa-arch-1',
        question: 'Why does the Chrome DevTools Protocol (CDP) WebSocket architecture provide significantly faster and more stable tests than legacy HTTP WebDriver?',
        options: [
          'It compiles the test scripts directly into x86 machine instructions inside the browser.',
          'It uses a persistent bi-directional WebSocket connection that observes DOM mutation events and network lifecycles directly within the browser engine.',
          'It disables JavaScript execution inside the browser to accelerate rendering.',
          'It stores all test assertions in local browser storage.',
        ],
        correctIndex: 1,
        explanation: 'CDP communicates over a single persistent WebSocket, enabling direct bi-directional event subscription, DOM mutation observation, and actionability checks without HTTP request polling overhead.',
      },
    ],
    relatedRoleSlugs: ['qa-automation-engineer', 'fullstack-javascript-developer'],
  },

  // 15. LOGICAL REASONING: Deductive Logic & Syllogisms
  {
    id: 'art-logic-syllogisms',
    slug: 'categorical-syllogisms-and-deductive-logic',
    domainSlug: 'logical-reasoning-deduction',
    domainName: 'Logical Reasoning & Analytical Deduction',
    title: 'Formal Deductive Logic: Categorical Syllogisms & Venn Diagram Proofs',
    level: 'BEGINNER',
    readTimeMinutes: 12,
    summary: 'Deconstruct formal deductive syllogisms, term distribution rules, mood and figure classifications, and Venn diagrammatic proofs for campus technical assessments.',
    prerequisites: ['Basic Set Theory (Union, Intersection, Subset)'],
    keyConcepts: ['Categorical Propositions (A, E, I, O)', 'Term Distribution', 'Middle Term Fallacy', 'Venn Diagram Modeling'],
    overview: 'Deductive reasoning evaluates the validity of arguments where the truth of the premises strictly guarantees the truth of the conclusion. In technical screening exams, syllogism questions test candidates ability to evaluate formal logical structure independent of real-world empirical beliefs.',
    theorySections: [
      {
        heading: '1. The Four Categorical Proposition Types',
        content: `Every standard syllogism statement belongs to one of four classical forms:
- Type A (Universal Affirmative): "All S are P" (Subject distributed, Predicate undistributed)
- Type E (Universal Negative): "No S are P" (Both Subject and Predicate distributed)
- Type I (Particular Affirmative): "Some S are P" (Neither Subject nor Predicate distributed)
- Type O (Particular Negative): "Some S are not P" (Subject undistributed, Predicate distributed)

A term is "distributed" if the proposition makes a claim about EVERY member of the class designated by the term.`,
      },
      {
        heading: '2. The Invariant Rules of Valid Syllogisms',
        content: `To determine validity without drawing diagrams:
1. Middle Term Distribution: The middle term (the term appearing in both premises but not the conclusion) MUST be distributed in at least one premise.
2. End Term Distribution: Any term distributed in the conclusion MUST be distributed in its premise.
3. Negative Premise Rules:
   - If one premise is negative, the conclusion MUST be negative.
   - Two negative premises yield NO valid conclusion.
4. Particular Premise Rules:
   - If one premise is particular, the conclusion MUST be particular.
   - Two particular premises yield NO valid conclusion.`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Confusing empirical real-world plausibility with logical validity',
        misconception: 'If the statement says "All cats are airplanes", candidates reject it because cats cannot fly in reality.',
        correction: 'Logical deduction is concerned solely with validity (the structural consequence of the premises), NOT truth of the premises in the physical universe.',
      },
      {
        trap: 'Treating "Some S are P" as implying "Some S are NOT P"',
        misconception: 'In everyday language, saying "Some apples are red" implies some are green.',
        correction: 'In formal logic, "Some" means "At least one". "Some S are P" is fully consistent with the possibility that ALL S are P.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-logic-syl-1',
        question: 'Premises: (1) All software engineers are problem solvers. (2) Some problem solvers are musicians. Which conclusion logically follows?',
        options: [
          'All software engineers are musicians.',
          'Some software engineers are musicians.',
          'No software engineers are musicians.',
          'None of the above conclusions strictly follows.',
        ],
        correctIndex: 3,
        explanation: 'The middle term is "problem solvers". In premise 1, it is the predicate of a Type A statement (undistributed). In premise 2, it is the subject of a Type I statement (undistributed). Because the middle term is not distributed in either premise, the Fallacy of the Undistributed Middle is committed. No definitive conclusion follows.',
      },
    ],
    relatedRoleSlugs: ['python-developer', 'data-analyst'],
  },

  // 16. SYSTEM DESIGN: Distributed Consensus Raft & Paxos
  {
    id: 'art-sys-consensus',
    slug: 'distributed-consensus-raft-and-paxos',
    domainSlug: 'system-design-architecture',
    domainName: 'System Design & Software Architecture',
    title: 'Distributed Consensus: Raft Protocol State Machines & Majority Quorums',
    level: 'ADVANCED',
    readTimeMinutes: 20,
    summary: 'Deconstruct how distributed systems achieve fault-tolerant state machine replication through Raft leader election, randomized election timers, log matching invariants, and majority quorum proofs.',
    prerequisites: ['CAP Theorem and Network Partitions', 'State Machine Replication Concepts'],
    keyConcepts: ['State Machine Replication (SMR)', 'Majority Quorum (N/2 + 1)', 'Randomized Heartbeat Timers', 'Raft Log Matching Property', 'Joint Consensus Reconfiguration'],
    overview: 'In an asynchronous network where servers can crash, reboot, or experience network partitions, achieving distributed consensus is the cornerstone of high-availability coordination engines (such as etcd, ZooKeeper, and Spanner). Raft decomposes consensus into three independent subproblems: Leader Election, Log Replication, and Safety Invariants.',
    theorySections: [
      {
        heading: '1. Majority Quorum Mathematics',
        content: `In a cluster of N nodes, any consensus operation requires agreement from a majority quorum Q:
  Q = floor(N / 2) + 1
Key mathematical property: Any two majority quorums Q1 and Q2 MUST overlap by at least one node:
  |Q1 intersect Q2| >= 1
Because any elected leader must obtain votes from a majority quorum, and any committed log entry must be written to a majority quorum, every candidate for leadership is guaranteed to intersect with at least one node containing the latest committed log entry.`,
      },
      {
        heading: '2. Raft Leader Election & Split Votes',
        content: `Raft nodes exist in one of three states: Follower, Candidate, or Leader.
- When a Follower does not receive a heartbeat within its randomized election timer (e.g. 150ms - 300ms), it transitions to Candidate, increments its current term, votes for itself, and sends RequestVote RPCs.
- Randomizing the timeout prevents split votes where multiple nodes become candidates simultaneously and divide votes equally.`,
        codeSnippet: {
          language: 'typescript',
          code: `enum RaftState { FOLLOWER, CANDIDATE, LEADER }

interface RaftNode {
  id: string;
  currentTerm: number;
  votedFor: string | null;
  state: RaftState;
  log: Array<{ term: number; command: string }>;
}

function handleRequestVote(
  node: RaftNode,
  candidateTerm: number,
  candidateId: string,
  lastLogIndex: number,
  lastLogTerm: number
): { voteGranted: boolean; term: number } {
  // Reject if candidate term is older than our term
  if (candidateTerm < node.currentTerm) {
    return { voteGranted: false, term: node.currentTerm };
  }

  // Adopt newer term and revert to follower
  if (candidateTerm > node.currentTerm) {
    node.currentTerm = candidateTerm;
    node.state = RaftState.FOLLOWER;
    node.votedFor = null;
  }

  // Check election safety: voter only votes if candidate log is at least as up-to-date
  const ourLastLogTerm = node.log.length > 0 ? node.log[node.log.length - 1].term : 0;
  const ourLastLogIndex = node.log.length - 1;
  const isLogUpToDate =
    lastLogTerm > ourLastLogTerm ||
    (lastLogTerm === ourLastLogTerm && lastLogIndex >= ourLastLogIndex);

  const canVote = (node.votedFor === null || node.votedFor === candidateId) && isLogUpToDate;

  if (canVote) {
    node.votedFor = candidateId;
    return { voteGranted: true, term: node.currentTerm };
  }

  return { voteGranted: false, term: node.currentTerm };
}`,
          explanation: 'Implements Raft election safety invariant: a node will only cast its vote for a candidate whose log is at least as complete as its own.',
        },
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Assuming a 5-node cluster provides higher write availability than a 3-node cluster',
        misconception: 'More nodes in a consensus cluster means the cluster is more resilient and handles higher throughput.',
        correction: 'A 3-node cluster tolerates 1 failure ((3/2) - 1). A 5-node cluster tolerates 2 failures ((5/2) - 1). However, consensus write latency INCREASES with cluster size because the leader must collect acknowledgments from more nodes (3 instead of 2). Clusters are kept small (3, 5, or 7 nodes) for coordination.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-sys-raft-1',
        question: 'In a 5-node Raft consensus cluster, what is the maximum number of simultaneous node failures the cluster can survive while continuing to accept state mutations?',
        options: ['1 node', '2 nodes', '3 nodes', '4 nodes'],
        correctIndex: 1,
        explanation: 'A cluster of N nodes requires a majority quorum of floor(N/2) + 1. For N=5, quorum = 3. Therefore, the cluster can tolerate at most 5 - 3 = 2 failed nodes. If 3 nodes fail, only 2 remain, which cannot form a majority of 5.',
      },
    ],
    relatedRoleSlugs: ['backend-systems-engineer', 'devops-engineer'],
  },

  // 17. DATABASE INTERNALS: ACID, MVCC & Isolation Anomalies
  {
    id: 'art-db-mvcc',
    slug: 'acid-transactions-mvcc-and-isolation-anomalies',
    domainSlug: 'database-storage-engines',
    domainName: 'Database Management Systems & Storage',
    title: 'ACID Internals: MVCC Read Views, WAL ARIES & Concurrency Anomalies',
    level: 'ADVANCED',
    readTimeMinutes: 19,
    summary: 'Explore Multi-Version Concurrency Control (MVCC) row versioning, Write-Ahead Logging (WAL) durability, and isolation anomalies from Dirty Reads to Write Skew.',
    prerequisites: ['Relational Database Basics', 'Basic B-Tree Index Concepts'],
    keyConcepts: ['Write-Ahead Logging (WAL)', 'MVCC Visibility Rules', 'Non-Repeatable Read vs Phantom Read', 'Write Skew Phenomenon', 'Snapshot Isolation vs Serializable'],
    overview: 'Early relational databases enforced transaction isolation using pessimistic Two-Phase Locking (2PL), where shared read locks blocked exclusive write locks, destroying read throughput in concurrent workloads. Modern relational storage engines employ Multi-Version Concurrency Control (MVCC): readers never block writers, and writers never block readers.',
    theorySections: [
      {
        heading: '1. Multi-Version Tuple Representation',
        content: `Under MVCC, updating a row does not overwrite its disk block in place. Instead, the storage engine appends a new version of the tuple into the page or rollback undo log:
Every tuple contains metadata headers:
- xmin: The transaction ID that inserted this version.
- xmax: The transaction ID that deleted or superseded this version (0 if currently live).
A transaction with Read View [ActiveTxList] evaluates visibility by checking if a row version was committed prior to the start of the snapshot and not deleted by an already-committed transaction.`,
      },
      {
        heading: '2. Concurrency Anomalies & ANSI Isolation Levels',
        content: `Standard SQL defines four isolation levels based on prohibited phenomena:
1. Read Uncommitted: Permits Dirty Reads (reading uncommitted mutations from another transaction).
2. Read Committed: Prohibits Dirty Reads; permits Non-Repeatable Reads (reading the same row twice within a transaction yields different values).
3. Repeatable Read: Prohibits Non-Repeatable Reads; evaluates against a point-in-time snapshot.
4. Serializable: Completely prohibits all concurrent execution anomalies, guaranteeing sequential execution equivalence.

Critique: ANSI SQL failed to identify the Write Skew anomaly, which occurs under Snapshot Isolation when concurrent transactions read overlapping data sets, make disjoint modifications, and violate a global business invariant.`,
      },
    ],
    trapsAndAntiPatterns: [
      {
        trap: 'Assuming Repeatable Read prevents all race conditions and anomalies',
        misconception: 'If a database runs under Repeatable Read, concurrent transactions cannot corrupt data.',
        correction: 'Repeatable Read / Snapshot Isolation is susceptible to Write Skew. For example, two on-call doctors simultaneously checking if count(on_call) >= 2 and then taking leave will both take leave, leaving zero doctors on call. Full Serializability or SELECT FOR UPDATE is required.',
      },
    ],
    practiceMcqs: [
      {
        id: 'q-db-mvcc-1',
        question: 'Under MVCC, how does a database engine allow long-running analytics read queries to execute concurrently with high-frequency write transactions without locking rows?',
        options: [
          'By pausing all write transactions until the read query finishes',
          'By reading historical tuple versions governed by transaction visibility headers (xmin/xmax) while writers append newer versions',
          'By converting all writes into temporary file logs stored in memory',
          'By copying the entire database into a temporary RAM disk',
        ],
        correctIndex: 1,
        explanation: 'MVCC stores multiple versions of a row. When a transaction performs an UPDATE, it appends a new version without deleting the old version in-place. Readers observe a snapshot consisting of versions committed prior to their read view without taking locks.',
      },
    ],
    relatedRoleSlugs: ['backend-systems-engineer', 'data-analyst'],
  },
];

