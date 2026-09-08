/**
 * Technical Interview Q&A Repository Hub
 * Exceeding conventional interview platforms with textbook-grade rigor,
 * follow-up counter questions, edge-case pitfalls, and direct curriculum links.
 */

export interface InterviewQAItem {
  id: string;
  category: string;
  categorySlug: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  frequency: 'VERY HIGH' | 'HIGH' | 'MEDIUM';
  shortSummary: string;
  deepAnswer: string;
  interviewerCounterQuestions: string[];
  keyTakeaways: string[];
  pitfalls: string[];
  relatedCurriculumSlug?: string;
}

export const INTERVIEW_CATEGORIES = [
  { slug: 'all', label: 'All Disciplines' },
  { slug: 'dsa', label: 'Data Structures & Algorithms' },
  { slug: 'system-design', label: 'System Design & Scalability' },
  { slug: 'databases', label: 'Databases & Storage Internals' },
  { slug: 'os-linux', label: 'Operating Systems & Linux' },
  { slug: 'networking', label: 'Computer Networks & Security' },
  { slug: 'java-jvm', label: 'Core Java & JVM Internals' },
  { slug: 'python-concurrency', label: 'Python & Asynchronous Runtimes' },
  { slug: 'cloud-devops', label: 'Cloud Architecture & DevOps' },
] as const;

