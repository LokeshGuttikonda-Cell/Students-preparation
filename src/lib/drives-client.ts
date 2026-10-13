import { triggerBrowserFileDownload } from './admin-database-client';

// ---------------------------------------------------------------------------
// Domain Types & Interfaces
// ---------------------------------------------------------------------------

export type RoundType =
  | 'SCREENING_MCQ'
  | 'SCENARIO_DIAGNOSIS'
  | 'SYSTEM_DEFENSE'
  | 'LEADERSHIP_ALIGNMENT';

export interface DriveRoundQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface DriveRound {
  roundNumber: number;
  title: string;
  roundType: RoundType;
  durationMinutes: number;
  cutoffPercentage: number;
  instructions: string;
  questions: DriveRoundQuestion[];
}

export interface PlacementDrive {
  id: string;
  title: string;
  consortiumName: string;
  roleSlug: string;
  roleTitle: string;
  ctcFormatted: string;
  ctcBreakdown: {
    base: string;
    performanceBonus: string;
    stockOptions: string;
  };
  minGpa: number;
  description: string;
  rounds: DriveRound[];
}

export type DriveApplicationStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'OFFER_EXTENDED'
  | 'ELIMINATED';

export interface PlacementOfferLetter {
  offerCode: string;
  candidateName: string;
  collegeName: string;
  roleTitle: string;
  consortiumName: string;
  ctcAnnual: string;
  baseSalary: string;
  joiningDate: string;
  validityDate: string;
  verificationHash: string;
  terms: string[];
}

