/**
 * System Design Architecture Blueprint Studio & Trade-Off Analyzer Client Engine
 * 100% Vendor-Neutral, Zero External AI Billing, Local Deterministic Compute.
 */

export interface SystemComponent {
  id: string;
  name: string;
  category: 'EDGE' | 'GATEWAY' | 'COMPUTE' | 'CACHE' | 'STORAGE' | 'STREAMING' | 'ASYNC_WORKER';
  description: string;
  latencyTier: string;
  failureMode: string;
  scalingStrategy: string;
  techPattern: string;
}

export interface CapacityEstimates {
  dau: number;
  readWriteRatio: number;
  payloadSizeBytes: number;
  retentionYears: number;
  qpsAverage: number;
  qpsPeak: number;
  readQps: number;
  writeQps: number;
  bandwidthIngressMBs: number;
  bandwidthEgressMBs: number;
  storageTotalTB: number;
  cacheMemoryRequiredGB: number;
}

export interface TradeOffDimension {
  id: string;
  title: string;
  question: string;
  optionA: {
    label: string;
    description: string;
    pros: string[];
    cons: string[];
  };
  optionB: {
    label: string;
    description: string;
    pros: string[];
    cons: string[];
  };
  defaultOption: 'A' | 'B';
  recommendation: string;
}

export interface BottleneckAuditItem {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  component: string;
  vulnerability: string;
  mitigation: string;
  pillar: 'Reliability' | 'Performance' | 'Scalability' | 'Data Integrity' | 'Cost';
}

export interface DataFlowStep {
  stepNumber: number;
  title: string;
  fromNode: string;
  toNode: string;
  protocol: string;
  description: string;
}

export interface SystemBlueprint {
  id: string;
  title: string;
  subtitle: string;
  tier: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
  targetRole: string;
  overview: string;
  problemStatement: string;
  requirements: {
    functional: string[];
    nonFunctional: string[];
  };
  defaultCapacity: {
    dau: number;
    readWriteRatio: number;
    payloadSizeBytes: number;
    retentionYears: number;
  };
  components: SystemComponent[];
  dataFlowSteps: DataFlowStep[];
  tradeOffs: TradeOffDimension[];
  bottlenecks: BottleneckAuditItem[];
}

export interface StudioState {
  activeBlueprintId: string;
  capacityOverrides: Record<string, Partial<CapacityEstimates>>;
  tradeOffSelections: Record<string, Record<string, 'A' | 'B'>>;
  customNotes: Record<string, string>;
  lastUpdated: string;
}

// ---------------------------------------------------------------------------
// 6 Canonical Enterprise System Design Blueprints
// ---------------------------------------------------------------------------

