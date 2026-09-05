export interface SocraticRemediationResult {
  misconception: string;
  recruiterTrap: string;
  socraticHint: string;
  conceptualRule: string;
  targetCompetency: {
    topicId: string;
    topicName: string;
    subjectName: string;
  };
  similarDrillAvailable: boolean;
}

export interface RoleTrapItem {
  id: string;
  roleSlug: string;
  title: string;
  topicName: string;
  trapDescription: string;
  antiPatternExample: string;
  correctPatternExample: string;
  interviewTip: string;
}

export interface DrillQuestionOption {
  id: string;
  questionId: string;
  body: string;
  orderIndex: number;
}

export interface DrillQuestion {
  id: string;
  topicId: string;
  body: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: DrillQuestionOption[];
}

import { apiUrl } from './env';
import { FALLBACK_TOPIC_QUESTIONS } from './catalog-fallbacks';
import { DEFAULT_ROLES_CATALOG } from './catalog-data';

export const FALLBACK_ROLE_TRAPS: Record<string, RoleTrapItem[]> = {
  'cloud-devops': [
    {
      id: 'trap_devops_1',
      roleSlug: 'devops-engineer',
      title: 'Missing Readiness Probe Grace Periods',
      topicName: 'Kubernetes & Containers',
      trapDescription:
        'Candidates often confuse liveness probes with readiness probes, leading to cascading pod restart loops before initialization scripts complete.',
      antiPatternExample:
        'livenessProbe: { httpGet: { path: "/health", port: 8080 }, initialDelaySeconds: 1 }',
      correctPatternExample:
        'readinessProbe: { initialDelaySeconds: 15, periodSeconds: 5 } with appropriate startupProbe',
      interviewTip:
        'Always explain the distinct lifecycle purposes: liveness recovers hung processes, readiness buffers traffic during warm-up.',
    },
    {
      id: 'trap_devops_2',
      roleSlug: 'devops-engineer',
      title: 'Unchecked Concurrency in CI Pipeline Artifacts',
      topicName: 'CI/CD Pipelines',
      trapDescription:
        'Multiple concurrent workflow runs overwriting identical shared tag versions or storage buckets without transactional locking.',
      antiPatternExample:
        'docker push my-registry/app:latest without immutable SHA tags',
      correctPatternExample:
        'docker push my-registry/app:$GITHUB_SHA with commit-anchored artifact manifests',
      interviewTip:
        'Recruiters check if you understand build reproducibility and rollback determinism.',
    },
  ],
  'devops-engineer': [
    {
      id: 'trap_devops_1',
      roleSlug: 'devops-engineer',
      title: 'Missing Readiness Probe Grace Periods',
      topicName: 'Kubernetes & Containers',
      trapDescription:
        'Candidates often confuse liveness probes with readiness probes, leading to cascading pod restart loops before initialization scripts complete.',
      antiPatternExample:
        'livenessProbe: { httpGet: { path: "/health", port: 8080 }, initialDelaySeconds: 1 }',
      correctPatternExample:
        'readinessProbe: { initialDelaySeconds: 15, periodSeconds: 5 } with appropriate startupProbe',
      interviewTip:
        'Always explain the distinct lifecycle purposes: liveness recovers hung processes, readiness buffers traffic during warm-up.',
    },
    {
      id: 'trap_devops_2',
      roleSlug: 'devops-engineer',
      title: 'Unchecked Concurrency in CI Pipeline Artifacts',
      topicName: 'CI/CD Pipelines',
      trapDescription:
        'Multiple concurrent workflow runs overwriting identical shared tag versions or storage buckets without transactional locking.',
      antiPatternExample:
        'docker push my-registry/app:latest without immutable SHA tags',
      correctPatternExample:
        'docker push my-registry/app:$GITHUB_SHA with commit-anchored artifact manifests',
      interviewTip:
        'Recruiters check if you understand build reproducibility and rollback determinism.',
    },
  ],
  'java-backend-developer': [
    {
      id: 'trap_java_1',
      roleSlug: 'java-backend-developer',
      title: 'String Concatenation in High-Throughput Loops',
      topicName: 'Data Structures & Algorithms',
      trapDescription:
        'Using operator `+` inside large loops generates thousands of ephemeral `StringBuilder` instances, generating GC allocation spikes.',
      antiPatternExample:
        'String s = ""; for (String item : items) { s += item; }',
      correctPatternExample:
        'StringBuilder sb = new StringBuilder(estimatedSize); for (String item : items) { sb.append(item); }',
      interviewTip:
        'Highlight heap allocation overhead, GC pressure, and memory cache line locality.',
    },
    {
      id: 'trap_java_2',
      roleSlug: 'java-backend-developer',
      title: 'Broken equals() and hashCode() Symmetry',
      topicName: 'Computer Fundamentals',
      trapDescription:
        'Overriding `equals` without overriding `hashCode`, resulting in phantom lookups and memory leaks in `HashMap` and `HashSet`.',
      antiPatternExample:
        'public boolean equals(Object o) { ... } // without hashCode()',
      correctPatternExample:
        'Consistently override both using Objects.hash(id, ...) with immutable identity keys',
      interviewTip:
        'Recruiters use this to test core JVM collections memory contracts.',
    },
  ],
  'java-backend': [
    {
      id: 'trap_java_1',
      roleSlug: 'java-backend-developer',
      title: 'String Concatenation in High-Throughput Loops',
      topicName: 'Data Structures & Algorithms',
      trapDescription:
        'Using operator `+` inside large loops generates thousands of ephemeral `StringBuilder` instances, generating GC allocation spikes.',
      antiPatternExample:
        'String s = ""; for (String item : items) { s += item; }',
      correctPatternExample:
        'StringBuilder sb = new StringBuilder(estimatedSize); for (String item : items) { sb.append(item); }',
      interviewTip:
        'Highlight heap allocation overhead, GC pressure, and memory cache line locality.',
    },
  ],
  'cloud-solutions-architect': [
    {
      id: 'trap_cloud_1',
      roleSlug: 'cloud-solutions-architect',
      title: 'Confusing Public Subnets with Internet Gateway Association',
      topicName: 'Cloud & Infrastructure Engineering',
      trapDescription:
        'Believing assigning a public IP to a virtual server instance automatically provides internet egress/ingress without an Internet Gateway attached and explicitly routed in the subnet route table.',
      antiPatternExample:
        'Deploying a virtual machine with auto-assigned public IP in a subnet routed only to local target 10.0.0.0/16',
      correctPatternExample:
        'Attach an Internet Gateway to the VPC and add route destination 0.0.0.0/0 -> igw-gateway in the subnet route table',
      interviewTip:
        'Diagram the packet path: Public IP -> Subnet Route Table -> Gateway -> External Internet.',
    },
    {
      id: 'trap_cloud_2',
      roleSlug: 'cloud-solutions-architect',
      title: 'Hardcoding Static IAM Credentials in Cloud Workloads',
      topicName: 'Cloud & Infrastructure Engineering',
      trapDescription:
        'Passing long-lived static API access keys in environment variables or code instead of attaching instance roles with short-lived STS tokens.',
      antiPatternExample:
        'STATIC_ACCESS_KEY="KEY123..." STATIC_SECRET_KEY="..." hardcoded in app environment files',
      correctPatternExample:
        'Attach IAM Roles with temporary, auto-rotated instance metadata service credentials and dedicated secret managers',
      interviewTip:
        'Always advocate for short-lived metadata tokens and centralized secret stores with automated rotation.',
    },
    {
      id: 'trap_cloud_3',
      roleSlug: 'cloud-solutions-architect',
      title: 'Neglecting Network Security Group Priority Rules Ordering',
      topicName: 'Cloud & Infrastructure Engineering',
      trapDescription:
        'Creating a Deny rule with lower evaluation priority expecting it to override an earlier permissive Allow rule.',
      antiPatternExample:
        'Priority 100: Allow All 443; Priority 500: Deny Specific IP on 443 (higher numerical priority is evaluated later)',
      correctPatternExample:
        'Assign specific Deny rules a lower priority integer (e.g. 100) before broader Allow rules (e.g. 200)',
      interviewTip:
        'Remind interviewers that in cloud firewall NSGs, the lowest numerical priority rule takes precedence upon first match.',
    },
  ],
  'python-developer': [
    {
      id: 'trap_py_1',
      roleSlug: 'python-developer',
      title: 'Mutable Default Arguments in Function Definitions',
      topicName: 'Enterprise Software Development',
      trapDescription:
        'Using `def fn(items=[])` creates a single shared list instance evaluated at import time, persisting state across invocations.',
      antiPatternExample:
        'def add_task(task, task_list=[]): task_list.append(task); return task_list',
      correctPatternExample:
        'def add_task(task, task_list=None): if task_list is None: task_list = []; task_list.append(task)',
      interviewTip:
        'Explain that default arguments are bound when the function definition is executed, not at runtime call.',
    },
    {
      id: 'trap_py_2',
      roleSlug: 'python-developer',
      title: 'Unnecessary Eager Evaluation in Large Iterables',
      topicName: 'Enterprise Software Development',
      trapDescription:
        'Loading millions of records into memory with list comprehensions instead of streaming with generators.',
      antiPatternExample:
        '[process(record) for record in fetch_large_dataset()]',
      correctPatternExample:
        '(process(record) for record in fetch_large_dataset()) or yield within a generator',
      interviewTip:
        'Highlight memory complexity reduction from O(n) heap allocation to O(1) streaming.',
    },
  ],
  'fullstack-javascript-developer': [
    {
      id: 'trap_fs_1',
      roleSlug: 'fullstack-javascript-developer',
      title: 'Blocking Event Loop with Heavy Synchronous Computation',
      topicName: 'Enterprise Software Development',
      trapDescription:
        'Executing CPU-intensive JSON parsing or cryptographic hashing on the single Node.js main thread, freezing all concurrent requests.',
      antiPatternExample:
        'crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512")',
      correctPatternExample:
        'crypto.pbkdf2(..., callback) or offload heavy tasks to Worker Threads (worker_threads)',
      interviewTip:
        'Interviewers look for understanding of the Node.js libuv threadpool versus the main event loop.',
    },
  ],
  'data-analyst': [
    {
      id: 'trap_data_1',
      roleSlug: 'data-analyst',
      title: 'NULL Propagation in NOT IN Subqueries',
      topicName: 'Database Management Systems',
      trapDescription:
        'Using `WHERE id NOT IN (SELECT id FROM t)` returns 0 rows if any row in the subquery has `id IS NULL`.',
      antiPatternExample:
        'SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders);',
      correctPatternExample:
        'SELECT * FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);',
      interviewTip:
        'Explain three-valued SQL logic (TRUE, FALSE, UNKNOWN). When compared to NULL, NOT IN evaluates to UNKNOWN, filtering out all rows.',
    },
    {
      id: 'trap_data_2',
      roleSlug: 'data-analyst',
      title: 'Cartesian Products in Multi-Condition JOINs',
      topicName: 'Database Management Systems',
      trapDescription:
        'Joining on non-unique foreign keys without composite constraint produces exponential duplicate rows, corrupting aggregate sums.',
      antiPatternExample:
        'FROM sales s JOIN discounts d ON s.category = d.category',
      correctPatternExample:
        'Join on full primary key composite `(category, tier, valid_date)` or pre-aggregate discounts table',
      interviewTip:
        'Always check row cardinality before and after a JOIN in technical interview whiteboards.',
    },
  ],
  'crm-specialist': [
    {
      id: 'trap_crm_1',
      roleSlug: 'crm-specialist',
      title: 'DML or SOQL Inside Loops (Governor Limit Violations)',
      topicName: 'Enterprise Databases & Workflows',
      trapDescription:
        'Querying or updating records inside a `for` loop, which rapidly breaches platform API limits in bulk batch executions.',
      antiPatternExample:
        'for (Account a : accounts) { update a; }',
      correctPatternExample:
        'List<Account> toUpdate = new List<Account>(); for (Account a : accounts) { toUpdate.add(a); } update toUpdate;',
      interviewTip:
        'Emphasize the concept of "bulkification" for enterprise CRM platforms where triggers handle up to 200 records.',
    },
  ],
  'data-engineer': [
    {
      id: 'trap_deng_1',
      roleSlug: 'data-engineer',
      title: 'Spark Wide Transformations Causing Out-Of-Memory Shuffles',
      topicName: 'Enterprise Databases & Workflows',
      trapDescription:
        'Using `groupByKey()` which collects all values for a key into worker memory, causing OutOfMemoryError on skewed datasets.',
      antiPatternExample:
        'rdd.groupByKey().mapValues(lambda vals: sum(vals))',
      correctPatternExample:
        'rdd.reduceByKey(lambda a, b: a + b) or Spark SQL aggregations with broadcast joins',
      interviewTip:
        'Explain map-side combine: `reduceByKey` aggregates locally before network shuffle, minimizing traffic.',
    },
  ],
  'ml-ai-engineer': [
    {
      id: 'trap_ml_1',
      roleSlug: 'ml-ai-engineer',
      title: 'Data Leakage During Feature Scaling',
      topicName: 'Enterprise Software Development',
      trapDescription:
        'Fitting the scaler or normalizer on the entire dataset before splitting into train and test sets, leaking test set distribution statistics.',
      antiPatternExample:
        'scaler.fit(X); X_train, X_test = train_test_split(X)',
      correctPatternExample:
        'X_train, X_test = train_test_split(X); scaler.fit(X_train); X_train_s = scaler.transform(X_train); X_test_s = scaler.transform(X_test)',
      interviewTip:
        'Stress that test data must remain strictly unseen; all preprocessing transformers must fit solely on train splits.',
    },
  ],
  'cybersecurity-specialist': [
    {
      id: 'trap_sec_1',
      roleSlug: 'cybersecurity-specialist',
      title: 'Confusing Authentication (AuthN) with Authorization (AuthZ)',
      topicName: 'Cloud & Infrastructure Engineering',
      trapDescription:
        'Verifying that a JWT is valid and issued by the IdP, but failing to verify that the requesting subject has permission to access the target object (IDOR vulnerability).',
      antiPatternExample:
        'if (jwt.isValid()) return db.getAccount(req.params.id);',
      correctPatternExample:
        'if (jwt.isValid() && (jwt.sub === req.params.userId || jwt.roles.includes("admin"))) return db.getAccount(req.params.id);',
      interviewTip:
        'Reference OWASP Top 10 Broken Object Level Authorization (BOLA/IDOR) as a primary attack vector.',
    },
  ],
  'qa-automation-engineer': [
    {
      id: 'trap_qa_1',
      roleSlug: 'qa-automation-engineer',
      title: 'Hardcoded Sleep Delays Leading to Flaky & Slow Test Suites',
      topicName: 'Enterprise Software Development',
      trapDescription:
        'Placing `Thread.sleep(5000)` or `time.sleep(5)` to wait for asynchronous UI components to render in browser automation.',
      antiPatternExample:
        'page.click("#submit"); Thread.sleep(5000); expect(page.locator(".success")).toBeVisible();',
      correctPatternExample:
        'await expect(page.locator(".success")).toBeVisible({ timeout: 10000 }) with auto-waiting locators',
      interviewTip:
        'Modern automation relies on web-first conditional polling assertions rather than arbitrary execution delays.',
    },
  ],
};