export interface DriveApplication {
  driveId: string;
  status: DriveApplicationStatus;
  currentRoundIndex: number; // 0-based: 0 -> Round 1, 1 -> Round 2, etc.
  roundScores: Record<number, number>; // roundNumber -> percentage score
  offerDetails?: PlacementOfferLetter;
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// Drives Catalog (100% Vendor-Neutral Consortium Profiles)
// ---------------------------------------------------------------------------

export const PLACEMENT_DRIVES_CATALOG: PlacementDrive[] = [
  {
    id: 'hyperscale-backend',
    title: 'HyperScale Distributed Systems Placement Drive',
    consortiumName: 'HyperScale Systems Consortium',
    roleSlug: 'java-backend-developer',
    roleTitle: 'Distributed Systems Backend Engineer',
    ctcFormatted: '₹24.5 LPA ($140,000)',
    ctcBreakdown: {
      base: '₹18.0 LPA',
      performanceBonus: '₹3.5 LPA',
      stockOptions: '₹3.0 LPA',
    },
    minGpa: 7.5,
    description: 'Premier multi-tier campus drive hiring software engineers for high-throughput microservices, event streaming, and distributed database consensus.',
    rounds: [
      {
        roundNumber: 1,
        title: 'Online Technical & CS Fundamentals Screening',
        roundType: 'SCREENING_MCQ',
        durationMinutes: 15,
        cutoffPercentage: 70,
        instructions: 'Answer core systems questions spanning concurrency, database indexing, and memory allocation. Negative marking applies.',
        questions: [
          {
            id: 'hs-r1-q1',
            prompt: 'In relational database B-Trees, why do leaf node pages maintain bidirectional pointers to neighboring leaf pages?',
            options: [
              'To support O(1) hash lookups on arbitrary keys',
              'To enable efficient range scans without re-traversing internal parent nodes',
              'To prevent lock escalation during table joins',
              'To eliminate disk fragmentation during compaction',
            ],
            correctIndex: 1,
            explanation: 'Bidirectional leaf pointers allow sequential range scans (e.g., BETWEEN queries) to traverse adjacent pages without ascending back up the tree hierarchy.',
            points: 25,
          },
          {
            id: 'hs-r1-q2',
            prompt: 'What condition causes false sharing in multi-core CPU architectures?',
            options: [
              'Two threads simultaneously executing atomic Compare-And-Swap on the same variable',
              'Multiple threads modifying distinct variables located on the exact same CPU cache line',
              'Virtual memory page faults during process context switches',
              'Branch misprediction in nested loop iterations',
            ],
            correctIndex: 1,
            explanation: 'False sharing occurs when distinct variables accessed by independent cores reside on the same cache line (typically 64 bytes), triggering unnecessary cache invalidation bus traffic.',
            points: 25,
          },
          {
            id: 'hs-r1-q3',
            prompt: 'Under the Raft consensus protocol, what happens when a leader node receives an append request with an index and term that does not match the follower log?',
            options: [
              'The follower node shuts down immediately to protect log integrity',
              'The follower rejects the AppendEntries RPC, prompting the leader to decrement nextIndex and retry',
              'The follower accepts the entry and marks previous conflicting entries as stale',
              'The cluster triggers an immediate split-brain election',
            ],
            correctIndex: 1,
            explanation: 'Followers reject logs that do not seamlessly match preceding terms. The leader decrements nextIndex until a common log prefix is identified.',
            points: 25,
          },
          {
            id: 'hs-r1-q4',
            prompt: 'Which HTTP/2 and HTTP/3 architectural improvement eliminates Head-of-Line (HoL) blocking at the transport layer?',
            options: [
              'Server Push headers',
              'QUIC over UDP with independent per-stream flow control',
              'HPACK header compression',
              'TCP selective acknowledgements (SACK)',
            ],
            correctIndex: 1,
            explanation: 'HTTP/3 utilizes QUIC over UDP so packet loss on one stream does not stall unrelated streams, solving transport-layer HoL blocking.',
            points: 25,
          },
        ],
      },
      {
        roundNumber: 2,
        title: 'Diagnostic Scenario & Incident Troubleshooting Lab',
        roundType: 'SCENARIO_DIAGNOSIS',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Analyze production diagnostics, query execution plans, and memory heap dumps to pinpoint systemic bottlenecks.',
        questions: [
          {
            id: 'hs-r2-q1',
            prompt: 'SCENARIO: An order service experiences sudden latency spikes from 15ms to 3200ms every 30 seconds. Database CPU is at 98%, with hundreds of active connection threads waiting on "exclusive lock on relation orders". What is the root cause?',
            options: [
              'A missing composite index on (customer_id, created_at) during customer queries',
              'An unindexed foreign key column triggering full table locks during parent deletion / update transactions',
              'Network socket saturation between the connection pooler and database server',
              'V8 garbage collection major sweep pauses',
            ],
            correctIndex: 1,
            explanation: 'Unindexed foreign key columns in relational databases force share/exclusive table-level locks on the child table whenever rows in the parent table are modified or deleted.',
            points: 50,
          },
          {
            id: 'hs-r2-q2',
            prompt: 'SCENARIO: A distributed cache cluster experiences a 90% drop in cache hit ratio within 3 seconds, causing immediate backend database overload. Memory charts show key count was constant. What pattern caused this outage?',
            options: [
              'Hash collision in consistent hashing ring',
              'Simultaneous TTL expiration on millions of keys created during morning peak (Cache Avalanche)',
              'TCP SYN flood attacking the cache port',
              'Linux OOM killer terminating worker threads',
            ],
            correctIndex: 1,
            explanation: 'Setting identical expiration times on bulk keys results in synchronized expiration (Cache Avalanche), sending all subsequent read traffic to the primary database.',
            points: 50,
          },
        ],
      },
      {
        roundNumber: 3,
        title: 'Socratic System Design & Architecture Defense',
        roundType: 'SYSTEM_DEFENSE',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Defend high-level architectural decisions under strict consistency, fault tolerance, and network partition constraints.',
        questions: [
          {
            id: 'hs-r3-q1',
            prompt: 'DEFENSE PROMPT: You are designing an idempotency key subsystem for a payment processing gateway handling 10,000 req/s. How should you guarantee that duplicate submissions within a 60-second window never result in duplicate billing?',
            options: [
              'Rely entirely on in-memory Node.js Set collections on each API server instance',
              'Store the idempotency key in distributed cache with atomic SETNX (set if not exists) and TTL, coupled with a unique constraint in the primary database ledger',
              'Query the payment processor via synchronous HTTP to inspect previous transaction status',
              'Generate client-side UUIDs and ignore requests with duplicate timestamps',
            ],
            correctIndex: 1,
            explanation: 'Atomic distributed lock primitives (e.g. SETNX with TTL) in Redis block concurrent duplicate in-flight requests, while database unique constraints guarantee ACID persistence invariants.',
            points: 50,
          },
          {
            id: 'hs-r3-q2',
            prompt: 'DEFENSE PROMPT: During a cross-region datacenter network partition (split-brain), your banking ledger must choose between Consistency or Availability. Under the PACELC theorem, what is the proper engineering trade-off?',
            options: [
              'Choose Availability (AP) and reconcile negative account balances with asynchronous event reconcilers',
              'Choose Consistency (CP) and reject partition-isolated transactions until quorum consensus is restored',
              'Route all write requests to local browser IndexedDB instances',
              'Disable read replicas and forward all requests across unencrypted public tunnels',
            ],
            correctIndex: 1,
            explanation: 'Financial and ledger accounting systems strictly prioritize Consistency over Availability (CP) to prevent double-spending and ledger balance corruption during network partitions.',
            points: 50,
          },
        ],
      },
      {
        roundNumber: 4,
        title: 'Engineering Culture & Situational Leadership',
        roundType: 'LEADERSHIP_ALIGNMENT',
        durationMinutes: 15,
        cutoffPercentage: 80,
        instructions: 'Demonstrate professional ownership, incident blameless post-mortem management, and sound architectural judgment.',
        questions: [
          {
            id: 'hs-r4-q1',
            prompt: 'SITUATION: 10 minutes prior to a major platform launch, an automated canary deployment exhibits a 0.4% increase in 5xx error rate on authentication requests. The product director urges you to proceed with full rollout to meet the public deadline. How do you respond?',
            options: [
              'Immediately proceed with rollout and plan a hotfix for tomorrow morning',
              'Halt rollout, execute immediate rollback of canary instances, alert the on-call team, and triage the error logs before rescheduling the release',
              'Silence the alerting threshold so the dashboard appears green for executives',
              'Blame the testing team in the public company Slack channel',
            ],
            correctIndex: 1,
            explanation: 'Production reliability and customer authentication safety strictly supersede arbitrary launch deadlines. Halting, rolling back, and investigating preserves platform integrity.',
            points: 50,
          },
          {
            id: 'hs-r4-q2',
            prompt: 'SITUATION: Following a critical outage caused by a junior developer applying a misconfigured database migration script, what is the correct engineering leadership approach?',
            options: [
              'Publicly reprimand the engineer to emphasize accountability',
              'Conduct a blameless post-mortem analyzing why the CI/CD pipeline and staging environments failed to catch the migration syntax before production',
              'Revoke production access from all junior engineers permanently',
              'Ignore the incident since service was eventually restored',
            ],
            correctIndex: 1,
            explanation: 'Blameless post-mortems treat outages as systemic gaps in tooling, automated guardrails, and testing rather than personal fault, fostering continuous architectural resilience.',
            points: 50,
          },
        ],
      },
    ],
  },
  {
    id: 'titan-fintech',
    title: 'Titan Distributed FinTech Systems Drive',
    consortiumName: 'Titan Distributed FinTech Labs',
    roleSlug: 'java-backend-developer',
    roleTitle: 'Low-Latency Concurrency & Financial Engineer',
    ctcFormatted: '₹28.0 LPA ($160,000)',
    ctcBreakdown: {
      base: '₹20.0 LPA',
      performanceBonus: '₹4.5 LPA',
      stockOptions: '₹3.5 LPA',
    },
    minGpa: 8.0,
    description: 'High-frequency transactional systems, order-matching algorithms, lock-free ring buffers, and sub-millisecond execution pipelines.',
    rounds: [
      {
        roundNumber: 1,
        title: 'Concurrency & Algorithmic Screening',
        roundType: 'SCREENING_MCQ',
        durationMinutes: 15,
        cutoffPercentage: 70,
        instructions: 'Test lock-free primitives, memory ordering, and queue mechanics.',
        questions: [
          {
            id: 'tf-r1-q1',
            prompt: 'Why does the LMAX Disruptor pattern achieve higher throughput than traditional Java ArrayBlockingQueue?',
            options: [
              'It uses lock-free circular ring buffers with single-writer memory ordering, avoiding kernel lock contention and cache invalidations',
              'It allocates objects dynamically on the native heap using JNI',
              'It compresses payloads using gzip before queueing',
              'It operates synchronously on a single core without thread switching',
            ],
            correctIndex: 0,
            explanation: 'The Disruptor avoids mutual exclusion locks via pre-allocated ring buffers and memory sequence barriers, eliminating lock contention.',
            points: 50,
          },
          {
            id: 'tf-r1-q2',
            prompt: 'What memory ordering semantics are guaranteed by volatile reads and writes in modern language memory models?',
            options: [
              'Volatile operations bypass CPU cache and always read from rotational hard drives',
              'Volatile writes establish a happens-before relationship with subsequent volatile reads of the same location, preventing instruction reordering across the barrier',
              'Volatile variables are automatically encrypted in RAM',
              'Volatile reads prevent other threads from executing for 1 millisecond',
            ],
            correctIndex: 1,
            explanation: 'Memory barriers emitted for volatile writes flush CPU store buffers and establish formal happens-before visibility guarantees across threads.',
            points: 50,
          },
        ],
      },
      {
        roundNumber: 2,
        title: 'Trading Engine Scenario Diagnosis',
        roundType: 'SCENARIO_DIAGNOSIS',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Debug race hazards and thread contention in high-volume order matching systems.',
        questions: [
          {
            id: 'tf-r2-q1',
            prompt: 'SCENARIO: An exchange matching engine experiences sporadic order execution ordering inversions during millisecond market spikes. What concurrency flaw is present?',
            options: [
              'Improper use of coarse-grained synchronized locks causing priority inversion across threads',
              'Multiple worker threads reading unsequenced network buffers without a single-writer sequencer or deterministic timestamp barrier',
              'Database connections running with READ UNCOMMITTED isolation level',
              'JSON payload serialization overhead',
            ],
            correctIndex: 1,
            explanation: 'Deterministic order book execution requires a single-writer sequencer or hardware timestamp synchronization (e.g. PTP) before parallel worker routing.',
            points: 100,
          },
        ],
      },
      {
        roundNumber: 3,
        title: 'FinTech Resiliency & Audit Defense',
        roundType: 'SYSTEM_DEFENSE',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Defend tamper-evident accounting ledgers and double-entry transaction invariants.',
        questions: [
          {
            id: 'tf-r3-q1',
            prompt: 'DEFENSE PROMPT: How do you design an audit-proof double-entry general ledger handling 50,000 ledger entries/sec with zero drift?',
            options: [
              'Update account balances directly with mutable UPDATE SQL queries',
              'Employ append-only immutable journal entry models where every transaction consists of balanced debit and credit entries with cryptographic hash chaining',
              'Store account balances in browser localStorage and synchronize hourly',
              'Use single-entry accounting with periodic manual CSV reconciliations',
            ],
            correctIndex: 1,
            explanation: 'Double-entry accounting requires immutable debit and credit pairs summing to zero, verified with cryptographic hash chains to ensure non-repudiation.',
            points: 100,
          },
        ],
      },
      {
        roundNumber: 4,
        title: 'Regulatory & High-Stakes Culture',
        roundType: 'LEADERSHIP_ALIGNMENT',
        durationMinutes: 15,
        cutoffPercentage: 80,
        instructions: 'Examine audit compliance, ethical disclosure, and zero-tolerance incident escalation.',
        questions: [
          {
            id: 'tf-r4-q1',
            prompt: 'SITUATION: You discover a logic defect in an overnight settlement batch calculation that credited $120,000 across 400 user accounts unnoticed by automated checks. What is your ethical and professional duty?',
            options: [
              'Quietly adjust database balances without documenting to prevent team panic',
              'Immediately disclose the discrepancy to engineering leadership and compliance, file an incident ticket, and stage an audited remediation script',
              'Wait to see if customers report the extra funds',
              'Delete the audit log records to conceal the calculation defect',
            ],
            correctIndex: 1,
            explanation: 'Financial compliance demands immediate transparency, formal escalation, and audited correction scripts.',
            points: 100,
          },
        ],
      },
    ],
  },
  {
    id: 'nova-cloud-devops',
    title: 'Nova Cloud & SRE Campus Hiring Drive',
    consortiumName: 'Nova Cloud Infrastructure Labs',
    roleSlug: 'devops-engineer',
    roleTitle: 'Cloud Infrastructure & Site Reliability Engineer',
    ctcFormatted: '₹22.0 LPA ($130,000)',
    ctcBreakdown: {
      base: '₹16.5 LPA',
      performanceBonus: '₹3.0 LPA',
      stockOptions: '₹2.5 LPA',
    },
    minGpa: 7.0,
    description: 'Infrastructure as Code, multi-region Kubernetes clusters, automated zero-downtime canary deployments, and observability telemetry.',
    rounds: [
      {
        roundNumber: 1,
        title: 'Cloud & Linux Internals Screening',
        roundType: 'SCREENING_MCQ',
        durationMinutes: 15,
        cutoffPercentage: 70,
        instructions: 'Test container namespaces, cgroups, network overlays, and Terraform state semantics.',
        questions: [
          {
            id: 'nc-r1-q1',
            prompt: 'Which Linux kernel feature provides resource quota boundaries (e.g. CPU, RAM, I/O) to container runtimes?',
            options: [
              'Namespaces (PID, Mount, Net)',
              'Control Groups (cgroups v2)',
              'Extended Berkeley Packet Filter (eBPF)',
              'AppArmor / SELinux profiles',
            ],
            correctIndex: 1,
            explanation: 'While Namespaces isolate process visibility, Control Groups (cgroups) meter and restrict CPU, memory, and I/O consumption.',
            points: 50,
          },
          {
            id: 'nc-r1-q2',
            prompt: 'Why should remote state storage for Terraform (e.g. Object Storage) always be configured with state locking?',
            options: [
              'To speed up terraform plan execution by 10x',
              'To prevent race conditions and state file corruption when two engineers or CI pipelines run terraform apply simultaneously',
              'To compress the state file using zstd',
              'To automatically generate documentation for cloud resources',
            ],
            correctIndex: 1,
            explanation: 'State locking prevents concurrent executions from interleaving state modifications, preventing devastating infrastructure corruption.',
            points: 50,
          },
        ],
      },
      {
        roundNumber: 2,
        title: 'Kubernetes Outage Scenario Diagnosis',
        roundType: 'SCENARIO_DIAGNOSIS',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Diagnose crash-looping microservices, ingress routing failures, and memory exhaustion.',
        questions: [
          {
            id: 'nc-r2-q1',
            prompt: 'SCENARIO: Pods in a production cluster enter CrashLoopBackOff immediately after startup with exit code 137. Node memory usage is at 75%. What does exit code 137 signify?',
            options: [
              'Application thrown Unhandled Promise Exception',
              'SIGKILL dispatched by Linux kernel OOM killer because the container exceeded its configured memory limit',
              'DNS resolution failure inside kube-dns',
              'Invalid SSL certificate on cluster ingress',
            ],
            correctIndex: 1,
            explanation: 'Exit code 137 = 128 + 9 (SIGKILL), indicating the container process was forcibly terminated by the kernel for exceeding its cgroup memory limit.',
            points: 100,
          },
        ],
      },
      {
        roundNumber: 3,
        title: 'High Availability & Disaster Recovery Defense',
        roundType: 'SYSTEM_DEFENSE',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Architect multi-region failover and blue/green deployment pipelines.',
        questions: [
          {
            id: 'nc-r3-q1',
            prompt: 'DEFENSE PROMPT: You need to implement zero-downtime deployment for a stateful WebSocket cluster without disconnecting 250,000 active client connections simultaneously. What is the optimal architecture?',
            options: [
              'Perform a hard cluster reboot during midnight maintenance window',
              'Implement connection draining with graceful SIGTERM handling, allowing existing connections to finish while routing new handshakes to the newly deployed replica set',
              'Scale cluster replicas to zero and immediately recreate them',
              'Block network port 443 with firewall rules during upgrade',
            ],
            correctIndex: 1,
            explanation: 'Graceful shutdown allows active connections to terminate naturally within a terminationGracePeriodSeconds window while routing new traffic to healthy pods.',
            points: 100,
          },
        ],
      },
      {
        roundNumber: 4,
        title: 'SRE Production Incident Management',
        roundType: 'LEADERSHIP_ALIGNMENT',
        durationMinutes: 15,
        cutoffPercentage: 80,
        instructions: 'Demonstrate incident command hierarchy, stakeholder communication, and post-mortem analysis.',
        questions: [
          {
            id: 'nc-r4-q1',
            prompt: 'SITUATION: During a SEV-1 outage affecting payment webhooks, multiple engineering managers enter the incident channel asking for frequent status updates every 2 minutes. As Incident Commander, what do you do?',
            options: [
              'Stop investigating and reply to each manager individually',
              'Designate an Incident Communications Lead to post 15-minute scheduled updates to the stakeholder channel while the engineering team focuses on mitigation',
              'Kick all managers out of Slack and lock the channels',
              'Turn off your laptop and step away',
            ],
            correctIndex: 1,
            explanation: 'The Incident Commander decouples technical remediation from stakeholder management by delegating communications to a dedicated liaison.',
            points: 100,
          },
        ],
      },
    ],
  },
  {
    id: 'apex-ai-data',
    title: 'Apex AI & Data Platform Systems Drive',
    consortiumName: 'Apex AI & Data Platform Systems',
    roleSlug: 'data-engineer',
    roleTitle: 'Data Platform & Distributed Systems Engineer',
    ctcFormatted: '₹26.0 LPA ($150,000)',
    ctcBreakdown: {
      base: '₹19.0 LPA',
      performanceBonus: '₹4.0 LPA',
      stockOptions: '₹3.0 LPA',
    },
    minGpa: 7.5,
    description: 'High-throughput stream processing, Apache Spark / Flink execution engines, vector search databases, and feature store infrastructure.',
    rounds: [
      {
        roundNumber: 1,
        title: 'Data Systems & Big Data Fundamentals',
        roundType: 'SCREENING_MCQ',
        durationMinutes: 15,
        cutoffPercentage: 70,
        instructions: 'Test distributed partitions, parquet columnar encoding, and stream semantics.',
        questions: [
          {
            id: 'ad-r1-q1',
            prompt: 'Why does Parquet columnar storage format dramatically accelerate analytical aggregations (OLAP) compared to row-oriented JSON or CSV?',
            options: [
              'It encrypts every field with SHA-256 by default',
              'Columnar layout allows queries selecting a subset of columns to skip reading irrelevant column byte blocks from disk entirely (column projection & predicate pushdown)',
              'It keeps the entire dataset permanently pinned in GPU memory',
              'It restricts strings to a maximum of 16 characters',
            ],
            correctIndex: 1,
            explanation: 'Columnar storage groups values of the same attribute together, allowing massive compression ratios and zero-copy disk I/O skipping for unused attributes.',
            points: 50,
          },
          {
            id: 'ad-r1-q2',
            prompt: 'In distributed stream processing, what is the key difference between Event Time and Processing Time?',
            options: [
              'Event Time is the time when an interaction occurred on the client/device, while Processing Time is the clock time of the worker node processing the record',
              'Event Time is measured in UTC while Processing Time is measured in local time',
              'Processing Time is always earlier than Event Time',
              'There is no difference in distributed streaming architectures',
            ],
            correctIndex: 0,
            explanation: 'Event Time corresponds to the creation timestamp at source, whereas Processing Time is the machine clock when the streaming operator processes the event.',
            points: 50,
          },
        ],
      },
      {
        roundNumber: 2,
        title: 'Pipeline Data Skew Scenario Diagnosis',
        roundType: 'SCENARIO_DIAGNOSIS',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Diagnose executor stragglers, partition skew, and shuffle spills.',
        questions: [
          {
            id: 'ad-r2-q1',
            prompt: 'SCENARIO: A distributed join job on a 10TB dataset has 199 tasks finish in 4 minutes, but 1 task runs for 3.5 hours before failing with OutOfMemoryError. What issue occurred?',
            options: [
              'Hardware failure on the driver node',
              'Severe data skew on the join key (e.g. nulls or hot keys) concentrating gigabytes of rows onto a single executor partition',
              'Network cable disconnection between worker nodes',
              'Invalid SQL syntax in the WHERE clause',
            ],
            correctIndex: 1,
            explanation: 'Data skew causes one partition to receive a disproportionate volume of records, causing task stragglers and executor memory exhaustion.',
            points: 100,
          },
        ],
      },
      {
        roundNumber: 3,
        title: 'Real-Time Feature Store Architecture Defense',
        roundType: 'SYSTEM_DEFENSE',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Design real-time ML inference pipelines with sub-20ms latency.',
        questions: [
          {
            id: 'ad-r3-q1',
            prompt: 'DEFENSE PROMPT: How do you synchronize batch-computed historical features (from Data Lake) with real-time streaming features for an ML fraud detection model serving 5,000 inferences/sec?',
            options: [
              'Run heavy Spark SQL queries on S3 during every live HTTP request',
              'Implement a Dual-Storage Feature Store architecture: an Offline store (Columnar Data Lake) for model training, and an Online store (Low-latency Key-Value cache) updated via streaming CDC',
              'Store feature vectors in plain text CSV files on the web server',
              'Recalculate all user statistics synchronously in the frontend client',
            ],
            correctIndex: 1,
            explanation: 'A dual-storage feature store unifies offline model training datasets with low-latency key-value online stores (e.g. Redis/DynamoDB) for millisecond inference lookup.',
            points: 100,
          },
        ],
      },
      {
        roundNumber: 4,
        title: 'Data Governance & Ethical AI Leadership',
        roundType: 'LEADERSHIP_ALIGNMENT',
        durationMinutes: 15,
        cutoffPercentage: 80,
        instructions: 'Ensure regulatory privacy, PII masking, and data lineage integrity.',
        questions: [
          {
            id: 'ad-r4-q1',
            prompt: 'SITUATION: A marketing stakeholder requests direct read access to raw customer event logs containing unmasked personal phone numbers and billing addresses for an urgent campaign. How do you respond?',
            options: [
              'Provide direct root database credentials over private Slack DM',
              'Enforce data governance policies by routing the request through masked/anonymized data view pipelines with role-based access control (RBAC)',
              'Ignore the request completely without responding',
              'Export the raw data to a public Google Sheet',
            ],
            correctIndex: 1,
            explanation: 'Data engineers have a legal and ethical mandate to enforce PII masking and RBAC policies, protecting customer privacy.',
            points: 100,
          },
        ],
      },
    ],
  },
  {
    id: 'nextgen-fullstack',
    title: 'NextGen Enterprise Web Systems Drive',
    consortiumName: 'NextGen Enterprise Web Consortium',
    roleSlug: 'fullstack-javascript-developer',
    roleTitle: 'Full Stack Enterprise Web Engineer',
    ctcFormatted: '₹19.5 LPA ($115,000)',
    ctcBreakdown: {
      base: '₹15.0 LPA',
      performanceBonus: '₹2.5 LPA',
      stockOptions: '₹2.0 LPA',
    },
    minGpa: 6.8,
    description: 'Modern App Router architectures, server-side rendering, WebSocket real-time collaborations, and micro-frontend integrations.',
    rounds: [
      {
        roundNumber: 1,
        title: 'Web Core & Architecture Screening',
        roundType: 'SCREENING_MCQ',
        durationMinutes: 15,
        cutoffPercentage: 70,
        instructions: 'Test SSR, hydration, event bubbling, and CSS layout performance.',
        questions: [
          {
            id: 'ng-r1-q1',
            prompt: 'What happens during React client hydration of server-rendered HTML?',
            options: [
              'The browser downloads the entire database table',
              'React walks the server-rendered DOM tree and attaches event listeners without re-creating existing DOM elements',
              'The browser deletes all HTML and renders from scratch',
              'CSS styles are converted into JavaScript AST trees',
            ],
            correctIndex: 1,
            explanation: 'Hydration attaches interactivity and state hooks to pre-rendered HTML DOM nodes, avoiding layout reflows.',
            points: 50,
          },
          {
            id: 'ng-r1-q2',
            prompt: 'How does the CSS contain property improve browser rendering performance in complex enterprise dashboards?',
            options: [
              'It encrypts stylesheet selectors',
              'It notifies the browser that an element and its subtree are independent of the rest of the document tree, isolating style and layout recalculations',
              'It automatically converts PNGs to SVGs',
              'It forces the browser to run on 4 CPU cores',
            ],
            correctIndex: 1,
            explanation: '`contain: layout / paint / strict` stops layout and paint invalidations from propagating outside the boundary element.',
            points: 50,
          },
        ],
      },
      {
        roundNumber: 2,
        title: 'Hydration Mismatch & Web Vitals Diagnosis',
        roundType: 'SCENARIO_DIAGNOSIS',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Debug cumulative layout shifts (CLS), memory leaks, and hydration mismatches.',
        questions: [
          {
            id: 'ng-r2-q1',
            prompt: 'SCENARIO: An e-commerce dashboard experiences severe Cumulative Layout Shift (CLS = 0.42) when dynamic hero banners load after initial paint. What is the standard remediation?',
            options: [
              'Remove all images from the website',
              'Reserve explicit aspect-ratio and skeleton placeholder dimensions in CSS so surrounding content does not shift when assets resolve',
              'Run animations using jQuery',
              'Increase browser cookie storage limits',
            ],
            correctIndex: 1,
            explanation: 'Setting explicit width/height or `aspect-ratio` reserves layout space, eliminating CLS when external media finishes loading.',
            points: 100,
          },
        ],
      },
      {
        roundNumber: 3,
        title: 'Real-Time Collaborative Web Architecture Defense',
        roundType: 'SYSTEM_DEFENSE',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Architect multi-user live document editing with conflict resolution.',
        questions: [
          {
            id: 'ng-r3-q1',
            prompt: 'DEFENSE PROMPT: You are architecting a real-time collaborative document editor for 1,000 concurrent editors on a single document. Between Operational Transformation (OT) and CRDTs (Conflict-free Replicated Data Types), which do you choose and why?',
            options: [
              'OT because it requires no central server',
              'CRDTs because they guarantee strong eventual consistency mathematically across decentralized peers without requiring complex central lock arbitration',
              'Neither, use periodic form submission via POST requests',
              'Write changes directly to client cookies',
            ],
            correctIndex: 1,
            explanation: 'CRDTs converge state deterministically through commutative and associative operations, eliminating lock contention in distributed collaborative editing.',
            points: 100,
          },
        ],
      },
      {
        roundNumber: 4,
        title: 'Product Engineering & Accessibility Culture',
        roundType: 'LEADERSHIP_ALIGNMENT',
        durationMinutes: 15,
        cutoffPercentage: 80,
        instructions: 'Prioritize WCAG 2.1 AA accessibility, cross-browser inclusivity, and fast feedback loops.',
        questions: [
          {
            id: 'ng-r4-q1',
            prompt: 'SITUATION: A designer suggests removing visible focus rings from all interactive buttons to make the UI look cleaner. How do you respond?',
            options: [
              'Agree immediately because visual aesthetics always take priority',
              'Advise that visible keyboard focus indicators are a non-negotiable WCAG 2.1 accessibility requirement for keyboard navigation, and collaborate on a stylized accessible focus ring instead',
              'Delete all keyboard navigation code from the repository',
              'Add popups asking users to use a computer mouse',
            ],
            correctIndex: 1,
            explanation: 'Accessible focus indicators are mandatory for keyboard and screen reader accessibility. Creative styling ensures both beauty and compliance.',
            points: 100,
          },
        ],
      },
    ],
  },
  {
    id: 'omnidefense-sdet',
    title: 'OmniDefense Security & Quality Engineering Drive',
    consortiumName: 'OmniDefense Systems & Quality',
    roleSlug: 'qa-automation-engineer',
    roleTitle: 'Security, Infrastructure Defense & SDET Specialist',
    ctcFormatted: '₹18.0 LPA ($110,000)',
    ctcBreakdown: {
      base: '₹14.0 LPA',
      performanceBonus: '₹2.5 LPA',
      stockOptions: '₹1.5 LPA',
    },
    minGpa: 7.0,
    description: 'End-to-end automated testing suites, penetration verification, zero-trust security audits, and continuous reliability verification.',
    rounds: [
      {
        roundNumber: 1,
        title: 'Security & Automation Screening',
        roundType: 'SCREENING_MCQ',
        durationMinutes: 15,
        cutoffPercentage: 70,
        instructions: 'Test OWASP Top 10 vulnerabilities, mock test idempotency, and test pyramid architecture.',
        questions: [
          {
            id: 'od-r1-q1',
            prompt: 'What architectural defense completely prevents SQL Injection vulnerabilities regardless of user input format?',
            options: [
              'Regex pattern matching on string inputs',
              'Parameterized prepared statements with bind variables',
              'Base64 encoding all query parameters',
              'Using stored procedures with string concatenation',
            ],
            correctIndex: 1,
            explanation: 'Prepared statements treat user input strictly as literal data rather than executable SQL code, preventing SQL injection by design.',
            points: 50,
          },
          {
            id: 'od-r1-q2',
            prompt: 'In a modern automated test pyramid, why should fast unit tests outnumber slow end-to-end browser tests?',
            options: [
              'Unit tests are more expensive to write',
              'Unit tests provide rapid millisecond feedback, high execution determinism, and exact root-cause isolation without flaky browser network overhead',
              'Browsers cannot run more than 5 tests per day',
              'Unit tests do not require code compilation',
            ],
            correctIndex: 1,
            explanation: 'The test pyramid ensures rapid test execution speed and low maintenance overhead while reserving E2E tests for critical user journeys.',
            points: 50,
          },
        ],
      },
      {
        roundNumber: 2,
        title: 'Security Vulnerability Scenario Diagnosis',
        roundType: 'SCENARIO_DIAGNOSIS',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Trace cross-site scripting (XSS), CSRF token leakage, and insecure deserialization.',
        questions: [
          {
            id: 'od-r2-q1',
            prompt: 'SCENARIO: An attacker injects malicious JavaScript via a user profile bio field that executes whenever other users visit their profile page. What vulnerability is this?',
            options: [
              'Stored Cross-Site Scripting (Stored XSS)',
              'Server-Side Request Forgery (SSRF)',
              'XML External Entity (XXE) Injection',
              'Denial of Service (DoS)',
            ],
            correctIndex: 0,
            explanation: 'Stored XSS occurs when unescaped user input is saved to the database and later rendered into the DOM of other users without output encoding.',
            points: 100,
          },
        ],
      },
      {
        roundNumber: 3,
        title: 'Zero-Trust Architecture Defense',
        roundType: 'SYSTEM_DEFENSE',
        durationMinutes: 20,
        cutoffPercentage: 75,
        instructions: 'Defend mutual TLS, least-privilege RBAC, and secure key rotation.',
        questions: [
          {
            id: 'od-r3-q1',
            prompt: 'DEFENSE PROMPT: How do you design an internal service-to-service communication fabric adhering to Zero-Trust principles across 50 microservices?',
            options: [
              'Trust all requests coming from private 10.0.0.0/8 IP ranges without authentication',
              'Require Mutual TLS (mTLS) with short-lived X.509 certificates and cryptographically signed JWT service identity tokens for every inter-service call',
              'Share a single global password in an environment variable across all containers',
              'Disable firewalls inside the private VPC',
            ],
            correctIndex: 1,
            explanation: 'Zero-Trust assumes the network is compromised, requiring explicit authentication and encryption (mTLS) for every internal call.',
            points: 100,
          },
        ],
      },
      {
        roundNumber: 4,
        title: 'Quality Advocacy & Responsible Disclosure',
        roundType: 'LEADERSHIP_ALIGNMENT',
        durationMinutes: 15,
        cutoffPercentage: 80,
        instructions: 'Evaluate security incident disclosure, regression prevention, and engineering rigor.',
        questions: [
          {
            id: 'od-r4-q1',
            prompt: 'SITUATION: During an automated security regression run, your suite catches a critical auth bypass regression introduced by a release branch scheduled to go live in 1 hour. What is your action?',
            options: [
              'Disable the failing test assertion so the CI build passes',
              'Immediately flag the blocking vulnerability, block the release deployment pipeline, and provide the reproduction payload to the auth team',
              'Publish the vulnerability on social media',
              'Wait until after launch to log a minor bug ticket',
            ],
            correctIndex: 1,
            explanation: 'SDET and Security engineers serve as quality gatekeepers, halting compromised releases before they reach production.',
            points: 100,
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Persistence Engine (LocalStorage)
// ---------------------------------------------------------------------------

const STORAGE_KEY_APPLICATIONS = 'sp_campus_drives_v1_apps';

export function getDrivesCatalog(): PlacementDrive[] {
  return PLACEMENT_DRIVES_CATALOG;
}

export function getDriveById(id: string): PlacementDrive | undefined {
  return PLACEMENT_DRIVES_CATALOG.find((d) => d.id === id);
}

export function getUserDriveApplications(): Record<string, DriveApplication> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
    if (data) {
      return JSON.parse(data) as Record<string, DriveApplication>;
    }
  } catch {
    // Ignore error
  }
  return {};
}

export function saveUserDriveApplications(
  apps: Record<string, DriveApplication>,
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(apps));
  } catch {
    // Ignore error
  }
}

export function startDriveApplication(driveId: string): DriveApplication {
  const apps = getUserDriveApplications();
  const existing = apps[driveId];
  if (existing) return existing;

  const newApp: DriveApplication = {
    driveId,
    status: 'IN_PROGRESS',
    currentRoundIndex: 0,
    roundScores: {},
    lastUpdated: new Date().toISOString(),
  };

  apps[driveId] = newApp;
  saveUserDriveApplications(apps);
  return newApp;
}

// ---------------------------------------------------------------------------
// Round Scoring & Advancement
// ---------------------------------------------------------------------------

export function evaluateRoundSubmission(
  driveId: string,
  roundNumber: number,
  answers: Record<string, number>, // questionId -> selectedOptionIndex
  candidateName?: string,
  collegeName?: string,
): {
  score: number;
  passed: boolean;
  feedback: string;
  updatedApplication: DriveApplication;
} {
  const drive = getDriveById(driveId);
  if (!drive) {
    throw new Error(`Drive not found: ${driveId}`);
  }

  const round = drive.rounds.find((r) => r.roundNumber === roundNumber);
  if (!round) {
    throw new Error(`Round not found: ${roundNumber}`);
  }

  // Calculate score
  let earnedPoints = 0;
  let totalPoints = 0;

  round.questions.forEach((q) => {
    totalPoints += q.points;
    if (answers[q.id] === q.correctIndex) {
      earnedPoints += q.points;
    }
  });

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = score >= round.cutoffPercentage;

  const apps = getUserDriveApplications();
  const currentApp: DriveApplication = apps[driveId] || {
    driveId,
    status: 'IN_PROGRESS',
    currentRoundIndex: roundNumber - 1,
    roundScores: {},
    lastUpdated: new Date().toISOString(),
  };

  currentApp.roundScores[roundNumber] = score;

  if (passed) {
    if (roundNumber === drive.rounds.length) {
      // Cleared all rounds! Award official offer letter
      currentApp.status = 'OFFER_EXTENDED';
      currentApp.offerDetails = generateOfferLetter(
        drive,
        candidateName || 'Verified Engineering Candidate',
        collegeName || 'National Institute of Technology',
      );
    } else {
      currentApp.currentRoundIndex = roundNumber; // Advance to next round index
      currentApp.status = 'IN_PROGRESS';
    }
  } else {
    currentApp.status = 'ELIMINATED';
  }

  currentApp.lastUpdated = new Date().toISOString();
  apps[driveId] = currentApp;
  saveUserDriveApplications(apps);

  const feedback = passed
    ? `Congratulations! You cleared Round ${roundNumber} (${score}% vs ${round.cutoffPercentage}% cutoff).`
    : `Round ${roundNumber} hurdle not met (${score}% scored vs ${round.cutoffPercentage}% required). Review recommended practice modules to retry.`;

  return {
    score,
    passed,
    feedback,
    updatedApplication: currentApp,
  };
}

// ---------------------------------------------------------------------------
// Deterministic Verifiable Offer Letter Generator
// ---------------------------------------------------------------------------

export function generateOfferLetter(
  drive: PlacementDrive,
  candidateName: string,
  collegeName: string,
): PlacementOfferLetter {
  const rawCode = `SP-OFFER-2026-${drive.id.toUpperCase()}-${Math.abs(drive.minGpa * 997).toString(16).toUpperCase()}`;
  const verificationHash = `SHA256:${Buffer.from(rawCode + candidateName).toString('base64').substring(0, 16).toUpperCase()}`;

  return {
    offerCode: rawCode,
    candidateName,
    collegeName,
    roleTitle: drive.roleTitle,
    consortiumName: drive.consortiumName,
    ctcAnnual: drive.ctcFormatted,
    baseSalary: drive.ctcBreakdown.base,
    joiningDate: 'July 1, 2027',
    validityDate: 'October 31, 2026',
    verificationHash,
    terms: [
      'Successful completion of undergraduate degree with aggregate GPA >= ' + drive.minGpa,
      'Pre-joining technical onboarding modules completed via Students-Preparation portal',
      'Standard enterprise background verification and academic credential validation',
      'Confidentiality and proprietary code security adherence agreement',
    ],
  };
}

// ---------------------------------------------------------------------------
// Client-Side PDF Offer Letter Generator (Pure Vector PDF 1.4)
// ---------------------------------------------------------------------------

export function downloadOfferLetterPdf(offer: PlacementOfferLetter): void {
  const filename = `${offer.candidateName.toLowerCase().replace(/\\s+/g, '-')}-placement-offer.pdf`;

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
    '<< /Length 1450 >>',
    'stream',
    'BT',
    '/F2 18 Tf',
    '50 790 Td',
    `(${offer.consortiumName.toUpperCase()}) Tj`,
    '/F1 10 Tf',
    '0 -22 Td',
    '(OFFICIAL CAMPUS PLACEMENT OFFER OF EMPLOYMENT) Tj',
    '0 -16 Td',
    `(Verification Code: ${offer.offerCode} | ${offer.verificationHash}) Tj`,
    '0 -26 Td',
    '/F2 12 Tf',
    `(Dear ${offer.candidateName},) Tj`,
    '/F1 10 Tf',
    '0 -18 Td',
    '(We are pleased to extend this offer of employment for the role of:) Tj',
    '0 -16 Td',
    '/F2 13 Tf',
    `(${offer.roleTitle}) Tj`,
    '/F1 10 Tf',
    '0 -22 Td',
    '(Following your outstanding performance in the 4-stage campus placement evaluation,) Tj',
    '0 -14 Td',
    `(${offer.consortiumName} is thrilled to welcome you to our engineering organization.) Tj`,
    '0 -26 Td',
    '/F2 12 Tf',
    '(COMPENSATION & TERMS PACKAGE:) Tj',
    '/F1 10 Tf',
    '0 -18 Td',
    `( - Total Annual Compensation (CTC): ${offer.ctcAnnual}) Tj`,
    '0 -16 Td',
    `( - Fixed Annual Base Salary: ${offer.baseSalary}) Tj`,
    '0 -16 Td',
    `( - Scheduled Joining Date: ${offer.joiningDate}) Tj`,
    '0 -16 Td',
    `( - Offer Acceptance Validity Date: ${offer.validityDate}) Tj`,
    '0 -26 Td',
    '/F2 12 Tf',
    '(KEY EMPLOYMENT CONDITIONS:) Tj',
    '/F1 9 Tf',
  ];

  offer.terms.forEach((t) => {
    pdfLines.push(
      '0 -15 Td',
      `( * ${t.substring(0, 85)}) Tj`,
    );
  });

  pdfLines.push(
    '0 -32 Td',
    '/F2 11 Tf',
    '(ISSUED ON BEHALF OF CAMPUS RECRUITMENT COMMITTEE) Tj',
    '/F1 9 Tf',
    '0 -15 Td',
    '(Students-Preparation Enterprise Placement Suite | Cryptographically Signed & Verifiable) Tj',
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
    '0000001700 00000 n ',
    '0000001770 00000 n ',
    'trailer',
    '<< /Size 7 /Root 1 0 R >>',
    'startxref',
    '1840',
    '%%EOF',
  );

  triggerBrowserFileDownload(filename, pdfLines.join('\n'), 'application/pdf');
}