export const BLUEPRINT_CATALOG: SystemBlueprint[] = [
  {
    id: 'url-shortener',
    title: 'High-Throughput Global URL Shortener & Analytics Engine',
    subtitle: 'Massive Read-Heavy Workload with Distributed In-Memory Caching & Base62 Sharding',
    tier: 'Tier-1 Core Architecture',
    difficulty: 'Intermediate',
    targetRole: 'Distributed Backend Engineer / Systems Architect',
    overview:
      'Design a resilient, low-latency URL shortening service capable of translating long URLs into short 7-character aliases, serving billions of redirection redirects per month, and tracking click stream telemetry.',
    problemStatement:
      'The service must generate unique short identifiers, guarantee redirect latency under 15ms at the 99th percentile, survive sudden viral spikes without database exhaustion, and maintain exact analytics counts.',
    requirements: {
      functional: [
        'Given a long URL, return a unique, compact 7-character alphanumeric short code (Base62).',
        'Redirect incoming short code HTTP requests to original destination via HTTP 301/302.',
        'Custom vanity alias support with conflict detection.',
        'Real-time redirection analytics (referrer, country, timestamp, browser user-agent).',
      ],
      nonFunctional: [
        'Ultra-low read latency: p99 < 15ms globally.',
        'High availability: 99.99% uptime with multi-region redundancy.',
        'Read-heavy ratio: 100:1 read to write dominance.',
        'Tamper-proof identifiers: Avoid sequential predictable IDs to prevent URL enumeration.',
      ],
    },
    defaultCapacity: {
      dau: 50000000,
      readWriteRatio: 100,
      payloadSizeBytes: 500,
      retentionYears: 5,
    },
    components: [
      {
        id: 'c-edge',
        name: 'Anycast DNS & Global Edge CDN',
        category: 'EDGE',
        description: 'Terminates TLS, routes requests to nearest geographical Point of Presence (PoP), and caches static redirect assets.',
        latencyTier: '< 5ms',
        failureMode: 'BGP failover to secondary edge gateway in adjacent datacenter zone.',
        scalingStrategy: 'Stateless Anycast edge routing with DDoS mitigation scrubbing.',
        techPattern: 'Global Anycast Edge & Reverse Proxy',
      },
      {
        id: 'c-gateway',
        name: 'Distributed API Gateway & Rate Limiter',
        category: 'GATEWAY',
        description: 'Applies token bucket rate limits per client IP, inspects request headers, and routes write/read paths.',
        latencyTier: '< 10ms',
        failureMode: 'Graceful degradation to soft bypass when local rate-limit token buffer overflows.',
        scalingStrategy: 'Horizontal auto-scaling behind Layer-4 load balancers.',
        techPattern: 'Stateless Token-Bucket API Shield',
      },
      {
        id: 'c-id-gen',
        name: 'Distributed Unique ID Generator (Snowflake / Range Allocator)',
        category: 'COMPUTE',
        description: 'Allocates coordinated integer ID ranges or 64-bit Snowflake timestamp IDs to application workers for Base62 encoding.',
        latencyTier: '< 2ms',
        failureMode: 'Pre-allocates 100,000 ID segments in memory per instance to absorb coordinator downtime.',
        scalingStrategy: 'Zookeeper/Etcd master-lease coordinator across distributed worker pods.',
        techPattern: 'Range-Based Distributed Sequence Allocator',
      },
      {
        id: 'c-cache',
        name: 'In-Memory Cache-Aside Cluster (Redis / Key-Value)',
        category: 'CACHE',
        description: 'Holds the top 20% of hottest short-code-to-original-URL mappings with LRU eviction and connection pooling.',
        latencyTier: '< 3ms',
        failureMode: 'Cluster sentinel automatic replica promotion; Bloom filter shields against cache penetration.',
        scalingStrategy: 'Consistent hashing ring with 256 virtual nodes per physical cache server.',
        techPattern: 'Consistent Hashing Memory Ring with Bloom Filter',
      },
      {
        id: 'c-db',
        name: 'Partitioned Relational / Wide-Column Storage Cluster',
        category: 'STORAGE',
        description: 'Persistent storage of URL mappings, creation timestamps, expiration TTLs, and owner metadata.',
        latencyTier: '< 20ms',
        failureMode: 'Read replicas handle read traffic if primary database failover occurs.',
        scalingStrategy: 'Hash sharding by short-code hash modulo number of database partitions.',
        techPattern: 'Hash-Partitioned Document/Relational Shards',
      },
      {
        id: 'c-stream',
        name: 'Clickstream Event Log & Asynchronous Queue',
        category: 'STREAMING',
        description: 'Decouples redirect path from analytics recording by streaming click events asynchronously.',
        latencyTier: '< 5ms async',
        failureMode: 'Local disk-backed buffer on application pods during broker disconnects.',
        scalingStrategy: 'Partitioned topic partitions distributed across consumer worker pools.',
        techPattern: 'Distributed Partitioned Append Log',
      },
      {
        id: 'c-analytics-worker',
        name: 'Aggregated Analytics Worker & Columnar Store',
        category: 'ASYNC_WORKER',
        description: 'Consumes click events in micro-batches and aggregates hourly metrics into columnar analytical storage.',
        latencyTier: '< 250ms batch',
        failureMode: 'Offset checkpoint commits enable at-least-once replay upon consumer worker crash.',
        scalingStrategy: 'Consumer groups scaled horizontally to match topic partition count.',
        techPattern: 'Micro-Batch Consumer with Columnar Rollups',
      },
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Incoming Redirect Request',
        fromNode: 'Client Device',
        toNode: 'Anycast DNS & Global Edge CDN',
        protocol: 'HTTPS GET /u/7xK9q2',
        description: 'Browser queries short URL; Edge CDN routes to nearest active point of presence.',
      },
      {
        stepNumber: 2,
        title: 'Cache Lookup',
        fromNode: 'API Gateway',
        toNode: 'In-Memory Cache Cluster',
        protocol: 'TCP RESP GET 7xK9q2',
        description: 'Worker queries cache-aside cluster. 90%+ hit rate returns original URL in < 3ms.',
      },
      {
        stepNumber: 3,
        title: 'Database Fallback on Cache Miss',
        fromNode: 'API Gateway',
        toNode: 'Partitioned Storage Cluster',
        protocol: 'SQL SELECT WHERE code = 7xK9q2',
        description: 'On cache miss, queries database replica shard and populates cache asynchronously.',
      },
      {
        stepNumber: 4,
        title: 'HTTP 302 Redirection & Async Telemetry',
        fromNode: 'API Gateway',
        toNode: 'Clickstream Event Log',
        protocol: 'HTTP 302 Location + Kafka Event',
        description: 'Sends 302 redirect header to client while emitting click telemetry to message broker.',
      },
    ],
    tradeOffs: [
      {
        id: 'redirect-code',
        title: 'HTTP 301 Permanent vs HTTP 302 Temporary Redirect',
        question: 'Which HTTP status code should the URL redirection respond with?',
        optionA: {
          label: 'HTTP 301 Permanent Redirect',
          description: 'Browsers cache the destination indefinitely on client devices.',
          pros: ['Reduces edge server load to zero for repeat clicks', 'Fastest possible response for user'],
          cons: ['Zero analytics tracking for repeat clicks', 'Impossible to expire or alter URL mapping instantly'],
        },
        optionB: {
          label: 'HTTP 302 Found (Temporary)',
          description: 'Browser sends every request through the server before redirecting.',
          pros: ['100% precise clickstream analytics', 'Immediate revocation and TTL enforcement capability'],
          cons: ['Slightly higher server traffic and QPS volume', 'Requires resilient low-latency cache tier'],
        },
        defaultOption: 'B',
        recommendation: 'Use HTTP 302 Temporary Redirect for commercial URL shorteners where click analytics and link management are mandatory.',
      },
      {
        id: 'id-generation',
        title: 'MD5/SHA-256 Hashing vs Distributed Counter Sequence',
        question: 'How should short codes be derived from original long URLs?',
        optionA: {
          label: 'Hash Truncation (MD5 / SHA-256)',
          description: 'Hash the long URL and take first 7 characters encoded in Base62.',
          pros: ['Deterministic: Identical long URLs produce identical codes', 'Stateless without centralized sequence generator'],
          cons: ['Hash collisions require re-hashing or salt appending', 'Vulnerable to database collision lookups'],
        },
        optionB: {
          label: 'Distributed Snowflake / Range Counter',
          description: 'Assign unique 64-bit integer ID and convert directly to Base62 string.',
          pros: ['Zero collisions mathematically guaranteed', '100% space efficient and predictable length'],
          cons: ['Sequential IDs require random salt shuffle to avoid guessing', 'Requires coordinated range service'],
        },
        defaultOption: 'B',
        recommendation: 'A range-based integer counter or 64-bit Snowflake generator converted to Base62 guarantees zero collisions and superior throughput.',
      },
    ],
    bottlenecks: [
      {
        id: 'bn-1',
        severity: 'CRITICAL',
        component: 'In-Memory Cache Cluster',
        vulnerability: 'Cache Penetration from Non-Existent Keys: Attackers requesting random unassigned short codes bypass cache and hammer database.',
        mitigation: 'Deploy a space-efficient Bloom Filter at the API Gateway to deterministically reject non-existent short codes before querying cache or DB.',
        pillar: 'Performance',
      },
      {
        id: 'bn-2',
        severity: 'HIGH',
        component: 'Partitioned Storage Cluster',
        vulnerability: 'Hot Shard Bottleneck: A single viral short code (e.g. breaking global news) concentrates millions of requests onto one storage shard.',
        mitigation: 'Implement multi-level local memory caching on application pods for top 100 hot keys with 60-second sliding TTL.',
        pillar: 'Scalability',
      },
      {
        id: 'bn-3',
        severity: 'MEDIUM',
        component: 'Clickstream Event Log',
        vulnerability: 'Consumer Lag & Queue Backpressure during sudden traffic spikes.',
        mitigation: 'Configure disk-backed ring buffers and partition autoscaling with dead-letter queue routing for corrupted records.',
        pillar: 'Reliability',
      },
    ],
  },
  {
    id: 'distributed-kv',
    title: 'Distributed Key-Value Store with Tunable Consistency & Gossip Protocol',
    subtitle: 'Dynamo-Style Masterless Replication with Consistent Hashing & Vector Clocks',
    tier: 'Tier-1 Core Architecture',
    difficulty: 'Expert',
    targetRole: 'Distributed Systems & Database Infrastructure Engineer',
    overview:
      'Architect a decentralized, highly available, partition-tolerant key-value datastore inspired by Dynamo and Cassandra architectures, supporting tunable quorum consistency (N, R, W) and anti-entropy synchronization.',
    problemStatement:
      'The datastore must achieve linear horizontal scalability, zero single points of failure (masterless topology), automatic node discovery via Gossip, and deterministic conflict resolution using Vector Clocks during cross-datacenter network partitions.',
    requirements: {
      functional: [
        'put(key, value) and get(key) primitives with sub-5ms SLA.',
        'Tunable client consistency levels: ANY, ONE, QUORUM, ALL.',
        'Automatic node membership discovery and failure detection.',
        'Background anti-entropy synchronization via Merkle trees.',
      ],
      nonFunctional: [
        'Masterless high availability: No single coordinator node can cause outages.',
        'High write throughput with Log-Structured Merge (LSM) trees.',
        'Partition tolerance (CAP Theorem AP bias with configurable CP mode).',
        'Balanced partition distribution via Consistent Hashing with virtual nodes.',
      ],
    },
    defaultCapacity: {
      dau: 20000000,
      readWriteRatio: 3,
      payloadSizeBytes: 2048,
      retentionYears: 3,
    },
    components: [
      {
        id: 'c-client-coord',
        name: 'Smart Client Coordinator & Hashing Driver',
        category: 'EDGE',
        description: 'Maintains local ring topology cache and routes key requests directly to primary replica node.',
        latencyTier: '< 1ms',
        failureMode: 'Falls back to any random healthy ring node if primary coordinator node is unreachable.',
        scalingStrategy: 'Embedded client SDK in application runtimes.',
        techPattern: 'Zero-Hop Ring Topology Routing Driver',
      },
      {
        id: 'c-ring',
        name: 'Consistent Hashing Ring (Virtual Nodes)',
        category: 'GATEWAY',
        description: 'Distributes keys uniformly across token space (0 to 2^64 - 1) with 256 virtual nodes per server.',
        latencyTier: '< 1ms',
        failureMode: 'Keys gracefully remapped to next clockwise neighbor upon node failure.',
        scalingStrategy: 'Deterministic hash mapping without central coordinator.',
        techPattern: 'Virtual-Node Consistent Hashing Space',
      },
      {
        id: 'c-storage-engine',
        name: 'LSM-Tree Storage Engine (MemTable & SSTables)',
        category: 'STORAGE',
        description: 'Appends writes to Write-Ahead Log (WAL) and memory MemTable, flushing sequentially to immutable SSTables.',
        latencyTier: '< 2ms write',
        failureMode: 'WAL replay restores MemTable state following process crash.',
        scalingStrategy: 'Independent local disk I/O on NVMe SSDs.',
        techPattern: 'Log-Structured Merge Tree with Bloom Filters',
      },
      {
        id: 'c-gossip',
        name: 'Decentralized Gossip Failure Detector',
        category: 'STREAMING',
        description: 'Periodically exchanges state heartbeats with random peer nodes to maintain consensus on ring health.',
        latencyTier: '< 50ms convergence',
        failureMode: 'Phi-Accrual failure detector calculates sliding failure suspicion window.',
        scalingStrategy: 'O(log N) epidemic broadcast overhead.',
        techPattern: 'Phi-Accrual Epidemic Gossip Protocol',
      },
      {
        id: 'c-anti-entropy',
        name: 'Merkle Tree Anti-Entropy Synchronizer',
        category: 'ASYNC_WORKER',
        description: 'Compares hierarchical cryptographic hashes of key ranges to pinpoint differences across replicas.',
        latencyTier: '< 1s background',
        failureMode: 'Stream only divergent sub-branches instead of full partition scans.',
        scalingStrategy: 'Scheduled low-priority background workers per range partition.',
        techPattern: 'Hierarchical Hash Tree Synchronization',
      },
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Consistent Hash Ring Lookup',
        fromNode: 'Smart Client Coordinator',
        toNode: 'Consistent Hashing Ring',
        protocol: 'MurmurHash3(key) mod 2^64',
        description: 'Maps key to first clockwise node and identifies N consecutive replica storage nodes.',
      },
      {
        stepNumber: 2,
        title: 'Quorum Write Dispatch',
        fromNode: 'Coordinator Node',
        toNode: 'LSM Storage Engine Replicas',
        protocol: 'Internal TCP RPC Put(key, val, vclock)',
        description: 'Dispatches write concurrently to N replica nodes and awaits W successful acknowledgments.',
      },
      {
        stepNumber: 3,
        title: 'Write-Ahead Log & MemTable Append',
        fromNode: 'Replica Node',
        toNode: 'Disk WAL & MemTable',
        protocol: 'Sequential Append I/O',
        description: 'Appends record to disk WAL for durability and updates sorted in-memory MemTable.',
      },
      {
        stepNumber: 4,
        title: 'Quorum Acknowledgment',
        fromNode: 'Replica Node',
        toNode: 'Coordinator Node',
        protocol: 'RPC WriteAck(OK)',
        description: 'Once W acknowledgments are received, coordinator confirms success to client caller.',
      },
    ],
    tradeOffs: [
      {
        id: 'quorum-balance',
        title: 'Strong Quorum (R + W > N) vs High-Availability Sloppy Quorum',
        question: 'How should the system configure replication factor N, Read quorum R, and Write quorum W?',
        optionA: {
          label: 'Strict Quorum (R + W > N, e.g. N=3, R=2, W=2)',
          description: 'Guarantees that read and write replica sets overlap by at least one node.',
          pros: ['Strong consistency: Always reads latest acknowledged write', 'Prevents dirty and stale reads'],
          cons: ['Writes fail if minority of nodes are partitioned or offline', 'Higher tail latency during slow node responses'],
        },
        optionB: {
          label: 'Sloppy Quorum with Hinted Handoff (W=1, R=1)',
          description: 'Temporarily stores writes on substitute nodes if primary replicas are unreachable.',
          pros: ['Extreme availability: Accepts writes even during major network partitions', 'Sub-millisecond latency SLA'],
          cons: ['Eventual consistency: Readers may observe stale values until reconciliation', 'Requires Vector Clocks for conflict resolution'],
        },
        defaultOption: 'A',
        recommendation: 'Strict Quorum (N=3, R=2, W=2) is the standard sweet spot for distributed reliability without sacrificing read consistency.',
      },
      {
        id: 'conflict-resolution',
        title: 'Last-Write-Wins (LWW) vs Vector Clocks with Client Merge',
        question: 'How should concurrent conflicting writes across partitioned nodes be reconciled?',
        optionA: {
          label: 'Last-Write-Wins (LWW) with Wall-Clock Timestamps',
          description: 'The write with the highest physical NTP timestamp overwrites previous values.',
          pros: ['Simple deterministic resolution without client involvement', 'Zero storage overhead for version history'],
          cons: ['Clock drift between servers can silently erase valid customer updates (silent data loss)'],
        },
        optionB: {
          label: 'Vector Clocks / Version Vectors',
          description: 'Maintains vector of (node, counter) pairs representing causality.',
          pros: ['100% causal consistency without clock skew vulnerabilities', 'Preserves concurrent siblings without data loss'],
          cons: ['Clients must handle merge logic when siblings occur', 'Vectors require truncation pruning algorithms'],
        },
        defaultOption: 'B',
        recommendation: 'Vector Clocks are critical for mission-critical datastores where silent write loss due to clock skew is unacceptable.',
      },
    ],
    bottlenecks: [
      {
        id: 'bn-kv-1',
        severity: 'CRITICAL',
        component: 'LSM Storage Engine',
        vulnerability: 'Compaction Write Amplification: Background SSTable compaction consumes disk I/O bandwidth, causing latency spikes for live queries.',
        mitigation: 'Implement tiered/leveled compaction rate limiters and reserve dedicated IOPS quotas for background compaction threads.',
        pillar: 'Performance',
      },
      {
        id: 'bn-kv-2',
        severity: 'HIGH',
        component: 'Decentralized Gossip',
        vulnerability: 'Flapping Node Storm: A degraded node with intermittent network drops triggers continuous gossip state churn across the entire ring.',
        mitigation: 'Apply exponential decay damping to node state transitions and require continuous heartbeat failure before declaring node dead.',
        pillar: 'Reliability',
      },
      {
        id: 'bn-kv-3',
        severity: 'MEDIUM',
        component: 'Merkle Tree Anti-Entropy',
        vulnerability: 'CPU saturation when computing cryptographic hashes over large SSTables during peak daytime traffic.',
        mitigation: 'Schedule anti-entropy synchronization jobs exclusively during low-traffic maintenance windows.',
        pillar: 'Cost',
      },
    ],
  },
  {
    id: 'payment-ledger',
    title: 'Resilient Financial Transaction & Double-Entry Ledger Pipeline',
    subtitle: 'Idempotent Payment Orchestration with Transactional Outbox & Saga Compensation',
    tier: 'Tier-1 Core Architecture',
    difficulty: 'Expert',
    targetRole: 'FinTech Platform Engineer / Core Banking Architect',
    overview:
      'Design an immutable, double-entry financial ledger and payment processing pipeline guaranteeing zero double-debiting, exactly-once idempotency semantics, and asynchronous reconciliation across external banking gateways.',
    problemStatement:
      'The architecture must process payments with strict ACID compliance on internal ledgers, orchestrate multi-step bank settlement workflows without 2-Phase-Commit blocking, and maintain a mathematically balanced append-only audit trail.',
    requirements: {
      functional: [
        'Execute fund transfers between accounts with double-entry balance consistency.',
        'Strict idempotency on payment submissions (replay of request yields identical receipt without double charge).',
        'Saga orchestration for external payment gateway capture, fraud scoring, and settlement.',
        'Real-time account balance queries with lock-free optimistic concurrency.',
      ],
      nonFunctional: [
        'Zero monetary loss: 100% mathematical reconciliation invariant (Total Debits == Total Credits).',
        'Auditability: Immutable append-only transaction log without row mutation.',
        'High availability with low p99 latency (< 150ms).',
        'Regulatory compliance: Cryptographically signed transaction digests.',
      ],
    },
    defaultCapacity: {
      dau: 15000000,
      readWriteRatio: 10,
      payloadSizeBytes: 1024,
      retentionYears: 7,
    },
    components: [
      {
        id: 'c-idemp',
        name: 'Idempotency Filter & Request Deduplication Cache',
        category: 'GATEWAY',
        description: 'Validates unique client Idempotency-Key in distributed cache with distributed locks to block concurrent duplicate submissions.',
        latencyTier: '< 5ms',
        failureMode: 'Replay stored original response if key is already completed; reject in-flight duplicates with HTTP 409 Conflict.',
        scalingStrategy: 'Redis cluster with Redlock / single-key atomic TTL reservations.',
        techPattern: 'Distributed Atomic Idempotency Shield',
      },
      {
        id: 'c-saga-orch',
        name: 'Saga Payment Orchestrator & State Machine',
        category: 'COMPUTE',
        description: 'Manages multi-step payment states: PENDING, AUTHORIZED, CAPTURED, SETTLED, or COMPENSATED upon failure.',
        latencyTier: '< 20ms',
        failureMode: 'State machine checkpointing ensures automated resumption or compensation rollback.',
        scalingStrategy: 'Stateless workflow workers polling or subscribed to durable state machines.',
        techPattern: 'Orchestrated Saga Pattern with Compensation Steps',
      },
      {
        id: 'c-outbox',
        name: 'Transactional Outbox & CDC Streamer (Debezium)',
        category: 'STREAMING',
        description: 'Saves domain events in an outbox table within the same database transaction as ledger entries, streaming to Kafka.',
        latencyTier: '< 10ms',
        failureMode: 'Zero two-phase commit overhead; CDC guarantees at-least-once event delivery from database transaction log.',
        scalingStrategy: 'Connector partition sharding mapped to database shard topology.',
        techPattern: 'Transactional Outbox with Change Data Capture',
      },
      {
        id: 'c-ledger-db',
        name: 'Immutable Double-Entry Ledger Database',
        category: 'STORAGE',
        description: 'Enforces append-only accounting entries (debit leg + credit leg). Row updates or balance overwrites are forbidden by database triggers.',
        latencyTier: '< 25ms ACID',
        failureMode: 'Synchronous standby multi-region replication with automatic failover.',
        scalingStrategy: 'Account ID hash sharding with cross-partition two-phase balance settlements.',
        techPattern: 'Append-Only Double-Entry Relational Ledger',
      },
      {
        id: 'c-recon-worker',
        name: 'Continuous Anti-Fraud & Reconciliation Worker',
        category: 'ASYNC_WORKER',
        description: 'Reconciles bank settlement files (MT940/CAMT) against internal ledger entries and flags variance alerts.',
        latencyTier: 'Batch / Daily',
        failureMode: 'Discrepancy queue triggers automatic freeze and escalation to financial operations.',
        scalingStrategy: 'Distributed MapReduce / streaming reconciliation workers.',
        techPattern: 'Asynchronous Discrepancy Reconciliation Engine',
      },
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Idempotency Verification',
        fromNode: 'Client Application',
        toNode: 'Idempotency Filter',
        protocol: 'POST /v1/transfers (Idempotency-Key: uuid)',
        description: 'Atomically reserves key in cache. If already processed, returns cached receipt immediately.',
      },
      {
        stepNumber: 2,
        title: 'ACID Ledger Write & Outbox Insert',
        fromNode: 'Payment Orchestrator',
        toNode: 'Immutable Ledger DB',
        protocol: 'BEGIN TRANSACTION ... COMMIT',
        description: 'Inserts paired debit/credit ledger lines and creates outbox event record in single transaction.',
      },
      {
        stepNumber: 3,
        title: 'CDC Event Streaming',
        fromNode: 'Immutable Ledger DB',
        toNode: 'Transactional Outbox CDC',
        protocol: 'Postgres WAL / Debezium Pipeline',
        description: 'Extracts committed transaction from database write-ahead log and publishes to payment topic.',
      },
      {
        stepNumber: 4,
        title: 'External Bank Gateway Settlement',
        fromNode: 'Saga Orchestrator',
        toNode: 'External Banking Network',
        protocol: 'mTLS ISO 20022 / REST Transfer',
        description: 'Calls external gateway. If gateway times out, orchestrator executes status inquiry or compensation refund.',
      },
    ],
    tradeOffs: [
      {
        id: 'distributed-tx',
        title: 'Two-Phase Commit (2PC) vs Saga Choreography/Orchestration',
        question: 'How should distributed payments spanning multiple services and external banks be coordinated?',
        optionA: {
          label: 'Two-Phase Commit (2PC / XA Transactions)',
          description: 'Synchronous blocking locks across all participating databases until all agree to commit.',
          pros: ['Instant strong consistency across all services', 'No need for compensating refund transactions'],
          cons: ['High latency and catastrophic lock contention', 'Vulnerable to coordinator failure freezing locks across system'],
        },
        optionB: {
          label: 'Saga Pattern (Orchestrated Workflow)',
          description: 'Sequence of local transactions with compensating reversal actions if a downstream step fails.',
          pros: ['Non-blocking high throughput with standard service autonomy', 'Works seamlessly across third-party banking APIs'],
          cons: ['Eventual consistency: Intermediate states are visible to queries', 'Requires complex compensation logic for failure paths'],
        },
        defaultOption: 'B',
        recommendation: 'Saga orchestration is the enterprise standard for modern payment architectures due to resilience and non-blocking performance.',
      },
      {
        id: 'balance-storage',
        title: 'Computed Balance (SUM of Entries) vs Cached Balance Column with Row Locks',
        question: 'How should an account balance be verified and stored?',
        optionA: {
          label: 'Computed Balance from Immutable Log (SELECT SUM)',
          description: 'Balance is always derived by summing all historical debit and credit journal lines.',
          pros: ['100% mathematically tamper-proof', 'Eliminates concurrency update conflicts on account rows'],
          cons: ['Slow query times for accounts with millions of transactions unless materialized snapshots are used'],
        },
        optionB: {
          label: 'Snapshot Checkpoints + Delta Journal',
          description: 'Daily account balance snapshots with fast sum of recent transaction journal rows.',
          pros: ['Sub-millisecond balance checks', 'Scales to decades of transaction history with constant lookup time'],
          cons: ['Requires deterministic snapshot rollup jobs at midnight cutoff'],
        },
        defaultOption: 'B',
        recommendation: 'Periodic snapshot checkpoints combined with an append-only delta ledger provides optimal performance with cryptographic integrity.',
      },
    ],
    bottlenecks: [
      {
        id: 'bn-pay-1',
        severity: 'CRITICAL',
        component: 'Immutable Double-Entry Ledger DB',
        vulnerability: 'Row Lock Contention on High-Frequency Hot Accounts (e.g. platform escrow / merchant merchant account).',
        mitigation: 'Implement account sharding with sub-accounts or balance reservation buckets to distribute write locks across parallel slots.',
        pillar: 'Performance',
      },
      {
        id: 'bn-pay-2',
        severity: 'HIGH',
        component: 'External Banking Network Integration',
        vulnerability: 'Network Timeout Ambiguity: Bank gateway returns connection timeout, leaving transfer state unknown (Was the money transferred?).',
        mitigation: 'Mandate strict asynchronous status polling with exponential backoff and never trigger compensation until the external provider confirms non-execution.',
        pillar: 'Reliability',
      },
      {
        id: 'bn-pay-3',
        severity: 'MEDIUM',
        component: 'Transactional Outbox Streamer',
        vulnerability: 'Duplicate Event Delivery: Consumer workers may process the same settlement notification more than once during rebalance.',
        mitigation: 'Enforce consumer-side idempotency tracking where each event ID is committed atomically with the downstream action.',
        pillar: 'Data Integrity',
      },
    ],
  },
  {
    id: 'notification-fanout',
    title: 'Scalable Multi-Channel Live Notification & Fan-Out Engine',
    subtitle: 'High-Volume Priority Queues, WebSocket Gateway Pools & Dynamic Rate Throttling',
    tier: 'Tier-1 Core Architecture',
    difficulty: 'Advanced',
    targetRole: 'Real-Time Systems / Backend Infrastructure Engineer',
    overview:
      'Design a global notification platform dispatching millions of push notifications, transactional emails, SMS alerts, and in-app WebSocket broadcasts per minute with priority scheduling, user preference management, and channel deduplication.',
    problemStatement:
      'The platform must handle celebrity fan-out events (one event generating 50 million recipient notifications) without choking mission-critical transactional alerts (e.g. OTP logins), adhering strictly to regional quiet hours and per-user throttling.',
    requirements: {
      functional: [
        'Deliver alerts across multi-channels: Push, SMS, Email, and Real-Time WebSocket.',
        'Priority classification: HIGH (OTPs, fraud alerts), MEDIUM (order updates), LOW (marketing digests).',
        'User notification preferences and quiet hour curfew suppression.',
        'Delivery receipt tracking and dead-letter queue retries.',
      ],
      nonFunctional: [
        'High throughput: 100,000+ dispatches per second peak capacity.',
        'Latency SLA: High-priority alerts delivered in < 2 seconds.',
        'Fairness: Celebrity broadcast must not starve critical one-to-one transactional messages.',
        'Cost efficiency: Channel fallbacks and message batching.',
      ],
    },
    defaultCapacity: {
      dau: 40000000,
      readWriteRatio: 5,
      payloadSizeBytes: 800,
      retentionYears: 2,
    },
    components: [
      {
        id: 'c-notif-api',
        name: 'Notification Ingestion API & Priority Router',
        category: 'GATEWAY',
        description: 'Validates alert payloads and immediately routes to prioritized message queues based on notification urgency tier.',
        latencyTier: '< 10ms',
        failureMode: 'Backpressure shedding for lowest priority marketing notifications under severe load.',
        scalingStrategy: 'Horizontal stateless auto-scaling.',
        techPattern: 'Priority-Aware Request Router',
      },
      {
        id: 'c-user-pref',
        name: 'User Preference & Curfew Cache',
        category: 'CACHE',
        description: 'In-memory lookup checking enabled channels, opt-outs, and timezone quiet hours.',
        latencyTier: '< 2ms',
        failureMode: 'Default to enabled transactional channels if preference cache is temporarily unreachable.',
        scalingStrategy: 'Redis cluster with 24-hour TTL and event-driven invalidation.',
        techPattern: 'High-Performance Profile & Preference Cache',
      },
      {
        id: 'c-fanout-queue',
        name: 'Tiered Partitioned Message Broker (Kafka / RabbitMQ)',
        category: 'STREAMING',
        description: 'Segregated topics for Critical, Standard, and Bulk traffic with separate consumer worker pools.',
        latencyTier: '< 15ms',
        failureMode: 'Dead-letter exchange captures unroutable or permanently failed messages.',
        scalingStrategy: 'Topic partitioning scaled to consumer concurrency requirements.',
        techPattern: 'Priority-Tiered Partitioned Message Broker',
      },
      {
        id: 'c-channel-dispatchers',
        name: 'Multi-Channel Worker Dispatchers (Push, SMS, Email)',
        category: 'ASYNC_WORKER',
        description: 'Pool of asynchronous workers managing vendor rate limits, token rotation, and batch dispatch.',
        latencyTier: '< 250ms dispatch',
        failureMode: 'Exponential backoff with circuit breaker when external vendor gateway degrades.',
        scalingStrategy: 'Dynamic worker scaling based on queue depth metrics.',
        techPattern: 'Circuit-Breaker Protected Channel Worker Pool',
      },
      {
        id: 'c-ws-gateway',
        name: 'In-App Live WebSocket Gateway Cluster',
        category: 'COMPUTE',
        description: 'Maintains persistent stateful WebSocket connections for active online users, delivering instant in-app alerts.',
        latencyTier: '< 20ms live',
        failureMode: 'Clients reconnect automatically with exponential jitter; messages queued in mailbox.',
        scalingStrategy: 'Redis Pub/Sub backplane routing events to specific gateway instances hosting user connections.',
        techPattern: 'Stateful WebSocket Connection Fleet with Pub/Sub Backplane',
      },
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Notification Ingestion',
        fromNode: 'Internal Microservice',
        toNode: 'Notification Ingestion API',
        protocol: 'gRPC TriggerNotification(user_id, template, priority)',
        description: 'Receives alert request, verifies priority, and checks deduplication window in cache.',
      },
      {
        stepNumber: 2,
        title: 'Preference & Rule Evaluation',
        fromNode: 'Notification Ingestion API',
        toNode: 'User Preference Cache',
        protocol: 'Redis MGET user:preferences',
        description: 'Checks if user muted channel, verified phone/email, or is currently within timezone quiet hours.',
      },
      {
        stepNumber: 3,
        title: 'Priority Queue Dispatch',
        fromNode: 'Notification Ingestion API',
        toNode: 'Tiered Message Broker',
        protocol: 'Kafka Produce (topic: notifications.critical)',
        description: 'Enqueues into dedicated critical queue isolated from background marketing traffic.',
      },
      {
        stepNumber: 4,
        title: 'Multi-Channel Dispatch & In-App Broadcast',
        fromNode: 'Channel Dispatcher Workers',
        toNode: 'End User Device / WebSocket Gateway',
        protocol: 'APNs / FCM / WebSocket Frame',
        description: 'Pushes mobile notification and simultaneously routes in-app alert via active WebSocket connection.',
      },
    ],
    tradeOffs: [
      {
        id: 'fanout-strategy',
        title: 'Fan-Out on Write (Push) vs Fan-Out on Read (Pull)',
        question: 'When a broadcaster with 10M followers publishes an announcement, how should delivery be orchestrated?',
        optionA: {
          label: 'Fan-Out on Write (Push Model)',
          description: 'Immediately enqueue 10 million distinct notification records upon message publish.',
          pros: ['Instant delivery to all followers', 'Zero read overhead when users open notification inbox'],
          cons: ['Massive compute & storage burst for accounts with millions of followers', 'Wasted compute for inactive users'],
        },
        optionB: {
          label: 'Hybrid Fan-Out (Write for Normal Users, Read for Celebrities)',
          description: 'Fan-out on write for users with < 25,000 followers; pull & merge on read for mega-accounts.',
          pros: ['Eliminates catastrophic database spikes during celebrity broadcasts', 'Optimal balance of write/read efficiency'],
          cons: ['Slightly more complex inbox query combining personal inbox with celebrity broadcast feeds'],
        },
        defaultOption: 'B',
        recommendation: 'A hybrid fan-out model is the industry standard (used by major social and content platforms) to neutralize celebrity thundering herd spikes.',
      },
      {
        id: 'websocket-backplane',
        title: 'Centralized Redis Pub/Sub vs Distributed Mesh Messaging',
        question: 'How should notifications find which WebSocket gateway node currently holds a user’s open socket?',
        optionA: {
          label: 'Redis Pub/Sub Backplane',
          description: 'All gateway nodes subscribe to a shared channel or user-specific topic.',
          pros: ['Extremely simple implementation with low latency', 'Zero need for nodes to track peer cluster topology'],
          cons: ['Every message broadcasts to all gateway nodes unless partitioned channels are carefully managed'],
        },
        optionB: {
          label: 'Distributed Session Registry (Redis Hash / DynamoDB)',
          description: 'Map user_id -> gateway_node_ip; dispatch messages directly via internal gRPC to that specific node.',
          pros: ['Point-to-point network efficiency; zero broadcast traffic waste', 'Scales to tens of millions of concurrent sockets'],
          cons: ['Requires heartbeat registration and stale session cleanup when connections drop unexpectedly'],
        },
        defaultOption: 'B',
        recommendation: 'A distributed session registry mapping user connections to specific host IPs eliminates broadcast flooding at massive scale.',
      },
    ],
    bottlenecks: [
      {
        id: 'bn-notif-1',
        severity: 'CRITICAL',
        component: 'Tiered Partitioned Message Broker',
        vulnerability: 'Queue Starvation: A single bulk marketing campaign floods worker queues, delaying time-sensitive 2FA OTP codes.',
        mitigation: 'Physically isolate high-priority traffic into dedicated broker topics and independent worker clusters with strict CPU/RAM quotas.',
        pillar: 'Reliability',
      },
      {
        id: 'bn-notif-2',
        severity: 'HIGH',
        component: 'Channel Worker Dispatchers',
        vulnerability: 'Downstream Vendor Rate Throttling: Push notification or SMS provider enforces 1,000 QPS limit and drops excess requests.',
        mitigation: 'Implement a distributed Token Bucket rate limiter in front of each external vendor connector with automated queue backpressure.',
        pillar: 'Scalability',
      },
      {
        id: 'bn-notif-3',
        severity: 'MEDIUM',
        component: 'In-App Live WebSocket Gateway',
        vulnerability: 'Ephemeral File Descriptor Exhaustion on WebSocket gateway instances during simultaneous reconnect storms.',
        mitigation: 'Tune Linux kernel `sysctl` settings (`fs.file-max`, `net.ipv4.ip_local_port_range`) and enforce randomized client reconnection backoff.',
        pillar: 'Performance',
      },
    ],
  },
  {
    id: 'collaborative-doc',
    title: 'Real-Time Collaborative Document Sync & Conflict Resolution',
    subtitle: 'Multi-User Concurrent Text Editing with CRDT, WebSocket Mesh & State Vectors',
    tier: 'Tier-1 Core Architecture',
    difficulty: 'Expert',
    targetRole: 'Distributed Systems & Real-Time Collaborative Apps Engineer',
    overview:
      'Design a real-time collaborative document editing architecture supporting multiple concurrent authors editing the same document with sub-50ms keystroke synchronization, offline capability, and mathematically provable convergence without data loss.',
    problemStatement:
      'The system must resolve concurrent character insertions and deletions across thousands of simultaneous editors, synchronize state vectors over unreliable WebSocket connections, and persist version history without unbounded memory bloat.',
    requirements: {
      functional: [
        'Concurrent multi-user character edits with real-time cursor presence and selection highlighting.',
        'Offline editing support: Users disconnect, edit locally, and seamlessly merge upon reconnection.',
        'Granular document version history and point-in-time snapshot rollback.',
        'Fine-grained workspace permissions (View, Comment, Edit).',
      ],
      nonFunctional: [
        'Convergence guarantee: All users who receive the same operations reach identical document state (Strong Eventual Consistency).',
        'Sub-50ms local typing latency: Zero lag between keyboard press and screen rendering.',
        'Network efficiency: Delta updates transmitted as compact binary state vectors.',
        'Durability: Continuous background snapshot persistence to cloud object storage.',
      ],
    },
    defaultCapacity: {
      dau: 10000000,
      readWriteRatio: 2,
      payloadSizeBytes: 1500,
      retentionYears: 5,
    },
    components: [
      {
        id: 'c-client-crdt',
        name: 'Client-Side CRDT Engine (Yjs / Automerge Architecture)',
        category: 'EDGE',
        description: 'Maintains local document state, applies keystrokes immediately to UI, and generates conflict-free delta operations.',
        latencyTier: '< 1ms local',
        failureMode: 'Local IndexedDB persistence ensures offline modifications are preserved across browser refreshes.',
        scalingStrategy: 'Client-side compute on user CPU runtimes.',
        techPattern: 'Client Conflict-Free Replicated Data Type (CRDT)',
      },
      {
        id: 'c-collab-gateway',
        name: 'Collaborative WebSocket Gateway Cluster',
        category: 'GATEWAY',
        description: 'Terminates binary WebSocket connections, authenticates session tokens, and multiplexes room channels.',
        latencyTier: '< 10ms',
        failureMode: 'Sticky routing with graceful socket migration during rolling node updates.',
        scalingStrategy: 'Consistent hash room allocation across gateway servers.',
        techPattern: 'Stateful WebSocket Connection Router',
      },
      {
        id: 'c-room-server',
        name: 'In-Memory Document Room Authority Server',
        category: 'COMPUTE',
        description: 'Holds in-memory authoritative document state vector, validates client deltas, and broadcasts updates to room peers.',
        latencyTier: '< 5ms',
        failureMode: 'Recovers latest state from append-only snapshot log in Redis / S3.',
        scalingStrategy: 'One active room coordinator per document with Raft or Redis lease.',
        techPattern: 'In-Memory Room Coordinator with Distributed Lease',
      },
      {
        id: 'c-op-log',
        name: 'Append-Only Operation Log & Transaction Cache',
        category: 'STORAGE',
        description: 'Durable log storing sequential binary updates with vector clock metadata.',
        latencyTier: '< 15ms',
        failureMode: 'Replicated across 3 availability zones with synchronous append.',
        scalingStrategy: 'Partitioned by document ID hash.',
        techPattern: 'Distributed Append-Only Operation Journal',
      },
      {
        id: 'c-snapshot-worker',
        name: 'Document Compaction & Snapshot Worker',
        category: 'ASYNC_WORKER',
        description: 'Periodically squashes millions of tiny CRDT character deltas into clean document snapshots stored in object storage.',
        latencyTier: '< 5s async',
        failureMode: 'Fails safely without interrupting active real-time editing rooms.',
        scalingStrategy: 'Asynchronous background job worker pool.',
        techPattern: 'CRDT Garbage Collection & State Compactor',
      },
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Local Keystroke Application',
        fromNode: 'User Browser / Native Editor',
        toNode: 'Local CRDT Engine',
        protocol: 'In-Memory State Mutex',
        description: 'User types character; local CRDT updates UI instantly (0ms perceived latency) and generates state delta.',
      },
      {
        stepNumber: 2,
        title: 'Binary Delta Broadcast',
        fromNode: 'Local CRDT Engine',
        toNode: 'WebSocket Gateway Cluster',
        protocol: 'Binary WebSocket Frame (State Vector)',
        description: 'Sends compact binary encoded update vector containing client ID, clock counter, and character payload.',
      },
      {
        stepNumber: 3,
        title: 'Room Authority Validation & Peer Fan-Out',
        fromNode: 'Collaborative Gateway',
        toNode: 'Room Authority Server',
        protocol: 'Internal TCP Pub/Sub Broadcast',
        description: 'Applies update to authoritative room state and broadcasts delta to all other connected peers in the same document room.',
      },
      {
        stepNumber: 4,
        title: 'Durable Append & Snapshot Rollup',
        fromNode: 'Room Authority Server',
        toNode: 'Operation Log & S3 Object Storage',
        protocol: 'Asynchronous Append & S3 PutObject',
        description: 'Appends operation to journal and triggers snapshot compression job after 500 accumulated operations.',
      },
    ],
    tradeOffs: [
      {
        id: 'sync-algorithm',
        title: 'Operational Transformation (OT) vs Conflict-Free Replicated Data Types (CRDT)',
        question: 'Which mathematical synchronization paradigm should drive document collaboration?',
        optionA: {
          label: 'Operational Transformation (OT - Google Docs Model)',
          description: 'Operations are transformed against concurrently executed operations via a central sequencing server.',
          pros: ['Extremely compact payload size without per-character metadata', 'Long-standing, battle-tested algorithms'],
          cons: ['Strictly requires central server to establish canonical order', 'Very difficult to implement for peer-to-peer or offline scenarios'],
        },
        optionB: {
          label: 'CRDT (Conflict-Free Replicated Data Types - Yjs / Figma Model)',
          description: 'Data structures where operations commute naturally; any arrival order produces identical state.',
          pros: ['Zero central coordinator required; seamless offline merge', 'Mathematically provable Strong Eventual Consistency'],
          cons: ['Higher memory overhead due to unique ID and tombstone metadata per character', 'Requires periodic garbage collection'],
        },
        defaultOption: 'B',
        recommendation: 'Modern collaborative engineering systems favor CRDTs due to offline-first resilience and distributed peer-to-peer convergence.',
      },
      {
        id: 'storage-compaction',
        title: 'Full Delta History vs Periodic Snapshot Compaction',
        question: 'How should historical document modifications be persisted over time?',
        optionA: {
          label: 'Retain Every Granular Keystroke Delta',
          description: 'Keep the entire immutable sequence of every single character inserted or deleted.',
          pros: ['Perfect time-travel playback capability down to every millisecond', 'Zero loss of editing history'],
          cons: ['Documents with millions of edits grow to hundreds of megabytes in memory, degrading initial load time'],
        },
        optionB: {
          label: 'Compacted Snapshots with Incremental Tombstone Pruning',
          description: 'Periodically collapse all prior deltas into a unified document state and prune deleted tombstones.',
          pros: ['Instant document opening times even for documents years old', 'Constrained memory footprint on mobile devices'],
          cons: ['Sub-second granularity playback between snapshots is condensed into milestone revisions'],
        },
        defaultOption: 'B',
        recommendation: 'Compacted snapshots with checkpoint milestones provide the optimal balance of fast opening performance and auditability.',
      },
    ],
    bottlenecks: [
      {
        id: 'bn-doc-1',
        severity: 'CRITICAL',
        component: 'Client-Side CRDT Engine',
        vulnerability: 'Tombstone Memory Leaks: Deleted characters remain in memory as tombstone pointers to preserve relative positioning, bloating document size over time.',
        mitigation: 'Implement state-based CRDT garbage collection that prunes tombstones when all active clients have confirmed seeing the deletion.',
        pillar: 'Performance',
      },
      {
        id: 'bn-doc-2',
        severity: 'HIGH',
        component: 'In-Memory Document Room Authority Server',
        vulnerability: 'Thundering Herd on Viral Document: 10,000 users opening a single public document simultaneously crashes room server memory.',
        mitigation: 'Separate read-only viewers from active editors; stream read-only updates via CDN/Edge WebSockets while editors connect to room coordinator.',
        pillar: 'Scalability',
      },
      {
        id: 'bn-doc-3',
        severity: 'MEDIUM',
        component: 'Collaborative WebSocket Gateway Cluster',
        vulnerability: 'Cross-datacenter latency differences creating jitter and visual cursor jumping for international participants.',
        mitigation: 'Deploy edge WebSocket termination with localized presence aggregation before routing to the primary document authority datacenter.',
        pillar: 'Reliability',
      },
    ],
  },
  {
    id: 'distributed-rate-limiter',
    title: 'Distributed API Shield & Multi-Tier Rate Limiting Engine',
    subtitle: 'Sliding Window Counters, Redis Atomic Lua Scripts & Local In-Memory Token Buckets',
    tier: 'Tier-1 Core Architecture',
    difficulty: 'Advanced',
    targetRole: 'Platform Security & Infrastructure Architect',
    overview:
      'Architect a distributed, high-performance API rate limiter capable of enforcing tiered quotas (per user, per API key, per IP) across millions of requests per second with sub-millisecond evaluation overhead and graceful degradation during cache failures.',
    problemStatement:
      'The rate limiter must eliminate race conditions across distributed gateway instances, protect downstream microservices from DDoS storms, support tiered VIP quotas, and maintain system availability even if the central Redis cache cluster fails completely.',
    requirements: {
      functional: [
        'Enforce rate limits per API key, User ID, and IP address (e.g. 100 req/min, 10,000 req/day).',
        'Support standard HTTP 429 Too Many Requests response with standard headers (X-RateLimit-Limit, Remaining, Reset).',
        'Sliding window precision to eliminate burst traffic at boundary edges.',
        'Tiered quota plans (Free, Developer, Enterprise) with dynamic configuration updates.',
      ],
      nonFunctional: [
        'Ultra-low latency impact: < 1ms added to request pipeline.',
        'High availability: Fail-open or soft-degradation policy when central cache is unavailable.',
        'Linear horizontal scalability across multi-region gateway fleets.',
        'Zero race condition vulnerabilities in concurrent request counts.',
      ],
    },
    defaultCapacity: {
      dau: 30000000,
      readWriteRatio: 1,
      payloadSizeBytes: 256,
      retentionYears: 1,
    },
    components: [
      {
        id: 'c-rl-edge',
        name: 'Edge Gateway Filter (Envoy / Reverse Proxy)',
        category: 'GATEWAY',
        description: 'Inspects incoming headers, extracts authentication tokens, and queries rate limiter before routing to upstream services.',
        latencyTier: '< 0.5ms',
        failureMode: 'Configurable fail-open mode allows traffic through if rate limiter cluster drops offline.',
        scalingStrategy: 'Horizontally scaled Envoy proxy sidecars.',
        techPattern: 'High-Performance Edge Reverse Proxy Filter',
      },
      {
        id: 'c-rl-local-cache',
        name: 'Local In-Memory Token Bucket (L1 Cache)',
        category: 'CACHE',
        description: 'Allocates local token batches to handle 90% of checks in-process on gateway memory without network hops.',
        latencyTier: '< 0.1ms in-process',
        failureMode: 'Requests fallback to distributed L2 cache upon local batch exhaustion.',
        scalingStrategy: 'Shared memory per gateway worker thread.',
        techPattern: 'In-Process Token Batching Buffer',
      },
      {
        id: 'c-rl-redis',
        name: 'Distributed Sliding Window Counter Cluster (L2 Redis)',
        category: 'STORAGE',
        description: 'Executes atomic Lua scripts evaluating sliding window weighted sums across current and prior minute intervals.',
        latencyTier: '< 1.5ms network',
        failureMode: 'Redis Cluster multi-master sharding with automated replica failover.',
        scalingStrategy: 'Consistent hashing partitioning on rate-limit key.',
        techPattern: 'Atomic Lua Sliding Window Counter on Redis Cluster',
      },
      {
        id: 'c-rl-config',
        name: 'Dynamic Policy & Quota Sync Engine',
        category: 'COMPUTE',
        description: 'Distributes updated rate-limit rules, tier changes, and blacklist IPs to all gateway instances within seconds.',
        latencyTier: '< 2s propagation',
        failureMode: 'Instances retain cached rules in local memory if config server is disconnected.',
        scalingStrategy: 'Pub/Sub topic broadcast to all gateway listener daemons.',
        techPattern: 'Dynamic Rule Distribution via Distributed Event Broadcast',
      },
      {
        id: 'c-rl-metrics',
        name: 'Abuse Detection & Security Telemetry Stream',
        category: 'ASYNC_WORKER',
        description: 'Analyzes 429 drop spikes and automatically triggers temporary firewall IP blocks for malicious actors.',
        latencyTier: '< 100ms async',
        failureMode: 'Non-blocking asynchronous logging decouples analytics from request pipeline.',
        scalingStrategy: 'Buffered asynchronous telemetry workers.',
        techPattern: 'Automated Threat Anomaly Detection Stream',
      },
    ],
    dataFlowSteps: [
      {
        stepNumber: 1,
        title: 'Incoming Request Interception',
        fromNode: 'Client Device',
        toNode: 'Edge Gateway Filter',
        protocol: 'HTTPS Request (Authorization: Bearer key)',
        description: 'Extracts API key and identifies applicable rate limit rules (e.g. 500 req/min).',
      },
      {
        stepNumber: 2,
        title: 'Local L1 Memory Check',
        fromNode: 'Edge Gateway Filter',
        toNode: 'Local Token Bucket (L1)',
        protocol: 'In-Memory Atomic Decrement',
        description: 'Checks in-process token allocation. If available, permits request in 0.1ms without network calls.',
      },
      {
        stepNumber: 3,
        title: 'Distributed L2 Sliding Window Evaluation',
        fromNode: 'Edge Gateway Filter',
        toNode: 'Distributed Redis Cluster',
        protocol: 'EVALSHA (Atomic Lua Sliding Window Script)',
        description: 'On L1 exhaustion, executes atomic script calculating weighted rolling window count in Redis.',
      },
      {
        stepNumber: 4,
        title: 'Decision Routing or 429 Response',
        fromNode: 'Edge Gateway Filter',
        toNode: 'Upstream Microservice or Client',
        protocol: 'HTTP 200 OK or HTTP 429 Too Many Requests',
        description: 'Forwards allowed traffic with rate-limit headers or immediately terminates with 429 and Retry-After header.',
      },
    ],
    tradeOffs: [
      {
        id: 'rate-algorithm',
        title: 'Token Bucket vs Sliding Window Counter',
        question: 'Which rate-limiting algorithm balances accuracy, memory efficiency, and burst handling?',
        optionA: {
          label: 'Token Bucket Algorithm',
          description: 'Tokens refill at a steady rate up to a bucket capacity; each request consumes one token.',
          pros: ['Allows legitimate sudden bursts up to maximum bucket capacity', 'Extremely low memory footprint (two numbers per key)'],
          cons: ['Can permit double-rate bursts at reset boundaries if not tuned carefully'],
        },
        optionB: {
          label: 'Sliding Window Counter Algorithm',
          description: 'Calculates weighted sum: prior window count * (1 - elapsed percentage) + current window count.',
          pros: ['Smooths traffic perfectly without boundary spike vulnerabilities', 'Very low memory usage compared to Sliding Window Logs'],
          cons: ['Assumes uniform distribution across the prior window (approximation error < 0.05%)'],
        },
        defaultOption: 'B',
        recommendation: 'Sliding Window Counter provides the ideal compromise between boundary accuracy and minimal memory consumption.',
      },
      {
        id: 'failure-policy',
        title: 'Fail-Open (Allow Traffic) vs Fail-Closed (Block Traffic)',
        question: 'How should the gateway react if the central Redis rate limiter becomes completely unreachable?',
        optionA: {
          label: 'Fail-Open Policy (High Availability)',
          description: 'Allow all incoming requests to pass through to upstream microservices when rate limiter fails.',
          pros: ['Prevents a rate limiter failure from causing an outage for genuine paying users', 'Maximizes availability metric'],
          cons: ['Upstream backend services risk total exhaustion if under an active DDoS attack during the outage'],
        },
        optionB: {
          label: 'Fail-Closed or Degraded Local Quota',
          description: 'Enforce a strict reduced local emergency quota per gateway instance if Redis cluster fails.',
          pros: ['Guarantees backend databases and internal services are never crushed by uncontrolled floods'],
          cons: ['Some legitimate users may receive 429 errors until the central rate limiter recovers'],
        },
        defaultOption: 'B',
        recommendation: 'Enforcing a degraded local emergency limit protects upstream critical infrastructure while preserving core functionality.',
      },
    ],
    bottlenecks: [
      {
        id: 'bn-rl-1',
        severity: 'CRITICAL',
        component: 'Distributed Redis Cluster (L2)',
        vulnerability: 'Network Hop Latency Amplification: Querying remote Redis cluster on every single HTTP request adds 2-5ms latency and creates central network bottleneck.',
        mitigation: 'Implement local batch token leasing (L1 Cache) where each gateway instance reserves 100 tokens at once, reducing remote calls by 95%.',
        pillar: 'Performance',
      },
      {
        id: 'bn-rl-2',
        severity: 'HIGH',
        component: 'Distributed Redis Cluster (L2)',
        vulnerability: 'Race Conditions in Naive Read-Update-Write: Non-atomic GET and INCR operations allow concurrent requests to exceed the limit.',
        mitigation: 'Execute rate-limiting logic strictly inside atomic Redis Lua scripts or use Redis multi/exec atomic transactions.',
        pillar: 'Data Integrity',
      },
      {
        id: 'bn-rl-3',
        severity: 'MEDIUM',
        component: 'Abuse Detection Stream',
        vulnerability: 'Memory bloat from millions of short-lived attacking IP addresses creating ephemeral keys.',
        mitigation: 'Set aggressive 5-minute TTL expirations on IP-based tracking keys and apply Bloom filters for early blacklist screening.',
        pillar: 'Cost',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Capacity Estimation Calculations (Back-of-the-Envelope)
// ---------------------------------------------------------------------------

export function calculateCapacityEstimates(
  dau: number,
  readWriteRatio: number,
  payloadSizeBytes: number,
  retentionYears: number,
): CapacityEstimates {
  const safeDau = Math.max(1, dau);
  const safeRatio = Math.max(1, readWriteRatio);
  const safePayload = Math.max(1, payloadSizeBytes);
  const safeYears = Math.max(1, retentionYears);

  // Average actions per DAU per day
  const writesPerDay = safeDau * 2;
  const readsPerDay = writesPerDay * safeRatio;
  const totalRequestsPerDay = writesPerDay + readsPerDay;

  // QPS calculations (86,400 seconds in a day)
  const qpsAverage = Math.round(totalRequestsPerDay / 86400);
  const qpsPeak = Math.round(qpsAverage * 2.5);
  const writeQps = Math.round(writesPerDay / 86400);
  const readQps = Math.round(readsPerDay / 86400);

  // Bandwidth in MB/s
  const bandwidthIngressMBs = Number(((writeQps * safePayload) / (1024 * 1024)).toFixed(2));
  const bandwidthEgressMBs = Number(((readQps * safePayload) / (1024 * 1024)).toFixed(2));

  // Storage over retention period with 1.5x replication factor (in Terabytes)
  const bytesPerYear = writesPerDay * 365 * safePayload;
  const totalStorageBytes = bytesPerYear * safeYears * 1.5;
  const storageTotalTB = Number((totalStorageBytes / 1e12).toFixed(2));

  // Cache Memory (80/20 Pareto rule: cache 20% of daily active read requests) in Gigabytes
  const dailyReadDataBytes = readsPerDay * safePayload;
  const cacheMemoryBytes = dailyReadDataBytes * 0.2;
  const cacheMemoryRequiredGB = Number((cacheMemoryBytes / (1024 * 1024 * 1024)).toFixed(2));

  return {
    dau: safeDau,
    readWriteRatio: safeRatio,
    payloadSizeBytes: safePayload,
    retentionYears: safeYears,
    qpsAverage,
    qpsPeak,
    readQps,
    writeQps,
    bandwidthIngressMBs,
    bandwidthEgressMBs,
    storageTotalTB,
    cacheMemoryRequiredGB,
  };
}

export function getBlueprintCatalog(): SystemBlueprint[] {
  return BLUEPRINT_CATALOG;
}

export function getBlueprintById(id: string): SystemBlueprint | undefined {
  return BLUEPRINT_CATALOG.find((b) => b.id === id) || BLUEPRINT_CATALOG[0];
}

// ---------------------------------------------------------------------------
// LocalStorage Persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'sp_system_design_studio_v1';

export function getSavedStudioState(): StudioState {
  if (typeof window === 'undefined') {
    return {
      activeBlueprintId: 'url-shortener',
      capacityOverrides: {},
      tradeOffSelections: {},
      customNotes: {},
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        activeBlueprintId: 'url-shortener',
        capacityOverrides: {},
        tradeOffSelections: {},
        customNotes: {},
        lastUpdated: new Date().toISOString(),
      };
    }
    return JSON.parse(raw) as StudioState;
  } catch {
    return {
      activeBlueprintId: 'url-shortener',
      capacityOverrides: {},
      tradeOffSelections: {},
      customNotes: {},
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function saveStudioState(state: StudioState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Graceful catch for storage limits or private browsing
  }
}

// ---------------------------------------------------------------------------
// Architectural Decision Record (ADR) Markdown Exporter
// ---------------------------------------------------------------------------

export function generateArchitecturalDecisionRecord(
  blueprint: SystemBlueprint,
  capacity: CapacityEstimates,
  tradeOffChoices: Record<string, 'A' | 'B'>,
  notes?: string,
): string {
  const dateStr = new Date().toISOString().split('T')[0];

  const lines = [
    `# Architectural Decision Record (ADR): ${blueprint.title}`,
    `**System ID:** \`${blueprint.id}\` | **Date:** ${dateStr} | **Status:** APPROVED | **Target Role:** ${blueprint.targetRole}`,
    '',
    '## 1. Context & Problem Statement',
    blueprint.problemStatement,
    '',
    '### Functional Requirements',
    ...blueprint.requirements.functional.map((f) => `- ${f}`),
    '',
    '### Non-Functional Requirements (SLAs & Invariants)',
    ...blueprint.requirements.nonFunctional.map((nf) => `- ${nf}`),
    '',
    '## 2. Back-of-the-Envelope Capacity Estimations',
    '| Metric Dimension | Estimated Value | Design Rationale & Multipliers |',
    '|---|---|---|',
    `| Daily Active Users (DAU) | ${capacity.dau.toLocaleString()} | Base user population activity |`,
    `| Read-to-Write Ratio | ${capacity.readWriteRatio}:1 | High-throughput dominant traffic profile |`,
    `| Average QPS | ${capacity.qpsAverage.toLocaleString()} req/s | Standard 24-hour amortized throughput |`,
    `| Peak QPS | ${capacity.qpsPeak.toLocaleString()} req/s | 2.5x traffic surge headroom |`,
    `| Network Ingress Bandwidth | ${capacity.bandwidthIngressMBs} MB/s | Incoming write payloads |`,
    `| Network Egress Bandwidth | ${capacity.bandwidthEgressMBs} MB/s | Outgoing read delivery payloads |`,
    `| Storage Capacity (${capacity.retentionYears} Years) | ${capacity.storageTotalTB} TB | 1.5x replication factor across clusters |`,
    `| Cache RAM Requirement | ${capacity.cacheMemoryRequiredGB} GB | 80/20 Pareto rule cache-aside footprint |`,
    '',
    '## 3. High-Level Component Topology',
    '| Component Name | Category | Latency SLA | Failure Recovery Strategy |',
    '|---|---|---|---|',
    ...blueprint.components.map(
      (c) => `| ${c.name} | \`${c.category}\` | ${c.latencyTier} | ${c.failureMode} |`,
    ),
    '',
    '## 4. Key Architectural Trade-Off Decisions',
  ];

  blueprint.tradeOffs.forEach((t) => {
    const chosen = tradeOffChoices[t.id] || t.defaultOption;
    const chosenObj = chosen === 'A' ? t.optionA : t.optionB;
    lines.push(
      `### Decision: ${t.title}`,
      `**Selected Architecture:** Option ${chosen} — *${chosenObj.label}*`,
      `> ${chosenObj.description}`,
      '',
      '**Evaluated Trade-Off Analysis:**',
      `*Advantages:* ${chosenObj.pros.join(', ')}`,
      `*Operational Costs / Risks:* ${chosenObj.cons.join(', ')}`,
      `*Engineering Guidance:* ${t.recommendation}`,
      '',
    );
  });

  lines.push(
    '## 5. Failure Mode & Single Point of Failure (SPOF) Analysis',
    '| Severity | Component | Vulnerability Surface | Hardened Mitigation Strategy |',
    '|---|---|---|---|',
    ...blueprint.bottlenecks.map(
      (b) => `| **${b.severity}** | ${b.component} | ${b.vulnerability} | ${b.mitigation} |`,
    ),
    '',
    '## 6. Candidate Engineering Notes & Socratic Defense Points',
    notes || 'No custom notes provided for this architecture revision.',
    '',
    '---',
    '*Generated by Students-Preparation Enterprise System Design Studio | 100% Vendor-Neutral Architecture*',
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

// ---------------------------------------------------------------------------
// Pure Client-Side Vector PDF 1.4 Architecture Blueprint Generator
// ---------------------------------------------------------------------------

export function exportArchitectureBlueprintPdf(
  blueprint: SystemBlueprint,
  capacity: CapacityEstimates,
  tradeOffChoices: Record<string, 'A' | 'B'>,
): void {
  const filename = `${blueprint.id}-system-design-blueprint.pdf`;

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
    '<< /Length 1550 >>',
    'stream',
    'BT',
    '/F2 16 Tf',
    '50 790 Td',
    '(SYSTEM DESIGN ARCHITECTURE BLUEPRINT SPECIFICATION) Tj',
    '/F1 10 Tf',
    '0 -20 Td',
    `(${blueprint.title.toUpperCase()}) Tj`,
    '0 -16 Td',
    `(Target Role: ${blueprint.targetRole} | Difficulty: ${blueprint.difficulty}) Tj`,
    '0 -24 Td',
    '/F2 12 Tf',
    '(BACK-OF-THE-ENVELOPE CAPACITY ESTIMATES:) Tj',
    '/F1 9 Tf',
    '0 -16 Td',
    `( - Daily Active Users (DAU): ${capacity.dau.toLocaleString()} | Read-to-Write Ratio: ${capacity.readWriteRatio}:1) Tj`,
    '0 -14 Td',
    `( - Average Throughput: ${capacity.qpsAverage.toLocaleString()} QPS | Peak Throughput: ${capacity.qpsPeak.toLocaleString()} QPS) Tj`,
    '0 -14 Td',
    `( - Network Ingress / Egress: ${capacity.bandwidthIngressMBs} MB/s Ingress | ${capacity.bandwidthEgressMBs} MB/s Egress) Tj`,
    '0 -14 Td',
    `( - Long-Term Storage Requirement (${capacity.retentionYears} Years): ${capacity.storageTotalTB} TB with 1.5x Replication) Tj`,
    '0 -14 Td',
    `( - In-Memory Cache Sizing (80/20 Rule): ${capacity.cacheMemoryRequiredGB} GB RAM) Tj`,
    '0 -24 Td',
    '/F2 12 Tf',
    '(CORE ARCHITECTURAL COMPONENTS:) Tj',
    '/F1 9 Tf',
  ];

  blueprint.components.slice(0, 5).forEach((c) => {
    pdfLines.push(
      '0 -15 Td',
      `([${c.category}] ${c.name} - SLA: ${c.latencyTier} | Strategy: ${c.scalingStrategy.substring(0, 45)}) Tj`,
    );
  });

  pdfLines.push(
    '0 -24 Td',
    '/F2 12 Tf',
    '(KEY TRADE-OFF DECISIONS & ARCHITECTURAL INVARIANTS:) Tj',
    '/F1 9 Tf',
  );

  blueprint.tradeOffs.forEach((t) => {
    const choice = tradeOffChoices[t.id] || t.defaultOption;
    const choiceObj = choice === 'A' ? t.optionA : t.optionB;
    pdfLines.push(
      '0 -15 Td',
      `(${t.title}: Option ${choice} - ${choiceObj.label.substring(0, 60)}) Tj`,
    );
  });

  pdfLines.push(
    '0 -32 Td',
    '/F2 10 Tf',
    '(ISSUED BY STUDENTS-PREPARATION ENTERPRISE SYSTEM DESIGN STUDIO) Tj',
    '/F1 8 Tf',
    '0 -14 Td',
    '(100% Vendor-Neutral Architecture Specification | Client-Side Cryptographic Document) Tj',
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
    '0000001800 00000 n ',
    '0000001870 00000 n ',
    'trailer',
    '<< /Size 7 /Root 1 0 R >>',
    'startxref',
    '1940',
    '%%EOF',
  );

  downloadFile(filename, pdfLines.join('\n'), 'application/pdf');
}