export async function explainMissedQuestion(
  questionId: string,
  selectedOptionId?: string,
  submittedCode?: string,
  targetRoleId?: string,
): Promise<SocraticRemediationResult> {
  try {
    const res = await fetch(apiUrl('remediation/explain-missed'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        questionId,
        selectedOptionId,
        submittedCode,
        targetRoleId,
      }),
    });

    if (res.ok) {
      return (await res.json()) as SocraticRemediationResult;
    }
  } catch {
    // Gracefully fallback to deterministic Socratic remediation
  }

  const q = FALLBACK_TOPIC_QUESTIONS.find((item) => item.id === questionId);
  const topicName = q?.topicSlug ? q.topicSlug.replace(/-/g, ' ') : 'Technical Domain Concept';

  return {
    misconception:
      'Assuming the default behavior without verifying lifecycle timing or memory visibility invariants.',
    recruiterTrap:
      'Interviewers intentionally construct this distractor option because candidates frequently confuse conceptual design with execution runtime mechanics.',
    socraticHint:
      `Consider how the runtime processes this step: What happens before this state transitions in ${topicName}?`,
    conceptualRule:
      'Always verify whether execution is synchronous or asynchronous and ensure state transitions preserve memory visibility.',
    targetCompetency: {
      topicId: q?.topicId || 'topic-general',
      topicName: topicName.charAt(0).toUpperCase() + topicName.slice(1),
      subjectName: 'Engineering Competency Framework',
    },
    similarDrillAvailable: true,
  };
}