export const INTERVIEW_QUESTIONS: InterviewQAItem[] = [
  // ==========================================
  // DATA STRUCTURES & ALGORITHMS (7 questions)
  // ==========================================
  {
    id: 'dsa-01',
    category: 'Data Structures & Algorithms',
    categorySlug: 'dsa',
    title: 'How do you implement an O(1) LRU (Least Recently Used) Cache?',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'Combine a Hash Map for O(1) key lookup with a Doubly Linked List for O(1) node relocation and eviction.',
    deepAnswer: `An LRU Cache requires two core operations in O(1) time complexity: get(key) and put(key, value).

1. Data Structure Synergy:
   - Doubly Linked List (DLL): Maintains access order. The most recently accessed node is placed at the Head (MRU), while the least recently accessed node resides at the Tail (LRU). A DLL allows deleting any arbitrary node in O(1) given its pointer, because both prev and next pointers are accessible.
   - Hash Map (key -> Node pointer): Maps the lookup key directly to the DLL node. This provides O(1) random access by key, overcoming the O(N) traversal bottleneck of linked lists.

2. Operations:
   - get(key): Check if key exists in the Hash Map. If missing, return -1 or null. If found, unlink the node from its current position in the DLL and prepend it to the Head (MRU). Return the node's value.
   - put(key, value): If the key already exists, update the value and move the node to the Head. If the key is new:
     a. Check capacity: if length == capacity, remove the tail node (prev of dummy tail) from both the DLL and the Hash Map.
     b. Allocate a new DLL node and insert it right after dummy head.
     c. Record key -> node in the Hash Map.

3. Optimization Trick:
   Always use pseudo-sentinel (dummy) Head and Tail nodes. This eliminates all null-pointer checks when inserting into an empty list or deleting the last element.`,
    interviewerCounterQuestions: [
      'How would you make this LRU Cache thread-safe in high-throughput multi-threaded environments without locking the entire cache?',
      'What happens if cache keys experience access frequency skew (e.g., LFU vs LRU vs 2Q)? When does LRU fail miserably?'
    ],
    keyTakeaways: [
      'Hash Map provides O(1) address resolution; Doubly Linked List provides O(1) structural splicing.',
      'Dummy Head and Dummy Tail sentinels eradicate boundary condition bugs.',
      'Space complexity is O(Capacity) with 2x pointer overhead.'
    ],
    pitfalls: [
      'Using a singly linked list: deleting a node requires finding its predecessor in O(N).',
      'Forgetting to delete the evicted node from the Hash Map when pruning the DLL tail.'
    ],
    relatedCurriculumSlug: 'binary-search-trees-and-avl-balancing'
  },
  {
    id: 'dsa-02',
    category: 'Data Structures & Algorithms',
    categorySlug: 'dsa',
    title: 'How does Floyd\'s Cycle Finding Algorithm (Tortoise and Hare) detect cycles and locate the start of a cycle in O(1) memory?',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'Use slow pointer (1 step) and fast pointer (2 steps). Once they collide inside the loop, reset slow to head; their next collision point is the cycle entry.',
    deepAnswer: `Floyd\'s Cycle Detection operates in two distinct phases with O(N) time and strictly O(1) auxiliary space:

Phase 1: Detecting Cycle Presence
- Initialize slow = head and fast = head.
- Traverse while fast != null and fast.next != null:
  slow = slow.next (speed 1)
  fast = fast.next.next (speed 2)
- If fast == slow, a directed cycle exists. If fast reaches null, the list is acyclic.

Phase 2: Locating the Cycle Origin (Mathematical Proof)
Let:
- L = distance from head to cycle entrance node.
- C = total length (number of nodes) in the cycle.
- d = distance from cycle entrance to the collision point.

When slow and fast collide:
- Distance traveled by slow = L + d
- Distance traveled by fast = L + d + k*C (where k >= 1 is the number of complete cycle laps made by fast)
- Since fast travels twice as fast as slow:
  2 * (L + d) = L + d + k*C
  L + d = k*C
  L = k*C - d = (k - 1)*C + (C - d)

Notice that (C - d) is the exact remaining distance from the collision point to the cycle entrance!
Therefore, if we reset slow = head and keep fast at the collision point, moving both pointers at speed 1 step per tick, they will traverse distances L and (C - d) simultaneously and meet precisely at the cycle entrance!`,
    interviewerCounterQuestions: [
      'What happens if fast moves 3 steps at a time instead of 2? Does the algorithm still guarantee collision?',
      'How can this same mathematical principle be applied to find duplicate numbers in an array of N+1 integers between 1 and N without modifying the array?'
    ],
    keyTakeaways: [
      'Relative speed is 1 step/tick, guaranteeing fast catches slow inside the loop without skipping over it.',
      'Phase 2 mathematical derivation: L = (k-1)C + (C-d).'
    ],
    pitfalls: [
      'Checking fast.next.next before ensuring fast.next is not null, causing NullPointerException.',
      'Attempting to use a HashSet which incurs O(N) memory overhead.'
    ],
    relatedCurriculumSlug: 'amortized-analysis-and-disjoint-set-union'
  },
  {
    id: 'dsa-03',
    category: 'Data Structures & Algorithms',
    categorySlug: 'dsa',
    title: 'How do you find the Median of an Unbounded Stream of Numbers in O(1) time?',
    difficulty: 'HARD',
    frequency: 'HIGH',
    shortSummary: 'Maintain two heaps: a Max-Heap for the lower half of numbers and a Min-Heap for the upper half, keeping sizes balanced within 1 element.',
    deepAnswer: `To find the running median of an infinite stream, sorting the array on every insertion takes O(N log N) or O(N), which is prohibitive. Instead, dual heaps achieve O(log N) insertion and O(1) median retrieval.

1. Architecture:
   - maxHeap (Left Half): Stores the smaller 50% of numbers. Root is the largest among the smaller half.
   - minHeap (Right Half): Stores the larger 50% of numbers. Root is the smallest among the larger half.

2. Invariants to Maintain:
   - Order Invariant: Every element in maxHeap <= every element in minHeap (maxHeap.peek() <= minHeap.peek()).
   - Balance Invariant: Size difference between heaps must never exceed 1:
     0 <= maxHeap.size() - minHeap.size() <= 1.

3. Add Number Algorithm:
   - If maxHeap is empty or num <= maxHeap.peek(), push to maxHeap; otherwise push to minHeap.
   - Rebalance step:
     - If maxHeap.size() > minHeap.size() + 1: minHeap.push(maxHeap.pop())
     - If minHeap.size() > maxHeap.size(): maxHeap.push(minHeap.pop())

4. Get Median:
   - If total elements is odd: maxHeap.peek().
   - If total elements is even: (maxHeap.peek() + minHeap.peek()) / 2.0.`,
    interviewerCounterQuestions: [
      'How would you adapt this to compute the median over a rolling fixed window of size K (Sliding Window Median)?',
      'What are the cache locality and memory fragmentation downsides of binary heap arrays versus balanced BSTs?'
    ],
    keyTakeaways: [
      'Dual heaps split the dataset dynamically across the median boundary.',
      'Insertion: O(log N); Finding Median: O(1); Total Space: O(N).'
    ],
    pitfalls: [
      'Integer overflow when computing (maxHeap.peek() + minHeap.peek()) / 2 in languages like Java/C++.',
      'Failing to rebalance when elements are inserted monotonically in increasing or decreasing order.'
    ],
    relatedCurriculumSlug: 'segment-trees-and-fenwick-binary-indexed-trees'
  },
  {
    id: 'dsa-04',
    category: 'Data Structures & Algorithms',
    categorySlug: 'dsa',
    title: 'What is the Knuth-Morris-Pratt (KMP) failure function (pi table) and why is its time complexity O(N + M)?',
    difficulty: 'HARD',
    frequency: 'HIGH',
    shortSummary: 'The pi array stores the length of the longest proper prefix that is also a suffix for each pattern prefix, enabling O(1) backtracking without re-scanning matched text characters.',
    deepAnswer: `The naive string matching algorithm checks pattern P (length M) against text T (length N) in O(N * M) time because mismatch resets the text pointer backwards.

1. KMP Key Insight:
   When a mismatch occurs at P[j] after matching j characters, the prefix P[0...j-1] matched T[i-j...i-1]. We can reuse this known matched substring without moving the text pointer i backward!

2. Failure Function (pi array / LPS):
   pi[j] is the length of the longest proper prefix of P[0...j] that is also a suffix of P[0...j].
   - If a mismatch occurs at P[j], the next character in pattern to compare against T[i] is at index j = pi[j-1].
   - If j == 0, we simply advance the text pointer i++.

3. Complexity Proof via Amortized Analysis:
   - In text search, the text pointer i advances exactly once in each iteration of the outer loop (N iterations).
   - The pattern pointer j only increases when characters match (at most N increments total).
   - In mismatches, j decreases via j = pi[j-1]. Since j cannot drop below 0 and was increased at most N times, j can decrease at most N times across the entire algorithm run.
   - Hence, total operations = N (advances) + N (backtracks) = O(N).
   - Preprocessing the pattern takes O(M) by identical logic.
   - Total Time: O(N + M), Auxiliary Space: O(M).`,
    interviewerCounterQuestions: [
      'How does KMP compare to the Boyer-Moore and Rabin-Karp algorithms in practical production search utilities like ripgrep or GNU grep?',
      'Can KMP be used to find the minimum repeating period of a string in O(N)?'
    ],
    keyTakeaways: [
      'Text pointer i NEVER moves backward in KMP.',
      'LPS (Longest Prefix Suffix) table construction is an auto-KMP pattern matching against itself in O(M).'
    ],
    pitfalls: [
      'Confusing substring with subsequence: LPS strictly requires contiguous prefixes and suffixes.',
      'Off-by-one errors when setting j = pi[j - 1] on full pattern match.'
    ],
    relatedCurriculumSlug: 'string-algorithms-kmp-and-rabin-karp'
  },
  {
    id: 'dsa-05',
    category: 'Data Structures & Algorithms',
    categorySlug: 'dsa',
    title: 'How does Dijkstra\'s Algorithm work with a Min-Heap, and why does it fail on negative edge weights?',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'Greedily extracts the minimum unvisited distance node using a priority queue. It fails with negative weights because once a node is finalized, Dijkstra assumes its distance can never decrease.',
    deepAnswer: `Dijkstra\'s algorithm solves the Single-Source Shortest Path (SSSP) problem on weighted directed/undirected graphs with non-negative edge weights.

1. Algorithm Mechanics:
   - Initialize dist[start] = 0, and dist[v] = infinity for all other nodes.
   - Maintain a min-priority queue of pairs (current_distance, u).
   - While queue is not empty:
     - Pop (d, u). If d > dist[u], continue (stale entry).
     - Mark u as finalized (visited).
     - For each outgoing edge (u, v, weight):
       - If dist[u] + weight < dist[v]:
         - dist[v] = dist[u] + weight
         - Push (dist[v], v) to priority queue.

2. Complexity:
   - With a binary min-heap: Each vertex is extracted once (V * log V). Each edge can relax and push to the heap once (E * log V). Total: O((V + E) log V).
   - With Fibonacci heap: O(E + V log V).

3. Why Negative Weights Break Dijkstra:
   Dijkstra relies on a fundamental greedy property: along any path with non-negative weights, path lengths are monotonically non-decreasing. Thus, when node u is extracted from the min-heap, no future unvisited path could possibly reach u with a shorter distance.
   If negative weights exist, a longer positive path could later encounter a heavily negative edge and become shorter than the already-finalized distance to u. Dijkstra will NOT revisit finalized nodes, yielding incorrect distances. (Bellman-Ford or SPFA is required instead).`,
    interviewerCounterQuestions: [
      'Can adding a large constant C to all edge weights fix Dijkstra for negative edges? Why or why not?',
      'What is the difference between Johnson\'s algorithm reweighting and naive constant addition?'
    ],
    keyTakeaways: [
      'Dijkstra is a greedy algorithm requiring the monotonic non-decreasing path property.',
      'Lazy deletion in binary min-heaps requires the "if d > dist[u] continue" guard.'
    ],
    pitfalls: [
      'Believing that adding a constant C to all weights works: paths with more edges are penalized by k*C more than paths with fewer edges, changing the shortest path topology!',
      'Using an adjacency matrix with binary heap on sparse graphs, inflating runtime to O(V^2).'
    ],
    relatedCurriculumSlug: 'advanced-graph-algorithms-dsu-and-minimum-spanning-trees'
  },
  {
    id: 'dsa-06',
    category: 'Data Structures & Algorithms',
    categorySlug: 'dsa',
    title: 'Explain Disjoint Set Union (DSU) with Path Compression and Union by Rank/Size: Why is the amortized complexity O(alpha(N))?',
    difficulty: 'HARD',
    frequency: 'HIGH',
    shortSummary: 'Path compression flattens the tree during find(), while Union by Rank attaches the shorter tree under the taller. Together, they reduce operational amortized time to nearly O(1), bounded by the inverse Ackermann function alpha(N).',
    deepAnswer: `Disjoint Set Union (DSU / Union-Find) manages a partition of elements into disjoint dynamic sets supporting two primary operations: find(x) and union(x, y).

1. Naive DSU Bottleneck:
   Representing sets as trees where parent[x] points to x\'s parent. In the worst case (linear chain of unions), tree height degrades to O(N), yielding O(N) per find().

2. Optimization 1: Path Compression
   During find(x), as we recursively traverse up to find the root, we update every visited node\'s parent directly to the root:
   find(x) {
     if (parent[x] != x) parent[x] = find(parent[x]);
     return parent[x];
   }
   This dramatically flattens the tree for all subsequent queries.

3. Optimization 2: Union by Rank / Size
   Maintain an integer rank[x] (upper bound on tree height) or size[x] (count of nodes).
   When joining root1 and root2:
   - Attach the root with smaller rank under the root with larger rank.
   - If ranks are equal, increment the chosen root\'s rank by 1.
   This guarantees tree depth never exceeds O(log N) even without path compression.

4. Inverse Ackermann Function alpha(N):
   Combining both optimizations achieves an amortized complexity of O(alpha(N)) per operation, where alpha is the inverse Ackermann function.
   Because Ackermann\'s function A(4, 2) exceeds 2^(65536) (more atoms than exist in the observable universe), alpha(N) <= 4 for all practical values of N in computer science. It is practically constant O(1).`,
    interviewerCounterQuestions: [
      'Can DSU support rollbacks (undo operations)? Why does path compression break standard rollback DSU?',
      'How does Kruskal\'s Minimum Spanning Tree algorithm use DSU to detect cycles in O(E log E)?'
    ],
    keyTakeaways: [
      'Path compression optimizes find(); Union by rank optimizes union().',
      'alpha(N) is <= 4 for any universe-scale input size, making DSU practically O(1) amortized.'
    ],
    pitfalls: [
      'Applying path compression in a persistent or rollback DSU: rollback requires restoring parent pointers via a stack, which is destroyed by full path compression (use only Union by Rank/Size for rollback DSU).',
      'Comparing elements x and y directly instead of their roots find(x) and find(y) during union.'
    ],
    relatedCurriculumSlug: 'advanced-graph-algorithms-dsu-and-minimum-spanning-trees'
  },
  {
    id: 'dsa-07',
    category: 'Data Structures & Algorithms',
    categorySlug: 'dsa',
    title: 'What is the difference between Segment Tree with Lazy Propagation and Fenwick Tree (Binary Indexed Tree)? When do you choose which?',
    difficulty: 'HARD',
    frequency: 'MEDIUM',
    shortSummary: 'Fenwick Trees are compact O(N) array-based structures ideal for point updates and prefix ranges with invertible operations. Segment Trees support arbitrary associative non-invertible operations and range updates in O(log N) via Lazy Propagation.',
    deepAnswer: `Both Segment Trees and Fenwick Trees (BIT) solve range query and update problems in O(log N) time, but with different trade-offs:

1. Fenwick Tree (Binary Indexed Tree):
   - Memory: Strictly O(N) in-place array.
   - Implementation: Under 15 lines of code using two\'s complement lowbit indexing: i & (-i).
   - Mechanism: Each index i stores the aggregate of a range of length (i & -i) ending at i.
   - Operations: Superb for Point Update + Range Query (e.g., prefix sums).
   - Limitation: Operations must be associative and invertible (like addition, XOR) to compute range [L, R] as query(R) - query(L - 1). Cannot efficiently support Range Minimum Query (RMQ) with point updates, nor arbitrary range updates without complex dual-tree schemes.

2. Segment Tree:
   - Memory: 4N array overhead.
   - Implementation: Full recursive or iterative binary tree.
   - Mechanism: Root covers [0, N-1]; each internal node splits into [L, mid] and [mid+1, R].
   - Versatility: Supports ANY associative operation (sum, min, max, GCD, matrix multiplication).
   - Lazy Propagation: Supports Range Update + Range Query in O(log N) by deferring updates to descendants until those children are queried.

3. Decision Matrix:
   - Use Fenwick Tree if you only need Point Update + Prefix/Range Sum (or invertibles) with minimal code and minimal cache footprint.
   - Use Segment Tree if you need Range Updates (e.g., add X to all elements in [L, R]) or non-invertible operations (e.g., Range Minimum/Maximum Query).`,
    interviewerCounterQuestions: [
      'How does an Iterative (Non-Recursive) Segment Tree work, and why does it avoid recursive call stack overhead?',
      'Can a 2D Fenwick Tree handle 2D submatrix sum queries? What is the space complexity?'
    ],
    keyTakeaways: [
      'Fenwick tree uses bits (i & -i); Segment tree uses binary recursive intervals.',
      'Lazy propagation stores deferred deltas on tree nodes to achieve O(log N) range updates.'
    ],
    pitfalls: [
      'Allocating 2N space for a recursive Segment Tree instead of 4N, causing out-of-bounds segfaults on un-padded power-of-two leaves.',
      'Forgetting to push down the lazy tag before querying child nodes in a Segment Tree.'
    ],
    relatedCurriculumSlug: 'segment-trees-and-fenwick-binary-indexed-trees'
  },

  // ==========================================
  // SYSTEM DESIGN & SCALABILITY (8 questions)
  // ==========================================
  {
    id: 'sys-01',
    category: 'System Design & Scalability',
    categorySlug: 'system-design',
    title: 'How do you design a High-Throughput URL Shortener (TinyURL) capable of 100M writes/day and 1B reads/day?',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'Use a 7-character Base62 encoded ID generated from a distributed 64-bit sequence generator (like Snowflake) backed by an LSM key-value store and distributed Redis read cache.',
    deepAnswer: `A production URL shortener must handle high read-to-write ratios (~10:1), sub-10ms redirection latency, and zero key collisions.

1. Scale Estimation:
   - Writes: 100M / 86400s ~ 1,200 writes/sec (Peak: 3,000/sec).
   - Reads: 1B / 86400s ~ 12,000 reads/sec (Peak: 30,000/sec).
   - Storage (5 years): 100M * 365 * 5 = 182.5 Billion URLs. At 500 bytes/record ~ 91 TB storage.

2. Short URL Key Generation:
   - Using Base62 ([a-z, A-Z, 0-9] = 62 characters):
     A 7-character string yields 62^7 = ~3.52 Trillion unique URLs, comfortably covering 182 Billion for decades.
   - Why not MD5/SHA-256 truncation? Hash truncation causes collisions requiring retry loops under write contention.
   - Recommended: Distributed 64-bit ID Generator (Twitter Snowflake style or pre-allocated range allocation service via ZooKeeper/etcd), converted directly to Base62. Guarantees 0 collisions and O(1) encoding without DB roundtrips.

3. High-Performance Architecture:
   - Client -> Anycast DNS / CDN -> Layer 7 Load Balancer -> API Gateway -> URL Redirection Service (Stateless Go/Rust pods).
   - Database: Distributed NoSQL Key-Value store (Cassandra, ScyllaDB, or DynamoDB) with partition key = short_key.
   - Caching Tier: Multi-node Redis Cluster with LRU eviction storing top 20% hottest URLs (80/20 rule).
   - HTTP Status: Return 302 (Found) if analytics tracking is required; return 301 (Moved Permanently) if browser-side caching is desired to offload backend.`,
    interviewerCounterQuestions: [
      'What are the security implications of sequential or auto-incrementing ID conversion to Base62? How do you prevent URL enumeration attacks?',
      'If you use HTTP 301 redirects, how can your analytics service accurately count total clicks per link?'
    ],
    keyTakeaways: [
      '62^7 yields 3.52 Trillion unique strings.',
      'Snowflake/range generator eliminates MD5 hash collision retry loops.',
      '301 enables browser cache; 302 forces requests through server for analytics capture.'
    ],
    pitfalls: [
      'Using an RDBMS auto-increment ID on a single primary node, creating a single point of failure and write bottleneck.',
      'Forgetting URL encoding validation, allowing malicious open-redirect attacks.'
    ],
    relatedCurriculumSlug: 'distributed-caching-strategies-and-redis-cluster'
  },
  {
    id: 'sys-02',
    category: 'System Design & Scalability',
    categorySlug: 'system-design',
    title: 'Compare the Rate Limiting Algorithms: Token Bucket, Leaky Bucket, and Sliding Window Counter. Which is best for distributed APIs?',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'Token Bucket allows bursts and is memory efficient. Leaky Bucket enforces a smooth egress rate. Sliding Window Counter provides high accuracy with minimal Redis memory overhead.',
    deepAnswer: `Rate limiting protects services from DDoS, API abuse, and cascading resource exhaustion.

1. Token Bucket:
   - A bucket holds up to B tokens. Tokens are replenished at a steady rate of R tokens/second.
   - Each request consumes 1 token. If tokens >= 1, allow; else drop/reject (HTTP 429).
   - Pro: Permits legitimate short bursts of traffic up to bucket capacity B.
   - Con: In distributed settings, concurrency race conditions require atomic Redis Lua scripts.

2. Leaky Bucket:
   - Requests enter a FIFO queue of capacity B. Requests are processed and released at a strictly constant rate R.
   - Pro: Smooths out bursts into a uniform output flow, ideal for protecting downstream services with fragile processing limits.
   - Con: Bursts of requests are delayed in the queue, increasing user-perceived latency.

3. Sliding Window Log:
   - Stores timestamps of every request in a Redis Sorted Set (ZSET). Evicts entries older than (now - window). Count remaining elements.
   - Pro: 100% mathematically exact rate limiting.
   - Con: High memory footprint (O(Requests)), vulnerable to memory exhaustion under attack.

4. Sliding Window Counter (Production Standard):
   - Divides time into fixed sub-windows. Weight = (1 - (current_time - current_window_start) / window_size).
   - Estimated Requests = previous_window_count * Weight + current_window_count.
   - Pro: Extreme memory efficiency (just 2 integer counters per user/IP), smooth sliding approximation with <0.05% error.`,
    interviewerCounterQuestions: [
      'How do you prevent Redis hot-key bottlenecks when millions of clients share a common global rate limit?',
      'How does local in-memory token buffering with batch Redis synchronization help reduce network roundtrips?'
    ],
    keyTakeaways: [
      'Token Bucket allows traffic bursts; Leaky Bucket forces constant egress.',
      'Sliding Window Counter combines low memory with smooth boundary transitions.',
      'Always execute multi-step check-and-decrement logic via atomic Redis Lua scripts.'
    ],
    pitfalls: [
      'Fixed Window Counter algorithm suffers from the Boundary Burst trap (2x rate limit allowed across the window boundary).',
      'Using simple GET + SET commands without Redis MULTI/EXEC or Lua scripts, leading to race condition bypasses.'
    ],
    relatedCurriculumSlug: 'api-gateway-architecture-and-resilience'
  },
  {
    id: 'sys-03',
    category: 'System Design & Scalability',
    categorySlug: 'system-design',
    title: 'How does Consistent Hashing work, and how do Virtual Nodes (VNodes) solve the data skew problem?',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'Maps both server nodes and cache keys onto a 360-degree hash ring (0 to 2^32-1). Keys route to the first clockwise server. Virtual nodes distribute multiple hash points per physical server to achieve balanced load distribution.',
    deepAnswer: `In traditional hash sharding (hash(key) % N), adding or removing a server changes the modulus N, invalidating almost 100% of cached keys and causing a massive cache stampede against downstream databases.

1. The Consistent Hash Ring:
   - Both server IDs and data keys are hashed using the same uniform cryptographic hash function (e.g., MurmurHash3 or SHA-1) onto a circular ring of range [0, 2^32 - 1].
   - When a key arrives, compute hash(key). Traverse clockwise along the ring until encountering the first server hash. That server owns the key.

2. Node Addition and Removal:
   - When Server X is added, it only claims keys between its position and its counter-clockwise predecessor. All other servers remain untouched!
   - On average, adding or removing a node reallocates only K / N keys (where K is total keys, N is total nodes).

3. The Non-Uniform Distribution Problem (Data Skew):
   - With few physical nodes (e.g., 3 nodes), random placement produces unequal ring segments. One node might receive 70% of traffic, while another receives 10%.
   - If a node fails, its entire clockwise partition falls onto its immediate successor, cascading node failures.

4. The Solution: Virtual Nodes (VNodes):
   - Instead of 1 ring entry per physical machine, each physical server is mapped to V virtual positions (e.g., 100 to 256 VNodes) labeled "ServerA#1", "ServerA#2", etc.
   - Benefits:
     a. Uniform distribution: standard deviation of load across nodes drops below 5%.
     b. Heterogeneous hardware: powerful servers can be assigned 500 VNodes while weaker ones receive 100 VNodes.
     c. Resilient failure redistribution: if Server A crashes, its load is evenly dispersed among all remaining servers.`,
    interviewerCounterQuestions: [
      'What data structure is used on each client or routing proxy to look up the responsible node in O(log M) time?',
      'How does DynamoDB use consistent hashing in conjunction with preference lists and Sloppy Quorum (N, R, W)?'
    ],
    keyTakeaways: [
      'Consistent hashing reallocates only K/N keys during scale up/down.',
      'Routing uses a binary search / Red-Black tree (like Java TreeMap) in O(log(N * V)).',
      'Virtual nodes eliminate hotspots and allow weighted capacity matching.'
    ],
    pitfalls: [
      'Assuming consistent hashing alone prevents hot keys (e.g., a single celebrity user key still hits only one server).',
      'Using a poor hash function with clustering tendencies instead of MurmurHash3 or xxHash.'
    ],
    relatedCurriculumSlug: 'database-scaling-replication-and-sharding'
  },
  {
    id: 'sys-04',
    category: 'System Design & Scalability',
    categorySlug: 'system-design',
    title: 'Explain Cache Invalidation Strategies: Cache-Aside vs Write-Through vs Write-Behind (Write-Back). What is Cache Stampede and how do you prevent it?',
    difficulty: 'HARD',
    frequency: 'HIGH',
    shortSummary: 'Cache-Aside delegates loading to the application; Write-Through updates cache and DB synchronously; Write-Behind buffers writes asynchronously. Cache stampede is solved via mutex locking or probabilistic early expiration (XFetch).',
    deepAnswer: `Caching mitigates database read pressure, but maintaining consistency between cache and storage is notoriously difficult.

1. Caching Strategies:
   - Cache-Aside (Lazy Loading): Application queries cache. On cache hit, return data. On cache miss, fetch from DB, populate cache, and return. On write: update DB, then invalidate (delete) the cache key. (Best for read-heavy workloads with irregular access).
   - Write-Through: Application writes to cache. Cache synchronously writes to DB in the same transaction before acknowledging success. (Ensures high consistency; higher write latency).
   - Write-Behind / Write-Back: Application writes to cache immediately. Cache queues the write and flushes batches to DB asynchronously. (Ultra-fast writes; risk of data loss on cache node crash before DB flush).
   - Refresh-Ahead: Cache automatically refreshes items before expiration based on predicted access patterns.

2. Why Delete Cache on DB Update instead of Updating Cache?
   If two concurrent writes (T1 and T2) occur, updating the cache directly can cause race conditions where T1 overwrites T2 in cache while T2 won in the DB, leaving permanently stale data in cache. Invalidating the cache key forces the next read to fetch the definitive DB state.

3. Cache Stampede (Thundering Herd):
   When a popular hot key expires, thousands of concurrent requests miss the cache simultaneously and bombard the database at the same instant, causing database overload.

4. Stampede Defenses:
   - Mutex / Distributed Lock (Singleflight): Only the first cache miss acquires a lock to query the DB; others wait or retry.
   - Probabilistic Early Expiration (XFetch algorithm): Refresh the key probabilistically prior to expiration:
     delta * beta * ln(rand()) > (expiry - now). As time approaches expiry, probability of background refresh smoothly approaches 100%.`,
    interviewerCounterQuestions: [
      'How does Redis Sentinel differ from Redis Cluster in high availability and data partitioning?',
      'What is Cache Penetration and how does a Bloom Filter prevent non-existent keys from hitting the DB?'
    ],
    keyTakeaways: [
      'In Cache-Aside, always delete (evict) the cache key on write; never update it directly.',
      'XFetch probabilistic early expiration eliminates thundering herds without lock contention.',
      'Bloom filters guard against cache penetration for missing records.'
    ],
    pitfalls: [
      'Setting identical TTLs for all keys, causing synchronized mass expiration.',
      'Using Write-Behind without durable write-ahead logging, risking data loss during memory crashes.'
    ],
    relatedCurriculumSlug: 'distributed-caching-strategies-and-redis-cluster'
  },
  {
    id: 'sys-05',
    category: 'System Design & Scalability',
    categorySlug: 'system-design',
    title: 'How does Kafka achieve Millions of Messages/sec throughput? Explain Zero-Copy, Partitioning, and Sequential Disk I/O.',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'Kafka treats disks as sequential append-only commit logs, bypasses OS user space via OS pagecache sendfile() zero-copy, and partitions topics for linear horizontal consumer scaling.',
    deepAnswer: `Kafka is an enterprise distributed event streaming platform built on three architectural pillars:

1. Sequential Disk I/O & OS Page Cache:
   - Random disk I/O on HDDs/SSDs is slow (~100-500 IOPS), but sequential disk access matches or exceeds random RAM access speed (600+ MB/s).
   - Kafka writes messages to append-only commit logs.
   - Kafka does not maintain an internal in-process object cache (avoiding JVM GC overhead). Instead, it delegates caching entirely to the Linux OS Page Cache. When messages are written, they reside directly in the OS buffer cache.

2. Zero-Copy Network Transfer (sendfile):
   - Traditional data transfer involves 4 context switches and 4 data copies:
     Disk -> OS Page Cache -> Application Buffer -> Socket Buffer -> NIC Buffer.
   - Kafka uses the Linux sendfile() system call (zero-copy):
     Disk -> OS Page Cache -> Directly to NIC Buffer via DMA (Direct Memory Access).
     CPU copies = 0, context switches = 2. This allows network saturation at line speed.

3. Partitioning & Consumer Groups:
   - A Kafka Topic is split into P partitions distributed across broker nodes.
   - Partitions allow both parallel ingest and parallel consumption: a Consumer Group with N consumers can read from N partitions concurrently.
   - Message order is strictly guaranteed within a single partition, but not across partitions.

4. End-to-End Batching and Compression:
   - Producers accumulate records into memory batches before sending them over TCP.
   - Brokers write batches directly to disk without decompressing. Consumers pull entire compressed batches in a single network roundtrip.`,
    interviewerCounterQuestions: [
      'How does Kafka achieve Exactly-Once Semantics (EOS) across producer retries and consumer read-process-write loops?',
      'What triggers a Consumer Rebalance, and how does the Cooperative Sticky Assignor prevent stop-the-world partition stalls?'
    ],
    keyTakeaways: [
      'Sequential disk I/O eliminates seek latency.',
      'Linux sendfile() zero-copy streams directly from OS page cache to network interface.',
      'Partitioning provides horizontal scaling; ordering is guaranteed only per-partition.'
    ],
    pitfalls: [
      'Creating thousands of tiny partitions per broker, leading to OS file descriptor exhaustion and slow leader election.',
      'Assuming Kafka guarantees global ordering across all partitions in a topic.'
    ],
    relatedCurriculumSlug: 'event-driven-architectures-kafka-and-rabbitmq'
  },
  {
    id: 'sys-06',
    category: 'System Design & Scalability',
    categorySlug: 'system-design',
    title: 'What is the Saga Pattern in Microservices? Compare Orchestration vs Choreography and explain Compensating Transactions.',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'A Saga manages distributed transactions across microservices as a sequence of local transactions. If any step fails, compensating transactions execute in reverse order to rollback previous side-effects.',
    deepAnswer: `In microservice architectures where each service has its own private database, traditional ACID Two-Phase Commit (2PC) is a blocking antipattern that hurts availability and latency (violating the CAP theorem).

1. Saga Core Concept:
   - A Saga breaks a global business process into a series of local transactions: T1, T2, ..., Tn.
   - For every transaction Ti, a corresponding Compensating Transaction Ci must exist that semantically undoes Ti (e.g., if T2 charges a credit card, C2 issues a refund).
   - If Tn fails, the saga invokes Cn-1, Cn-2, ..., C1 to restore consistency.

2. Choreography-Based Saga (Event-Driven):
   - Services publish domain events to a message bus (e.g., Kafka/RabbitMQ). Participating services listen to events and execute their local transactions autonomously.
   - Pros: Simple for small flows, loose coupling, no single orchestrator bottleneck.
   - Cons: Hard to understand and debug complex workflows; cyclical event dependencies; testing requires all services running.

3. Orchestration-Based Saga (Centralized Coordinator):
   - A dedicated orchestrator (e.g., Temporal, AWS Step Functions, or a dedicated workflow service) commands each service what action to execute.
   - Pros: Centralized business state machine; straightforward monitoring and error handling; easy to reason about compensations.
   - Cons: Risk of concentrating too much business logic in the orchestrator; potential coordinator bottleneck.

4. The Lack of Isolation (I in ACID):
   Sagas provide Atomicity, Consistency, and Durability, but lack Isolation: intermediate states are visible to other transactions.
   Countermeasures:
   - Semantic locks: mark records with "PENDING_APPROVAL".
   - Commutative updates: design operations such that ordering does not alter the final result.
   - Pessimistic view: reorder steps so high-risk transactions execute first.`,
    interviewerCounterQuestions: [
      'What happens if a Compensating Transaction fails midway through rollback? How do you ensure it eventually completes?',
      'How does the Transactional Outbox pattern ensure a database write and a message publish happen atomically?'
    ],
    keyTakeaways: [
      'Sagas replace blocking 2PC with sequential local transactions + compensations.',
      'Compensating transactions must be idempotent and retryable until success.',
      'Transactional Outbox solves dual-write atomicity between database and message broker.'
    ],
    pitfalls: [
      'Writing non-idempotent compensating actions, leading to duplicate refunds or inventory corruption during retries.',
      'Ignoring the lack of isolation, causing dirty reads and lost updates across concurrent sagas.'
    ],
    relatedCurriculumSlug: 'distributed-transactions-and-observability'
  },
  {
    id: 'sys-07',
    category: 'System Design & Scalability',
    categorySlug: 'system-design',
    title: 'What is the Circuit Breaker pattern? Explain the three states: Closed, Open, and Half-Open.',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'Prevents cascading failures by detecting failing downstream dependencies and failing fast without wasting threads and connections.',
    deepAnswer: `In distributed microservices, when a downstream service becomes slow or unresponsive, upstream callers continue issuing requests. Thread pools fill up, socket connections exhaust, and the failure cascades across the entire platform.

1. The Three States:
   - Closed (Normal Operation):
     Requests pass through to the downstream service. The circuit breaker tracks error counts and latency within a rolling time window.
     If the failure rate exceeds a defined threshold (e.g., >50% errors over 10 seconds), the circuit trips to OPEN.

   - Open (Fail-Fast Mode):
     All incoming requests are immediately short-circuited without attempting to contact the downstream service.
     A fallback response (cached data, default value, or fast error) is returned immediately.
     This gives the downstream service breathing room to recover and preserves upstream thread pools.
     A reset timer (e.g., 30 seconds) starts.

   - Half-Open (Canary Testing Mode):
     When the reset timer expires, the breaker transitions to Half-Open.
     A limited number of trial requests (canaries) are allowed to pass through to the downstream service.
     - If all trial requests succeed: the breaker transitions back to CLOSED (recovered).
     - If any trial request fails: the breaker immediately re-enters OPEN and resets the cooldown timer.`,
    interviewerCounterQuestions: [
      'How does a Circuit Breaker coordinate with exponential backoff and jitter in API client retry policies?',
      'Where should circuit breakers be deployed: in application code (Resilience4j) or at the service mesh sidecar layer (Envoy)?'
    ],
    keyTakeaways: [
      'Circuit Breakers protect thread pools from slow downstream timeouts.',
      'States: Closed (active) -> Open (short-circuit) -> Half-Open (probe).',
      'Always combine circuit breakers with meaningful fallback behaviors.'
    ],
    pitfalls: [
      'Retrying failed requests without exponential backoff and jitter, creating self-inflicted retry storms.',
      'Setting timeout values longer than upstream SLA thresholds, causing client disconnects before the breaker trips.'
    ],
    relatedCurriculumSlug: 'api-gateway-architecture-and-resilience'
  },
  {
    id: 'sys-08',
    category: 'System Design & Scalability',
    categorySlug: 'system-design',
    title: 'How do you handle Database Sharding and Replication Lag? Explain Read-Your-Own-Writes consistency.',
    difficulty: 'HARD',
    frequency: 'HIGH',
    shortSummary: 'Sharding partitions data horizontally across independent database clusters. Replication lag in primary-replica setups is mitigated for individual users via Read-Your-Own-Writes routing.',
    deepAnswer: `When a database outgrows a single server\'s RAM and storage, architectures employ horizontal sharding and read replicas.

1. Horizontal Sharding:
   - Shard Key Selection: Must provide high cardinality and uniform distribution (e.g., user_id).
   - Range-Based Sharding: Shard 1 holds IDs 1-1M, Shard 2 holds 1M-2M. (Susceptible to hot-spotting on newly created entities).
   - Hash-Based Sharding: hash(shard_key) % NumShards. (Uniform distribution, but cross-shard joins and re-sharding are expensive).

2. Replication Lag Anomaly:
   In asynchronous primary-replica architectures:
   - User updates profile -> Write committed to Primary database.
   - User immediately refreshes page -> Read request routed to Replica.
   - If replication lag is 500ms, the Replica has not yet applied the WAL changes!
   - Result: User sees their own update vanish, leading to confused user bug reports.

3. Read-Your-Own-Writes Consistency Strategies:
   - Read-from-Primary Window: After a user performs a write, route all subsequent reads from THAT user to the Primary for a window exceeding max replication lag (e.g., 5 seconds).
   - Timestamp / LSN Tracking: Return the transaction\'s Log Sequence Number (LSN) or commit timestamp in a cookie/header. The replica router only forwards the query to replicas whose replication watermark >= transaction LSN; if not caught up, route to primary.
   - Version Vector / Causal Consistency: Clients maintain monotonic version counters to enforce causal order.`,
    interviewerCounterQuestions: [
      'How do you re-shard a live production database with zero downtime when doubling shard count?',
      'Why are distributed transactions across multiple shards (cross-shard queries) discouraged?'
    ],
    keyTakeaways: [
      'Sharding splits tables across physical database nodes by a shard key.',
      'Async replication causes transient replication lag anomalies.',
      'Read-your-own-writes routes recently-writing users to the primary or up-to-date replicas.'
    ],
    pitfalls: [
      'Choosing a low-cardinality shard key (e.g., country_code), creating massive unbalanced shards.',
      'Executing cross-shard scatter-gather queries in synchronous HTTP request threads.'
    ],
    relatedCurriculumSlug: 'database-scaling-replication-and-sharding'
  },

  // ==========================================
  // DATABASES & STORAGE INTERNALS (7 questions)
  // ==========================================
  {
    id: 'db-01',
    category: 'Databases & Storage Internals',
    categorySlug: 'databases',
    title: 'Compare B+ Trees and Log-Structured Merge (LSM) Trees. Why do databases like Cassandra and RocksDB use LSM-Trees while Postgres and MySQL use B+ Trees?',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'B+ Trees optimize for fast random reads via balanced tree fanout. LSM-Trees optimize for write-intensive workloads by converting random writes into sequential in-memory appends and batch-compacting to disk.',
    deepAnswer: `Database storage engines are defined by how they manage disk I/O and index mutability.

1. B+ Tree Internals (InnoDB / PostgreSQL):
   - All data records are stored exclusively in Leaf nodes; Internal nodes store routing keys.
   - High fanout (typically 100-500 children per page), resulting in shallow trees (depth 3-4 for millions of rows).
   - Leaf nodes are linked sequentially via bidirectional pointers for ultra-fast range scans.
   - Writes: In-place updates. Modifying a row requires reading a 16KB disk page into the Buffer Pool, modifying it in RAM, logging changes to WAL, and writing the dirty page back to disk.
   - Trade-off: Superb for read-heavy workloads (1-3 I/Os per lookup). High write amplification due to random disk writes and page splits.

2. LSM-Tree Internals (Cassandra / RocksDB / ScyllaDB):
   - Writes are appended to an in-memory sorted data structure (MemTable, usually a SkipList) and written to a sequential Write-Ahead Log (WAL) for durability.
   - When MemTable reaches capacity, it is flushed sequentially to disk as an immutable Sorted String Table (SSTable).
   - Leveled or Size-Tiered Compaction runs in the background to merge overlapping SSTables and purge tombstones.
   - Trade-off: Unmatched write throughput because all disk I/O is 100% sequential.
   - Reads: Must check MemTable, then multiple SSTable levels. Mitigated via Bloom Filters to skip SSTables that definitely do not contain the target key.

3. Summary Rule of Thumb:
   - Read-heavy, relational, complex joins, low-latency point reads -> B+ Tree (MySQL, Postgres).
   - Write-heavy, telemetry, time-series, log streaming, big data distributed stores -> LSM-Tree (Cassandra, RocksDB).`,
    interviewerCounterQuestions: [
      'What is Write Amplification, Read Amplification, and Space Amplification in LSM storage engines?',
      'How do Bloom Filters work and what is their false positive rate formula?'
    ],
    keyTakeaways: [
      'B+ Tree: In-place updates, fast reads, high random write cost.',
      'LSM-Tree: Append-only, sequential disk writes, background compaction, relies on Bloom filters.',
      'B+ Tree leaf nodes form a doubly linked list for range scans.'
    ],
    pitfalls: [
      'Assuming LSM deletions immediately free disk space: deletions write a "tombstone" record; disk space is reclaimed only during compaction.',
      'Ignoring write stalls in LSM trees when background compaction fails to keep pace with ingestion.'
    ],
    relatedCurriculumSlug: 'lsm-trees-and-leveled-compaction'
  },
  {
    id: 'db-02',
    category: 'Databases & Storage Internals',
    categorySlug: 'databases',
    title: 'Explain ACID Transaction Isolation Levels and the Write Skew Anomaly in Snapshot Isolation.',
    difficulty: 'EXPERT',
    frequency: 'VERY HIGH',
    shortSummary: 'The 4 SQL isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable) protect against Dirty Reads, Non-Repeatable Reads, and Phantoms. Write Skew occurs under Snapshot Isolation when concurrent transactions read overlapping data and update disjoint sets violating a global constraint.',
    deepAnswer: `SQL isolation levels define how transactions interact concurrently.

1. Isolation Levels and Anomalies:
   - Read Uncommitted: Permits Dirty Reads (reading uncommitted changes of another transaction).
   - Read Committed: Guarantees reading only committed data. Prevents Dirty Reads. Subject to Non-Repeatable Reads (row re-read within same transaction yields different values).
   - Repeatable Read (Snapshot Isolation in PostgreSQL): Transaction sees an immutable snapshot of the database taken at transaction start. Prevents Non-Repeatable Reads and Phantom Reads.
   - Serializable: Guarantees concurrent execution produces identical results to some serial ordering.

2. The Write Skew Anomaly:
   Consider an on-call medical database with invariant: "At least one doctor must remain on call at all times."
   - Currently, Doctor A and Doctor B are both on call (Count = 2).
   - Transaction 1 (Doctor A wants to go off call):
     SELECT count(*) FROM on_call; -- returns 2 (safe)
     UPDATE doctors SET on_call = FALSE WHERE id = 'A';
   - Transaction 2 (Doctor B wants to go off call, running concurrently):
     SELECT count(*) FROM on_call; -- returns 2 (sees snapshot before T1 commits)
     UPDATE doctors SET on_call = FALSE WHERE id = 'B';
   - Both transactions commit!
   - Result: Count is now 0. The global safety constraint is violated!

3. Why Snapshot Isolation Fails Write Skew:
   Snapshot isolation detects conflicts only if transactions write to the SAME row (First-Committer-Wins). Because T1 wrote to Doctor A and T2 wrote to Doctor B, their write sets are disjoint!
   Solution:
   - Explicit locking: SELECT ... FOR UPDATE on all candidate rows.
   - True Serializable isolation via Serializable Snapshot Isolation (SSI), which tracks read-write dependency cycles (siw cycles) and aborts conflicting transactions.`,
    interviewerCounterQuestions: [
      'How does Serializable Snapshot Isolation (SSI) in PostgreSQL track read-write conflicts without holding shared row locks?',
      'What is the difference between Optimistic Concurrency Control (OCC) and Two-Phase Locking (2PL)?'
    ],
    keyTakeaways: [
      'Snapshot Isolation does NOT prevent Write Skew.',
      'Write Skew involves reading shared state and updating disjoint rows.',
      'PostgreSQL uses SSI to detect rw-antidependency cycles in memory.'
    ],
    pitfalls: [
      'Assuming that "Repeatable Read" guarantees complete serializability in PostgreSQL or MySQL.',
      'Using SELECT FOR UPDATE without an explicit index, resulting in entire table lock escalation.'
    ],
    relatedCurriculumSlug: 'relational-database-acid-and-transaction-isolation'
  },
  {
    id: 'db-03',
    category: 'Databases & Storage Internals',
    categorySlug: 'databases',
    title: 'How does Write-Ahead Logging (WAL) and ARIES Recovery guarantee Database Durability and Atomicity after a system crash?',
    difficulty: 'HARD',
    frequency: 'HIGH',
    shortSummary: 'WAL enforces that log records are flushed to disk before modified dirty data pages are written. ARIES uses Analysis, Redo (Repeating History), and Undo (Rolling Back with Compensation Log Records) phases during crash recovery.',
    deepAnswer: `To provide ACID Durability without writing every random modified data page to disk on every commit, databases use Write-Ahead Logging (WAL).

1. The WAL Protocol:
   - The Write-Ahead Logging invariant: A data page modified in RAM (dirty page) must NOT be written to disk until the corresponding WAL log record describing the update has been flushed to non-volatile storage (fsync).
   - On COMMIT, only the sequential WAL records must be flushed. Random disk I/O on tables is deferred to background checkpoints.

2. ARIES Recovery Algorithm (3-Pass Architecture):
   When a database recovers after an abrupt power outage or kernel panic, it executes three passes:

   - Pass 1: Analysis Phase
     Scans WAL forward from the most recent Checkpoint to the end of the log.
     Identifies:
     a. The Dirty Page Table (pages dirty in buffer pool at the time of crash).
     b. Active Transactions (transactions that had not committed or aborted before the crash - "Losers").

   - Pass 2: Redo Phase ("Repeating History")
     Scans forward from the earliest unwritten dirty page LSN (recLSN).
     Re-applies all logged actions (both committed and uncommitted transactions) to return the database state to the exact microsecond of the crash.

   - Pass 3: Undo Phase
     Scans backward from the end of the log.
     Rolls back the changes of all "Loser" transactions identified in the Analysis phase.
     For every undone operation, it logs a Compensation Log Record (CLR). CLRs contain an undoNextLSN pointer ensuring that if the database crashes AGAIN during recovery, previously undone actions are never undone twice.`,
    interviewerCounterQuestions: [
      'What is the difference between STEAL/NO-FORCE buffer pool policies and why does ARIES use STEAL/NO-FORCE?',
      'Why is Repeating History in the Redo phase necessary even for uncommitted loser transactions?'
    ],
    keyTakeaways: [
      'WAL invariant: Log records must reach disk before dirty pages.',
      'ARIES 3 passes: Analysis -> Redo (Repeat History) -> Undo (Rollback Losers with CLRs).',
      'Compensation Log Records (CLRs) prevent infinite crash loops during crash recovery.'
    ],
    pitfalls: [
      'Assuming COMMIT waits for table pages to write to disk; it only waits for sequential WAL fsync.',
      'Disabling fsync in production database configs to artificially boost benchmark throughput.'
    ],
    relatedCurriculumSlug: 'relational-database-acid-and-transaction-isolation'
  },
  {
    id: 'db-04',
    category: 'Databases & Storage Internals',
    categorySlug: 'databases',
    title: 'Explain Database Indexing: Clustered vs Non-Clustered Indexes, Covering Indexes, and Index Cardinality.',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'Clustered indexes dictate the physical row storage order on disk (one per table). Non-clustered indexes store separate keys pointing to clustered keys or row IDs. Covering indexes satisfy queries entirely from index nodes without table lookups.',
    deepAnswer: `Database indexes accelerate lookups from O(N) full table scans to O(log N) tree navigations.

1. Clustered Index:
   - Dictates the physical sort order of the table data pages on disk.
   - Leaf nodes of the clustered index contain the actual data row columns.
   - A table can have only ONE clustered index (usually the Primary Key in MySQL InnoDB).

2. Non-Clustered (Secondary) Index:
   - A separate B+ tree structure.
   - Leaf nodes contain the indexed column values plus a pointer to the clustered index key (in InnoDB) or a physical tuple pointer/CTID (in PostgreSQL).
   - If a query needs columns not present in the secondary index, the engine must perform a Secondary Lookup (Bookmark Lookup / Table Hop) to the clustered index.

3. Covering Index:
   - An index that contains all columns requested by a SELECT query (in either the key columns or via INCLUDE clause).
   - The database engine satisfies the query entirely within the secondary index B+ tree without touching table data pages (Index-Only Scan), speeding queries up by 10x-100x.

4. Cardinality and Selectivity:
   - Cardinality: The count of unique values in a column.
   - Selectivity: Cardinality / Total Rows.
   - If a column has low selectivity (e.g., boolean is_active or gender with only 2 values), the query planner will reject the index and choose a sequential scan, because jumping back and forth between secondary index and table pages costs more random I/O than a linear sequential read.`,
    interviewerCounterQuestions: [
      'What is the Leftmost Prefix Rule in Composite (multi-column) indexes? Can an index on (A, B, C) be used for a query on WHERE B = 5 AND C = 10?',
      'How does PostgreSQL Heap-Only Tuples (HOT) optimization prevent secondary index bloat during row updates?'
    ],
    keyTakeaways: [
      'Clustered index leaf nodes ARE the table rows.',
      'Covering index avoids secondary table lookups via Index-Only scans.',
      'Low selectivity columns cause the query planner to default to full table scans.'
    ],
    pitfalls: [
      'Creating indexes on low-cardinality columns thinking it will speed up searches.',
      'Over-indexing: each secondary index adds write amplification to every INSERT, UPDATE, and DELETE.'
    ],
    relatedCurriculumSlug: 'relational-database-acid-and-transaction-isolation'
  },
  {
    id: 'db-05',
    category: 'Databases & Storage Internals',
    categorySlug: 'databases',
    title: 'What is Database Normalization (1NF, 2NF, 3NF, BCNF) and when should you deliberately Denormalize?',
    difficulty: 'MEDIUM',
    frequency: 'HIGH',
    shortSummary: 'Normalization decomposes tables to eliminate redundancy and update anomalies. Denormalization introduces deliberate redundancy to optimize heavy read queries and avoid expensive distributed joins.',
    deepAnswer: `Relational schema design balances data integrity against query performance.

1. Normal Forms:
   - 1NF (First Normal Form): All column values are atomic (no repeating groups, arrays, or comma-separated lists); table has a primary key.
   - 2NF (Second Normal Form): Satisfies 1NF and eliminates Partial Functional Dependencies (every non-key attribute must depend on the whole composite primary key, not just a subset).
   - 3NF (Third Normal Form): Satisfies 2NF and eliminates Transitive Dependencies (non-key columns must not depend on other non-key columns; "depend on the key, the whole key, and nothing but the key").
   - BCNF (Boyce-Codd Normal Form): Every determinant in a functional dependency must be a candidate key.

2. When to Denormalize:
   While 3NF guarantees zero update anomalies, high-scale read applications suffer when joins span 5-10 large tables.
   Scenarios for Denormalization:
   - High-throughput read dashboards requiring pre-aggregated totals (e.g., caching total_likes directly on the posts table).
   - Distributed systems where cross-database or cross-shard joins are impossible.
   - Historical snapshots (e.g., copying user\'s billing address directly into the orders table at checkout time so future address changes do not alter past tax records).

3. Trade-off:
   Denormalization increases write complexity: application code or database triggers must update multiple redundant locations, opening windows for data inconsistency.`,
    interviewerCounterQuestions: [
      'How do materialized views provide denormalization benefits without breaking schema normalization?',
      'How do OLAP columnar stores (ClickHouse, Snowflake) change the normalization vs denormalization debate compared to OLTP databases?'
    ],
    keyTakeaways: [
      '3NF eliminates transitive dependencies; BCNF enforces that all determinants are candidate keys.',
      'Denormalize for read performance, cross-shard queries, and immutable historical records.',
      'Denormalization requires strict synchronization to prevent data drift.'
    ],
    pitfalls: [
      'Premature denormalization in early-stage products before performance bottlenecks are proven.',
      'Storing mutable foreign data without an update strategy, causing inconsistent UI states.'
    ],
    relatedCurriculumSlug: 'relational-database-acid-and-transaction-isolation'
  },
  {
    id: 'db-06',
    category: 'Databases & Storage Internals',
    categorySlug: 'databases',
    title: 'Explain the CAP Theorem and PACELC Theorem: Why is CAP insufficient for modern distributed systems?',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'CAP states a distributed store can only guarantee 2 of Consistency, Availability, and Partition Tolerance. PACELC extends this: in case of Partition (P), choose between Availability (A) and Consistency (C); Else (E), choose between Latency (L) and Consistency (C).',
    deepAnswer: `Distributed systems face trade-offs dictated by network physics and hardware failure.

1. The CAP Theorem (Brewer):
   - Consistency (Linearizability): Every read receives the most recent write or an error.
   - Availability: Every non-failing node returns a non-error response (without guarantee that it contains the newest write).
   - Partition Tolerance: The system continues operating despite arbitrary dropped or delayed network packets.
   - The Reality: Networks are physical and WILL partition (cable cuts, switch failures). Therefore, Partition Tolerance (P) is mandatory! The real choice during a partition is:
     - CP: Reject writes or wait until partition heals to preserve consistency.
     - AP: Accept writes on both sides of partition, sacrificing global consistency.

2. Why CAP is Insufficient (The PACELC Theorem):
   CAP only describes system behavior during a rare network partition (P). What about the other 99.9% of the time when the network is functioning normally (Else - E)?
   Even without partitions, systems must trade between Latency (L) and Consistency (C)!

   PACELC Formula:
   If Partition (P) -> choose between (A)vailability or (C)onsistency;
   Else (E) -> choose between (L)atency or (C)onsistency.

3. System Classifications under PACELC:
   - PC/EC (e.g., Spanner, CockroachDB, RDBMS clusters): During partition, choose Consistency; under normal operation, pay Latency cost for synchronous consensus to ensure Consistency.
   - PA/EL (e.g., Cassandra, DynamoDB, Couchbase): During partition, remain Available; under normal operation, return immediately for minimal Latency, accepting eventual consistency.`,
    interviewerCounterQuestions: [
      'What is Linearizability versus Serializability?',
      'How does Spanner use TrueTime atomic clocks and GPS receivers to achieve external consistency without cross-region two-phase commit overhead?'
    ],
    keyTakeaways: [
      'Partition tolerance is non-negotiable in distributed networks; the trade-off is CP vs AP.',
      'PACELC covers normal operations: Else, choose between Latency and Consistency.',
      'Cassandra is PA/EL; Spanner/CockroachDB is PC/EC.'
    ],
    pitfalls: [
      'Claiming a system is "CA": a network partition cannot be prevented, so "CA without P" does not exist in distributed systems.',
      'Confusing ACID Consistency (invariants/constraints) with CAP Consistency (linearizability/single-copy semantics).'
    ],
    relatedCurriculumSlug: 'database-scaling-replication-and-sharding'
  },
  {
    id: 'db-07',
    category: 'Databases & Storage Internals',
    categorySlug: 'databases',
    title: 'What is MVCC (Multi-Version Concurrency Control) and how does it prevent readers from blocking writers?',
    difficulty: 'HARD',
    frequency: 'HIGH',
    shortSummary: 'MVCC maintains multiple timestamped versions of data records. Readers read an immutable historical snapshot without taking locks, allowing readers and writers to execute concurrently without contention.',
    deepAnswer: `In naive lock-based concurrency, readers take shared locks (S-locks) and writers take exclusive locks (X-locks). A long-running analytics read query blocks all concurrent writes, crushing throughput.

1. MVCC Mechanics:
   - In MVCC, updating a row does NOT overwrite existing data in place.
   - Instead, the database creates a NEW version of the row with an assigned creation transaction ID (xmin / row creation LSN).
   - The old row version is tagged with an expiration transaction ID (xmax).
   - Deleting a row simply sets xmax = deleting_tx_id.

2. Snapshot Visibility:
   When a transaction begins, it receives an active transaction snapshot (list of currently active uncommitted transactions, plus max committed tx_id).
   When scanning rows:
   - A row version is visible IF xmin is committed before transaction snapshot start AND (xmax is empty OR xmax was created after snapshot start).
   - Readers never acquire locks! Writers only lock the specific rows they modify.
   - "Readers never block writers, and writers never block readers."

3. Garbage Collection / Vacuuming:
   As dead row versions accumulate (bloat), they consume disk space and degrade B+ tree performance.
   - PostgreSQL uses VACUUM (and autovacuum) to identify dead tuples whose xmax is older than the oldest running transaction and reclaim page space.
   - MySQL InnoDB writes old row versions to an Undo Log segment and purges them asynchronously when no older read view references them.`,
    interviewerCounterQuestions: [
      'What happens if a long-running reporting query runs for 12 hours in PostgreSQL? How does it affect VACUUM and table bloat?',
      'How does MVCC differ between PostgreSQL (in-heap versions) and MySQL InnoDB (in-place row with Undo Log roll-pointers)?'
    ],
    keyTakeaways: [
      'MVCC decouples reads and writes: readers take no locks.',
      'Old versions must be garbage collected (Vacuum in Postgres, Undo purge in InnoDB).',
      'Long-running transactions prevent vacuuming, causing severe table bloat.'
    ],
    pitfalls: [
      'Leaving open uncommitted transactions in production, blocking VACUUM and triggering transaction ID wraparound panic.',
      'Assuming MVCC eliminates all locks: writes to the same row still require row-level exclusive locks.'
    ],
    relatedCurriculumSlug: 'relational-database-acid-and-transaction-isolation'
  },

  // ==========================================
  // OPERATING SYSTEMS & LINUX (7 questions)
  // ==========================================
  {
    id: 'os-01',
    category: 'Operating Systems & Linux',
    categorySlug: 'os-linux',
    title: 'What happens under the hood during a Linux System Call (Syscall) and Context Switch?',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'The CPU switches from User Mode (Ring 3) to Kernel Mode (Ring 0) via hardware trap. Registers are saved to the kernel stack, page tables/TLB may flush on process switch, and the syscall dispatcher executes the kernel handler.',
    deepAnswer: `User programs run in Ring 3 (restricted privilege) to isolate hardware. Accessing disks, network sockets, or memory allocation requires executing a system call to enter Ring 0 (kernel space).

1. System Call Lifecycle:
   - User program invokes a library wrapper (e.g., POSIX read() in glibc).
   - Syscall arguments are loaded into CPU general-purpose registers (rdi, rsi, rdx, r10, r8, r9 on x86-64).
   - Syscall number is placed in the rax register (e.g., 0 for sys_read).
   - The CPU executes the 'syscall' instruction.
   - Hardware Transition:
     - CPU saves user rip and rflags, switches privilege from Ring 3 to Ring 0.
     - CPU switches stack pointer rsp from user stack to kernel stack.
     - Execution jumps to the kernel syscall entry point (entry_SYSCALL_64).
   - Kernel executes the requested function via the sys_call_table.
   - Return: Kernel executes 'sysretq', restoring user mode, user stack, and program counter.

2. Process Context Switch vs Thread Context Switch:
   - Thread Switch (within same process):
     Saves CPU registers, stack pointer, and program counter to the Thread Control Block (TCB). Restores new thread\'s registers. Fast (~1-2 microseconds) because virtual memory address space remains identical.
   - Process Switch:
     Requires switching the CR3 register to point to the new process\'s page directory. This invalidates the CPU\'s Translation Lookaside Buffer (TLB)!
     Subsequent memory accesses suffer high-latency TLB misses until the hardware cache repopulates.`,
    interviewerCounterQuestions: [
      'What is vDSO (Virtual Dynamic Shared Object) and how does it allow calls like gettimeofday() to execute without entering kernel mode?',
      'How did KPTI (Kernel Page Table Isolation) mitigate the Meltdown CPU vulnerability at the cost of context switch performance?'
    ],
    keyTakeaways: [
      'Syscalls transition privilege rings (Ring 3 -> Ring 0) via hardware trap.',
      'Process context switch reloads CR3 and flushes TLB; thread context switch preserves page tables.',
      'vDSO maps kernel data pages read-only into user space for zero-syscall lookups.'
    ],
    pitfalls: [
      'Assuming system calls and context switches are free: high context switch rates (>50k/sec) degrade CPU throughput via cache pollution.',
      'Confusing thread context switches with process context switches.'
    ],
    relatedCurriculumSlug: 'linux-kernel-internals-syscalls-and-ipc'
  },
  {
    id: 'os-02',
    category: 'Operating Systems & Linux',
    categorySlug: 'os-linux',
    title: 'How does Virtual Memory, Paging, and the Translation Lookaside Buffer (TLB) work?',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'Virtual memory isolates processes via contiguous virtual address spaces mapped to physical frames via multi-level page tables. The TLB caches recent translations directly on the CPU for single-cycle lookups.',
    deepAnswer: `Virtual memory provides each process with the illusion of a dedicated, continuous 64-bit address space while protecting memory from malicious or buggy neighbor processes.

1. Multi-Level Page Tables (e.g., 4-Level on x86-64):
   - Memory is divided into fixed-size chunks called Pages (typically 4KB).
   - A 48-bit virtual address is split into 4 index offsets (9 bits each = 512 entries per level) and a 12-bit page offset (2^12 = 4096 bytes):
     PGD (Page Global Directory) -> P4D -> PUD -> PMD -> PTE (Page Table Entry) -> Physical Frame.
   - Why Multi-Level? Allocating a flat single-level table for 64-bit addresses would require petabytes of RAM per process. Multi-level tables allocate page table subtrees on-demand only for mapped virtual regions.

2. Translation Lookaside Buffer (TLB):
   - Walking 4 levels of page tables in RAM for EVERY memory instruction would quadruple memory latency (400ns per read!).
   - The TLB is an ultra-fast hardware associative cache built directly into the CPU core that stores recent (Virtual Page -> Physical Frame) translations in ~1 CPU clock cycle.
   - TLB Hit: Address translated in 1 cycle.
   - TLB Miss: Hardware page table walker traverses DRAM page tables, updates TLB, and resumes instruction.

3. Page Faults:
   If a virtual page has no physical mapping:
   - Major Page Fault: Page was swapped out to disk or mapped from a file (mmap). Kernel must read disk into RAM.
   - Minor Page Fault: Physical frame exists in RAM (e.g., Copy-on-Write after fork), kernel updates PTE without disk I/O.
   - Segmentation Fault (SIGSEGV): Address is invalid or violates permissions (e.g., writing to read-only text segment).`,
    interviewerCounterQuestions: [
      'Why and when should high-performance applications (like databases or search engines) use HugePages (2MB or 1GB pages)?',
      'How does Linux Copy-On-Write (COW) during fork() optimize process creation?'
    ],
    keyTakeaways: [
      'Virtual addresses decouple software from physical RAM layout.',
      'Multi-level page tables save RAM; TLB makes translation O(1) cycle.',
      'HugePages reduce TLB misses by expanding page size from 4KB to 2MB/1GB.'
    ],
    pitfalls: [
      'Assuming a malloc() immediately allocates physical RAM: it only expands the virtual memory range (brk/mmap); physical RAM is committed on first write via Minor Page Fault.',
      'Ignoring TLB thrashing in random memory access algorithms over large datasets.'
    ],
    relatedCurriculumSlug: 'linux-kernel-internals-syscalls-and-ipc'
  },
  {
    id: 'os-03',
    category: 'Operating Systems & Linux',
    categorySlug: 'os-linux',
    title: 'Explain Deadlock: The 4 Coffman Conditions and how Banker\'s Algorithm avoids unsafe states.',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'Deadlock requires Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Banker\'s Algorithm simulates resource allocation to ensure the system always remains in a Safe State with at least one viable execution sequence.',
    deepAnswer: `A deadlock occurs when a set of concurrent processes are permanently blocked because each holds a resource needed by another process in the group.

1. The 4 Coffman Conditions (ALL must hold simultaneously for deadlock to occur):
   - Mutual Exclusion: At least one resource is held in a non-shareable mode.
   - Hold and Wait: A process holds at least one resource while waiting to acquire additional resources held by others.
   - No Preemption: Resources cannot be forcibly seized from a process; they can only be released voluntarily.
   - Circular Wait: A closed chain of processes exists where P0 waits for P1, P1 waits for P2, ..., and Pn waits for P0.

2. Deadlock Prevention:
   Break at least one Coffman condition:
   - Break Circular Wait (Industry Standard): Impose a strict global strict linear ordering on all resources (e.g., always acquire Lock A before Lock B).
   - Break Hold and Wait: Require a thread to request all needed locks simultaneously at start.
   - Break No Preemption: Use pthread_mutex_trylock(); if second lock cannot be acquired, release held locks and retry with backoff.

3. Deadlock Avoidance: Banker\'s Algorithm (Dijkstra):
   - Processes declare their maximum resource requirements in advance.
   - Safe State: A state is safe if there exists an execution sequence <P1, P2, ..., Pn> such that for each Pi, its remaining needs can be satisfied by current available resources plus resources held by all preceding processes.
   - When a resource is requested, Banker\'s algorithm tentatively simulates allocation. If resulting state is safe, grant; if unsafe (risk of circular wait), process is forced to wait.`,
    interviewerCounterQuestions: [
      'Why is Banker\'s Algorithm rarely used in general-purpose OS kernels like Linux?',
      'What is Priority Inversion and how does Priority Inheritance Protocol prevent unbounded latency in real-time kernels?'
    ],
    keyTakeaways: [
      'Deadlock requires all 4 Coffman conditions.',
      'Resource ordering is the most effective practical deadlock prevention technique.',
      'Banker\'s algorithm guarantees safe states by requiring advance knowledge of max resource demands.'
    ],
    pitfalls: [
      'Assuming safe state equals deadlock-free: an unsafe state is NOT deadlocked yet, but has no guarantee against future deadlock.',
      'Inconsistent lock acquisition ordering across different code paths in large teams.'
    ],
    relatedCurriculumSlug: 'operating-system-concurrency-and-deadlock-prevention'
  },
  {
    id: 'os-04',
    category: 'Operating Systems & Linux',
    categorySlug: 'os-linux',
    title: 'Compare Mutex, Counting Semaphore, and Spinlock: When do you choose which in high-concurrency systems?',
    difficulty: 'MEDIUM',
    frequency: 'HIGH',
    shortSummary: 'Spinlocks busy-wait on CPU cores for ultra-short critical sections. Mutexes put waiting threads to sleep in kernel wait-queues. Semaphores control access to a finite pool of N shared resources.',
    deepAnswer: `Synchronization primitives prevent data corruption in concurrent shared-memory systems.

1. Mutex (Mutual Exclusion Lock):
   - Ownership: A mutex has strict ownership (only the thread that locked the mutex can unlock it).
   - Behavior: If the lock is held, the calling thread yields the CPU and transitions to a sleeping state (BLOCKED) in the kernel wait queue.
   - Use Case: Long or unknown critical sections (e.g., file I/O, network calls, complex object mutations).
   - Overhead: Thread sleep and wakeup trigger 2 kernel context switches (~2-5 microseconds).

2. Spinlock:
   - Behavior: If the lock is held, the calling thread repeatedly polls the lock memory location in a tight CPU loop (busy-wait via atomic test-and-set / CAS) without sleeping.
   - Use Case: Extremely short critical sections (e.g., updating a linked list pointer in kernel interrupt handlers) where lock hold time is less than the cost of a context switch.
   - Requirement: MUST be run on multi-core systems; must NEVER sleep while holding a spinlock (which causes deadlock).

3. Counting Semaphore:
   - Mechanism: An integer counter initialized to N.
     - wait() / P(): Decrements counter. If counter < 0, caller sleeps.
     - signal() / V(): Increments counter. Wakes up a sleeping thread if any.
   - Ownership: No ownership! Any thread can signal (useful for producer-consumer signaling).
   - Use Case: Throttling access to a pool of N resources (e.g., connection pools, rate limiters).`,
    interviewerCounterQuestions: [
      'What is an Adaptive Mutex (as implemented in glibc / pthread_mutex_t)?',
      'Why is calling sleep() or blocking I/O while holding a spinlock catastrophic?'
    ],
    keyTakeaways: [
      'Spinlocks busy-wait (use for <100ns operations); Mutexes sleep (use for I/O and longer critical sections).',
      'Semaphores have no ownership, enabling cross-thread event signaling.',
      'Adaptive mutexes spin briefly before falling back to kernel sleep.'
    ],
    pitfalls: [
      'Using a spinlock on a single-core CPU or when the critical section performs blocking I/O, pegging CPU at 100% and starving the lock holder.',
      'Unlocking a mutex from a different thread than the acquiring thread (undefined behavior).'
    ],
    relatedCurriculumSlug: 'operating-system-concurrency-and-deadlock-prevention'
  },
  {
    id: 'os-05',
    category: 'Operating Systems & Linux',
    categorySlug: 'os-linux',
    title: 'Explain Linux IPC Mechanisms: Pipes, Unix Domain Sockets, Shared Memory, and Message Queues.',
    difficulty: 'MEDIUM',
    frequency: 'HIGH',
    shortSummary: 'Shared Memory is the fastest IPC because it avoids kernel data copying. Unix Domain Sockets provide reliable bidirectional byte streams with file permission security. Pipes provide unidirectional streaming.',
    deepAnswer: `Inter-Process Communication (IPC) allows isolated Linux processes to exchange data safely.

1. Anonymous Pipes & Named Pipes (FIFOs):
   - Unidirectional byte stream with FIFO semantics backed by a circular buffer in kernel memory.
   - Anonymous pipes (pipe()) only work between processes sharing a common ancestor (parent-child).
   - Named pipes (mkfifo) appear as a file on the filesystem and connect unrelated processes.
   - Limitation: Unidirectional; data copied twice (user -> kernel buffer -> user).

2. Unix Domain Sockets (UDS):
   - Uses the standard POSIX socket API (AF_UNIX) but bypasses network stack overhead (no IP checksums, no routing, no TCP flow control).
   - Bidirectional stream (SOCK_STREAM) or datagram (SOCK_DGRAM).
   - Supports passing open file descriptors between processes (SCM_RIGHTS).
   - Benchmark: 2x throughput and 50% lower latency than loopback TCP (127.0.0.1).

3. Shared Memory (shmget / mmap MAP_SHARED):
   - Maps the same physical memory frames into the virtual address spaces of two or more processes.
   - Performance: The FASTEST IPC mechanism because data transfer occurs at memory bus speeds with ZERO kernel copying.
   - Requirement: Processes must coordinate access using synchronization primitives (POSIX mutexes/semaphores placed in the shared memory region).

4. POSIX / SysV Message Queues:
   - Stores structured messages in kernel memory.
   - Enables priority-based message retrieval rather than strictly FIFO order.`,
    interviewerCounterQuestions: [
      'Why does PostgreSQL use Shared Memory (shm) for its buffer pool instead of sockets or pipes?',
      'How does Docker or Envoy use Unix Domain Sockets for high-performance sidecar communication?'
    ],
    keyTakeaways: [
      'Shared memory = Zero kernel copy, highest throughput, requires explicit synchronization.',
      'Unix domain sockets = 2x faster than loopback TCP, supports passing file descriptors.',
      'Pipes are unidirectional streams with kernel buffer limits.'
    ],
    pitfalls: [
      'Forgetting synchronization on Shared Memory, causing data corruption race conditions.',
      'Filling a pipe buffer without a reader, causing the writer process to block indefinitely.'
    ],
    relatedCurriculumSlug: 'linux-kernel-internals-syscalls-and-ipc'
  },
  {
    id: 'os-06',
    category: 'Operating Systems & Linux',
    categorySlug: 'os-linux',
    title: 'How does Linux manage File Descriptors, Inodes, Hard Links, and Soft Links in Ext4?',
    difficulty: 'MEDIUM',
    frequency: 'MEDIUM',
    shortSummary: 'Inodes store file metadata and data block pointers. Hard links point directly to an inode number. Soft links are independent files containing a target path. File descriptors are process-local integers indexing the open file table.',
    deepAnswer: `Understanding the Linux VFS (Virtual Filesystem Switch) and Ext4 filesystem architecture is crucial for systems engineering.

1. Inodes (Index Nodes):
   - A filesystem data structure storing all metadata about a file: file size, permissions, owner UID/GID, timestamps (atime, mtime, ctime), and pointers to disk data blocks.
   - Notice: The inode does NOT store the filename or the file data itself! Filenames are stored in directory data blocks mapping (filename -> inode number).

2. Hard Links:
   - A directory entry that maps a filename directly to an existing inode number.
   - The inode contains a link count (i_nlink). Creating a hard link increments link count.
   - Deleting a file (rm / unlink) decrements link count. The underlying data blocks and inode are freed ONLY when link count reaches 0 AND no running process has an open file descriptor on it!
   - Constraint: Cannot span across different filesystem partitions (inode numbers are partition-local); cannot hard link directories (prevents infinite directory loops).

3. Soft Links (Symbolic Links / Symlinks):
   - A regular file with its own unique inode number and file type S_IFLNK.
   - Its data block stores the text string of the target path (e.g., "/var/log/app.log").
   - Can cross filesystem boundaries and point to directories.
   - If target file is deleted, the symlink becomes a "dangling / broken" link.

4. File Descriptors (FDs):
   - An integer representing an open file within a single process.
   - Indexes the process\'s fd_array in task_struct, which points to an entry in the system-wide Open File Table (struct file), which points to the struct inode.`,
    interviewerCounterQuestions: [
      'Why does deleting a 50GB log file with "rm" sometimes fail to free up disk space in "df -h"? How do you fix it without restarting the machine?',
      'What happens when a filesystem runs out of inodes (df -i at 100%) even when disk storage has gigabytes of free space?'
    ],
    keyTakeaways: [
      'Hard links share the same inode and increment i_nlink.',
      'Soft links store a path string in a new inode.',
      'Disk space is only reclaimed when link count = 0 AND open file descriptor count = 0.'
    ],
    pitfalls: [
      'Deleting an open file expecting immediate disk reclamation: if a running process holds the FD open, disk blocks remain allocated until process termination or truncation (> /path/to/file).',
      'Creating millions of tiny 1-byte files, exhausting inode table (df -i) while disk space remains empty.'
    ],
    relatedCurriculumSlug: 'linux-kernel-internals-syscalls-and-ipc'
  },
  {
    id: 'os-07',
    category: 'Operating Systems & Linux',
    categorySlug: 'os-linux',
    title: 'What is the difference between epoll, poll, and select for I/O Multiplexing in Linux?',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'select and poll suffer from O(N) descriptor scanning on every event. epoll uses kernel event callback registration and ready lists for O(1) event delivery, scaling to 100,000+ concurrent connections.',
    deepAnswer: `I/O multiplexing allows a single thread to monitor thousands of network sockets for read/write readiness.

1. select():
   - Uses fixed-size bitmasks (fd_set) capped at FD_SETSIZE (typically 1024 descriptors).
   - On every call, user space passes the bitmask to kernel; kernel scans all 1024 bits in O(N).
   - The bitmask is modified in-place, requiring user space to reinitialize the mask on every loop.
   - Complexity: O(N) where N is the maximum descriptor number.

2. poll():
   - Replaces bitmasks with an array of pollfd structures, removing the 1024 limit.
   - However, kernel must still iterate over the entire array in O(N) to inspect readiness.
   - Passing large arrays across user-kernel boundary on every tick creates high copy overhead.

3. epoll (Linux Standard - powers Nginx, Redis, Netty, Node.js):
   - Solves both the copy overhead and the O(N) scan bottleneck through 3 system calls:
     - epoll_create(): Allocates an epoll instance in the kernel.
     - epoll_ctl(): Adds, modifies, or removes watched file descriptors. Stores monitored sockets in an in-kernel Red-Black Tree in O(log N).
     - epoll_wait(): Blocks until events occur. Returns ONLY the active file descriptors via an in-kernel doubly linked Ready List in O(Active Events)!
   - Mechanism: When a network packet arrives, the NIC driver interrupt triggers the kernel socket callback, which appends the ready socket directly to the epoll Ready List and wakes up the thread.
   - Complexity: O(1) relative to total monitored connections. 100,000 idle connections cost zero CPU cycles!

4. Edge-Triggered (EPOLLET) vs Level-Triggered:
   - Level-Triggered (Default): epoll_wait will continue reporting the socket as ready as long as data remains in the buffer.
   - Edge-Triggered: epoll_wait notifies ONLY when state changes (e.g., new data arrives). The application MUST loop non-blocking read() until EAGAIN/EWOULDBLOCK, otherwise remaining data will stall indefinitely.`,
    interviewerCounterQuestions: [
      'What is the Thundering Herd problem in epoll when multiple worker processes listen on the same socket, and how did EPOLLEXCLUSIVE / SO_REUSEPORT solve it?',
      'How does Linux io_uring advance beyond epoll by using shared ring buffers for true asynchronous I/O?'
    ],
    keyTakeaways: [
      'select/poll are O(N); epoll is O(Active Events).',
      'epoll maintains an internal RB-tree (monitored set) and Ready List (active set).',
      'Edge-triggered requires non-blocking sockets read until EAGAIN.'
    ],
    pitfalls: [
      'Using Edge-Triggered epoll without a while(read() > 0) loop, causing dropped or hung socket requests.',
      'Passing thousands of sockets to select(), hitting silent bitmask buffer overflows beyond 1024.'
    ],
    relatedCurriculumSlug: 'linux-kernel-internals-syscalls-and-ipc'
  },

  // ==========================================
  // COMPUTER NETWORKS & SECURITY (6 questions)
  // ==========================================
  {
    id: 'net-01',
    category: 'Computer Networks & Security',
    categorySlug: 'networking',
    title: 'Explain the TCP 3-Way Handshake, 4-Way Teardown, and why the TIME_WAIT state lasts 2MSL.',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'Handshake establishes synchronized initial sequence numbers (SYN, SYN-ACK, ACK). Teardown closes bidirectional channels independently (FIN, ACK, FIN, ACK). TIME_WAIT lasts 2MSL to ensure the final ACK was delivered and clear delayed duplicate packets.',
    deepAnswer: `TCP provides reliable, ordered, error-checked bidirectional byte streams over unreliable IP.

1. TCP 3-Way Handshake:
   - Step 1 (Client -> Server): Sends SYN packet with client Initial Sequence Number (ISN_c). State: SYN_SENT.
   - Step 2 (Server -> Client): Allocates transmission control block (TCB), sends SYN-ACK with server ISN_s and ACK = ISN_c + 1. State: SYN_RCVD.
   - Step 3 (Client -> Server): Sends ACK with ACK = ISN_s + 1. Both endpoints reach ESTABLISHED. Data can be pipelined in this packet.

2. TCP 4-Way Teardown:
   TCP is full-duplex; closing each direction is independent:
   - Step 1 (Endpoint A -> B): Sends FIN. State: FIN_WAIT_1.
   - Step 2 (Endpoint B -> A): Sends ACK. B enters CLOSE_WAIT; A enters FIN_WAIT_2. (Direction A->B closed; B can still send remaining data).
   - Step 3 (Endpoint B -> A): Finishes sending data, sends FIN. State: LAST_ACK.
   - Step 4 (Endpoint A -> B): Sends ACK. B closes socket immediately. Endpoint A enters TIME_WAIT state!

3. Why TIME_WAIT Lasts 2MSL (Maximum Segment Lifetime, typically 60-120 seconds):
   - Reason 1: Reliable Connection Termination.
     If Endpoint A\'s final ACK is dropped by the network, Endpoint B will retransmit its FIN. If Endpoint A had closed immediately, it would respond with an RST packet instead of ACK, causing Endpoint B to report an abnormal connection termination error.
   - Reason 2: Draining Delayed Duplicate Packets.
     Packets can be delayed in Internet router queues. 2MSL ensures all lingering duplicate packets from the old connection expire and drop, preventing them from being accepted as valid data by a future new connection using the same 4-tuple (src_ip, src_port, dst_ip, dst_port).`,
    interviewerCounterQuestions: [
      'What is a SYN Flood attack and how do SYN Cookies (syncookies) mitigate it without allocating server memory?',
      'How does the TCP_TW_REUSE socket option work for high-throughput client connections?'
    ],
    keyTakeaways: [
      'Handshake synchronizes sequence numbers; teardown closes directions independently.',
      'TIME_WAIT prevents delayed packet corruption and guarantees final ACK delivery.',
      'SYN cookies avoid allocating kernel memory for unverified handshakes.'
    ],
    pitfalls: [
      'Setting TIME_WAIT to 0 via SO_LINGER in production, risking data corruption on socket reconnection.',
      'Accumulating millions of sockets in CLOSE_WAIT: this indicates an application bug where code fails to call socket.close().'
    ],
    relatedCurriculumSlug: 'tcp-transport-internals-flow-control-and-congestion'
  },
  {
    id: 'net-02',
    category: 'Computer Networks & Security',
    categorySlug: 'networking',
    title: 'How does TCP Congestion Control work? Compare Reno, CUBIC, and BBR (Bottleneck Bandwidth and RTT).',
    difficulty: 'HARD',
    frequency: 'HIGH',
    shortSummary: 'Loss-based algorithms (Reno, CUBIC) treat packet drops as congestion, leading to bufferbloat. BBR models maximum bandwidth and minimum RTT to maximize throughput without filling router buffers.',
    deepAnswer: `TCP Congestion Control prevents senders from overwhelming intermediate network routers.

1. Classical Loss-Based Congestion Control (Reno / NewReno):
   - Slow Start: Starts with small Congestion Window (cwnd). Doubles cwnd every RTT (exponential growth) until reaching ssthresh (slow start threshold).
   - Congestion Avoidance: Increases cwnd linearly (+1 MSS per RTT) (Additive Increase).
   - Packet Drop (Triple Duplicate ACK): Halves cwnd and ssthresh (Multiplicative Decrease - AIMD).
   - Flaw: Assumes all packet drops are caused by network congestion, when wireless networks frequently drop packets due to RF interference.

2. CUBIC (Linux Default for Years):
   - Replaces linear increase with a cubic function of elapsed time since last congestion event.
   - Slows down window growth near the previous saturation point (stability), then accelerates rapidly if no drop occurs.

3. Bufferbloat Problem:
   Loss-based algorithms blindly inflate the sending window until a router buffer physically overflows and drops a packet. Over-provisioned intermediate router queues fill up completely, causing tens of seconds of latency spikes (bufferbloat) without increasing throughput.

4. BBR (Bottleneck Bandwidth and RTT):
   - Developed by Google engineers; operates on control systems theory rather than loss events.
   - Concurrently estimates:
     a. BtlBw: Maximum bottleneck delivery bandwidth.
     b. RTprop: Minimum round-trip propagation delay.
   - Paces packet transmission precisely at BtlBw to keep the inflight data equal to the Bandwidth-Delay Product (BDP = BtlBw * RTprop).
   - Result: Maximum possible throughput with minimum queue delay and near-zero bufferbloat.`,
    interviewerCounterQuestions: [
      'What is the Bandwidth-Delay Product (BDP) and how does it determine the optimal TCP socket receive buffer size?',
      'How does Explicit Congestion Notification (ECN) notify endpoints of congestion without dropping packets?'
    ],
    keyTakeaways: [
      'AIMD: Additive Increase, Multiplicative Decrease.',
      'Loss-based algorithms cause bufferbloat by filling router queues until drop.',
      'BBR paces transmission based on BtlBw * RTprop to achieve maximum throughput at minimum latency.'
    ],
    pitfalls: [
      'Using default small TCP buffer sizes on 10Gbps+ links, throttling throughput due to BDP exhaustion.',
      'Confusing Flow Control (receiver window rwnd protects receiver) with Congestion Control (cwnd protects intermediate routers).'
    ],
    relatedCurriculumSlug: 'tcp-transport-internals-flow-control-and-congestion'
  },
  {
    id: 'net-03',
    category: 'Computer Networks & Security',
    categorySlug: 'networking',
    title: 'Compare HTTP/1.1, HTTP/2, and HTTP/3: How does HTTP/3 over QUIC eliminate Head-of-Line (HoL) Blocking?',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'HTTP/2 introduced binary multiplexing over a single TCP connection, but suffered from TCP-level Head-of-Line blocking. HTTP/3 runs over QUIC (UDP), providing independent streams where a lost packet stalls only that single stream.',
    deepAnswer: `The evolution of the web protocol reflects continuous efforts to minimize latency.

1. HTTP/1.1:
   - Text-based protocol.
   - Persistent connections (Keep-Alive) allow reusing TCP handshakes.
   - Head-of-Line (HoL) Blocking: Only one request/response can be transferred per TCP connection at a time. Browsers had to open 6 parallel TCP connections per domain to load assets.

2. HTTP/2:
   - Binary framing layer.
   - Multiplexing: Multiple bidirectional streams interleaved concurrently over a single TCP connection.
   - Header Compression: HPACK reduces redundant header overhead.
   - Server Push: Server proactively sends critical assets.
   - The Achilles Heel: TCP-Level Head-of-Line Blocking!
     Because all HTTP/2 streams share a SINGLE underlying TCP stream, if ONE TCP packet is dropped, TCP halts ALL delivery until the missing packet is retransmitted and acknowledged. A single lost packet on an image stalls all API calls and stylesheet streams on that connection!

3. HTTP/3 over QUIC (UDP):
   - Replaces TCP with QUIC, an encrypted transport protocol built on top of UDP.
   - True Independent Stream Multiplexing:
     Each HTTP/3 stream has its own independent flow control and sequence numbers within QUIC. If a packet for Stream 3 is lost, Stream 1 and Stream 2 continue delivering bytes to the application without interruption!
   - 0-RTT Connection Establishment:
     Combines transport and TLS 1.3 handshakes into a single roundtrip; clients with cached server keys can send data in 0-RTT!
   - Connection Migration:
     Connections are identified by a 64-bit Connection ID rather than the 4-tuple (IP, port). If a mobile user switches from Wi-Fi to 5G cellular, the connection persists seamlessly without reconnecting.`,
    interviewerCounterQuestions: [
      'Why is QUIC implemented in User Space on top of UDP rather than modifying the Linux kernel TCP stack?',
      'What are the security risks of 0-RTT data in TLS 1.3 / QUIC, and how do servers protect against replay attacks?'
    ],
    keyTakeaways: [
      'HTTP/2 multiplexes streams over 1 TCP connection, suffering from TCP-level HoL blocking on packet drops.',
      'HTTP/3 runs over QUIC/UDP, isolating packet loss strictly to the affected stream.',
      'QUIC Connection ID enables connection migration across network changes.'
    ],
    pitfalls: [
      'Assuming HTTP/2 is always faster than HTTP/1.1: on lossy mobile networks (>2% packet loss), HTTP/2 performs worse than 6 parallel HTTP/1.1 connections due to TCP HoL blocking.',
      'Allowing non-idempotent POST requests in 0-RTT data, opening vulnerabilities to replay attacks.'
    ],
    relatedCurriculumSlug: 'tcp-transport-internals-flow-control-and-congestion'
  },
  {
    id: 'net-04',
    category: 'Computer Networks & Security',
    categorySlug: 'networking',
    title: 'What is the difference between Symmetric vs Asymmetric Encryption, and how does the TLS 1.3 Handshake work?',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'Asymmetric encryption (RSA/ECC) securely exchanges keys during handshake; fast Symmetric encryption (AES-GCM/ChaCha20) encrypts the bulk session data. TLS 1.3 reduces handshake to 1-RTT by mandating Ephemeral Diffie-Hellman.',
    deepAnswer: `Transport Layer Security (TLS) provides confidentiality, data integrity, and server authentication over untrusted networks.

1. Symmetric vs Asymmetric Cryptography:
   - Asymmetric (Public/Private Key - RSA, ECDSA):
     Public key encrypts; private key decrypts. Computationally intensive (~1000x slower than symmetric). Used solely to authenticate server identity and exchange session secrets.
   - Symmetric (Single Shared Secret - AES-256-GCM, ChaCha20-Poly1305):
     Same key encrypts and decrypts. Extremely fast, supported by hardware CPU instructions (AES-NI). Used for all application payload encryption.

2. TLS 1.3 Handshake (1-RTT Standard):
   TLS 1.3 removed legacy insecure ciphers (RSA key exchange, CBC mode) and made Ephemeral Diffie-Hellman (ECDHE) mandatory, cutting handshake latency from 2-RTT to 1-RTT:

   - Client Hello (RTT 0 -> 1):
     Client sends supported cipher suites, random nonce, and crucially: its Diffie-Hellman key share (e.g., X25519 public key) guessing the server\'s preferred curve!

   - Server Hello & Finished (RTT 1 -> 0):
     Server chooses cipher suite, sends its own Diffie-Hellman key share, server digital certificate (signed by a CA), and HMAC Finished signature.
     Both parties immediately compute the shared master secret using ECDHE!

   - Application Data:
     Client verifies server certificate against trusted Root CA certificates.
     Encrypted application traffic begins immediately at 1-RTT!

3. Perfect Forward Secrecy (PFS):
   Mandated in TLS 1.3 via Ephemeral Diffie-Hellman.
   Even if an attacker records all encrypted traffic over decades and later steals the server\'s private signing key, they CANNOT decrypt past sessions because the ephemeral session keys were discarded from memory after connection termination.`,
    interviewerCounterQuestions: [
      'How does Certificate Revocation work (CRLs vs OCSP vs OCSP Stapling)? Why is OCSP Stapling preferred?',
      'What is Server Name Indication (SNI) and how does Encrypted Client Hello (ECH) protect user privacy?'
    ],
    keyTakeaways: [
      'Asymmetric authenticates and negotiates; symmetric encrypts payload.',
      'TLS 1.3 achieves 1-RTT by combining ClientHello with Diffie-Hellman key share.',
      'Perfect Forward Secrecy (PFS) ensures past sessions cannot be decrypted if server private key is compromised.'
    ],
    pitfalls: [
      'Using static RSA key exchange (forbidden in TLS 1.3), which lacks Perfect Forward Secrecy.',
      'Failing to enable OCSP Stapling, causing client browsers to make blocking synchronous HTTP calls to CA verification servers.'
    ],
    relatedCurriculumSlug: 'cloud-security-iam-and-zero-trust-architecture'
  },
  {
    id: 'net-05',
    category: 'Computer Networks & Security',
    categorySlug: 'networking',
    title: 'Explain DNS Resolution Hierarchy: Recursive vs Iterative Queries and DNS Record Types (A, AAAA, CNAME, ALIAS, MX, TXT).',
    difficulty: 'MEDIUM',
    frequency: 'HIGH',
    shortSummary: 'Resolves human-readable domain names to IP addresses via hierarchical tree: Root -> TLD -> Authoritative Nameservers. Recursive resolvers query step-by-step on behalf of the client.',
    deepAnswer: `The Domain Name System (DNS) is a global hierarchical distributed database translating domain names into routable IP addresses.

1. The Resolution Hierarchy:
   When resolving "api.example.com":
   - Browser / OS DNS Cache: Checked first.
   - Recursive Resolver (e.g., 8.8.8.8 or ISP DNS): Resolves the full chain on behalf of client:
     1. Queries Root Nameserver ("."): Returns the TLD nameserver for ".com".
     2. Queries TLD Nameserver (".com"): Returns Authoritative nameservers for "example.com" (NS records).
     3. Queries Authoritative Nameserver ("ns1.example.com"): Returns the target IP record (A/AAAA) for "api.example.com".
     4. Caches record according to TTL (Time to Live) and returns answer to client.

2. Recursive vs Iterative Queries:
   - Recursive Query: Client demands: "Give me the final answer or return an error." (Between client stub resolver and ISP resolver).
   - Iterative Query: Resolver asks nameserver: "Give me the best referral pointer you know." (Between ISP resolver and Root/TLD nameservers).

3. Core DNS Record Types:
   - A: Maps domain name to 32-bit IPv4 address (e.g., 93.184.216.34).
   - AAAA: Maps domain name to 128-bit IPv6 address.
   - CNAME (Canonical Name): Maps an alias name to another canonical domain name (e.g., www.example.com -> example.com). Cannot exist at zone apex (@).
   - ALIAS / ANAME: Virtual pseudo-record created by DNS providers to allow CNAME-like routing at the zone apex without violating RFC 1034.
   - MX (Mail Exchange): Directs email traffic to designated mail servers with priority integers.
   - TXT: Holds arbitrary human or machine-readable text (used for SPF, DKIM, DMARC email authentication and domain ownership verification).`,
    interviewerCounterQuestions: [
      'Why cannot a CNAME record coexist with other records at the root apex domain (example.com)?',
      'What is DNS Cache Poisoning and how does DNSSEC use public key cryptography to prevent spoofing?'
    ],
    keyTakeaways: [
      'Resolution hierarchy: Root -> TLD -> Authoritative.',
      'CNAME cannot exist at apex; ALIAS/ANAME resolves apex dynamically.',
      'TTL dictates caching duration across intermediate resolvers.'
    ],
    pitfalls: [
      'Setting overly high TTL (e.g., 24 hours) right before an IP migration, preventing emergency rollbacks.',
      'Confusing Authoritative nameservers with Recursive resolvers.'
    ],
    relatedCurriculumSlug: 'tcp-transport-internals-flow-control-and-congestion'
  },
  {
    id: 'net-06',
    category: 'Computer Networks & Security',
    categorySlug: 'networking',
    title: 'Explain Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), and Content Security Policy (CSP) Defenses.',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'XSS injects malicious client-side JavaScript to steal tokens or hijack sessions. CSRF tricks authenticated users into submitting unwanted state-changing actions. Defend via CSP, Contextual Output Encoding, and SameSite cookies.',
    deepAnswer: `Web application security requires defending against unauthorized script execution and forged client requests.

1. Cross-Site Scripting (XSS):
   - Stored XSS: Malicious script is permanently stored in database (e.g., comment box) and served to other users.
   - Reflected XSS: Malicious script is reflected off web server via URL query parameters in the immediate HTTP response.
   - DOM-based XSS: Malicious input is processed insecurely by client-side JavaScript (e.g., innerHTML, eval).
   - Impact: Stealing document.cookie session tokens, logging keystrokes, unauthorized API calls.
   - Defense:
     a. Contextual HTML/JS output encoding.
     b. Set HttpOnly flag on session cookies (prevents document.cookie access).
     c. Content Security Policy (CSP): Restrict script sources (script-src 'self' https://trusted.cdn.com) and disallow 'unsafe-inline'.

2. Cross-Site Request Forgery (CSRF):
   - Attack: A victim is logged into bank.com (browser holds valid session cookies). Victim visits malicious evil.com.
   - evil.com contains hidden form: <form action="https://bank.com/transfer" method="POST">.
   - Browser automatically attaches bank.com cookies to cross-site requests!
   - Impact: Bank executes transfer believing it was authorized by the user.
   - Defense:
     a. SameSite Cookie Attribute (Industry Standard):
        SameSite=Lax (default in modern browsers) or SameSite=Strict prevents cookies from being attached to cross-site state-changing requests.
     b. Anti-CSRF Synchronizer Tokens: Server issues unique cryptographically random token embedded in forms and verified in POST headers.
     c. Custom Request Headers: APIs requiring custom headers (e.g., X-Requested-With or Authorization: Bearer) cannot be forged by standard cross-origin HTML forms.`,
    interviewerCounterQuestions: [
      'If an application uses Authorization: Bearer <JWT> stored in localStorage, is it vulnerable to CSRF? What does it become vulnerable to instead?',
      'What is CORS (Cross-Origin Resource Sharing) and why does CORS NOT protect against CSRF attacks?'
    ],
    keyTakeaways: [
      'XSS executes malicious JS; defend with HttpOnly cookies, output escaping, and strict CSP.',
      'CSRF abuses automatic browser cookie attachment; defend with SameSite cookies and Anti-CSRF tokens.',
      'CORS is a browser relaxation policy, not a security defense against CSRF.'
    ],
    pitfalls: [
      'Storing sensitive JWT tokens in localStorage where any XSS vulnerability can extract them instantly.',
      'Believing CORS blocks incoming requests: standard HTML form submissions trigger POST requests regardless of CORS.'
    ],
    relatedCurriculumSlug: 'cloud-security-iam-and-zero-trust-architecture'
  },

  // ==========================================
  // CORE JAVA & JVM INTERNALS (6 questions)
  // ==========================================
  {
    id: 'java-01',
    category: 'Core Java & JVM Internals',
    categorySlug: 'java-jvm',
    title: 'How does HashMap work internally in Java 8+? Explain Hash Collision Resolution, Treeification, and Load Factor.',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'Java 8 HashMap uses an array of Node buckets. Collisions are handled via linked lists that convert to Red-Black Trees (Treeification) when bucket size reaches 8 and table capacity >= 64, improving worst-case lookup from O(N) to O(log N).',
    deepAnswer: `HashMap is the most commonly asked Java collection data structure in technical interviews.

1. Core Architecture:
   - Backed by an array of Node<K, V>[] (transient Node<K,V>[] table).
   - Default initial capacity = 16 (always a power of 2).
   - Default load factor = 0.75.
   - Bucket index calculation:
     hash = (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16)  // XOR high bits
     index = (n - 1) & hash                                          // Bitwise modulo

2. Why XOR with High 16 Bits (hash spreading)?
   When table length n is small (e.g., 16), (n - 1) is 15 (binary 00001111). Only the lowest 4 bits of the hash code influence bucket index. If hashCode() differs only in high bits, all keys collide in bucket 0! XORing the high 16 bits downward spreads entropy.

3. Treeification (Java 8 Enhancement):
   - In Java 7, collisions chained into a singly linked list. Malicious attacks crafting colliding keys degraded lookup to O(N), causing DoS CPU spikes.
   - In Java 8:
     - When a bucket exceeds TREEIFY_THRESHOLD (8 items) AND table capacity >= MIN_TREEIFY_CAPACITY (64), the linked list converts into a balanced Red-Black Tree (TreeNode<K,V>).
     - Worst-case lookup time drops from O(N) to O(log N).
     - Untreeify: If deletions reduce bucket size to UNTREEIFY_THRESHOLD (6 items), it converts back to a linked list to avoid tree overhead.

4. Resize (Rehashing):
   - Triggered when size > threshold (capacity * loadFactor).
   - Capacity doubles (newCap = oldCap << 1).
   - Fast rehash trick: Because capacity is a power of 2, a node either stays at the exact same index (oldIdx) or moves to (oldIdx + oldCap), determined by testing a single bit (hash & oldCap == 0).`,
    interviewerCounterQuestions: [
      'Why is ConcurrentHashMap preferred over Collections.synchronizedMap(hashMap)? How did Java 8 remove Segment locks in ConcurrentHashMap?',
      'Why must hashCode() and equals() always be overridden together? What happens if you override equals() without hashCode()?'
    ],
    keyTakeaways: [
      'Index formula: (n - 1) & hash; capacity is strictly power of 2.',
      'Treeification occurs at threshold 8 (with capacity >= 64), converting O(N) list to O(log N) Red-Black Tree.',
      'High-bit XOR spreading prevents low-bit collision clustering.'
    ],
    pitfalls: [
      'Mutating an object after using it as a HashMap key: its hashCode changes, making the entry permanently unretrievable (memory leak).',
      'Using HashMap across concurrent threads, risking infinite CPU loops (Java 7 circular resize bug) or silent data corruption.'
    ],
    relatedCurriculumSlug: 'operating-system-concurrency-and-deadlock-prevention'
  },
  {
    id: 'java-02',
    category: 'Core Java & JVM Internals',
    categorySlug: 'java-jvm',
    title: 'Explain JVM Memory Model: Heap, Metaspace, Stack, PC Register, and Native Method Stack.',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'Heap stores objects and is shared across threads. Stack stores local primitive variables and frame pointers per thread. Metaspace stores class metadata in native off-heap memory.',
    deepAnswer: `The JVM divides memory into specific runtime data areas with different lifecycles.

1. Thread-Shared Memory Areas:
   - Heap:
     Shared across all threads. Stores all object instances and arrays. Managed automatically by Garbage Collectors.
     Subdivided into:
     - Young Generation: Eden space and two Survivor spaces (S0, S1).
     - Old (Tenured) Generation: Long-lived objects surviving threshold minor GC cycles.
   - Metaspace (Replaced PermGen in Java 8):
     Stores class metadata, bytecodes, constant pool, and method tables.
     Crucial Difference: Metaspace resides in Native OS Memory, not the JVM Heap! It expands dynamically up to available OS RAM unless bounded by -XX:MaxMetaspaceSize.

2. Thread-Private Memory Areas:
   - JVM Stack:
     Created per thread. Stores Stack Frames. Each frame contains Local Variables, Operand Stack, and Frame Data for a single executing method.
     When stack exceeds depth limit: java.lang.StackOverflowError.
   - Program Counter (PC) Register:
     Holds the memory address of the JVM bytecode instruction currently being executed by the thread.
   - Native Method Stack:
     Executes native C/C++ code via JNI (Java Native Interface).

3. String Constant Pool:
   - Stored in the JVM Heap (moved out of PermGen in Java 7).
   - String literals are automatically interned. Calling String.intern() places the string instance into the pool, reusing identical string references to save RAM.`,
    interviewerCounterQuestions: [
      'What triggers java.lang.OutOfMemoryError: Metaspace versus OOM: Java heap space?',
      'How does Escape Analysis in the JIT compiler allow scalar replacement and stack allocation for objects that do not escape method scope?'
    ],
    keyTakeaways: [
      'Heap is shared (objects); Stack is per-thread (primitives, frame pointers).',
      'Metaspace uses native OS RAM, eliminating PermGen fixed-size OOM errors.',
      'JIT escape analysis avoids heap allocation when objects do not escape local scope.'
    ],
    pitfalls: [
      'Creating dynamic class proxies or loading classes repeatedly without unloading, leaking native Metaspace memory.',
      'Assuming objects are always created on the heap: JIT scalar replacement breaks non-escaping objects into stack primitives.'
    ],
    relatedCurriculumSlug: 'operating-system-concurrency-and-deadlock-prevention'
  },
  {
    id: 'java-03',
    category: 'Core Java & JVM Internals',
    categorySlug: 'java-jvm',
    title: 'How do JVM Garbage Collectors work? Compare G1 GC, ZGC, and the Generational Hypothesis.',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'The Weak Generational Hypothesis states most objects die young. G1 partitions heap into regions and collects highest-garbage regions first. ZGC achieves sub-millisecond pauses using colored pointers and load barriers.',
    deepAnswer: `Garbage Collection (GC) automatically reclaims heap memory allocated to unreferenced objects.

1. The Weak Generational Hypothesis:
   Decades of empirical software metrics prove:
   - Most objects die shortly after creation (e.g., local variables in short-lived HTTP requests).
   - Objects that survive multiple GC cycles tend to persist for a very long time.
   - Hence: Partition heap into Young (Eden + Survivor) and Old generations. Minor GC rapidly collects Eden without scanning the massive Old generation.

2. G1 GC (Garbage-First - Default in Java 9+):
   - Abandons rigid contiguous memory regions. Divides heap into 2,048 equal-sized independent regions (1MB to 32MB).
   - Regions dynamically act as Eden, Survivor, or Old.
   - Pause Time Goal (-XX:MaxGCPauseMillis=200): G1 models throughput and pause times. It collects the regions containing the highest percentage of garbage first (hence "Garbage-First"), copying live objects into fresh regions to defragment memory.

3. ZGC (Z Garbage Collector - Production Standard for Low Latency):
   - Designed for massive heaps (16MB to 16 Terabytes) with ultra-low pause times: Stop-The-World (STW) pauses are guaranteed < 1 millisecond!
   - Key Innovations:
     a. Colored Pointers: Uses reference metadata bits directly inside the 64-bit object pointer (Marked0, Marked1, Remapped).
     b. Load Barriers: JIT injects a tiny check whenever application code reads an object reference. If the object was relocated during concurrent compaction, the load barrier detects the stale pointer and updates it on the fly (self-healing).
     c. Concurrent Phase: Marking, evacuation, and compaction happen 100% concurrently with live application threads.`,
    interviewerCounterQuestions: [
      'What is a Full GC and what causes it in G1 GC (Humongous Allocations / Concurrent Mode Failure)?',
      'What is the difference between ZGC and Shenandoah GC?'
    ],
    keyTakeaways: [
      'Generational hypothesis: separate young short-lived objects from old tenured objects.',
      'G1 collects highest-yield regions within a target pause time budget.',
      'ZGC uses colored pointers and load barriers for sub-millisecond pause times up to 16TB.'
    ],
    pitfalls: [
      'Allocating Humongous objects (>50% region size) in G1, causing fragmentation and triggering sudden Stop-The-World Full GCs.',
      'Blindly tuning JVM flags without capturing and analyzing GC logs via -Xlog:gc*.'
    ],
    relatedCurriculumSlug: 'operating-system-concurrency-and-deadlock-prevention'
  },
  {
    id: 'java-04',
    category: 'Core Java & JVM Internals',
    categorySlug: 'java-jvm',
    title: 'Explain volatile, synchronized, and Java Memory Model (JMM) Happens-Before Guarantee.',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'volatile guarantees visibility and prevents instruction reordering via CPU memory barriers, but does not guarantee atomicity. synchronized guarantees mutual exclusion, visibility, and atomicity via intrinsic monitor locks.',
    deepAnswer: `In multi-core CPUs, each core has private L1/L2 hardware caches. Without memory model guarantees, writes by Core 1 remain in its write buffer and are invisible to Core 2, or compilers reorder instructions for optimization.

1. Java Memory Model (JMM) & Happens-Before Guarantee:
   If Action A "happens-before" Action B, the memory effects of Action A are guaranteed to be fully visible to Action B.
   Key Happens-Before Rules:
   - Program Order Rule: Within a single thread, each action happens-before any subsequent action.
   - Monitor Lock Rule: An unlock on a monitor lock happens-before every subsequent lock on that same monitor.
   - Volatile Variable Rule: A write to a volatile variable happens-before every subsequent read of that same volatile variable.
   - Thread Start Rule: Thread.start() happens-before any action in the started thread.

2. The volatile Keyword:
   - Visibility: Forces reads and writes to bypass CPU registers/L1 cache and flush directly to main memory (or invalidate L1 cache line via MESI cache coherence protocol).
   - Ordering (Memory Barriers): Prevents compiler and CPU instruction reordering across the volatile boundary (LoadLoad, StoreStore, LoadStore, StoreLoad barriers).
   - NOT Atomic: volatile int count = 0; count++ is NOT thread-safe because count++ is 3 distinct operations (read, increment, write). For atomicity, use AtomicInteger (CAS) or synchronized.

3. The synchronized Keyword:
   - Acquires an object\'s intrinsic monitor lock (Monitorenter / Monitorexit bytecode).
   - Guarantees Mutual Exclusion (only 1 thread executes critical section), Visibility (flushes memory upon exit), and Atomicity.`,
    interviewerCounterQuestions: [
      'How does Double-Checked Locking work for Lazy Singleton initialization and why is the volatile keyword mandatory?',
      'How does Java JVM optimize synchronized via Biased Locking, Lightweight Locking (CAS), and Heavyweight OS Mutex escalation?'
    ],
    keyTakeaways: [
      'volatile = Visibility + Instruction Ordering (no atomicity).',
      'synchronized = Visibility + Ordering + Atomicity (via monitor locks).',
      'Happens-before guarantees visibility across CPU core cache lines.'
    ],
    pitfalls: [
      'Using volatile for compound operations like count++ or check-then-act, leading to lost updates.',
      'Implementing Double-Checked Locking without volatile: instruction reordering can publish a reference to a partially-constructed object!'
    ],
    relatedCurriculumSlug: 'operating-system-concurrency-and-deadlock-prevention'
  },
  {
    id: 'java-05',
    category: 'Core Java & JVM Internals',
    categorySlug: 'java-jvm',
    title: 'How does ConcurrentHashMap achieve thread safety in Java 8+ without segment locks?',
    difficulty: 'HARD',
    frequency: 'HIGH',
    shortSummary: 'Java 8 replaced Java 7 ReentrantLock Segment arrays with CAS (Compare-And-Swap) for empty bucket initialization and synchronized locking only on the first node of colliding buckets, allowing concurrent reads without locking.',
    deepAnswer: `ConcurrentHashMap provides high-concurrency thread-safe key-value operations without locking the entire map.

1. Java 7 Segment Architecture vs Java 8 Node Locking:
   - Java 7: Used an array of 16 Segment objects (each extending ReentrantLock). Operations locked only the target Segment, allowing concurrency level of 16.
   - Java 8: Completely removed Segments! Uses the same Node<K, V>[] table array as HashMap. Concurrency level scales dynamically with the number of table buckets!

2. Java 8 Concurrency Mechanics:
   - Reads (get()):
     Completely lock-free! Node values and next pointers are declared volatile. volatile reads guarantee visibility of the latest committed write without acquiring any locks.
   - Insertion (putVal()):
     1. Compute bucket index.
     2. If bucket is empty: Use CAS (Compare-And-Swap via Unsafe / VarHandle) to atomically place the new Node at index i. No lock acquired!
     3. If bucket is undergoing resize (hash == MOVED): Thread cooperates in transferring nodes (helpTransfer()).
     4. If bucket contains nodes (collision): Acquire synchronized ONLY on the first node of that single bucket (head of linked list / root of tree). Other buckets remain completely unobstructed!

3. Concurrent Rehashing:
   When resizing, multiple worker threads assist concurrently in transferring slices of buckets to the new table using ForwardingNodes.`,
    interviewerCounterQuestions: [
      'Why does ConcurrentHashMap NOT allow null keys or null values, whereas standard HashMap allows both?',
      'How does LongAdder differ from AtomicLong under extreme multi-threaded contention?'
    ],
    keyTakeaways: [
      'get() is 100% lock-free via volatile pointer reads.',
      'Empty bucket insert uses hardware CAS; collision insert locks only the bucket head node.',
      'Null keys/values are prohibited to eliminate ambiguity between missing keys and null values in concurrent environments.'
    ],
    pitfalls: [
      'Assuming compound operations on ConcurrentHashMap are atomic: map.put(k, map.get(k) + 1) is NOT atomic; use map.compute(k, (key, val) -> val + 1) instead.',
      'Trying to insert null keys or values, which immediately throws NullPointerException.'
    ],
    relatedCurriculumSlug: 'operating-system-concurrency-and-deadlock-prevention'
  },
  {
    id: 'java-06',
    category: 'Core Java & JVM Internals',
    categorySlug: 'java-jvm',
    title: 'What are Java 21 Virtual Threads (Project Loom) and how do they differ from OS Platform Threads?',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'Virtual threads are lightweight, user-mode threads managed by the JVM rather than the OS kernel. Millions can run concurrently with near-zero memory footprint by unmounting from carrier OS threads during blocking I/O.',
    deepAnswer: `Traditional Java concurrency relies on Platform Threads, which are 1:1 wrappers around OS kernel threads.

1. The Problem with Platform Threads:
   - High Memory Footprint: Each platform thread reserves ~1MB of stack memory. A server with 5,000 threads consumes 5GB of RAM just for thread stacks!
   - Context Switch Overhead: Switching between OS threads requires kernel transitions (Ring 3 -> Ring 0) and CPU cache invalidations.
   - Scalability Limit: Servers top out at ~5,000 to 10,000 threads before OS scheduler exhaustion, forcing developers into complex reactive asynchronous frameworks (WebFlux, RxJava).

2. Virtual Threads (Java 21 / Project Loom):
   - M:N Scheduling: Millions of Virtual Threads are mapped onto a small pool of ForkJoinPool Carrier OS Threads (typically matching CPU core count).
   - Memory Efficiency: A virtual thread stack begins at just a few hundred bytes in the JVM heap and grows/shrinks dynamically.
   - Non-Blocking Continuation:
     When a virtual thread executes a blocking operation (e.g., Socket read, JDBC database query, Thread.sleep()):
     a. The JVM unmounts the virtual thread from its Carrier OS thread.
     b. The virtual thread\'s stack frame is copied to the Java heap as a Continuation.
     c. The underlying Carrier OS thread is immediately free to execute other virtual threads!
     d. When the I/O event completes, the OS epoll wakes the JVM, which mounts the virtual thread onto any available carrier thread and resumes execution.

3. Impact:
   Developers can write straightforward, synchronous, thread-per-request blocking code that scales to millions of concurrent connections without reactive framework complexity!`,
    interviewerCounterQuestions: [
      'What is Thread Pinning in Virtual Threads and why does executing synchronized blocks or JNI calls prevent unmounting from carrier threads?',
      'Should you use thread pools (e.g., Executors.newFixedThreadPool) with Virtual Threads?'
    ],
    keyTakeaways: [
      'Platform threads: 1:1 with OS (~1MB stack); Virtual threads: M:N user-mode (~few hundred bytes).',
      'Blocking I/O unmounts virtual thread, freeing carrier thread for other tasks.',
      'Never pool virtual threads; spawn them on demand via Executors.newVirtualThreadPerTaskExecutor().'
    ],
    pitfalls: [
      'Pooling virtual threads: pooling defeats their lightweight on-demand design.',
      'Pinning carrier threads by holding synchronized locks during long blocking I/O calls (replace with ReentrantLock).'
    ],
    relatedCurriculumSlug: 'operating-system-concurrency-and-deadlock-prevention'
  },

  // ==========================================
  // PYTHON & ASYNCHRONOUS RUNTIMES (5 questions)
  // ==========================================
  {
    id: 'py-01',
    category: 'Python & Asynchronous Runtimes',
    categorySlug: 'python-concurrency',
    title: 'Explain Python\'s Global Interpreter Lock (GIL): Why does multi-threading NOT speed up CPU-bound tasks in CPython?',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'The GIL is a mutex protecting CPython memory management and reference counts from race conditions. It allows only one native thread to execute Python bytecode at a time, preventing multi-threaded CPU speedup.',
    deepAnswer: `CPython (the standard Python interpreter) uses reference counting for garbage collection.

1. Why the GIL Exists:
   - Every Python object has an ob_refcnt integer. If two threads modify an object concurrently, reference counting suffers race conditions leading to memory leaks or premature deallocation segfaults.
   - Rather than putting fine-grained locks on every individual object (which drastically slows down single-threaded performance), Guido van Rossum implemented the Global Interpreter Lock (GIL) - a single mutex locking the entire interpreter state.

2. Impact on Workloads:
   - CPU-Bound Tasks (e.g., matrix multiplication, image processing, cryptography):
     Adding threads does NOT utilize multiple CPU cores! Threads fight for the GIL, incurring OS context switch overhead and executing SLOWER than a single thread.
     Solution: Use multiprocessing (forks separate OS processes with independent GILs) or offload computation to native C/Rust extensions (NumPy, PyTorch) that release the GIL during heavy computation (Py_BEGIN_ALLOW_THREADS).
   - I/O-Bound Tasks (e.g., web scraping, database queries, file reads):
     Multi-threading is effective because CPython voluntarily releases the GIL whenever a thread blocks on an operating system syscall (socket.recv, file.read, time.sleep).`,
    interviewerCounterQuestions: [
      'What is PEP 703 (Free-threaded Python / No-GIL in Python 3.13+) and how does it replace the GIL with mimalloc and biased reference counting?',
      'How does multiprocessing exchange data between processes and what are the serialization (pickle) costs?'
    ],
    keyTakeaways: [
      'GIL protects CPython reference counting; only 1 thread executes Python bytecode at once.',
      'CPU-bound tasks require multiprocessing or native extensions; I/O-bound tasks release the GIL during syscalls.',
      'Python 3.13 introduces experimental free-threading (no-GIL).'
    ],
    pitfalls: [
      'Spawning 16 threading.Thread instances for CPU-intensive math expecting a 16x speedup.',
      'Passing huge data structures between multiprocessing processes without shared memory, choking on pickle serialization overhead.'
    ],
    relatedCurriculumSlug: 'linux-kernel-internals-syscalls-and-ipc'
  },
  {
    id: 'py-02',
    category: 'Python & Asynchronous Runtimes',
    categorySlug: 'python-concurrency',
    title: 'How does asyncio and the Event Loop work in Python? Compare Coroutines, Tasks, and Futures.',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'asyncio provides single-threaded cooperative multitasking via an event loop backed by OS selectors (epoll). Coroutines yield control to the loop at await points, allowing thousands of concurrent I/O operations without thread overhead.',
    deepAnswer: `Python\'s asyncio library implements cooperative asynchronous concurrency on top of an event loop.

1. The Event Loop:
   - A single-threaded infinite loop running on top of the OS I/O multiplexer (epoll on Linux, kqueue on macOS).
   - Maintains a queue of scheduled callbacks and monitors socket file descriptors for readiness.
   - When a task awaits a network call, the loop registers the socket with epoll and switches immediately to another ready task.

2. Coroutines, Tasks, and Futures:
   - Coroutine (async def func()):
     A generator-like function that can suspend and resume execution. Calling func() does NOT run it; it returns a Coroutine object. It must be awaited or scheduled.
   - Future:
     A low-level object representing an eventual result of an asynchronous operation (contains state: PENDING, FINISHED, CANCELLED).
   - Task (asyncio.create_task()):
     A subclass of Future that wraps a coroutine and schedules it immediately onto the event loop. This enables concurrent background execution!

3. Cooperative Multitasking Rule:
   Execution is cooperative: tasks yield CPU control ONLY when encountering an explicit 'await' on an asynchronous I/O primitive.
   If a coroutine executes a blocking synchronous call (e.g., time.sleep(5) or requests.get()), the entire event loop freezes, blocking all other concurrent users!`,
    interviewerCounterQuestions: [
      'How do you safely execute a blocking synchronous library inside an asyncio application without stalling the event loop?',
      'What is an Async Context Manager (async with) and Async Generator (async for)?'
    ],
    keyTakeaways: [
      'asyncio is single-threaded cooperative concurrency.',
      'create_task schedules coroutines concurrently onto the event loop.',
      'Blocking CPU or synchronous I/O freezes the entire event loop (use asyncio.to_thread).'
    ],
    pitfalls: [
      'Calling synchronous requests.get() inside an async def function instead of httpx or aiohttp.',
      'Forgetting to await a coroutine, resulting in RuntimeWarning: coroutine was never awaited.'
    ],
    relatedCurriculumSlug: 'linux-kernel-internals-syscalls-and-ipc'
  },
  {
    id: 'py-03',
    category: 'Python & Asynchronous Runtimes',
    categorySlug: 'python-concurrency',
    title: 'How do Python Generators and the yield keyword work? What are Generator Expressions and memory benefits?',
    difficulty: 'MEDIUM',
    frequency: 'HIGH',
    shortSummary: 'Generators produce values lazily on demand using the yield keyword, maintaining local stack frame state between calls. They reduce memory usage from O(N) to O(1) for processing massive streams.',
    deepAnswer: `In standard functions, return terminates the function and releases its stack frame. In generators, yield pauses the function and yields a value while preserving its complete execution state.

1. Mechanics of yield:
   - When a function contains the yield keyword, calling it returns a Generator Iterator object without executing the body.
   - When next(gen) is called:
     - The function executes until hitting yield value.
     - The value is emitted to the caller.
     - The generator pauses: local variables, instruction pointer, and evaluation stack remain frozen in a PyGenObject on the heap.
   - Subsequent next() calls resume execution right after the yield statement.
   - When execution finishes, it raises StopIteration.

2. Memory Efficiency (Streaming Data):
   - Consider reading a 50GB CSV file:
     - List comprehension: [line.split(',') for line in open('file.csv')] attempts to load all 50GB into RAM at once, triggering an OutOfMemory MemoryError crash.
     - Generator expression: (line.split(',') for line in open('file.csv')) streams 1 line at a time in O(1) RAM.

3. Two-Way Communication (Coroutines foundation):
   Generators support generator.send(val): callers can send values back into the generator, which becomes the evaluation result of the yield expression.`,
    interviewerCounterQuestions: [
      'What is the difference between yield and yield from in nested generators?',
      'How did yield from form the historical foundation for Python\'s async/await syntax?'
    ],
    keyTakeaways: [
      'yield freezes function frame state and emits values lazily.',
      'Generators stream infinite or massive datasets in O(1) memory.',
      'yield from delegates iteration directly to sub-generators.'
    ],
    pitfalls: [
      'Attempting to index or reuse a consumed generator: generators are single-pass iterables and cannot be rewound.',
      'Accidentally calling list(gen) on an infinite generator, causing an infinite loop and RAM exhaustion.'
    ],
    relatedCurriculumSlug: 'linux-kernel-internals-syscalls-and-ipc'
  },
  {
    id: 'py-04',
    category: 'Python & Asynchronous Runtimes',
    categorySlug: 'python-concurrency',
    title: 'How do Python Decorators work under the hood? Explain Closures and functools.wraps.',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'A decorator is a higher-order function that takes a function as input and returns an enhanced wrapper function via closures. functools.wraps preserves original function metadata (name, docstring).',
    deepAnswer: `Python functions are First-Class Objects: they can be assigned to variables, passed as arguments, and returned from other functions.

1. Decorator Syntax Equivalence:
   The @decorator syntax is purely syntactic sugar:
   @my_decorator
   def greet(): pass
   is 100% equivalent to:
   greet = my_decorator(greet)

2. Closures:
   A closure is an inner function that retains access to variables from its enclosing lexical scope even after the outer function has finished executing:
   def timing_decorator(func):
       @functools.wraps(func)
       def wrapper(*args, **kwargs):
           start = time.perf_counter()
           result = func(*args, **kwargs)
           print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")
           return result
       return wrapper

3. Why functools.wraps is Mandatory:
   When a function is decorated, the original function is replaced by wrapper.
   Without @functools.wraps(func), greet.__name__ becomes "wrapper" and greet.__doc__ is erased!
   This breaks reflection, debugging tools, API documentation generators (FastAPI/Sphinx), and unit testing frameworks. @functools.wraps copies the __name__, __doc__, and __module__ metadata back onto the wrapper.`,
    interviewerCounterQuestions: [
      'How do you write a decorator that accepts custom configuration arguments (e.g., @rate_limit(max_per_sec=5))?',
      'How can classes act as decorators using __call__?'
    ],
    keyTakeaways: [
      '@decorator is syntactic sugar for func = decorator(func).',
      'Closures capture free variables from enclosing scopes.',
      'Always use @functools.wraps(func) to preserve function metadata.'
    ],
    pitfalls: [
      'Omitting *args and **kwargs in the wrapper, preventing the decorator from wrapping functions with parameters.',
      'Decorating without functools.wraps, causing subtle debugging issues in logging and documentation.'
    ],
    relatedCurriculumSlug: 'linux-kernel-internals-syscalls-and-ipc'
  },
  {
    id: 'py-05',
    category: 'Python & Asynchronous Runtimes',
    categorySlug: 'python-concurrency',
    title: 'Explain Python\'s Method Resolution Order (MRO) and the C3 Linearization Algorithm in Multiple Inheritance.',
    difficulty: 'HARD',
    frequency: 'MEDIUM',
    shortSummary: 'MRO determines the method search order in inheritance hierarchies. Python uses the C3 Linearization algorithm to enforce monotonicity and preserve local precedence order, accessible via Class.__mro__.',
    deepAnswer: `In languages supporting Multiple Inheritance, the "Diamond Problem" (Class D inherits from B and C, which both inherit from A) creates ambiguity: which superclass method should be called first?

1. The C3 Linearization Algorithm:
   Introduced in Python 2.3, C3 Linearization satisfies 3 fundamental properties:
   - Consistent local precedence order: If class D inherits from (B, C), B must appear before C in the MRO.
   - Monotonicity: If class B appears before class A in any parent\'s MRO, B must appear before A in all subclasses.
   - Preserves Single-Inheritance equivalence: Standard single inheritance order is always preserved.

2. C3 Linearization Merge Formula:
   L[C(B1 ... BN)] = C + merge(L[B1], ..., L[BN], B1 ... BN)
   The merge algorithm scans the heads of the lists. It selects the first head that does NOT appear in the tail (any position other than the first) of any other list.

3. The super() Function:
   super() does NOT simply call the immediate parent! It searches the next class in the runtime MRO sequence of the calling instance:
   Class.mro() returns the complete resolved linear lookup chain.
   If a valid MRO cannot be constructed without violating monotonicity, Python immediately raises TypeError: Cannot create a consistent method resolution order.`,
    interviewerCounterQuestions: [
      'What happens if you define class Child(ParentA, ParentB) where ParentA inherits from ParentB?',
      'Why is cooperative multiple inheritance with super() crucial for mixin architectures?'
    ],
    keyTakeaways: [
      'C3 Linearization guarantees monotonicity in multiple inheritance.',
      'super() follows the runtime MRO chain, not just the immediate parent.',
      'View resolved MRO via Class.__mro__.'
    ],
    pitfalls: [
      'Calling Parent.__init__(self) directly instead of super().__init__() in multiple inheritance, breaking diamond resolution.',
      'Creating cyclical or contradictory inheritance lists, causing TypeError at import time.'
    ],
    relatedCurriculumSlug: 'operating-system-concurrency-and-deadlock-prevention'
  },

  // ==========================================
  // CLOUD ARCHITECTURE & DEVOPS (5 questions)
  // ==========================================
  {
    id: 'cloud-01',
    category: 'Cloud Architecture & DevOps',
    categorySlug: 'cloud-devops',
    title: 'How does the Kubernetes Control Plane schedule Pods? Explain kube-apiserver, etcd, kube-scheduler, and Controller Manager.',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'The control plane maintains cluster state. kube-scheduler runs filtering (predicates) and scoring (priorities) to select optimal nodes. etcd provides Raft-replicated consistency; apiserver is the single stateless gateway.',
    deepAnswer: `Kubernetes orchestrates containerized workloads across node clusters using a declarative control plane.

1. Control Plane Components:
   - kube-apiserver: The stateless REST gateway. Validates and configures API objects (Pods, Services, Deployments). All other components communicate exclusively through apiserver; no component touches etcd directly.
   - etcd: Distributed consistent key-value store using Raft consensus. Stores the complete source-of-truth cluster state and configuration. Uses watch streams to notify apiserver of changes.
   - kube-scheduler: Watches for newly created Pods with no assigned node (nodeName is empty) and selects the best worker node.
   - kube-controller-manager: Runs continuous control loops (Deployment controller, ReplicaSet controller, Node controller) that compare actual cluster state against desired declarative state and drive convergence.

2. Pod Scheduling Phases:
   When a Pod is submitted:
   - Phase 1: Filtering (Predicates)
     Eliminates nodes that cannot run the Pod based on:
     - Resource limits (sufficient CPU/RAM allocatable).
     - Node selectors and Affinity/Anti-Affinity rules.
     - Taints and Tolerations (e.g., node-role.kubernetes.io/master:NoSchedule).
     - Port conflicts (hostPort).
   - Phase 2: Scoring (Priorities)
     Ranks remaining eligible nodes on a 0-100 score:
     - LeastRequestedPriority (favors nodes with lowest resource utilization to balance load) or MostAllocatedPriority (packs nodes tightly for autoscaling).
     - ImageLocalityPriority (favors nodes that already cached the container image).
     - Inter-pod affinity/anti-affinity weights.
   - Phase 3: Binding
     Writes the chosen node assignment to etcd via apiserver. The target node\'s kubelet detects the binding and invokes the container runtime (CRI) to spawn containers.`,
    interviewerCounterQuestions: [
      'What happens if the etcd cluster loses quorum (e.g., 2 out of 3 etcd nodes fail)? Do running container workloads crash?',
      'How does the Horizontal Pod Autoscaler (HPA) coordinate with Cluster Autoscaler to scale workloads and infrastructure?'
    ],
    keyTakeaways: [
      'Only apiserver speaks to etcd; all other components talk to apiserver.',
      'Scheduler uses 2 phases: Filtering (predicates) then Scoring (priorities).',
      'Loss of etcd quorum halts new deployments and scheduling, but running pods continue executing undisturbed.'
    ],
    pitfalls: [
      'Deploying an even number of etcd nodes (e.g., 4 or 6), which increases failure risk without improving quorum tolerance.',
      'Omitting Pod resource requests, causing the scheduler to treat workloads as 0-cost and overcommit nodes to failure.'
    ],
    relatedCurriculumSlug: 'kubernetes-control-plane-and-scheduling-algorithms'
  },
  {
    id: 'cloud-02',
    category: 'Cloud Architecture & DevOps',
    categorySlug: 'cloud-devops',
    title: 'How do Linux Namespaces, cgroups, and OverlayFS create Container Isolation in Docker/containerd?',
    difficulty: 'HARD',
    frequency: 'VERY HIGH',
    shortSummary: 'Containers are regular Linux processes isolated by Linux Namespaces (what you can SEE), restricted by cgroups (what you can USE), and backed by OverlayFS layered file storage.',
    deepAnswer: `There is no such thing as a "container" hardware construct in the Linux kernel. A container is a standard Linux process isolated using three kernel features:

1. Linux Namespaces (What a process can SEE):
   Virtualizes system resources so a container process believes it has its own dedicated OS:
   - PID Namespace: Process tree isolation. The container process is PID 1 inside, while having a normal PID (e.g., PID 14820) on the host.
   - NET Namespace: Dedicated network interfaces, loopback, IP addresses, and iptables routing tables.
   - MNT (Mount) Namespace: Isolated filesystem root (chroot on steroids).
   - IPC Namespace: Isolates shared memory and message queues.
   - UTS Namespace: Dedicated hostname and domain name.
   - USER Namespace: Maps root (UID 0) inside container to an unprivileged user (UID 10001) on the host.

2. Control Groups - cgroups v1 / v2 (What a process can USE):
   Restricts, accounts for, and isolates physical hardware resources:
   - CPU: CPU shares and CFS (Completely Fair Scheduler) quotas (e.g., limit process to 1.5 CPU cores).
   - Memory: Enforces hard limits (memory.max). If process exceeds limit, the kernel OOM Killer immediately kills the process (Exit Code 137).
   - Block I/O: Throttles disk read/write bandwidth and IOPS.

3. OverlayFS (Layered Storage Driver):
   - Combines multiple directories into a single unified mount:
     - LowerDir (Read-Only): Immutable Docker image layers.
     - UpperDir (Read-Write): Ephemeral container read-write layer.
     - MergedDir: The unified view presented to the container.
   - Copy-on-Write (CoW): When a container modifies an image file, the file is copied up from LowerDir to UpperDir before mutation, keeping base images 100% immutable and shared across containers.`,
    interviewerCounterQuestions: [
      'Why is running a container as root (without user namespaces) dangerous on a multi-tenant host?',
      'How does cgroups v2 improve memory pressure handling over cgroups v1?'
    ],
    keyTakeaways: [
      'Namespaces isolate visibility; cgroups enforce resource limits; OverlayFS provides layered CoW storage.',
      'Container processes run directly on the host kernel with zero hypervisor virtualization overhead.',
      'Exit code 137 indicates the kernel cgroups OOM killer terminated the container.'
    ],
    pitfalls: [
      'Running containers with --privileged flag, which disables namespace isolation and grants full host device access.',
      'Ignoring JVM cgroups awareness on older Java versions, causing JVM to allocate heap based on host RAM instead of container limits.'
    ],
    relatedCurriculumSlug: 'container-internals-namespaces-cgroups-and-overlayfs'
  },
  {
    id: 'cloud-03',
    category: 'Cloud Architecture & DevOps',
    categorySlug: 'cloud-devops',
    title: 'What is Zero Trust Architecture (ZTA) and how does Mutual TLS (mTLS) provide workload identity?',
    difficulty: 'HARD',
    frequency: 'HIGH',
    shortSummary: 'Zero Trust replaces perimeter-based security with "never trust, always verify". Every service request is authenticated, authorized, and encrypted using cryptographic workload identities via mTLS.',
    deepAnswer: `Traditional corporate security used perimeter defense ("Castle-and-Moat"): anything inside the corporate VPN was trusted, and anything outside was untrusted. Once an attacker breached the perimeter, they moved laterally across internal networks unrestricted.

1. Zero Trust Architecture (NIST SP 800-207):
   - Core Tenet: "Never Trust, Always Verify."
   - Assume network is hostile and already compromised.
   - Enforce least-privilege access, continuous authentication, and micro-segmentation for EVERY individual API request.

2. Workload Identity & SPIFFE/SPIRE:
   - In dynamic cloud environments, IP addresses are ephemeral. Workload identity is defined by cryptographically verifiable SPIFFE IDs (e.g., "spiffe://prod.cluster/ns/payments/sa/payment-service").
   - SPIRE issues short-lived X.509 SVID certificates to workloads.

3. Mutual TLS (mTLS) in Service Meshes (Istio, Linkerd):
   - Standard TLS authenticates ONLY the server to the client.
   - In mTLS:
     - The client verifies the server certificate against a shared Root CA.
     - The server ALSO demands and verifies the client certificate!
   - Benefits:
     a. End-to-End Encryption: Prevents packet sniffing on intermediate cloud networks.
     b. Cryptographic Workload Identity: The server inspects the client certificate SAN (Subject Alternative Name) to verify the calling service identity.
     c. Granular Authorization Policies: Envoy sidecar enforces L7 RBAC rules (e.g., only "service:frontend" can call "POST /checkout", while rejecting all other callers).`,
    interviewerCounterQuestions: [
      'How does OpenID Connect (OIDC) token exchange allow GitHub Actions or GitLab CI to deploy to cloud providers without storing long-lived static secrets?',
      'What is the latency and CPU overhead of mTLS sidecar proxies across high-frequency microservice meshes?'
    ],
    keyTakeaways: [
      'Zero trust assumes the network is compromised; verify every request.',
      'mTLS authenticates both client and server via X.509 certificates.',
      'OIDC federated identity eliminates static cloud credentials in CI/CD.'
    ],
    pitfalls: [
      'Storing static cloud IAM secret keys in CI/CD repository settings instead of using OIDC workload identity federation.',
      'Enabling mTLS in permissive mode without enforcing strict authorization policies, allowing unauthorized internal callers.'
    ],
    relatedCurriculumSlug: 'cloud-security-iam-and-zero-trust-architecture'
  },
  {
    id: 'cloud-04',
    category: 'Cloud Architecture & DevOps',
    categorySlug: 'cloud-devops',
    title: 'Explain Site Reliability Engineering (SRE) Principles: SLI, SLO, SLA, and Error Budgets.',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'SLI measures actual performance; SLO sets target reliability; SLA is the contractual commitment with penalties. Error Budget is (100% - SLO), defining the allowed rate of innovation versus stabilization.',
    deepAnswer: `SRE applies software engineering principles to operations and reliability management.

1. Definitions and Hierarchy:
   - SLI (Service Level Indicator):
     A quantifiable metric measuring actual service behavior in production:
     SLI = (Good Events / Total Valid Events) * 100%
     Example: "Percentage of HTTP GET /api requests returning < 500 status with latency < 200ms."

   - SLO (Service Level Objective):
     The target reliability agreed upon internally between engineering, product, and business:
     Example: "99.9% of requests must meet the SLI over a rolling 30-day window."

   - SLA (Service Level Agreement):
     The formal legal contract with customers specifying penalties (refunds, service credits) if reliability drops below a lower threshold:
     Example: "99.0% availability; 10% credit if violated."
     Rule: SLO is always stricter than SLA (SLO > SLA) to detect and fix regressions before incurring business penalties.

2. The Error Budget:
   - Formula: Error Budget = 100% - SLO.
   - For a 99.9% SLO, the Error Budget is 0.1% of requests or ~43.8 minutes of downtime per month.
   - Balance of Innovation and Stability:
     - When Error Budget is healthy (>50% remaining): Developers are encouraged to push features rapidly, experiment, and accept calculated risks.
     - When Error Budget is exhausted (<0% remaining): Feature deployments are halted! All engineering efforts redirect to reliability, bug fixes, automated testing, and resilience engineering.`,
    interviewerCounterQuestions: [
      'What are Burn Rate Alerts in SRE and why are they superior to static threshold alerts?',
      'Why is 100% uptime the wrong reliability target for software systems?'
    ],
    keyTakeaways: [
      'SLI = What you measure; SLO = Internal target; SLA = Contractual commitment.',
      'Error Budget (1 - SLO) aligns product velocity with platform reliability.',
      '100% reliability is economically unjustified and stifles product velocity.'
    ],
    pitfalls: [
      'Treating 100% availability as an SLO: users cannot perceive reliability higher than their local ISP/cellular network.',
      'Creating hundreds of vanity SLIs instead of focusing on the 4 Golden Signals (Latency, Traffic, Errors, Saturation).'
    ],
    relatedCurriculumSlug: 'site-reliability-engineering-slos-and-incident-management'
  },
  {
    id: 'cloud-05',
    category: 'Cloud Architecture & DevOps',
    categorySlug: 'cloud-devops',
    title: 'Compare Blue-Green, Canary, and Rolling Deployment Strategies: How does GitOps (ArgoCD/Flux) automate reconciliation?',
    difficulty: 'MEDIUM',
    frequency: 'VERY HIGH',
    shortSummary: 'Blue-Green switches 100% traffic between identical environments. Canary routes a small percentage of real traffic to test stability. GitOps uses Git as the single source of truth with automated drift reconciliation.',
    deepAnswer: `Deploying production updates with zero downtime is central to modern DevOps.

1. Deployment Strategies:
   - Rolling Deployment:
     Default in Kubernetes. Gradually replaces old Pods with new Pods one by one.
     - Pro: Zero additional infrastructure cost.
     - Con: Old and new versions run simultaneously in production (requires backwards-compatible APIs and database schemas); rollback requires re-rolling.

   - Blue-Green Deployment:
     Maintains two identical production environments: "Blue" (active live traffic) and "Green" (idle staging).
     - Deploy new release to Green, run integration tests.
     - Switch load balancer / router router to Green in 1 millisecond.
     - Pro: Instant instantaneous cutover; instant rollback by switching router back to Blue.
     - Con: 2x infrastructure cost; stateful databases require careful shared migration.

   - Canary Deployment:
     Routes a tiny fraction of live user traffic (e.g., 2% -> 10% -> 50% -> 100%) to the new version.
     - Monitored by automated metrics analysis (Prometheus error rates, latency).
     - If metrics degrade, rollback is triggered automatically before the majority of users are impacted.

2. GitOps (ArgoCD / Flux):
   - Principle: Git repository is the single declarative source of truth for all infrastructure and application manifests.
   - Pull-Based Controller:
     An in-cluster agent (e.g., ArgoCD) continuously monitors both the Git repository and the live cluster state.
   - Automated Drift Detection:
     If someone manually tampers with cluster state (e.g., kubectl edit), the GitOps operator detects the configuration drift and automatically reverts the cluster to match Git.
   - Security: No external CI server requires administrative credentials to access the production Kubernetes API.`,
    interviewerCounterQuestions: [
      'How do you manage database schema migrations during Canary or Blue-Green deployments (Expand/Contract pattern)?',
      'What is Progressive Delivery and how does Flagger or Argo Rollouts automate Canary traffic shifting via Service Mesh?'
    ],
    keyTakeaways: [
      'Blue-Green = instant cutover and instant rollback (2x cost).',
      'Canary = incremental risk validation on real users.',
      'GitOps makes Git the single source of truth with automated drift reconciliation.'
    ],
    pitfalls: [
      'Executing breaking database schema changes during rolling or canary deployments, breaking old pods that are still serving live traffic.',
      'Push-based CI/CD exposing root Kubernetes cluster credentials in CI runner environments.'
    ],
    relatedCurriculumSlug: 'ci-cd-security-supply-chain-and-gitops-workflows'
  }
];

export function getInterviewQuestions(categorySlug?: string, searchQuery?: string): InterviewQAItem[] {
  return INTERVIEW_QUESTIONS.filter((q) => {
    const matchesCat = !categorySlug || categorySlug === 'all' || q.categorySlug === categorySlug;
    const matchesQuery = !searchQuery ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.shortSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });
}

export function getInterviewQuestionById(id: string): InterviewQAItem | undefined {
  return INTERVIEW_QUESTIONS.find((q) => q.id === id);
}
