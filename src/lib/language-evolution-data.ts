/**
 * Language Evolution Matrix Dataset
 * Authoritative comparative data contrasting legacy paradigms with modern idiomatic syntax
 * across major LTS and milestone releases.
 * Strictly conforms to docs/CONTENT_POLICY.md (zero vendor commercial trademarks).
 */

export interface LanguageEvolutionItem {
  id: string;
  language: 'Java' | 'Python' | 'C++' | 'Rust' | 'TypeScript' | 'Go';
  languageSlug: 'java' | 'python' | 'cpp' | 'rust' | 'typescript' | 'go';
  versionShift: string;
  featureTitle: string;
  paradigmSummary: string;
  legacyVersion: string;
  legacyCode: string;
  legacyDescription: string;
  modernVersion: string;
  modernCode: string;
  modernDescription: string;
  performanceMetrics: {
    asymptotic: string;
    memoryAllocation: string;
    throughputGain: string;
  };
  breakingChangesAndGotchas: string[];
  architecturalTakeaway: string;
}

export const LANGUAGE_EVOLUTION_ITEMS: LanguageEvolutionItem[] = [
  {
    id: 'evo-java-loom-virtual-threads',
    language: 'Java',
    languageSlug: 'java',
    versionShift: 'Java 8 → Java 21',
    featureTitle: 'Thread-Per-Request to Virtual Threads (Project Loom)',
    paradigmSummary:
      'Replacing heavy OS thread pools and reactive asynchronous callbacks with cheap, user-mode virtual threads scheduled M:N on carrier ForkJoinPool threads.',
    legacyVersion: 'Java 8',
    legacyCode: `// Java 8: Thread-per-request using bounded OS platform thread pool
ExecutorService pool = Executors.newFixedThreadPool(200);

pool.submit(() -> {
    try {
        // Blocks 1MB OS kernel stack during network I/O
        byte[] payload = fetchRemoteRpcEndpoint();
        processPayload(payload);
    } catch (Exception e) {
        Thread.currentThread().interrupt();
    }
});`,
    legacyDescription:
      'Platform threads allocate ~1MB of off-heap OS stack memory. A server handling 10,000 concurrent blocking I/O calls triggers OutOfMemoryError: unable to create new native thread or severe thread-context-switch thrashing.',
    modernVersion: 'Java 21',
    modernCode: `// Java 21: High-throughput virtual threads with structured concurrency
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Supplier<byte[]> rpcTask = scope.fork(() -> {
        // Non-blocking yield: JVM unmounts stack frame onto heap continuation
        return fetchRemoteRpcEndpoint();
    });

    scope.join().throwIfFailed();
    processPayload(rpcTask.get());
}`,
    modernDescription:
      'Virtual threads have a negligible initial heap footprint (~hundreds of bytes) and no dedicated OS stack. Blocking network syscalls automatically park the continuation, releasing the carrier thread for other tasks.',
    performanceMetrics: {
      asymptotic: 'O(1) scheduling per unpark event vs O(N) kernel scheduling latency',
      memoryAllocation: '~1KB initial continuation frame vs 1MB fixed OS thread stack',
      throughputGain: '10x - 50x concurrent connection saturation under I/O-bound workloads',
    },
    breakingChangesAndGotchas: [
      'Synchronized blocks and JNI calls pin the virtual thread to its carrier OS thread, preventing unmounting.',
      'ThreadLocal memory leaks are amplified when spawning hundreds of thousands of virtual threads; prefer ScopedValue.',
      'Object pooling of virtual threads is an anti-pattern; create them fresh per task.',
    ],
    architecturalTakeaway:
      'Virtual threads restore synchronous, sequential debugging and stack traces without the operational fragility of reactive streams or the memory overhead of OS thread pools.',
  },
  {
    id: 'evo-java-records-pattern-matching',
    language: 'Java',
    languageSlug: 'java',
    versionShift: 'Java 8 → Java 17 & 21',
    featureTitle: 'Boilerplate POJOs to Records & Sealed Pattern Matching',
    paradigmSummary:
      'Transitioning from mutable JavaBeans and verbose inheritance hierarchies to immutable data carriers with compile-time algebraic data type (ADT) completeness.',
    legacyVersion: 'Java 8',
    legacyCode: `// Java 8: Verbose mutable class with manual getters, equals, and hashCode
public class TransactionEvent {
    private final String id;
    private final double amount;

    public TransactionEvent(String id, double amount) {
        this.id = id;
        this.amount = amount;
    }
    public String getId() { return id; }
    public double getAmount() { return amount; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TransactionEvent)) return false;
        TransactionEvent that = (TransactionEvent) o;
        return Double.compare(that.amount, amount) == 0 && Objects.equals(id, that.id);
    }
    @Override
    public int hashCode() { return Objects.hash(id, amount); }
}`,
    legacyDescription:
      'Over 50 lines of ceremonial boilerplate per data carrier. Downstream type checks required instanceof followed by an explicit type cast, inviting ClassCastException on refactors.',
    modernVersion: 'Java 21',
    modernCode: `// Java 21: Sealed interface with records and exhaustive pattern matching
public sealed interface OrderEvent permits PaymentSettled, OrderCancelled {}

public record PaymentSettled(String orderId, double amount) implements OrderEvent {}
public record OrderCancelled(String orderId, String reason) implements OrderEvent {}

// Pattern matching switch expression with record deconstruction
String summary = switch (event) {
    case PaymentSettled(var id, var amt) when amt > 10_000 -> "High-value order: " + id;
    case PaymentSettled(var id, var amt) -> "Standard order: " + id;
    case OrderCancelled(var id, var reason) -> "Cancelled: " + id + " (" + reason + ")";
};`,
    modernDescription:
      'Records generate compact, transparent, immutable data carriers with scalar replacement optimization in JIT. Sealed types guarantee exhaustiveness checking at compile time without requiring a default clause.',
    performanceMetrics: {
      asymptotic: 'O(1) pattern dispatch via JVM tableswitch / lookupswitch tables',
      memoryAllocation: 'Zero auxiliary metadata overhead; JIT scalar replacement flattens fields to CPU registers',
      throughputGain: 'Eliminates redundant object allocations and instance checks',
    },
    breakingChangesAndGotchas: [
      'Records cannot extend other classes because they implicitly extend java.lang.Record.',
      'Record components are shallowly immutable; mutable collections passed to a record must be defensive-copied via List.copyOf().',
      'Reflective frameworks using JavaBeans getter naming conventions (getFoo) may require record-aware serializers.',
    ],
    architecturalTakeaway:
      'Sealed interfaces and records provide true Algebraic Data Types (ADTs) in the JVM, enforcing domain state modeling without boilerplate.',
  },
  {
    id: 'evo-python-pattern-matching-gil',
    language: 'Python',
    languageSlug: 'python',
    versionShift: 'Python 3.8 → Python 3.10 & 3.13',
    featureTitle: 'Structural Pattern Matching & Free-Threaded Execution',
    paradigmSummary:
      'Upgrading from nested isinstance checks and GIL bottlenecking to structural match/case statements and native multi-threaded CPU execution.',
    legacyVersion: 'Python 3.8',
    legacyCode: `# Python 3.8: Imperative type validation and dictionary inspection
def dispatch_event(event):
    if not isinstance(event, dict):
        raise TypeError("Expected dictionary payload")
    action = event.get("action")
    if action == "route":
        dest = event.get("destination")
        hops = event.get("hops", 0)
        if dest and hops < 5:
            return forward(dest, hops + 1)
        return drop_packet()
    elif action == "ack":
        return acknowledge(event.get("ack_id"))
    else:
        raise ValueError(f"Unknown action: {action}")`,
    legacyDescription:
      'Nested dictionary guards and manual type checks are error-prone, fragile, and noisy. Multi-core parallelism requires multiprocessing with expensive IPC pickle serialization.',
    modernVersion: 'Python 3.13',
    modernCode: `# Python 3.10+: Structural pattern matching with sequence & mapping guards
def dispatch_event(event: dict[str, Any]) -> Response:
    match event:
        case {"action": "route", "destination": str(dest), "hops": int(hops)} if hops < 5:
            return forward(dest, hops + 1)
        case {"action": "route"}:
            return drop_packet()
        case {"action": "ack", "ack_id": str(seq)}:
            return acknowledge(seq)
        case _:
            raise ValueError(f"Invalid packet shape: {event}")

# Python 3.13: Free-threaded execution without GIL lock contention
# python3.13t -X gil=0 worker_pool.py (True concurrent thread scaling)`,
    modernDescription:
      'Structural pattern matching extracts and validates complex data shapes declaratively in one pass. Python 3.13 free-threaded builds allow multiple threads to execute bytecode in parallel across CPU cores.',
    performanceMetrics: {
      asymptotic: 'O(1) pattern dispatch hash lookups for mapping patterns',
      memoryAllocation: 'Zero pickle serialization overhead in free-threaded multi-threading',
      throughputGain: 'Up to 3.8x throughput scaling across 4 CPU cores without IPC overhead',
    },
    breakingChangesAndGotchas: [
      'In match...case, bare variable names bind variables rather than matching literals; use enum or dot-lookup (Status.PENDING) for constant matching.',
      'Python 3.13 free-threaded mode requires C-extensions to declare Py_MOD_GIL_NOT_USED support.',
      'Thread safety invariants must now be enforced via threading.Lock() for shared mutable state in free-threaded mode.',
    ],
    architecturalTakeaway:
      'Structural pattern matching clarifies complex domain routing, while free-threaded Python transforms it into a viable high-performance multi-threaded runtime.',
  },
  {
    id: 'evo-cpp-concepts-ranges-expected',
    language: 'C++',
    languageSlug: 'cpp',
    versionShift: 'C++11 → C++20 & C++23',
    featureTitle: 'SFINAE to C++20 Concepts & C++23 Monadic std::expected',
    paradigmSummary:
      'Replacing inscrutable template metaprogramming error cascades with first-class compile-time constraints and zero-cost monadic error propagation.',
    legacyVersion: 'C++11',
    legacyCode: `// C++11: SFINAE template constraint and exception/out-param error propagation
template <typename T,
          typename = typename std::enable_if<std::is_integral<T>::value>::type>
bool parse_buffer(const uint8_t* ptr, size_t len, T& out_val) {
    if (len < sizeof(T)) return false;
    out_val = *reinterpret_cast<const T*>(ptr);
    return true;
}

// Chained transformations required raw iterator pairs and temporary vector allocations
std::vector<int> filtered;
std::copy_if(src.begin(), src.end(), std::back_inserter(filtered), [](int x) { return x % 2 == 0; });
std::vector<int> transformed;
std::transform(filtered.begin(), filtered.end(), std::back_inserter(transformed), [](int x) { return x * 10; });`,
    legacyDescription:
      'Type constraints relied on template substitution failure (std::enable_if) producing hundreds of lines of cryptic compiler errors when broken. Iterators generated redundant intermediate allocations.',
    modernVersion: 'C++23',
    modernCode: `// C++20: Expressive Concepts constraining template signatures
template <std::integral T>
auto parse_buffer(std::span<const uint8_t> bytes) -> std::expected<T, ParseError> {
    if (bytes.size() < sizeof(T)) {
        return std::unexpected(ParseError::BufferUnderrun);
    }
    return std::bit_cast<T>(bytes.first<sizeof(T)>());
}

// C++20/23: Non-allocating composable Ranges pipelines
auto transformed = src 
    | std::views::filter([](int x) { return x % 2 == 0; })
    | std::views::transform([](int x) { return x * 10; });

// C++23: Monadic error chaining without exception stack unrolling
auto result = parse_buffer<uint32_t>(data)
    .and_then(validate_checksum)
    .transform([](auto val) { return process_metric(val); });`,
    modernDescription:
      'Concepts provide instant compile-time validation with clean diagnostic messages. Ranges operate lazily without temporary allocations. std::expected provides deterministic zero-cost monadic error handling without exception table unwinding.',
    performanceMetrics: {
      asymptotic: 'Zero runtime overhead; concepts and ranges pipelines evaluate completely at compile time',
      memoryAllocation: '0 intermediate buffer allocations in ranges pipelines vs O(N) in chained std::copy',
      throughputGain: '3x - 5x faster error-path performance compared to exception unwinding',
    },
    breakingChangesAndGotchas: [
      'std::views are lazy views; storing a view beyond the lifetime of its underlying container causes dangling reference undefined behavior.',
      'C++20 spaceship operator <=> replaces manual comparison operators but requires careful member ordering.',
      'std::bit_cast requires trivially copyable types of identical sizeof.',
    ],
    architecturalTakeaway:
      'Modern C++ eliminates template obscurity and exception penalties while retaining absolute bare-metal performance and deterministic memory predictability.',
  },
  {
    id: 'evo-rust-rpitit-async-traits',
    language: 'Rust',
    languageSlug: 'rust',
    versionShift: 'Rust 2018 → Rust 2021 & 2024',
    featureTitle: 'Async Trait Boxing to Native RPITIT & Disjoint Closure Capture',
    paradigmSummary:
      'Eliminating mandatory heap boxing (Box<dyn Future>) in trait definitions with Return Position Impl Trait in Trait (RPITIT) and granular field borrows.',
    legacyVersion: 'Rust 2018',
    legacyCode: `// Rust 2018: Async methods in traits required heap-allocation boxing macro
use async_trait::async_trait;

#[async_trait]
pub trait StorageEngine {
    // Hidden cost: allocs Box<dyn Future<Output = Result<Record, Error>> + Send + 'async_trait>
    async fn fetch_record(&self, key: &str) -> Result<Record, StorageError>;
}

// Closure captured entire struct even when accessing independent fields:
let mut state = ServerState { config: cfg, cache: m };
let worker = move || {
    // In 2018: captures entire \`state\`, preventing borrowing \`state.config\` elsewhere
    access_cache(&mut state.cache);
};`,
    legacyDescription:
      'Async traits forced a heap allocation on every single method invocation via the async-trait crate. Closures captured entire structs, creating spurious borrow-checker conflicts.',
    modernVersion: 'Rust 2024',
    modernCode: `// Rust 2024: Native async fn in traits without heap boxing (RPITIT)
pub trait StorageEngine {
    // Zero-cost: desugars to anonymous associated Future type, no heap alloc
    async fn fetch_record(&self, key: &str) -> Result<Record, StorageError>;
}

impl StorageEngine for DistributedLsmStore {
    async fn fetch_record(&self, key: &str) -> Result<Record, StorageError> {
        self.memtable.lookup(key).await
    }
}

// Rust 2021+: Disjoint capture allows borrowing state.config while state.cache is borrowed
let mut state = ServerState { config: cfg, cache: m };
let mut worker = || access_cache(&mut state.cache);
inspect_config(&state.config); // Perfectly valid: independent field borrows!
worker();`,
    modernDescription:
      'Native async fn in traits evaluates to static associated future types, allowing the compiler to inline and optimize futures without heap indirection. Disjoint capture enables fine-grained borrow checking inside closures.',
    performanceMetrics: {
      asymptotic: 'Zero heap allocations per async trait method call',
      memoryAllocation: '0 bytes heap allocation vs 64-128 bytes box per async-trait invocation',
      throughputGain: '15% - 30% reduction in memory allocator contention on high-frequency RPC paths',
    },
    breakingChangesAndGotchas: [
      'RPITIT trait futures are not Send by default in generic contexts; use trait bounds or the Send Trait RFC pattern where cross-thread dispatch is required.',
      'Rust 2024 introduces reservation of gen keyword for native generators.',
      'Disjoint closure capture may change Drop order if a struct relies on drop timing of non-captured fields.',
    ],
    architecturalTakeaway:
      'Zero-allocation async traits fulfill Rust\'s core promise of zero-cost abstractions across distributed systems and embedded networking runtimes.',
  },
  {
    id: 'evo-ts-const-type-params-using',
    language: 'TypeScript',
    languageSlug: 'typescript',
    versionShift: 'TypeScript 4.x → TypeScript 5.x',
    featureTitle: 'Const Type Parameters & Explicit Resource Management',
    paradigmSummary:
      'Moving from manual as const assertions to <const T> type parameters, and from leak-prone try/finally to native using declarations.',
    legacyVersion: 'TypeScript 4.x',
    legacyCode: `// TS 4.x: Required manual as const at call sites to prevent literal widening
function createRouter<T extends readonly string[]>(routes: T) {
    return { routes };
}
// Without 'as const', routes widened to string[]
const router = createRouter(['/home', '/dashboard'] as const);

// Manual resource cleanup prone to leaks if developers forget finally
const client = acquireConnectionPool();
try {
    const data = client.query("SELECT * FROM metrics");
    processMetrics(data);
} finally {
    // Easy to omit, leading to connection exhaustion
    client.release();
}`,
    legacyDescription:
      'Callers frequently forgot as const, leading to premature type widening to string or number. Resource lifecycle management relied on boilerplate try/finally blocks susceptible to programmer omission.',
    modernVersion: 'TypeScript 5.x',
    modernCode: `// TS 5.0+: <const T> preserves literal types automatically without call-site ceremony
function createRouter<const T extends readonly string[]>(routes: T) {
    return { routes };
}
// Automatically inferred as readonly ['/home', '/dashboard']
const router = createRouter(['/home', '/dashboard']);

// TS 5.2+: Explicit Resource Management (\`using\` declarations)
class ScopedClient implements Disposable {
    [Symbol.dispose]() {
        this.release(); // Deterministic cleanup upon scope exit
    }
}

{
    using client = new ScopedClient();
    client.query("SELECT * FROM metrics");
} // client[Symbol.dispose]() invoked automatically here, even on thrown exceptions!`,
    modernDescription:
      'Const type parameters automatically infer literal and readonly tuple types without requiring callers to supply as const. The using keyword provides deterministic RAII-style cleanup at block exit.',
    performanceMetrics: {
      asymptotic: 'Zero runtime footprint; const type parameters exist solely at compile time',
      memoryAllocation: 'Eliminates resource leak bugs that lead to long-term memory bloat',
      throughputGain: '20% faster TypeScript compiler execution due to internal namespaces refactor',
    },
    breakingChangesAndGotchas: [
      'Using using requires configuring "moduleDetection": "force" and "target": "es2022" or polyfilling Symbol.dispose.',
      'ECMAScript Stage 3 decorators replace experimentalDecorators; method decorator signatures and metadata APIs differ.',
      'Const type parameters treat object literals as deeply readonly, which may conflict with mutable callback parameters.',
    ],
    architecturalTakeaway:
      'TypeScript 5 bridges systems-grade deterministic lifecycle safety (using) with effortless type-level literal precision.',
  },
  {
    id: 'evo-go-generics-loop-scoping',
    language: 'Go',
    languageSlug: 'go',
    versionShift: 'Go 1.16 → Go 1.18 & 1.22+',
    featureTitle: 'Empty Interfaces to Generics & Per-Iteration Loop Scoping',
    paradigmSummary:
      'Replacing interface{} casting and the infamous loop-variable capture race condition with compile-time type safety and per-iteration scoping.',
    legacyVersion: 'Go 1.16',
    legacyCode: `// Go 1.16: Runtime type casting via empty interface and reflection
func Filter(slice []interface{}, predicate func(interface{}) bool) []interface{} {
    var out []interface{}
    for _, item := range slice {
        if predicate(item) {
            out = append(out, item)
        }
    }
    return out // Caller must manually type-assert every element: item.(User)
}

// The classic Go loop variable concurrency bug:
for _, item := range items {
    // Bug: all goroutines capture the identical memory address of 'item'
    go func() {
        process(item) // In 1.16, all print the final element!
    }()
}`,
    legacyDescription:
      'Generic operations required boxing types into interface{}, forfeiting compile-time type safety and incurring pointer boxing overhead. Goroutines inside range loops captured the address of the single loop variable.',
    modernVersion: 'Go 1.22+',
    modernCode: `// Go 1.18+: Strongly typed parametric generics with zero reflection
func Filter[T any](slice []T, predicate func(T) bool) []T {
    out := make([]T, 0, len(slice))
    for _, item := range slice {
        if predicate(item) {
            out = append(out, item)
        }
    }
    return out // Strongly typed []T, no cast needed!
}

// Go 1.22+: Each iteration creates a brand new variable scope
for _, item := range items {
    go func() {
        // Safe: In Go 1.22, 'item' is fresh for every iteration, no manual shadow needed
        process(item)
    }()
}`,
    modernDescription:
      'Generics compile via GCShape stenciling, generating monomorphized code for value types while sharing runtime stencils for pointer types to avoid binary bloat. Go 1.22 formally resolves the ten-year loop variable scoping pitfall.',
    performanceMetrics: {
      asymptotic: 'O(1) direct field access with zero interface boxing/unboxing overhead',
      memoryAllocation: 'Zero heap escapes for generic value types vs mandatory heap boxing in interface{}',
      throughputGain: '2x - 4x faster slice filtering and sorting without interface virtual table dispatch',
    },
    breakingChangesAndGotchas: [
      'Methods on generic types cannot declare additional type parameters; only functions can introduce new type parameters.',
      'Go 1.22 loop variable change is backward compatible unless code deliberately relied on the old sharing behavior.',
      'math/rand is now superseded by math/rand/v2 with ChaCha8 algorithm and lock-free global generators.',
    ],
    architecturalTakeaway:
      'Go preserved its famous simplicity and rapid compilation speed while fixing its most notorious concurrency trap and adding type-safe generics.',
  },
];