export async function getSimilarDrill(
  questionId: string,
): Promise<DrillQuestion> {
  try {
    const res = await fetch(apiUrl('remediation/similar-drill'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ questionId }),
    });

    if (res.ok) {
      return (await res.json()) as DrillQuestion;
    }
  } catch {
    // Fallback to local catalog
  }

  const original = FALLBACK_TOPIC_QUESTIONS.find((item) => item.id === questionId);
  const drillCandidate =
    FALLBACK_TOPIC_QUESTIONS.find(
      (item) => item.id !== questionId && item.topicId === original?.topicId,
    ) ||
    FALLBACK_TOPIC_QUESTIONS.find((item) => item.id !== questionId) ||
    FALLBACK_TOPIC_QUESTIONS[0];

  return {
    id: drillCandidate.id,
    topicId: drillCandidate.topicId,
    body: drillCandidate.body,
    difficulty: drillCandidate.difficulty,
    options: drillCandidate.options.map((opt) => ({
      id: opt.id,
      questionId: drillCandidate.id,
      body: opt.body,
      orderIndex: opt.orderIndex,
    })),
  };
}

export async function getRoleInterviewTraps(
  roleSlugOrId: string,
): Promise<RoleTrapItem[]> {
  try {
    const res = await fetch(apiUrl(`remediation/traps/${encodeURIComponent(roleSlugOrId)}`), {
      credentials: 'include',
    });

    if (res.ok) {
      const data = (await res.json()) as RoleTrapItem[];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Fallback
  }

  const slug = (roleSlugOrId || '').toLowerCase();
  // Find in fallback map
  if (FALLBACK_ROLE_TRAPS[slug]) {
    return FALLBACK_ROLE_TRAPS[slug];
  }

  // Match by partial slug or role catalog
  for (const [key, traps] of Object.entries(FALLBACK_ROLE_TRAPS)) {
    if (slug.includes(key) || key.includes(slug)) {
      return traps;
    }
  }

  const roleItem = DEFAULT_ROLES_CATALOG.find((r) => r.id === roleSlugOrId || r.slug === roleSlugOrId);
  if (roleItem && FALLBACK_ROLE_TRAPS[roleItem.slug]) {
    return FALLBACK_ROLE_TRAPS[roleItem.slug];
  }

  // Return generic engineering traps if not found
  return [
    {
      id: 'trap_gen_1',
      roleSlug: slug,
      title: 'Boundary & Off-By-One Index Flaws',
      topicName: 'Problem Solving & Coding',
      trapDescription:
        'Assuming array lengths match valid indices, causing IndexOutOfBoundsException or missed final element in boundary sweeps.',
      antiPatternExample: 'for (int i = 0; i <= arr.length; i++)',
      correctPatternExample:
        'for (int i = 0; i < arr.length; i++) with explicit inclusive/exclusive invariants',
      interviewTip:
        'State boundary conditions aloud during the initial requirement clarification step.',
    },
    {
      id: 'trap_gen_2',
      roleSlug: slug,
      title: 'Premature Optimization over Asymptotic Correctness',
      topicName: 'System Architecture',
      trapDescription:
        'Micro-optimizing string allocations before establishing an O(n) algorithm, leading to complex buggy logic.',
      antiPatternExample:
        'Complex bitwise tricks on an O(n^2) nested algorithm',
      correctPatternExample:
        'Establish O(n) hash map or two-pointer logic first, then optimize memory usage',
      interviewTip:
        'Interviewers prioritize clean, correct, readable logic before clever micro-optimizations.',
    },
  ];
}

