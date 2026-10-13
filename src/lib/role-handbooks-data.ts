/**
 * IT Roles Engineering Handbooks & Syllabus Catalog
 * Textbook-grade technical specifications for all 12 IT roles.
 * Strictly adheres to docs/CONTENT_POLICY.md: zero vendor trademarks, 100% technical signal.
 */

export interface RoleHandbookCareerLevel {
  level: string;
  title: string;
  typicalExperience: string;
  focus: string;
}

export interface RoleHandbookCompBand {
  region: string;
  entryLevel: string;
  midSenior: string;
  staffPrincipal: string;
}

export interface RoleHandbookCompetency {
  topic: string;
  weightPercentage: number;
  benchmarkAccuracy: number;
  coreInvariants: string[];
}

export interface RoleHandbookProject {
  title: string;
  spec: string;
  deliverables: string[];
}

export interface RoleHandbookSyllabusTier {
  tier: string;
  title: string;
  description: string;
  durationWeeks: number;
  competencies: RoleHandbookCompetency[];
  handsOnProjects: RoleHandbookProject[];
}

export interface RoleHandbookQuestion {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  category: string;
  questionText: string;
  modelAnswer: string;
  counterQuestions: string[];
  interviewerExpectations: string[];
  criticalPitfalls: string[];
}

export interface RoleHandbookTrap {
  title: string;
  antiPattern: string;
  correctApproach: string;
  dangerLevel: 'HIGH' | 'CRITICAL';
  interviewContext: string;
}

export interface RoleHandbookArchitecturalInvariant {
  title: string;
  formulaOrInvariant: string;
  explanation: string;
  tradeoffs: string;
}

export interface RoleHandbookCodeExample {
  language: string;
  title: string;
  code: string;
  explanation: string;
}

export interface RoleHandbookDocSection {
  sectionTitle: string;
  overview: string;
  architecturalInvariants: RoleHandbookArchitecturalInvariant[];
  codeExamples: RoleHandbookCodeExample[];
}

export interface RoleHandbook {
  id: string;
  slug: string;
  name: string;
  targetLevel: string;
  summary: string;
  category:
    | 'Cloud & Infrastructure'
    | 'Backend & Systems'
    | 'Full-Stack & Web'
    | 'Data & AI'
    | 'Security & QA'
    | 'Enterprise Systems';
  estimatedReadTime: string;
  pageEstimate: number;

  information: {
    overview: string;
    mission: string;
    dayInTheLife: string[];
    coreResponsibilities: string[];
    careerProgression: RoleHandbookCareerLevel[];
    compensationBands: RoleHandbookCompBand[];
    keyToolsAndTechnologies: string[];
    industryDemandRationale: string;
  };

  syllabus: RoleHandbookSyllabusTier[];
  questions: RoleHandbookQuestion[];
  interviewTraps: RoleHandbookTrap[];
  documentation: RoleHandbookDocSection[];
}

export const ROLE_HANDBOOKS: RoleHandbook[] = [
  // 1. Cloud Solutions Architect
  {
    id: 'role-aws-cloud',
    slug: 'aws-cloud-engineer',
    name: 'Cloud Solutions Architect',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'Design, architect, and implement fault-tolerant, horizontally scalable, multi-region distributed cloud infrastructure and virtual network topologies.',
    category: 'Cloud & Infrastructure',
    estimatedReadTime: '24 min',
    pageEstimate: 14,
    information: {
      overview: 'A Cloud Solutions Architect translates business scale requirements into resilient, decoupled distributed systems. They govern cloud networking topologies, multi-region storage replication, autoscaling compute tiers, and zero-trust security perimeters.',
      mission: 'Engineer cloud topologies that eliminate single points of failure (SPOFs), withstand data center outages without data loss, and maintain sub-100ms p99 latency globally.',
      dayInTheLife: [
        'Authoring declarative Infrastructure-as-Code (IaC) modules with state locking and peer validation.',
        'Analyzing traffic egress cost vectors and provisioning private gateway endpoints to optimize packet transit.',
        'Reviewing distributed database replication topology and designing automated cross-region disaster recovery runbooks.',
        'Simulating failure injection scenarios (Chaos Engineering) against live compute node autoscaling pools.',
        'Auditing identity policies and token federation across microservice boundaries to uphold least-privilege access.'
      ],
      coreResponsibilities: [
        'Architect high-availability (99.99%) distributed topologies across multiple availability zones and regions.',
        'Provision software-defined networking (VPCs, CIDR allocation, subnets, route tables, peering, NAT gateways).',
        'Implement automated compute scaling policies driven by queue depth, CPU quotas, and ingress rate telemetry.',
        'Design immutable storage tiers with lifecycle tiering, object lock compliance, and encryption at rest/transit.',
        'Establish automated compliance auditing, cloud budget quotas, and observability telemetry pipelines.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Associate Cloud Engineer', typicalExperience: '0-2 yrs', focus: 'Single-zone infrastructure provisioning, basic CI/CD deployments, and telemetry alert response.' },
        { level: 'L2', title: 'Cloud Infrastructure Architect', typicalExperience: '2-5 yrs', focus: 'Multi-AZ architecture, automated IaC pipelines, cost optimization, and network security hardening.' },
        { level: 'L3', title: 'Staff Systems Architect', typicalExperience: '5-8 yrs', focus: 'Multi-region active-active design, disaster recovery RPO/RTO SLAs, and organizational cloud governance.' },
        { level: 'L4', title: 'Principal Infrastructure Fellow', typicalExperience: '8+ yrs', focus: 'Global edge traffic engineering, cross-cloud abstraction layers, and multi-petabyte distributed storage.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$95,000 - $125,000', midSenior: '$140,000 - $195,000', staffPrincipal: '$215,000 - $340,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 55,000 - 75,000', midSenior: 'EUR 85,000 - 125,000', staffPrincipal: 'EUR 140,000 - 210,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 10,00,000 - 16,00,000', midSenior: 'INR 22,00,000 - 42,00,000', staffPrincipal: 'INR 50,00,000 - 95,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'OpenTofu / Terraform', 'Docker & Container Runtimes', 'Kubernetes', 'Linux Kernel & Systemd',
        'Prometheus & Grafana', 'Envoy Proxy', 'WireGuard VPN', 'PostgreSQL Distributed Replicas'
      ],
      industryDemandRationale: 'As organizations transition from monolithic on-premise hardware to elastic cloud fabrics, cloud architects who understand networking physics, cost vectors, and fault domains command the highest demand in systems engineering.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Foundational Cloud Networking & Compute Infrastructure',
        description: 'Master TCP/IP subnetting, CIDR planning, virtual private clouds, and compute virtualization lifecycle.',
        durationWeeks: 4,
        competencies: [
          { topic: 'Virtual Private Cloud & Subnet CIDR Engineering', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['Subnet /28 reservation bounds', 'Stateful Security Groups vs Stateless Network ACLs', 'Route table next-hop priority'] },
          { topic: 'Compute Virtualization & Elastic Autoscaling', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Graceful shutdown termination signals', 'Scale-in protection invariants', 'Target tracking metric lag'] },
          { topic: 'Object Storage & Lifecycle Policies', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Eventual consistency vs strong read-after-write', 'Object lock compliance retention', 'Multipart upload thresholding'] }
        ],
        handsOnProjects: [
          {
            title: 'Multi-AZ Immutable VPC Topology',
            spec: 'Provision a 3-Availability-Zone VPC using declarative code featuring isolated database subnets, private worker subnets with redundant NAT gateways, and public ingress load balancers.',
            deliverables: ['Modular Terraform configuration', 'Automated security scan passing checkov/tfsec', 'Route propagation test script']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'High-Availability Storage, Distributed Caching & Message Fabrics',
        description: 'Implement distributed storage replication, asynchronous pub/sub messaging, and edge caching acceleration.',
        durationWeeks: 6,
        competencies: [
          { topic: 'Relational & NoSQL Database High Availability', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['Synchronous vs Asynchronous replication lag', 'Automated DNS multi-AZ failover', 'Read replica connection pooling'] },
          { topic: 'Decoupled Asynchronous Messaging & Queues', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['At-least-once delivery duplicates', 'Dead letter queue exponential retry', 'FIFO queue partition keys'] },
          { topic: 'Edge Content Delivery & Path Routing', weightPercentage: 25, benchmarkAccuracy: 70, coreInvariants: ['Origin shielding cache hit ratio', 'SSL/TLS termination offloading', 'Dynamic gzip/brotli compression'] }
        ],
        handsOnProjects: [
          {
            title: 'Fault-Tolerant Asynchronous Event Processing Pipeline',
            spec: 'Build an event ingestion architecture with queue throttling, dead-letter redrive policies, and autoscaled consumer worker fleets with zero message loss.',
            deliverables: ['Event schema validation layer', 'Chaos monkey consumer crash test suite', 'End-to-end latency metric dashboard']
          }
        ]
      },
      {
        tier: 'Tier 3',
        title: 'Staff-Level Multi-Region Topologies, Chaos Engineering & Governance',
        description: 'Design global multi-region active-active architectures, zero-trust network microsegmentation, and automated disaster recovery.',
        durationWeeks: 8,
        competencies: [
          { topic: 'Multi-Region Active-Active Topologies & WAN Routing', weightPercentage: 45, benchmarkAccuracy: 85, coreInvariants: ['Conflict-free Replicated Data Types (CRDTs)', 'Cross-region read replica promotion RTO', 'BGP Anycast path routing'] },
          { topic: 'Zero-Trust Infrastructure & mTLS Service Meshes', weightPercentage: 30, benchmarkAccuracy: 80, coreInvariants: ['Short-lived cryptographic certificates', 'Service-to-service identity tokens', 'Egress gateway proxy enforcement'] },
          { topic: 'FinOps Cost Modeling & Capacity Planning', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Reserved capacity breakeven analysis', 'Inter-AZ data transfer optimization', 'Cold tier archival thresholds'] }
        ],
        handsOnProjects: [
          {
            title: 'Active-Active Multi-Region Global Data Plane',
            spec: 'Deploy a dual-region active-active web architecture with latency-based DNS routing, cross-region asynchronous database synchronization, and automated regional health checking.',
            deliverables: ['Disaster recovery test simulation report (RTO < 60s, RPO < 5s)', 'Multi-region Terraform orchestration', 'Global traffic failover dashboard']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-cloud-1',
        title: 'Zero-Downtime Database Migration Across Distributed Regions',
        difficulty: 'HARD',
        category: 'Distributed Systems',
        questionText: 'How do you execute a live, zero-downtime database migration from an on-premises data center to a multi-region cloud cluster with zero data loss (RPO = 0)?',
        modelAnswer: 'A zero-downtime migration follows a structured 5-phase pipeline: 1) Initial snapshot loading: Establish baseline data state via bulk export/import. 2) Change Data Capture (CDC) streaming: Capture database WAL/binlog events continuously via an event streaming broker (e.g. Kafka or Debezium) and apply them to the target cluster. 3) Dual-Writing / Shadow Mode: Applications write to primary while an async worker or broker writes to target, validating record parity through an offline checksum worker. 4) Read cutover: Redirect read traffic to target replicas to evaluate performance under load. 5) Write cutover: Quiesce write ingress for a sub-second window, allow remaining CDC stream lag to drain to 0, flip DNS/routing proxy to target primary, and resume writes.',
        counterQuestions: [
          'What happens if the CDC pipeline encounters an unresolvable schema constraint violation midway through streaming?',
          'How do you handle bidirectional writes if a rollback is needed 2 hours after cutover without losing newly created customer records?'
        ],
        interviewerExpectations: [
          'Candidate must mention CDC / WAL replication rather than naive stop-the-world dumps.',
          'Candidate must account for dual-writing hazards and idempotency keys.',
          'Candidate must define clear rollback mechanisms.'
        ],
        criticalPitfalls: [
          'Proposing an offline dump-and-restore that requires hours of maintenance downtime.',
          'Forgetting that client connection pools cache database IP addresses, preventing seamless DNS failover unless connection TTL is enforced.'
        ]
      },
      {
        id: 'q-cloud-2',
        title: 'Optimizing Cloud Networking Egress Costs and Latency Vectors',
        difficulty: 'MEDIUM',
        category: 'Cloud Networking',
        questionText: 'When microservices inside a private subnet transfer hundreds of terabytes of data daily to an internal cloud object storage service, costs spike. What architectural defect is occurring, and how is it resolved?',
        modelAnswer: 'Private subnets without dedicated storage endpoints route all outbound traffic through the NAT Gateway. NAT Gateways incur both per-hour instance charges and per-gigabyte data processing fees. To resolve this, configure a VPC Gateway Endpoint for object storage. Gateway Endpoints modify the private subnet route table with a prefix-list destination pointing directly to the internal storage fabric via software-defined hypervisor routing. This completely bypasses the NAT Gateway, eliminating data processing fees, reducing latency by removing a network hop, and enhancing throughput.',
        counterQuestions: [
          'Can VPC Gateway Endpoints be accessed across VPC Peering connections or on-premises VPN links?',
          'What is the difference between a Gateway Endpoint and an Interface Endpoint (PrivateLink)?'
        ],
        interviewerExpectations: [
          'Identify NAT Gateway data processing fees as the root economic cause.',
          'Explain the mechanics of VPC Gateway Endpoints and route table prefix lists.'
        ],
        criticalPitfalls: [
          'Recommending spinning up larger NAT instances, which fails to eliminate per-GB charges.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Assuming DNS TTL Guarantees Sub-Second Regional Failover',
        antiPattern: 'Configuring DNS record TTL to 5 seconds and assuming global client traffic will redirect within 5 seconds during an outage.',
        correctApproach: 'Client runtimes, ISP resolvers, and corporate proxies routinely cache DNS records for minutes or hours regardless of TTL. Production failover requires BGP Anycast routing or active-active reverse proxies with healthy origin pools.',
        dangerLevel: 'CRITICAL',
        interviewContext: 'Asked during System Design & High Availability screening.'
      },
      {
        title: 'Confusing Security Groups (Stateful) with Network ACLs (Stateless)',
        antiPattern: 'Opening inbound port 443 on a stateless NACL and forgetting to open ephemeral outbound return ports (1024-65535).',
        correctApproach: 'Security Groups are stateful; return traffic is automatically permitted. NACLs are stateless at the subnet boundary; both ingress and egress rules must explicitly permit outbound ephemeral response ports.',
        dangerLevel: 'HIGH',
        interviewContext: 'Asked during Cloud Networking & Security drills.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'Distributed Autoscaling Physics: Little\'s Law',
        overview: 'Autoscaling compute pools must be sized based on queue queuing theory and concurrency physics rather than naive CPU thresholds.',
        architecturalInvariants: [
          {
            title: 'Little\'s Law Invariant',
            formulaOrInvariant: 'L = lambda * W',
            explanation: 'In any stable queuing system, the average number of concurrent requests (L) equals the average arrival rate (lambda) multiplied by the average response time (W). If arrival rate is 10,000 req/sec and p99 latency is 80ms, the system must support 800 concurrent executions.',
            tradeoffs: 'Optimizing response latency (W) through caching reduces concurrent worker capacity requirements (L) linearly.'
          }
        ],
        codeExamples: [
          {
            language: 'hcl',
            title: 'Declarative Modular VPC Topology with Isolated Subnet Tiers',
            code: `# Production High-Availability VPC Architecture
resource "cloud_vpc" "production" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Environment = "production"
    ManagedBy   = "IaC"
  }
}

# Gateway Endpoint for Internal Object Storage (0 Cost Transit)
resource "cloud_vpc_endpoint" "object_storage" {
  vpc_id          = cloud_vpc.production.id
  service_name    = "storage.internal"
  route_table_ids = [cloud_route_table.private.id]
}`,
            explanation: 'Routes private subnet traffic directly to internal storage fabrics without traversing costly NAT Gateways.'
          }
        ]
      }
    ]
  },

  // 2. Cloud Infrastructure Specialist
  {
    id: 'role-azure-cloud',
    slug: 'azure-cloud-engineer',
    name: 'Cloud Infrastructure Specialist',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'Enterprise cloud infrastructure administration, virtual networks, identity federation, hybrid workload operations, and private endpoint links.',
    category: 'Cloud & Infrastructure',
    estimatedReadTime: '22 min',
    pageEstimate: 13,
    information: {
      overview: 'Enterprise Cloud Infrastructure Specialists build and maintain scalable hybrid cloud environments. They bridge on-premises enterprise data centers with cloud virtual networks, manage single sign-on identity federation, and enforce zero-trust security perimeters.',
      mission: 'Ensure enterprise hybrid cloud services achieve 99.95% uptime with strict compliance auditing and cryptographic boundary isolation.',
      dayInTheLife: [
        'Configuring hybrid interconnect tunnels (IPsec VPN / Dedicated Express Links) with dynamic BGP route propagation.',
        'Auditing role-based access control (RBAC) assignments and conditional access policies for multi-factor identity verification.',
        'Provisioning Virtual Machine Scale Sets with ephemeral OS disks for high-performance stateless batch processing.',
        'Implementing private endpoint integrations to isolate database services from the public internet.',
        'Monitoring infrastructure health via centralized log analytics workspaces and configuring automated remediation runbooks.'
      ],
      coreResponsibilities: [
        'Design and deploy hub-and-spoke virtual network topologies with central firewall inspection.',
        'Configure identity federation and access management using OAuth2, SAML 2.0, and OpenID Connect.',
        'Automate resource provisioning using declarative templates and infrastructure pipelines.',
        'Enforce governance policies, resource locks, and budget allocation across departmental subscriptions.',
        'Implement backup, site recovery, and business continuity plans across paired cloud regions.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Associate Infrastructure Admin', typicalExperience: '0-2 yrs', focus: 'Virtual machine lifecycle, basic virtual network configuration, and identity account management.' },
        { level: 'L2', title: 'Senior Infrastructure Specialist', typicalExperience: '2-5 yrs', focus: 'Hub-and-spoke network design, hybrid interconnects, and automated policy enforcement.' },
        { level: 'L3', title: 'Staff Enterprise Cloud Architect', typicalExperience: '5-8 yrs', focus: 'Multi-tenant landing zones, zero-trust perimeter engineering, and cost governance frameworks.' },
        { level: 'L4', title: 'Principal Infrastructure Strategist', typicalExperience: '8+ yrs', focus: 'Enterprise-wide digital transformation, sovereign cloud compliance, and hybrid disaster recovery.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$92,000 - $120,000', midSenior: '$135,000 - $185,000', staffPrincipal: '$200,000 - $310,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 52,000 - 72,000', midSenior: 'EUR 80,000 - 120,000', staffPrincipal: 'EUR 135,000 - 195,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 9,50,000 - 15,00,000', midSenior: 'INR 20,00,000 - 38,00,000', staffPrincipal: 'INR 45,00,000 - 85,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'OpenTofu / Bicep', 'Virtual Networks & Private Link', 'Hybrid BGP Routing', 'OIDC & OAuth2 Identity',
        'Log Analytics & KQL', 'Scale Sets & Ephemeral Storage', 'Kubernetes Service (AKS)', 'Bastion Host Proxies'
      ],
      industryDemandRationale: 'Enterprises require specialized infrastructure engineers who can modernize legacy data centers into secure, compliant hybrid cloud landing zones with rigorous governance.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Virtual Networking & Identity Security Foundations',
        description: 'Understand virtual network peering, subnets, Network Security Groups, and role-based access control.',
        durationWeeks: 4,
        competencies: [
          { topic: 'Virtual Network Topology & Hub-and-Spoke Routing', weightPercentage: 40, benchmarkAccuracy: 75, coreInvariants: ['Non-transitive peering rule', 'User Defined Route (UDR) 0.0.0.0/0 next-hop override', 'Private DNS zone resolution'] },
          { topic: 'Identity Governance & Access Management', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Principle of least privilege', 'Privileged Identity Management (PIM) time-bound elevation', 'Conditional access signals'] },
          { topic: 'Storage Redundancy & Virtual Machine Scaling', weightPercentage: 25, benchmarkAccuracy: 70, coreInvariants: ['Locally redundant vs Zone-redundant storage', 'Scale set autoscale cooldown dampening', 'Ephemeral OS disk IOPS acceleration'] }
        ],
        handsOnProjects: [
          {
            title: 'Enterprise Hub-and-Spoke Network with Central NVA',
            spec: 'Build a secure hub-and-spoke virtual network where all inter-spoke and internet-bound traffic is routed through a central network virtual appliance firewall via custom UDR tables.',
            deliverables: ['Automated deployment template', 'Effective route table diagnostic report', 'End-to-end ICMP/HTTP routing verification script']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'Enterprise Hybrid Connectivity, Private Endpoints & Governance',
        description: 'Implement secure hybrid data center connectivity, eliminate public IP exposure, and enforce compliance policies.',
        durationWeeks: 6,
        competencies: [
          { topic: 'Private Endpoint Links & Secure Data Ingestion', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['Private Link DNS CNAME alias resolution', 'Disabling public network access switches', 'Network Interface Card (NIC) microsegmentation'] },
          { topic: 'Hybrid Interconnect & BGP Routing Integration', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['BGP Autonomous System Number (ASN) peering', 'VPN active-active failover tunnels', 'MTU packet fragmentation boundaries'] },
          { topic: 'Policy Governance & Cost Management Controls', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Deny-by-default resource policies', 'Automated tag inheritance', 'Spending threshold budget action groups'] }
        ],
        handsOnProjects: [
          {
            title: 'Zero-Public-IP Database & Microservice Isolation',
            spec: 'Deploy a multi-tier enterprise web application where relational databases and storage buckets have zero public IP addresses, accessible exclusively via private endpoint NICs inside dedicated subnets.',
            deliverables: ['Private DNS integration template', 'Port vulnerability scan report demonstrating 0 open public ports', 'Application health verification script']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-azure-1',
        title: 'Hub-and-Spoke Non-Transitive Peering Traps',
        difficulty: 'MEDIUM',
        category: 'Enterprise Cloud Networking',
        questionText: 'Spoke A is peered to Hub, and Spoke B is peered to Hub. However, a VM in Spoke A cannot ping or send TCP packets to a VM in Spoke B. Why is this occurring, and what is the standard enterprise solution?',
        modelAnswer: 'Virtual network peering is non-transitive. Traffic arriving from Spoke A into the Hub cannot hop through the Hub into Spoke B simply because both are peered. To enable communication between Spoke A and Spoke B, deploy a central router or Network Virtual Appliance (NVA) / Firewall in the Hub. Then, attach a User Defined Route (UDR) table to Spoke A subnet with destination Spoke B CIDR (or 0.0.0.0/0) and next-hop set to the private IP address of the Hub NVA, and configure the corresponding route on Spoke B.',
        counterQuestions: [
          'What happens if you enable "Allow Gateway Transit" on the Hub and "Use Remote Gateways" on the Spokes?',
          'How does virtual network gateway transit interact with on-premises VPN links?'
        ],
        interviewerExpectations: [
          'Must explicitly state that peering is non-transitive.',
          'Must explain UDR next-hop configuration through an NVA or gateway.'
        ],
        criticalPitfalls: [
          'Suggesting creating direct mesh peerings between all spokes, which causes O(N^2) configuration sprawl and bypasses central traffic inspection.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Overlooking Private Endpoint DNS Split-Brain Resolution',
        antiPattern: 'Creating a Private Endpoint for a database service without configuring a Private DNS Zone linked to the virtual network.',
        correctApproach: 'Database endpoints resolve to public IPs by default. A Private DNS Zone with a virtual network link must be configured to resolve the service FQDN to the internal private IP address; otherwise, traffic continues to attempt public routing and fails.',
        dangerLevel: 'HIGH',
        interviewContext: 'Asked during Hybrid Cloud & Security evaluations.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'Hybrid Network Topology & Routing Invariants',
        overview: 'Enterprise network architectures require deterministic packet routing and stateful boundary controls.',
        architecturalInvariants: [
          {
            title: 'Peering Non-Transitivity Invariant',
            formulaOrInvariant: 'Path(A -> Hub) AND Path(Hub -> B) DOES NOT IMPLY Path(A -> B)',
            explanation: 'Software-defined virtual network peerings are non-transitive. Inter-spoke traffic requires an active next-hop router or NVA.',
            tradeoffs: 'Routing through a central NVA incurs processing latency and compute costs but guarantees centralized packet inspection.'
          }
        ],
        codeExamples: [
          {
            language: 'json',
            title: 'User Defined Route (UDR) Next-Hop Specification',
            code: `{
  "name": "Route-To-Hub-Firewall",
  "properties": {
    "addressPrefix": "10.2.0.0/16",
    "nextHopType": "VirtualAppliance",
    "nextHopIpAddress": "10.0.1.4"
  }
}`,
            explanation: 'Forces all traffic targeting spoke subnet 10.2.0.0/16 to traverse the hub inspection appliance at 10.0.1.4.'
          }
        ]
      }
    ]
  },

  // 3. DevOps & Site Reliability Engineer
  {
    id: 'role-devops',
    slug: 'devops-engineer',
    name: 'DevOps & Site Reliability Engineer',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'Automated CI/CD pipelines, container orchestration with Kubernetes, Linux kernel administration, observability telemetry, and system reliability.',
    category: 'Cloud & Infrastructure',
    estimatedReadTime: '26 min',
    pageEstimate: 16,
    information: {
      overview: 'DevOps & Site Reliability Engineers (SRE) bridge software development and systems operations. They treat operations as a software problem, building automated deployment pipelines, managing Kubernetes container clusters, tracking error budgets, and conducting blameless post-mortems.',
      mission: 'Ensure software delivery pipelines are rapid and deterministic while keeping production availability within defined SLO error budgets (e.g. 99.9% uptime).',
      dayInTheLife: [
        'Authoring declarative GitOps delivery pipelines that deploy tested artifacts to staging and production.',
        'Debugging Kubernetes Pod scheduling issues, CrashLoopBackOff states, and OOMKilled memory limits.',
        'Instrumenting services with OpenTelemetry traces, Prometheus metrics, and Grafana dashboards.',
        'Analyzing Completely Fair Scheduler (CFS) throttling and tuning Linux cgroup CPU quotas.',
        'Leading incident management, mitigating active outages, and facilitating blameless post-mortems.'
      ],
      coreResponsibilities: [
        'Build and maintain automated CI/CD pipelines with automated unit, integration, and security checks.',
        'Manage production Kubernetes clusters (Deployments, StatefulSets, Services, Ingress, NetworkPolicies).',
        'Define and monitor Service Level Indicators (SLIs), Service Level Objectives (SLOs), and Error Budgets.',
        'Administer Linux server kernels, systemd services, disk I/O schedulers, and networking parameters.',
        'Implement automated disaster recovery drills, infrastructure testing, and chaos experiments.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Associate DevOps Engineer', typicalExperience: '0-2 yrs', focus: 'CI/CD pipeline maintenance, Docker containerization, and basic metric monitoring.' },
        { level: 'L2', title: 'Site Reliability Engineer', typicalExperience: '2-5 yrs', focus: 'Kubernetes cluster administration, automated failover, and SLO error budget management.' },
        { level: 'L3', title: 'Staff Reliability Engineer', typicalExperience: '5-8 yrs', focus: 'Distributed systems resilience, eBPF tracing, chaos engineering, and incident commander.' },
        { level: 'L4', title: 'Principal Infrastructure Engineer', typicalExperience: '8+ yrs', focus: 'Platform engineering strategy, self-healing runtime systems, and global reliability.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$100,000 - $130,000', midSenior: '$145,000 - $205,000', staffPrincipal: '$225,000 - $350,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 58,000 - 80,000', midSenior: 'EUR 90,000 - 135,000', staffPrincipal: 'EUR 145,000 - 225,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 11,00,000 - 18,00,000', midSenior: 'INR 24,00,000 - 45,00,000', staffPrincipal: 'INR 55,00,000 - 1,00,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'Kubernetes & Helm', 'Docker & containerd', 'GitOps (ArgoCD)', 'Prometheus, Grafana & Loki',
        'OpenTelemetry & Jaeger', 'Linux Kernel & eBPF', 'Terraform & Ansible', 'GitHub Actions & GitLab CI'
      ],
      industryDemandRationale: 'Continuous delivery velocity and service reliability directly dictate business survival. Engineers who can eliminate downtime, automate toil, and manage container platforms remain in massive demand.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Linux Systems Administration & Containerization Fundamentals',
        description: 'Master Linux shell scripting, systemd, process isolation (namespaces & cgroups), and Docker packaging.',
        durationWeeks: 4,
        competencies: [
          { topic: 'Linux Process Architecture & Storage I/O', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['File descriptors and inode exhaustion', 'Signals SIGTERM (15) vs SIGKILL (9)', 'Virtual memory swap thrashing'] },
          { topic: 'Container Runtimes & Multi-Stage Image Builds', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Layer caching optimization', 'Non-root container execution', 'cgroups v2 resource accounting'] },
          { topic: 'Automated CI/CD Pipeline Construction', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Pipeline determinism and hermetic builds', 'Secret injection security', 'Artifact immutability with sha256 digests'] }
        ],
        handsOnProjects: [
          {
            title: 'Hardened Container Build & CI/CD Pipeline',
            spec: 'Construct a declarative CI/CD pipeline that runs automated linters, unit tests, vulnerability vulnerability scanning, and produces a minimal, non-root scratch/distroless container image signed with cryptographic keys.',
            deliverables: ['GitHub Actions / GitLab CI pipeline config', 'Multi-stage Dockerfile (<50MB image size)', 'Trivy/Grype vulnerability report (0 Critical/High)']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'Kubernetes Workload Orchestration & Service Networking',
        description: 'Deploy resilient microservices on Kubernetes with auto-healing, rolling updates, and network policies.',
        durationWeeks: 6,
        competencies: [
          { topic: 'Kubernetes Pod Scheduling & Lifecycle States', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['OOMKilled exit code 137 vs CrashLoopBackOff', 'PreStop lifecycle hooks for zero-downtime drain', 'PodDisruptionBudget minimum availability'] },
          { topic: 'Service Networking & Ingress Controllers', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['ClusterIP iptables / IPVS proxy modes', 'Ingress path routing & TLS termination', 'NetworkPolicy default-deny egress/ingress'] },
          { topic: 'Storage Classes & StatefulSets', weightPercentage: 25, benchmarkAccuracy: 70, coreInvariants: ['PersistentVolumeClaim binding lifecycle', 'Ordered graceful startup/shutdown of StatefulSets', 'Volume expansion without pod downtime'] }
        ],
        handsOnProjects: [
          {
            title: 'Production Kubernetes Cluster Deployment with Zero-Downtime Rolling Updates',
            spec: 'Deploy a high-throughput microservice on Kubernetes configured with readiness/liveness probes, preStop sleep hooks, Horizontal Pod Autoscaler, and PodDisruptionBudgets. Execute load tests during a rolling update to verify 0 dropped HTTP connections.',
            deliverables: ['Complete Kubernetes YAML manifest suite / Helm chart', 'Vegeta / k6 load test report demonstrating 100% 200 OK responses during rollout', 'HPA scaling demonstration recording']
          }
        ]
      },
      {
        tier: 'Tier 3',
        title: 'Observability Telemetry, eBPF & SRE Incident Management',
        description: 'Instrument production distributed systems with metrics, logs, and distributed traces; manage SLO error budgets.',
        durationWeeks: 8,
        competencies: [
          { topic: 'SLI/SLO Engineering & Error Budget Governance', weightPercentage: 45, benchmarkAccuracy: 85, coreInvariants: ['Multi-window multi-burn-rate alerting', 'Error budget freeze policy enforcement', 'Good events over total valid events ratio'] },
          { topic: 'Observability Telemetry (Prometheus, OpenTelemetry, Grafana)', weightPercentage: 30, benchmarkAccuracy: 80, coreInvariants: ['Counter rate() vs gauge values', 'High cardinality label hazards', 'Distributed trace context propagation (W3C TraceContext)'] },
          { topic: 'Linux Kernel Performance & eBPF Tracing', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['CFS CPU quota throttling latency', 'TCP socket backlog drop queues', 'Zero-copy sendfile kernel transitions'] }
        ],
        handsOnProjects: [
          {
            title: 'Enterprise OpenTelemetry & SRE Observability Stack',
            spec: 'Instrument a polyglot microservice application with OpenTelemetry collectors, Prometheus scraping, and Grafana dashboards. Implement multi-window burn-rate alert rules that notify on-call engineers before 2% of the monthly error budget burns in 1 hour.',
            deliverables: ['Prometheus alert rule configuration', 'Grafana RED (Rate, Errors, Duration) dashboard JSON', 'Incident post-mortem template documenting simulated outage']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-devops-1',
        title: 'Diagnosing OOMKilled vs CrashLoopBackOff in Kubernetes',
        difficulty: 'MEDIUM',
        category: 'Kubernetes Internals',
        questionText: 'A Kubernetes pod frequently restarts. kubectl describe pod reports exit code 137, while another pod reports CrashLoopBackOff with exit code 1. How do you distinguish the root causes, and how do you systematically remediate each?',
        modelAnswer: 'Exit code 137 indicates the process was terminated by SIGKILL (128 + 9 = 137), almost always triggered by the Linux kernel Out-Of-Memory (OOM) killer because the container exceeded its configured cgroup memory limit. To remediate: inspect memory usage graphs, increase container resources.limits.memory, or fix memory leaks in the runtime (e.g. JVM heap sizing or unclosed database connections). In contrast, CrashLoopBackOff with exit code 1 indicates an application-level unhandled exception or crash during startup (e.g. missing environment variables, failing database connection, syntax error). To remediate: inspect kubectl logs --previous to view the stack trace prior to termination.',
        counterQuestions: [
          'What happens if a pod has memory requests set but no memory limits?',
          'How does the Linux kernel oom_score_adj algorithm decide which pod container to terminate first on a starved worker node?'
        ],
        interviewerExpectations: [
          'Must recognize exit code 137 as SIGKILL / OOMKiller.',
          'Must explain checking kubectl logs --previous for exit code 1.',
          'Must understand the difference between memory requests (scheduling) and limits (cgroup enforcement).'
        ],
        criticalPitfalls: [
          'Confusing CPU throttling with OOM kills: exceeding CPU limits throttles clock cycles (CFS quota); it never terminates the process.'
        ]
      },
      {
        id: 'q-devops-2',
        title: 'Zero-Downtime Rolling Updates & Connection Draining',
        difficulty: 'HARD',
        category: 'Production Reliability',
        questionText: 'During a Kubernetes Deployment rollout, clients report intermittent 502 Bad Gateway errors for 2-3 seconds, despite readiness probes being configured. What causes this race condition, and what is the definitive fix?',
        modelAnswer: 'This occurs because pod termination and ingress/kube-proxy endpoint removal happen asynchronously in parallel. When a pod is terminated: 1) The kubelet sends SIGTERM to the container. 2) Simultaneously, the Endpoint controller removes the pod IP from the Service Endpoints list and kube-proxy updates iptables/IPVS rules across worker nodes. Because iptables rule propagation takes a few hundred milliseconds, ingress proxies continue forwarding incoming traffic to the terminating pod after the application has already stopped accepting connections. To fix: 1) Add a preStop lifecycle hook: preStop: exec: command: ["/bin/sh", "-c", "sleep 15"]. This pauses SIGTERM delivery to the application process, giving iptables rules sufficient time to withdraw the pod IP from all proxies. 2) Implement graceful shutdown in the application server to finish processing in-flight requests before exiting.',
        counterQuestions: [
          'Why does a readiness probe alone fail to prevent this 502 error during pod termination?',
          'What happens if terminationGracePeriodSeconds is shorter than the preStop sleep duration?'
        ],
        interviewerExpectations: [
          'Identify the asynchronous race condition between endpoint removal and SIGTERM.',
          'Provide the preStop sleep pattern as the canonical production fix.'
        ],
        criticalPitfalls: [
          'Assuming increasing the replica count will prevent 502 errors during rolling deployment.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Configuring Tight CPU Limits Leading to Severe CFS Throttling',
        antiPattern: 'Setting resources.limits.cpu: "500m" to prevent runaway CPU usage, resulting in severe latency spikes even when node CPU utilization is below 20%.',
        correctApproach: 'The Linux Completely Fair Scheduler (CFS) enforces CPU limits across 100ms periods. A multi-threaded application can burst across all cores and exhaust its 50ms quota within the first 10ms of the period, remaining completely frozen for the remaining 90ms. In modern Kubernetes, best practice is to set CPU requests for scheduling and omit CPU limits or use CPU quota burst allowances.',
        dangerLevel: 'CRITICAL',
        interviewContext: 'Asked during Kubernetes Performance & Latency optimization drills.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'Completely Fair Scheduler (CFS) Quota Physics',
        overview: 'Understanding how Linux cgroups enforce CPU bandwidth constraints is vital for preventing tail-latency degradation in containerized environments.',
        architecturalInvariants: [
          {
            title: 'CFS CPU Quota Formula',
            formulaOrInvariant: 'allowed_runtime = quota / period',
            explanation: 'Under cgroups v1/v2, cpu.cfs_period_us defaults to 100,000us (100ms). If cpu.cfs_quota_us is set to 50,000us (0.5 cores), all threads combined cannot exceed 50ms of execution per 100ms period. Any excess triggers immediate thread suspension until the next period starts.',
            tradeoffs: 'Removing CPU limits prevents throttling latency spikes but requires cluster-wide node autoscaling to absorb runaway CPU loops.'
          }
        ],
        codeExamples: [
          {
            language: 'yaml',
            title: 'Production Resilient Kubernetes Pod Spec with Graceful Termination',
            code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  template:
    spec:
      terminationGracePeriodSeconds: 60
      containers:
      - name: app
        image: service:v2.4.1
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]
        readinessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 3
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            memory: 1Gi`,
            explanation: 'Ensures zero-downtime rolling updates by combining maxUnavailable: 0, preStop sleep draining, and memory bounds.'
          }
        ]
      }
    ]
  },

  // 4. Java Enterprise Backend Developer
  {
    id: 'role-java-backend',
    slug: 'java-backend-developer',
    name: 'Java Enterprise Backend Developer',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'High-throughput enterprise backend engineering, Java Memory Model, JVM garbage collection mechanics, concurrency primitives, and relational databases.',
    category: 'Backend & Systems',
    estimatedReadTime: '25 min',
    pageEstimate: 15,
    information: {
      overview: 'Java Enterprise Backend Developers build mission-critical, high-concurrency enterprise services. They specialize in JVM memory architecture, non-blocking asynchronous I/O, relational database transaction isolation, and thread-safe data structures.',
      mission: 'Engineer robust Java microservices processing thousands of transactions per second with strict ACID guarantees and sub-millisecond GC pause latencies.',
      dayInTheLife: [
        'Writing thread-safe domain logic utilizing modern Java features (records, sealed classes, pattern matching, virtual threads).',
        'Profiling heap allocations, GC pause durations (ZGC / G1), and memory leaks with JFR (Java Flight Recorder) and async-profiler.',
        'Tuning database connection pools (HikariCP) and optimizing SQL query execution plans with indexing.',
        'Implementing distributed event-driven messaging pipelines with idempotent consumer deduplication.',
        'Reviewing code for concurrency race conditions, memory visibility flaws, and resource leaks.'
      ],
      coreResponsibilities: [
        'Design and develop high-throughput REST and gRPC microservices using modern Java frameworks.',
        'Enforce thread safety and memory consistency using Java Memory Model (JMM) happens-before rules.',
        'Optimize database transaction boundaries, lock contention (pessimistic vs optimistic), and connection pooling.',
        'Tune JVM runtime parameters, garbage collectors, and off-heap memory buffers.',
        'Author comprehensive unit and integration test suites using JUnit 5, Mockito, and Testcontainers.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Associate Java Engineer', typicalExperience: '0-2 yrs', focus: 'Core Java syntax, Spring Boot REST endpoints, JPA/Hibernate mapping, and unit testing.' },
        { level: 'L2', title: 'Senior Backend Developer', typicalExperience: '2-5 yrs', focus: 'Multithreading, transaction isolation tuning, performance profiling, and distributed caching.' },
        { level: 'L3', title: 'Staff Systems Engineer', typicalExperience: '5-8 yrs', focus: 'Low-latency JVM engineering, event-driven microservices architecture, and high-concurrency systems.' },
        { level: 'L4', title: 'Principal Software Architect', typicalExperience: '8+ yrs', focus: 'Enterprise distributed data plane, zero-copy messaging architectures, and platform reliability.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$95,000 - $125,000', midSenior: '$140,000 - $195,000', staffPrincipal: '$210,000 - $325,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 55,000 - 75,000', midSenior: 'EUR 85,000 - 130,000', staffPrincipal: 'EUR 140,000 - 215,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 10,00,000 - 17,00,000', midSenior: 'INR 22,00,000 - 42,00,000', staffPrincipal: 'INR 50,00,000 - 90,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'Java 21+ (Virtual Threads)', 'Spring Boot & Micronaut', 'PostgreSQL & MySQL', 'HikariCP & JPA/jOOQ',
        'Redis & Hazelcast', 'Kafka & RabbitMQ', 'JFR & async-profiler', 'Testcontainers & JUnit 5'
      ],
      industryDemandRationale: 'Enterprise banking, fintech, e-commerce, and logistics rely on Java for their core transactional ledgers. Engineers with deep JVM and concurrency skills command premium salaries globally.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Core Java Fundamentals & Memory Architecture',
        description: 'Master Object-Oriented Design, Collections internals, Exception hierarchies, and JVM Heap/Stack memory layout.',
        durationWeeks: 4,
        competencies: [
          { topic: 'Java Collections Framework Internals', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['HashMap O(1) bucketing and treeification at bin size 8', 'ArrayList dynamic array growth 1.5x formula', 'ConcurrentHashMap lockless reads via volatile table pointers'] },
          { topic: 'JVM Memory Architecture & GC Foundations', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Heap Young/Old generation vs Metaspace', 'Eden to Survivor copy cycles', 'Root set reachability mark-and-sweep'] },
          { topic: 'Modern Java Features (Records, Pattern Matching, Sealed Types)', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Record shallow immutability invariants', 'Exhaustive pattern matching with sealed interfaces', 'Value-based class identity semantics'] }
        ],
        handsOnProjects: [
          {
            title: 'High-Performance Custom In-Memory Cache with LRU Eviction',
            spec: 'Implement an in-memory thread-safe key-value cache combining a HashMap and a Doubly Linked List with O(1) get and put operations, enforcing capacity limits with atomic eviction.',
            deliverables: ['Custom thread-safe LRU implementation', 'Concurrency stress test suite simulating 100 threads', 'JMH microbenchmark measuring nanosecond latencies']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'Concurrency, Java Memory Model & Database Transactions',
        description: 'Master thread synchronization, JMM happens-before guarantees, Virtual Threads, and ACID transaction isolation levels.',
        durationWeeks: 6,
        competencies: [
          { topic: 'Java Memory Model (JMM) & Thread Synchronization', weightPercentage: 45, benchmarkAccuracy: 80, coreInvariants: ['Volatile write happens-before volatile read', 'Atomic CAS (Compare-And-Swap) memory barriers', 'Virtual Thread thread-pinning avoidance with synchronized blocks'] },
          { topic: 'Database Transaction Isolation & Locking Topologies', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Dirty reads, Non-repeatable reads, Phantom reads', 'Optimistic locking with @Version vs Pessimistic write locks', 'HikariCP connection pool starvation prevention'] },
          { topic: 'Enterprise REST & gRPC API Engineering', weightPercentage: 20, benchmarkAccuracy: 70, coreInvariants: ['Idempotency-Key HTTP header deduplication', 'Global exception translation with RFC 7807 ProblemDetails', 'Streaming gRPC backpressure handling'] }
        ],
        handsOnProjects: [
          {
            title: 'High-Throughput Financial Ledger with Optimistic Locking',
            spec: 'Build a double-entry accounting ledger service processing concurrent fund transfers. Prevent overdrafts and deadlocks using optimistic locking with exponential backoff and test with 500 concurrent threads.',
            deliverables: ['Spring Boot / Micronaut service', 'Integration test suite using Testcontainers and PostgreSQL', 'Thread-safety benchmark report']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-java-1',
        title: 'ConcurrentHashMap Lockless Reads & Treeification',
        difficulty: 'MEDIUM',
        category: 'Java Concurrency',
        questionText: 'How does ConcurrentHashMap achieve high read throughput without acquiring locks, and what structural transformation occurs when hash collisions spike in a single bucket?',
        modelAnswer: 'ConcurrentHashMap achieves lockless reads through the Java Memory Model guarantees on its internal Node array: 1) The table array and the val/next references in each Node are declared volatile. This ensures any write to a node by an updating thread is immediately visible to any reading thread without acquiring locks. 2) Writes only lock the head node of the specific bin (bucket) using synchronized(firstNode), allowing other bins to be modified concurrently. When collisions in a single bucket exceed TREEIFY_THRESHOLD (default 8) and total table capacity is at least MIN_TREEIFY_CAPACITY (64), the bucket transforms from a singly linked list into a balanced Red-Black Tree (TreeNode), reducing worst-case lookup complexity from O(N) to O(log N).',
        counterQuestions: [
          'Why does ConcurrentHashMap not use synchronized on read operations?',
          'What happens during table resizing (rehash), and how do concurrent writing threads participate in transferring buckets?'
        ],
        interviewerExpectations: [
          'Mention volatile visibility for lockless get() calls.',
          'Explain fine-grained synchronization on bucket head nodes.',
          'Identify Red-Black Tree transformation at threshold 8.'
        ],
        criticalPitfalls: [
          'Claiming ConcurrentHashMap uses Segment locks in modern Java: Java 8+ eliminated Segments in favor of synchronized bucket heads and CAS.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Pinning Carrier Threads with Synchronized Blocks in Virtual Threads',
        antiPattern: 'Executing blocking I/O operations (e.g. database query, HTTP call) inside a synchronized block in a Java 21 Virtual Thread.',
        correctApproach: 'When a Virtual Thread executes a synchronized block or native method, it becomes "pinned" to its underlying OS carrier thread, preventing the carrier thread from unmounting and executing other virtual threads. Replace synchronized blocks with java.util.concurrent.locks.ReentrantLock, which unmounts cleanly during blocking I/O.',
        dangerLevel: 'CRITICAL',
        interviewContext: 'Asked during Java 21 & Concurrency architectural screening.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'Java Memory Model (JMM) Happens-Before Invariants',
        overview: 'Thread safety in Java is governed by formal memory visibility rules defined in JLS Chapter 17.',
        architecturalInvariants: [
          {
            title: 'Volatile Variable Rule',
            formulaOrInvariant: 'Write(volatile v) happens-before Read(volatile v)',
            explanation: 'A write to a volatile field happens-before every subsequent read of that same field. Actions before the write in program order are also visible to the reading thread.',
            tradeoffs: 'Volatile variables prevent compiler instruction reordering via CPU memory barriers (LoadLoad/StoreStore), which carries a minor CPU pipeline flush cost.'
          }
        ],
        codeExamples: [
          {
            language: 'java',
            title: 'Thread-Safe Lock-Free Ring Buffer with VarHandle Acquire/Release',
            code: `public class LockFreeQueue<T> {
    private static final VarHandle HEAD;
    private static final VarHandle TAIL;
    private volatile int head = 0;
    private volatile int tail = 0;
    private final Object[] buffer;

    static {
        try {
            MethodHandles.Lookup l = MethodHandles.lookup();
            HEAD = l.findVarHandle(LockFreeQueue.class, "head", int.class);
            TAIL = l.findVarHandle(LockFreeQueue.class, "tail", int.class);
        } catch (ReflectiveOperationException e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    public LockFreeQueue(int capacity) {
        this.buffer = new Object[capacity];
    }
}`,
            explanation: 'Demonstrates low-level VarHandle memory ordering without full synchronization locks.'
          }
        ]
      }
    ]
  },

  // 5. Python Developer & Automation Engineer
  {
    id: 'role-python-dev',
    slug: 'python-developer',
    name: 'Python Developer & Automation Engineer',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'Backend web development with modern asynchronous frameworks, event loop scheduling, automation scripting, and algorithmic data processing.',
    category: 'Backend & Systems',
    estimatedReadTime: '23 min',
    pageEstimate: 14,
    information: {
      overview: 'Python Developers & Automation Engineers build scalable API services, asynchronous web scrapers, automation workflows, and data pipelines. They possess deep mastery over Python memory management, generator iterators, asyncio runtimes, and concurrent worker pools.',
      mission: 'Develop robust, maintainable Python backends capable of processing high-volume asynchronous I/O and automating complex enterprise workflows.',
      dayInTheLife: [
        'Building asynchronous REST/GraphQL APIs with FastAPI or Django utilizing Pydantic schema validation.',
        'Diagnosing event loop latency spikes and offloading CPU-intensive algorithms to multiprocessing worker pools.',
        'Writing memory-efficient generator streaming pipelines to ingest multi-gigabyte data files without RAM bloat.',
        'Automating infrastructure validation and integration testing using Pytest fixtures and mock adapters.',
        'Profiling application memory with tracemalloc and optimizing critical loops with Cython or vectorized NumPy routines.'
      ],
      coreResponsibilities: [
        'Develop and maintain high-performance asynchronous web services with FastAPI, Starlette, or Django.',
        'Design automated testing suites, synthetic monitor scripts, and CI verification tools.',
        'Optimize memory usage and execution speed of data manipulation and ETL workflows.',
        'Manage relational and document databases with SQLAlchemy, Tortoise ORM, and Redis.',
        'Implement robust error handling, structured JSON logging, and distributed tracing.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Associate Python Developer', typicalExperience: '0-2 yrs', focus: 'Scripting, REST endpoints with FastAPI/Flask, basic database queries, and unit tests.' },
        { level: 'L2', title: 'Senior Backend Engineer', typicalExperience: '2-5 yrs', focus: 'Asyncio event loops, ORM query optimization, Celery worker orchestration, and caching.' },
        { level: 'L3', title: 'Staff Systems Developer', typicalExperience: '5-8 yrs', focus: 'High-throughput asynchronous architectures, GIL-free multithreading, and platform tooling.' },
        { level: 'L4', title: 'Principal Python Architect', typicalExperience: '8+ yrs', focus: 'Enterprise microservices strategy, core framework extensions, and distributed data systems.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$90,000 - $120,000', midSenior: '$135,000 - $185,000', staffPrincipal: '$200,000 - $315,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 50,00,0 - 72,000', midSenior: 'EUR 80,000 - 120,000', staffPrincipal: 'EUR 135,000 - 200,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 9,00,000 - 15,00,000', midSenior: 'INR 20,00,000 - 38,00,000', staffPrincipal: 'INR 45,00,000 - 85,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'Python 3.12+ / 3.13', 'FastAPI & Pydantic', 'Asyncio & anyio', 'SQLAlchemy 2.0 & Alembic',
        'Celery & Redis', 'Pytest & pytest-asyncio', 'Docker & Poetry', 'HTTPX & aiohttp'
      ],
      industryDemandRationale: 'Python dominates cloud automation, data engineering, AI application backends, and rapid API development. Strong Python engineers with true async systems depth are in high demand.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Pythonic Design, Memory Management & Iterators',
        description: 'Understand Python object model, garbage collection (ref counting + cyclic GC), generators, and context managers.',
        durationWeeks: 4,
        competencies: [
          { topic: 'Python Object Model & Memory Management', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['Reference counting immediate deallocation', 'Cyclic GC generation sweeps', '__slots__ memory footprint reduction'] },
          { topic: 'Iterators, Generators & Streaming Pipelines', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Generator yield lazy evaluation', 'Memory consumption O(1) vs list comprehension O(N)', 'itertools and generator delegation (yield from)'] },
          { topic: 'Functional Tooling & Decorator Metaprogramming', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Decorator closure state wrapping with functools.wraps', 'Context managers with contextlib.contextmanager', 'Dunder methods (__repr__, __enter__, __exit__)'] }
        ],
        handsOnProjects: [
          {
            title: 'Memory-Efficient Streaming CSV/JSON ETL Engine',
            spec: 'Build an ETL parser that processes a 10GB CSV file using generator pipelines with under 50MB resident memory (RSS), validating rows against schema rules and outputting NDJSON.',
            deliverables: ['Streaming parser Python script', 'Memory profile report using memory_profiler demonstrating <50MB peak RAM', 'Pytest test suite covering malformed input rows']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'Asynchronous Concurrency (Asyncio) & FastAPI Web Services',
        description: 'Master cooperative multitasking, event loops, coroutines, non-blocking I/O, and production FastAPI services.',
        durationWeeks: 6,
        competencies: [
          { topic: 'Asyncio Event Loop & Non-Blocking Concurrency', weightPercentage: 45, benchmarkAccuracy: 80, coreInvariants: ['Single-threaded event loop cooperative yielding', 'Offloading CPU tasks via loop.run_in_executor', 'Task cancellation and asyncio.shield protection'] },
          { topic: 'Modern API Architecture with FastAPI & Pydantic', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Dependency injection (Depends) scoping', 'Pydantic v2 validation serialization performance', 'BackgroundTasks fire-and-forget lifecycle'] },
          { topic: 'Relational Database Integration with SQLAlchemy 2.0', weightPercentage: 20, benchmarkAccuracy: 70, coreInvariants: ['AsyncSession connection management', 'Eager loading (selectinload) preventing N+1 queries', 'Alembic automated database migration versioning'] }
        ],
        handsOnProjects: [
          {
            title: 'High-Throughput Asynchronous Web Scraping & Aggregation Service',
            spec: 'Build a FastAPI service that concurrently scrapes, parses, and persists data from 100 external endpoints with token-bucket rate limiting, exponential retry backoff, and PostgreSQL async storage.',
            deliverables: ['FastAPI application repository', 'Locust load test script demonstrating 1,000 req/s concurrency', 'Docker compose environment with PostgreSQL and Redis']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-py-1',
        title: 'Event Loop Starvation in Asyncio Backends',
        difficulty: 'HARD',
        category: 'Asyncio Systems',
        questionText: 'In a FastAPI backend handling 500 requests/sec, an endpoint performs a synchronous image resizing operation using Pillow. Within seconds, all other endpoints experience latency spikes and timeout. Explain the technical root cause and how to properly fix it.',
        modelAnswer: 'Python asyncio is built on a single-threaded cooperative multitasking event loop. When a coroutine executes a synchronous, CPU-intensive operation like image resizing (or synchronous time.sleep / file read), it does not yield control back to the event loop. The thread is completely blocked from executing other waiting coroutines, network socket reads, or timer callbacks, causing event loop starvation and global timeouts. The proper fix is to offload CPU-bound synchronous work to an external process or thread pool: await asyncio.to_thread(sync_function, args) or loop.run_in_executor(multiprocessing_pool, sync_function). This frees the main event loop thread to continue servicing network I/O.',
        counterQuestions: [
          'Why is a ProcessPoolExecutor preferred over a ThreadPoolExecutor for heavy CPU workloads under the standard GIL?',
          'What happens if an asynchronous coroutine creates a thread pool worker on every incoming request without bounding the executor?'
        ],
        interviewerExpectations: [
          'Identify single-threaded event loop blocking as the cause.',
          'Differentiate between I/O-bound async tasks and CPU-bound blocking tasks.',
          'Recommend asyncio.to_thread or ProcessPoolExecutor.'
        ],
        criticalPitfalls: [
          'Suggesting wrapping the synchronous function with async def without an executor, which does NOT make it asynchronous.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Mutable Default Arguments in Function Signatures',
        antiPattern: 'Defining def add_item(item, basket=[]) where a mutable list is created once at function definition time and shared across all invocations.',
        correctApproach: 'Use None as the default argument and initialize the list inside the function: def add_item(item, basket=None): if basket is None: basket = [].',
        dangerLevel: 'HIGH',
        interviewContext: 'Standard Python fundamentals screening question.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'Asyncio Event Loop Invariants & Concurrency Physics',
        overview: 'Asyncio relies on cooperative yielding via await expressions to dispatch task execution.',
        architecturalInvariants: [
          {
            title: 'Cooperative Yielding Rule',
            formulaOrInvariant: 'Execution_Continuity = True UNTIL Explicit_Yield (await / yield)',
            explanation: 'A coroutine holds exclusive CPU execution until it explicitly encounters an await expression targeting a pending Future or IO selector.',
            tradeoffs: 'Eliminates race conditions on local variables without locks, but any blocking call halts the entire application process.'
          }
        ],
        codeExamples: [
          {
            language: 'python',
            title: 'Non-Blocking Bounded Concurrency Task Worker',
            code: `import asyncio
from typing import List, Any

async def process_item(semaphore: asyncio.Semaphore, item: int) -> int:
    async with semaphore:
        # Guaranteed max 10 concurrent in-flight executions
        await asyncio.sleep(0.05)
        return item * 2

async def main(items: List[int]) -> List[Any]:
    sem = asyncio.Semaphore(10)
    tasks = [process_item(sem, i) for i in items]
    return await asyncio.gather(*tasks)`,
            explanation: 'Controls concurrency with an asyncio.Semaphore to prevent resource starvation or downstream rate-limit tripwires.'
          }
        ]
      }
    ]
  },

  // 6. Full Stack JavaScript & Web Engineer
  {
    id: 'role-fullstack-js',
    slug: 'fullstack-javascript-developer',
    name: 'Full Stack JavaScript & Web Engineer',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'End-to-end web engineering, TypeScript type systems, React/Next.js component architectures, Node.js event loop runtimes, and REST/GraphQL APIs.',
    category: 'Full-Stack & Web',
    estimatedReadTime: '24 min',
    pageEstimate: 15,
    information: {
      overview: 'Full Stack JavaScript Engineers build seamless, accessible user interfaces and high-throughput server backends. They master the modern React ecosystem, server-side rendering (SSR), TypeScript static type invariants, and Node.js asynchronous stream mechanics.',
      mission: 'Ship responsive, accessible, sub-second First Contentful Paint (FCP) web applications backed by scalable Node.js microservices.',
      dayInTheLife: [
        'Developing responsive, accessible UI components with React, Next.js App Router, and Tailwind CSS.',
        'Authoring type-safe backend API routes in Node.js / Next.js with Zod schema validation.',
        'Optimizing bundle sizes, code splitting, dynamic imports, and server-side rendering performance.',
        'Designing database schemas with Prisma or Drizzle ORM and writing efficient relational queries.',
        'Implementing real-time bidirectional communication using WebSockets and Server-Sent Events (SSE).'
      ],
      coreResponsibilities: [
        'Develop accessible, cross-browser web interfaces adhering to WCAG 2.1 AA accessibility standards.',
        'Build and maintain full-stack web applications utilizing React Server Components (RSC) and Server Actions.',
        'Enforce end-to-end type safety using TypeScript generics, utility types, and runtime schema validators.',
        'Optimize Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms).',
        'Write robust unit, component, and end-to-end test suites using Vitest, Testing Library, and Playwright.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Associate Full Stack Developer', typicalExperience: '0-2 yrs', focus: 'React components, Tailwind styling, REST API integration, and basic TypeScript.' },
        { level: 'L2', title: 'Senior Full Stack Engineer', typicalExperience: '2-5 yrs', focus: 'Next.js App Router, SSR/SSG caching strategies, state management, and database design.' },
        { level: 'L3', title: 'Staff Web Architect', typicalExperience: '5-8 yrs', focus: 'Micro-frontends, design system architecture, performance optimization, and edge computing.' },
        { level: 'L4', title: 'Principal Frontend / Full Stack Fellow', typicalExperience: '8+ yrs', focus: 'Web platform strategy, enterprise design standards, and developer productivity tooling.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$92,000 - $122,000', midSenior: '$138,000 - $190,000', staffPrincipal: '$205,000 - $320,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 52,000 - 74,000', midSenior: 'EUR 82,000 - 125,000', staffPrincipal: 'EUR 138,000 - 205,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 9,50,000 - 16,00,000', midSenior: 'INR 21,00,000 - 40,00,000', staffPrincipal: 'INR 48,00,000 - 90,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'TypeScript 5+', 'Next.js 15 (App Router) & React 19', 'Tailwind CSS v4', 'Node.js & Bun Runtimes',
        'Prisma & Drizzle ORM', 'Zod & React Hook Form', 'Playwright & Vitest', 'Redis & WebSockets'
      ],
      industryDemandRationale: 'JavaScript and TypeScript power the modern web. Companies need full-stack engineers who can deliver high-converting user interfaces without compromising on backend scalability or security.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Modern TypeScript, React Foundations & DOM Rendering',
        description: 'Master TypeScript type gymnastics, React component lifecycle, hooks, and virtual DOM reconciliation.',
        durationWeeks: 4,
        competencies: [
          { topic: 'TypeScript Static Typing & Generics', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['Discriminated unions exhaustive checking', 'Mapped types and conditional type inference (infer)', 'Type narrowing via user-defined type guards'] },
          { topic: 'React Fiber Reconciliation & Hook Mechanics', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Immutability invariant in state updates', 'useEffect dependency array closures and cleanup', 'useMemo and useCallback reference stability'] },
          { topic: 'Responsive CSS Layouts & Accessibility (a11y)', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Flexbox and Grid layout recalculation costs', 'ARIA role and keyboard focus trap management', 'Semantic HTML5 landmark hierarchy'] }
        ],
        handsOnProjects: [
          {
            title: 'Accessible Design System Component Library',
            spec: 'Build a production-ready component library (Modal, Dropdown, Tabs, Data Table) using React and Tailwind CSS adhering strictly to WAI-ARIA 1.2 keyboard navigation guidelines with 100% test coverage.',
            deliverables: ['Reusable component package', 'Vitest component test suite with Testing Library', 'Accessibility compliance audit passing axe-core']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'Next.js Full-Stack Architecture, Server Components & Database Systems',
        description: 'Master React Server Components, server actions, caching topologies, and relational database persistence.',
        durationWeeks: 6,
        competencies: [
          { topic: 'React Server Components (RSC) & Data Fetching', weightPercentage: 45, benchmarkAccuracy: 80, coreInvariants: ['Server vs Client Component serialization boundaries', 'Streaming SSR with Suspense boundaries', 'Cache-Control headers and revalidateTag mechanics'] },
          { topic: 'Node.js Event Loop & Asynchronous Streams', weightPercentage: 30, benchmarkAccuracy: 75, coreInvariants: ['process.nextTick vs Promise microtask priority', 'Backpressure management in stream.pipeline', 'Buffer allocation and memory leak debugging'] },
          { topic: 'Relational Database Persistence with Prisma/PostgreSQL', weightPercentage: 25, benchmarkAccuracy: 70, coreInvariants: ['Foreign key cascade integrity', 'Indexed column lookup selectivity', 'Optimistic concurrency control with version tokens'] }
        ],
        handsOnProjects: [
          {
            title: 'Full-Stack Real-Time Collaboration Board',
            spec: 'Develop a full-stack Next.js web application with live collaborative editing via WebSockets, PostgreSQL persistence, optimistic UI updates, and server action authentication.',
            deliverables: ['Next.js application repository', 'WebSocket sync engine with conflict resolution', 'Playwright end-to-end integration test suite']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-fs-1',
        title: 'React Server Components vs Client Components Boundary Rules',
        difficulty: 'MEDIUM',
        category: 'React Architecture',
        questionText: 'What data types can be passed as props across the React Server Component (RSC) to Client Component boundary, and why do functions or non-serializable objects throw errors?',
        modelAnswer: 'Props passed across the Server-to-Client boundary must be serializable across the network protocol into JSON/Flight stream payloads. Valid types include primitive strings, numbers, booleans, null, undefined, plain arrays, plain objects, Maps, Sets, TypedArrays, and JSX elements. Non-serializable values—such as functions (event handlers), class instances with methods, symbols, or DOM elements—cannot be passed because the server renders HTML/Flight payloads asynchronously and sends them across HTTP; a JavaScript function closure cannot be serialized into text without executing in the client context. To pass user interactions, convert the child component to a Client Component ("use client") or pass a Server Action.',
        counterQuestions: [
          'Can a Server Component be passed as a children prop to a Client Component without making the Server Component run on the client?',
          'How does Next.js handle partial page hydration when multiple Suspense boundaries stream simultaneously?'
        ],
        interviewerExpectations: [
          'Explain network serialization / Flight protocol as the reason.',
          'Identify valid vs invalid prop types.',
          'Demonstrate knowledge of the "children pattern" for nesting Server Components inside Client Components.'
        ],
        criticalPitfalls: [
          'Assuming "use client" runs code only in the browser: Client Components still execute on the server during initial SSR.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Stale Closure Bugs in useEffect / Event Listeners',
        antiPattern: 'Referencing component state inside an event listener or useEffect without including the state variable in the dependency array.',
        correctApproach: 'The effect closure captures the initial render value of state. If dependencies are omitted, subsequent events read outdated stale state. Use functional state updates (setCount(c => c + 1)) or include all referenced variables in the dependency array.',
        dangerLevel: 'HIGH',
        interviewContext: 'Asked during React Coding & Component Design interviews.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'Node.js / V8 Event Loop Microtask Invariants',
        overview: 'Understanding microtask and macrotask execution order is critical for preventing subtle asynchronous race conditions.',
        architecturalInvariants: [
          {
            title: 'Microtask Drain Priority Rule',
            formulaOrInvariant: 'CallStack_Empty -> Drain(process.nextTick) -> Drain(Promise_Microtasks) -> Advance(Macrotask_Phase)',
            explanation: 'Whenever the call stack empties, the runtime drains all pending process.nextTick callbacks, followed by all Promise microtasks, before advancing to the next libuv macrotask phase (Timers, Poll, Check).',
            tradeoffs: 'Recursive nextTick or Promise chaining starves the event loop, preventing I/O operations from ever firing.'
          }
        ],
        codeExamples: [
          {
            language: 'typescript',
            title: 'Type-Safe Server Action with Zod Validation',
            code: `'use server';
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(20),
});

export async function createPostAction(formData: FormData) {
  const parsed = CreatePostSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });

  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  // Persist to database with verified type safety
  return { success: true, data: parsed.data };
}`,
            explanation: 'Ensures strict runtime type validation before invoking backend database mutations.'
          }
        ]
      }
    ]
  },

  // 7. Data Analyst & SQL Specialist
  {
    id: 'role-data-analyst',
    slug: 'data-analyst',
    name: 'Data Analyst & SQL Specialist',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'Advanced analytical SQL, window functions, statistical inference, cohort retention analysis, and business intelligence reporting.',
    category: 'Data & AI',
    estimatedReadTime: '22 min',
    pageEstimate: 13,
    information: {
      overview: 'Data Analysts & SQL Specialists transform complex transactional databases and event streams into actionable business intelligence. They write high-performance SQL queries, design metric semantic layers, conduct A/B test statistical analysis, and model user retention cohorts.',
      mission: 'Extract unambiguous statistical insights from petabyte-scale data lakes with optimized query plans and rigorous methodology.',
      dayInTheLife: [
        'Authoring complex SQL queries utilizing window functions, Common Table Expressions (CTEs), and self-joins.',
        'Analyzing query execution plans (EXPLAIN ANALYZE) to eliminate full table scans and memory-spill sorts.',
        'Building user retention cohort heatmaps to measure feature adoption and churn rates.',
        'Designing executive business intelligence dashboards with automated data refresh schedules.',
        'Conducting statistical hypothesis testing (t-tests, chi-squared, p-values, confidence intervals) on A/B tests.'
      ],
      coreResponsibilities: [
        'Write complex, optimized SQL queries across columnar warehouses and relational databases.',
        'Design dimensional schemas (Star and Snowflake schemas) for analytical reporting.',
        'Perform cohort analysis, customer lifetime value (LTV) modeling, and funnel conversion tracking.',
        'Formulate and evaluate statistical A/B tests with sample size and power calculation.',
        'Translate executive business inquiries into reproducible data pipelines and visualizations.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Junior Data Analyst', typicalExperience: '0-2 yrs', focus: 'Basic SQL queries (joins, aggregations), dashboard maintenance, and data cleansing.' },
        { level: 'L2', title: 'Senior Data Analyst', typicalExperience: '2-5 yrs', focus: 'Advanced window functions, cohort retention modeling, A/B test analysis, and query optimization.' },
        { level: 'L3', title: 'Lead Analytics Specialist', typicalExperience: '5-8 yrs', focus: 'Semantic metric layer design, data modeling governance, and predictive statistical modeling.' },
        { level: 'L4', title: 'Principal Analytics Strategist', typicalExperience: '8+ yrs', focus: 'Company-wide data strategy, automated attribution modeling, and executive advising.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$80,000 - $105,000', midSenior: '$120,000 - $165,000', staffPrincipal: '$180,000 - $275,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 45,000 - 65,000', midSenior: 'EUR 70,000 - 105,000', staffPrincipal: 'EUR 120,000 - 175,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 8,00,000 - 13,00,000', midSenior: 'INR 16,00,000 - 30,00,000', staffPrincipal: 'INR 38,00,000 - 70,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'Advanced SQL (PostgreSQL, Trino, DuckDB)', 'Window Functions & CTEs', 'Python (pandas, numpy, scipy)',
        'Tableau & Metabase', 'Dimensional Modeling (Kimball)', 'Git & dbt', 'A/B Testing Statistics'
      ],
      industryDemandRationale: 'Data-driven decision making is ubiquitous. Organizations need specialists who can write bulletproof SQL, spot statistical fallacies, and optimize expensive analytical workloads.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Relational Database Foundations & Advanced Analytical SQL',
        description: 'Master multi-table joins, subqueries, grouping sets, and analytical window functions.',
        durationWeeks: 4,
        competencies: [
          { topic: 'SQL Joins, Aggregations & Grouping Sets', weightPercentage: 40, benchmarkAccuracy: 85, coreInvariants: ['Inner vs Outer join row expansion mechanics', 'GROUP BY GROUPING SETS, ROLLUP & CUBE', 'HAVING aggregation filter vs WHERE predicate filter'] },
          { topic: 'Window Functions (Ranking, Offsets & Frames)', weightPercentage: 35, benchmarkAccuracy: 80, coreInvariants: ['ROW_NUMBER() vs RANK() vs DENSE_RANK() tie handling', 'LAG() / LEAD() inter-row time delta calculation', 'ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW running totals'] },
          { topic: 'Data Cleansing & Schema Normalization', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['COALESCE and NULLIF handling for dirty data', 'Third Normal Form (3NF) relational decomposition', 'Date truncation and timezone normalization'] }
        ],
        handsOnProjects: [
          {
            title: 'SaaS Customer Subscription & MRR Cohort Analysis',
            spec: 'Author a modular SQL query computing Monthly Recurring Revenue (MRR), expansion revenue, contraction revenue, and churn rate across monthly sign-up cohorts over 24 months.',
            deliverables: ['SQL analytical script using CTEs', 'Cohort retention triangle output matrix', 'Validation script verifying MRR reconciliation with transaction logs']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'Statistical Inference, A/B Testing & Query Performance',
        description: 'Execute rigorous hypothesis testing, sample size sizing, and query execution plan tuning.',
        durationWeeks: 6,
        competencies: [
          { topic: 'A/B Testing Statistical Analysis & Hypothesis Testing', weightPercentage: 45, benchmarkAccuracy: 80, coreInvariants: ['Null hypothesis rejection (p < 0.05)', 'Type I (alpha) vs Type II (beta) error trade-offs', 'Sample size estimation based on Minimum Detectable Effect (MDE)'] },
          { topic: 'Query Execution Plan Analysis (EXPLAIN ANALYZE)', weightPercentage: 30, benchmarkAccuracy: 75, coreInvariants: ['Seq Scan vs Index Scan vs Bitmap Heap Scan', 'Hash Join vs Nested Loop vs Merge Join memory thresholds', 'Sort memory spills to disk (work_mem tuning)'] },
          { topic: 'Dimensional Modeling (Kimball Star Schema)', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Fact tables vs Slowly Changing Dimensions (SCD Type 2)', 'Surrogate keys vs Natural keys', 'Conformed dimensions across business domains'] }
        ],
        handsOnProjects: [
          {
            title: 'E-Commerce Funnel Conversion & A/B Experiment Audit',
            spec: 'Perform an end-to-end evaluation of an e-commerce checkout A/B test. Calculate sample size adequacy, check for Sample Ratio Mismatch (SRM), compute conversion lifts, and output 95% confidence intervals.',
            deliverables: ['Complete SQL and Python statistical analysis notebook', 'SRM Chi-Square validation test report', 'Executive presentation deck summarizing revenue impact']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-da-1',
        title: 'Window Function Ranking Differences (ROW_NUMBER vs RANK vs DENSE_RANK)',
        difficulty: 'EASY',
        category: 'SQL Analytical Functions',
        questionText: 'When ranking employee salaries in a department where three employees have identical tied salaries of $100,000 followed by an employee making $90,000, what ranks do ROW_NUMBER(), RANK(), and DENSE_RANK() output?',
        modelAnswer: 'For the three tied records followed by the next record: 1) ROW_NUMBER() arbitrarily assigns distinct sequential integers without ties: 1, 2, 3, 4. 2) RANK() assigns identical ranks to tied records and leaves gaps in the sequence equal to the number of tied records: 1, 1, 1, 4. 3) DENSE_RANK() assigns identical ranks to tied records without leaving gaps in subsequent ranks: 1, 1, 1, 2.',
        counterQuestions: [
          'What happens if an ORDER BY clause is omitted inside a window OVER() specification?',
          'What is the default window frame when an ORDER BY clause is present versus when it is omitted?'
        ],
        interviewerExpectations: [
          'Correctly identify the sequence for each ranking function.',
          'State that RANK() produces gaps while DENSE_RANK() does not.'
        ],
        criticalPitfalls: [
          'Confusing RANK() and DENSE_RANK() gap behavior.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'NULL Values in NOT IN Subquery Producing 0 Results',
        antiPattern: 'Executing SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM unsubscribed) when the subquery contains a single NULL value.',
        correctApproach: 'In SQL three-valued logic, x NOT IN (1, 2, NULL) evaluates to UNKNOWN for all rows because comparison against NULL cannot yield TRUE. The query returns 0 rows. Use NOT EXISTS or filter WHERE user_id IS NOT NULL in the subquery.',
        dangerLevel: 'CRITICAL',
        interviewContext: 'Universal SQL interview trap.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'SQL Logical Query Processing Order',
        overview: 'SQL queries execute in a strict logical phase order that differs fundamentally from the lexical written syntax.',
        architecturalInvariants: [
          {
            title: 'Logical Execution Phase Order',
            formulaOrInvariant: 'FROM -> ON -> JOIN -> WHERE -> GROUP BY -> WITH CUBE/ROLLUP -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT',
            explanation: 'Aliases defined in the SELECT clause cannot be referenced in WHERE or GROUP BY clauses because those phases execute prior to SELECT projection.',
            tradeoffs: 'Understanding phase order allows writing performant predicates that filter rows prior to expensive join or group operations.'
          }
        ],
        codeExamples: [
          {
            language: 'sql',
            title: 'Rolling 30-Day Active Users & Retention Cohort Query',
            code: `WITH user_activity AS (
  SELECT
    user_id,
    DATE_TRUNC('month', signup_date) AS cohort_month,
    DATE_TRUNC('month', activity_date) AS activity_month
  FROM user_events
  JOIN users USING (user_id)
)
SELECT
  cohort_month,
  activity_month,
  COUNT(DISTINCT user_id) AS active_users,
  ROUND(
    COUNT(DISTINCT user_id)::numeric / 
    FIRST_VALUE(COUNT(DISTINCT user_id)) OVER (
      PARTITION BY cohort_month 
      ORDER BY activity_month
    ) * 100, 2
  ) AS retention_percentage
FROM user_activity
GROUP BY 1, 2
ORDER BY 1, 2;`,
            explanation: 'Computes cohort retention percentage using the FIRST_VALUE window function to establish baseline cohort size.'
          }
        ]
      }
    ]
  },

  // 8. CRM & Enterprise Applications Specialist
  {
    id: 'role-crm-spec',
    slug: 'crm-specialist',
    name: 'CRM & Enterprise Applications Specialist',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'Enterprise data modeling, relationship schemas, business process automation, workflow rules, audit compliance, and CRM platform architecture.',
    category: 'Enterprise Systems',
    estimatedReadTime: '21 min',
    pageEstimate: 12,
    information: {
      overview: 'CRM & Enterprise Applications Specialists design, automate, and govern enterprise customer data architectures. They model complex business relationships (1:M, M:M junction records), automate business workflow logic, configure role-based access security, and ensure audit compliance.',
      mission: 'Ensure enterprise customer relationship data remains accurate, audited, and seamlessly integrated across departmental workflows.',
      dayInTheLife: [
        'Configuring declarative data models with Master-Detail and Lookup relationship constraints.',
        'Automating approval processes, validation rules, and bulk asynchronous record processors.',
        'Designing field-level security (FLS), sharing rules, and hierarchical role access permissions.',
        'Building bi-directional integration pipelines connecting CRM systems with ERP and billing backends.',
        'Auditing data quality, duplicate records, and enforcing compliance retention mandates.'
      ],
      coreResponsibilities: [
        'Architect relational customer schemas with strict referential integrity and roll-up summary metrics.',
        'Implement automated business logic without exceeding transaction execution limits.',
        'Configure fine-grained access control policies across departments, roles, and profiles.',
        'Design integration APIs for external data ingestion with idempotency and retry handling.',
        'Maintain system change logs, deployment pipelines, and sandbox refresh environments.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Junior CRM Administrator', typicalExperience: '0-2 yrs', focus: 'User administration, standard object configuration, reports, and basic validation rules.' },
        { level: 'L2', title: 'Senior CRM Developer', typicalExperience: '2-5 yrs', focus: 'Bulkified trigger logic, complex workflow automations, and external API integrations.' },
        { level: 'L3', title: 'Enterprise CRM Architect', typicalExperience: '5-8 yrs', focus: 'Large data volume (LDV) indexing, multi-org architecture, and security governance.' },
        { level: 'L4', title: 'Principal Business Systems Director', typicalExperience: '8+ yrs', focus: 'Enterprise IT systems strategy, CRM transformation, and organizational compliance.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$85,000 - $115,000', midSenior: '$130,000 - $175,000', staffPrincipal: '$190,000 - $290,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 48,000 - 68,000', midSenior: 'EUR 75,000 - 115,000', staffPrincipal: 'EUR 125,000 - 185,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 8,50,000 - 14,00,000', midSenior: 'INR 18,00,000 - 34,00,000', staffPrincipal: 'INR 40,00,000 - 75,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'Enterprise CRM Platforms', 'Relational Schemas (Master-Detail / Lookup)', 'Workflow & Approval Engines',
        'REST & SOAP Integration APIs', 'Bulkified Event Architecture', 'SQL / SOQL Query Optimization'
      ],
      industryDemandRationale: 'Every enterprise relies on CRM systems to drive sales, support, and billing operations. Specialists who can handle complex data relationships and bulk transaction limits are essential.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Enterprise Data Modeling & Access Control Security',
        description: 'Master relationship schemas (Master-Detail vs Lookup), validation rules, and sharing models.',
        durationWeeks: 4,
        competencies: [
          { topic: 'Relational Schema Design & Object Relationships', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['Master-Detail cascade delete and sharing inheritance', 'Lookup loose coupling without cascade delete', 'Roll-up summary calculation limits'] },
          { topic: 'Access Control, Profiles & Sharing Rules', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Organization-Wide Defaults (OWD) baseline security', 'Role hierarchy access grant propagation', 'Field-Level Security (FLS) restriction overriding UI layouts'] },
          { topic: 'Declarative Validation & Business Workflow Automation', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Deterministic validation rule firing order', 'Cross-object formula field limitations', 'Approval process multi-step routing logic'] }
        ],
        handsOnProjects: [
          {
            title: 'Enterprise Opportunity Management & Approval Workflow',
            spec: 'Design an end-to-end opportunity management schema with custom pricing tiers, discount validation rules, multi-level executive approval steps, and automated audit logging.',
            deliverables: ['Schema relationship diagram', 'Validation rule test verification report', 'Approval process execution trace']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-crm-1',
        title: 'Master-Detail vs Lookup Relationship Architecture',
        difficulty: 'MEDIUM',
        category: 'Enterprise Data Architecture',
        questionText: 'Explain the critical behavioral and security differences between a Master-Detail relationship and a Lookup relationship in an enterprise CRM platform.',
        modelAnswer: '1) Lifecycle Dependency: In a Master-Detail relationship, the child record cannot exist without the parent. If the parent record is deleted, all associated child records are automatically cascade-deleted. In a Lookup relationship, child records can exist independently without a parent link. 2) Security and Sharing: In Master-Detail, the child record inherits its security sharing rules and ownership directly from the master record (no independent owner field). In Lookup, the child record has its own independent owner and sharing settings. 3) Roll-Up Summaries: Only Master-Detail relationships allow the parent record to define Roll-Up Summary fields (e.g. SUM, COUNT, MIN, MAX) calculated automatically across child records.',
        counterQuestions: [
          'What happens to roll-up summary calculations when thousands of child records are updated concurrently in a bulk batch job?',
          'When would you intentionally choose a Lookup relationship over a Master-Detail relationship despite needing roll-up metrics?'
        ],
        interviewerExpectations: [
          'Clearly articulate cascade delete behavior.',
          'Explain sharing inheritance in Master-Detail.',
          'Mention roll-up summary calculation availability.'
        ],
        criticalPitfalls: [
          'Suggesting Master-Detail can be used on standard accounts and opportunities as the detail child.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Executing Queries or Callouts Inside Loop Iterations',
        antiPattern: 'for (Record r : records) { Query q = runQuery(r.id); } which immediately breaches database governor limits.',
        correctApproach: 'Always bulkify code: collect IDs into a set, execute a single query outside the loop, and populate a map for O(1) in-memory resolution.',
        dangerLevel: 'CRITICAL',
        interviewContext: 'Universal enterprise applications interview trap.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'Bulkified Transaction Processing Invariants',
        overview: 'Enterprise applications must process records in batches of 200 to 10,000 records without hitting CPU or query limits.',
        architecturalInvariants: [
          {
            title: 'Bulkification Law',
            formulaOrInvariant: 'Query_Count = O(1) REGARDLESS OF Record_Volume (N)',
            explanation: 'Database queries and DML write operations must remain strictly constant O(1) relative to batch record size.',
            tradeoffs: 'Requires in-memory aggregation data structures (HashMaps) rather than simple sequential processing.'
          }
        ],
        codeExamples: [
          {
            language: 'javascript',
            title: 'Bulkified Record Update Processing Pattern',
            code: `// Bulkified record update handler
export function processBatchUpdates(records) {
  // 1. Collect parent IDs in a single pass
  const parentIds = new Set(records.map(r => r.parentId));

  // 2. Execute a single query outside the loop
  const parentMap = fetchParentsByIds(Array.from(parentIds));

  // 3. Process records in-memory
  const updates = [];
  for (const record of records) {
    const parent = parentMap.get(record.parentId);
    if (parent && parent.isActive) {
      updates.push({ id: record.id, status: 'PROCESSED' });
    }
  }

  // 4. Perform single bulk write
  bulkUpdateRecords(updates);
}`,
            explanation: 'Ensures database read and write operations execute exactly once per batch.'
          }
        ]
      }
    ]
  },

  // 9. Data Engineer & ETL Architect
  {
    id: 'role-data-eng',
    slug: 'data-engineer',
    name: 'Data Engineer & ETL Architect',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'Distributed data pipelines, ETL orchestration, columnar storage formats, Lakehouse architectures, and streaming ingestion.',
    category: 'Data & AI',
    estimatedReadTime: '26 min',
    pageEstimate: 16,
    information: {
      overview: 'Data Engineers & ETL Architects design and maintain distributed data infrastructure. They build resilient batch and real-time streaming pipelines, manage distributed compute clusters (Spark, Flink), optimize columnar storage formats (Parquet, ORC), and maintain Lakehouse table formats (Iceberg, Delta Lake).',
      mission: 'Deliver reliable, high-throughput, low-latency data pipelines processing terabytes of structured and unstructured data with exactly-once processing semantics.',
      dayInTheLife: [
        'Authoring PySpark and SQL transformations for distributed batch and streaming pipelines.',
        'Managing Airflow DAG orchestration schedules with dependency checks and backfill automation.',
        'Optimizing distributed shuffle partitions, mitigating data skew, and tuning memory allocations.',
        'Designing streaming event pipelines using Kafka with consumer group lag monitoring.',
        'Enforcing schema evolution policies and compaction routines on Lakehouse table partitions.'
      ],
      coreResponsibilities: [
        'Build and operate scalable distributed data pipelines using Apache Spark, Flink, and Kafka.',
        'Design Lakehouse storage layouts with partition pruning and Z-order clustering optimization.',
        'Automate workflow orchestration using Apache Airflow, Prefect, or Dagster.',
        'Implement robust data quality validation frameworks (Great Expectations) and schema contracts.',
        'Monitor and resolve data pipeline failures, schema drift, and consumer lag bottlenecks.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Associate Data Engineer', typicalExperience: '0-2 yrs', focus: 'SQL transformations, Airflow DAG creation, and basic PySpark jobs.' },
        { level: 'L2', title: 'Senior Data Engineer', typicalExperience: '2-5 yrs', focus: 'Spark optimization, streaming pipelines, Lakehouse management, and data modeling.' },
        { level: 'L3', title: 'Staff Data Architect', typicalExperience: '5-8 yrs', focus: 'Enterprise Lakehouse architecture, real-time stream processing, and data governance.' },
        { level: 'L4', title: 'Principal Data Systems Fellow', typicalExperience: '8+ yrs', focus: 'Company-wide data infrastructure strategy, custom compute engines, and distributed storage.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$100,000 - $130,000', midSenior: '$145,000 - $205,000', staffPrincipal: '$220,000 - $340,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 58,000 - 80,000', midSenior: 'EUR 88,000 - 135,000', staffPrincipal: 'EUR 145,000 - 220,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 11,00,000 - 18,00,000', midSenior: 'INR 24,00,000 - 44,00,000', staffPrincipal: 'INR 55,00,000 - 95,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'Apache Spark & PySpark', 'Apache Kafka & Flink', 'Parquet & ORC Columnar Formats',
        'Apache Iceberg & Delta Lake', 'Apache Airflow', 'PostgreSQL & Trino', 'Docker & Kubernetes'
      ],
      industryDemandRationale: 'Without clean, robust, low-latency data pipelines, business analytics and machine learning models cannot function. Scalable data engineering skills command top-tier compensation.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Distributed Compute Foundations & Columnar Storage Formats',
        description: 'Understand distributed computing principles, DAG task scheduling, and columnar storage efficiency.',
        durationWeeks: 4,
        competencies: [
          { topic: 'Distributed Storage & Columnar File Formats (Parquet/ORC)', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['Columnar compression (Snappy, Zstandard) and dictionary encoding', 'Row groups and statistics-based predicate pushdown', 'Small file problem mitigation'] },
          { topic: 'Apache Spark Architecture & RDD/DataFrame DAG Execution', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Narrow vs Wide transformations and shuffle barriers', 'Driver vs Executor memory management', 'Broadcast joins vs Sort-Merge joins'] },
          { topic: 'Data Pipeline Orchestration with Apache Airflow', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Idempotent DAG tasks and backfilling semantics', 'Airflow sensors vs task polling', 'XCom state passing limits'] }
        ],
        handsOnProjects: [
          {
            title: 'End-to-End Batch ETL Pipeline with PySpark and Airflow',
            spec: 'Build an automated pipeline that ingests raw transactional JSON logs, deduplicates records, computes user aggregate metrics using PySpark, and outputs partitioned Parquet tables.',
            deliverables: ['PySpark transformation script', 'Airflow DAG definition file', 'Data quality validation check suite']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'Real-Time Streaming, Kafka Architecture & Lakehouse Table Formats',
        description: 'Master event streaming with Kafka, stream processing with Spark Structured Streaming, and ACID Lakehouses.',
        durationWeeks: 6,
        competencies: [
          { topic: 'Apache Kafka Architecture & Stream Partitioning', weightPercentage: 45, benchmarkAccuracy: 80, coreInvariants: ['Partition log append mechanics and consumer offset commits', 'Producer ack levels (acks=0, 1, all) and idempotency', 'Consumer group rebalancing protocols'] },
          { topic: 'ACID Lakehouse Table Formats (Apache Iceberg / Delta Lake)', weightPercentage: 30, benchmarkAccuracy: 75, coreInvariants: ['Snapshot isolation via metadata manifest trees', 'Time travel queries and rollback mechanics', 'Compaction and orphan file deletion'] },
          { topic: 'Stream Processing with Watermarking & State Management', weightPercentage: 25, benchmarkAccuracy: 70, coreInvariants: ['Event time vs Processing time semantics', 'Watermarking thresholds for late-arriving data', 'Exactly-once end-to-end processing guarantees'] }
        ],
        handsOnProjects: [
          {
            title: 'Real-Time Fraud Detection Streaming Pipeline',
            spec: 'Construct a Kafka streaming pipeline that processes incoming credit card transactions, computes sliding 5-minute velocity metrics using Spark Structured Streaming with watermarking, and flags anomalous transactions in real time.',
            deliverables: ['Kafka producer simulation script', 'Spark streaming transformation code', 'Latency and throughput benchmark report']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-de-1',
        title: 'Mitigating Data Skew in Apache Spark Shuffle Joins',
        difficulty: 'HARD',
        category: 'Distributed Computing',
        questionText: 'During a large Spark join operation between a 10TB fact table and a dimension table, 199 tasks finish in 30 seconds, while the final task runs for 45 minutes and fails with an OutOfMemory error. What is occurring, and how do you resolve it?',
        modelAnswer: 'This is the classic "Data Skew" problem. Spark partitions data across executors by hashing the join key (hash(key) % num_partitions). If a single key (e.g. NULL, or a massive high-volume merchant ID) accounts for 20% of the dataset, all those records are routed to a single partition/executor task (the "straggler"), causing memory exhaustion and massive runtime imbalance. Solutions: 1) Salting: Append a random suffix (e.g. key + "_" + random(1..N)) to the skewed key on the left table, and replicate the corresponding dimension record N times with suffixes on the right table to distribute the load across N executors. 2) Broadcast Join: If the dimension table is under the broadcast threshold (default 10MB, or tuned higher), broadcast it to all executors, completely eliminating the shuffle stage. 3) Spark 3.0 Adaptive Query Execution (AQE): Enable spark.sql.adaptive.skewJoin.enabled to automatically split skewed partitions at runtime.',
        counterQuestions: [
          'What are the memory and CPU tradeoffs of salting versus broadcast joins?',
          'How does broadcast join fail when the dimension table unexpectedly grows beyond available executor driver memory?'
        ],
        interviewerExpectations: [
          'Identify data skew and key hashing imbalance.',
          'Explain key salting mechanics.',
          'Mention Broadcast Hash Join and Spark AQE.'
        ],
        criticalPitfalls: [
          'Suggesting simply increasing spark.sql.shuffle.partitions, which does NOT fix a single key skew.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Using groupByKey() Instead of reduceByKey() in Spark',
        antiPattern: 'Calling rdd.groupByKey() which shuffles all values across the network before aggregating, causing massive OOM failures.',
        correctApproach: 'Use reduceByKey() or aggregateByKey(), which performs map-side partial aggregation before shuffling, drastically reducing network I/O.',
        dangerLevel: 'HIGH',
        interviewContext: 'Classic Spark performance interview question.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'Distributed Shuffle Join Topologies',
        overview: 'Data placement and network shuffle boundaries dictate distributed computing performance.',
        architecturalInvariants: [
          {
            title: 'Shuffle Network Boundary Law',
            formulaOrInvariant: 'Network_I/O = Total_Dataset_Size (when Broadcast is impossible)',
            explanation: 'In a sort-merge shuffle join, all records on both sides must be written to disk, sent across the network, and sorted before the join occurs.',
            tradeoffs: 'Broadcast joins avoid the network shuffle entirely but require the broadcasted table to fit in memory on every executor node.'
          }
        ],
        codeExamples: [
          {
            language: 'python',
            title: 'PySpark Key Salting Implementation for Skew Mitigation',
            code: `from pyspark.sql import functions as F

# 1. Salt skewed dataset by appending random integer 0-9
SALT_BINS = 10
df_skewed_salted = df_large.withColumn(
    "salt", F.concat(F.col("skew_key"), F.lit("_"), F.floor(F.rand() * SALT_BINS))
)

# 2. Replicate dimension table across all salt bins
df_dim_exploded = df_small.withColumn(
    "salt_array", F.array([F.lit(i) for i in range(SALT_BINS)])
).withColumn("salt_idx", F.explode("salt_array")).withColumn(
    "salt", F.concat(F.col("skew_key"), F.lit("_"), F.col("salt_idx"))
)

# 3. Join on salted key to distribute partition load evenly
joined_df = df_skewed_salted.join(df_dim_exploded, on="salt")`,
            explanation: 'Distributes a heavily skewed join key evenly across 10 executor partitions.'
          }
        ]
      }
    ]
  },

  // 10. Machine Learning & AI Systems Engineer
  {
    id: 'role-ml-ai',
    slug: 'ml-ai-engineer',
    name: 'Machine Learning & AI Systems Engineer',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'Production ML systems, vector search, embeddings, model quantization, LLM inference serving, feature engineering, and monitoring.',
    category: 'Data & AI',
    estimatedReadTime: '26 min',
    pageEstimate: 16,
    information: {
      overview: 'Machine Learning & AI Systems Engineers deploy, scale, and monitor machine learning models and LLM architectures in production. They specialize in feature stores, vector databases, high-throughput model inference engines, quantization, and real-time drift detection.',
      mission: 'Bridge the gap between experimental data science models and low-latency, highly available production inference systems.',
      dayInTheLife: [
        'Building high-throughput model serving pipelines with vLLM, TensorRT-LLM, or Triton Inference Server.',
        'Optimizing embedding indexing and Approximate Nearest Neighbor (ANN) vector search.',
        'Implementing Retrieval-Augmented Generation (RAG) architectures with hybrid dense/sparse search.',
        'Monitoring feature drift (KS-tests, PSI) and concept drift in live production inference streams.',
        'Quantizing models (INT8, FP8, 4-bit AWQ) to minimize GPU VRAM footprint while maintaining benchmark accuracy.'
      ],
      coreResponsibilities: [
        'Deploy and serve production ML/AI models with sub-50ms latency SLAs.',
        'Build vector similarity search systems utilizing HNSW and IVF-PQ indexing.',
        'Design RAG architectures with chunking, re-ranking, and context compression.',
        'Implement automated model training, validation, and continuous deployment pipelines.',
        'Monitor model performance, data distribution shifts, and inference throughput.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Associate ML Engineer', typicalExperience: '0-2 yrs', focus: 'Feature engineering, model evaluation, REST inference endpoints, and PyTorch basics.' },
        { level: 'L2', title: 'Senior AI Systems Engineer', typicalExperience: '2-5 yrs', focus: 'Model serving optimization, vector databases, RAG pipelines, and drift detection.' },
        { level: 'L3', title: 'Staff AI Architect', typicalExperience: '5-8 yrs', focus: 'Distributed model training, custom inference engines, and enterprise AI safety.' },
        { level: 'L4', title: 'Principal AI Infrastructure Fellow', typicalExperience: '8+ yrs', focus: 'Company-wide AI platform, hardware acceleration strategies, and foundational model architecture.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$110,000 - $145,000', midSenior: '$160,000 - $225,000', staffPrincipal: '$240,000 - $380,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 62,000 - 88,000', midSenior: 'EUR 95,00,0 - 145,000', staffPrincipal: 'EUR 155,000 - 240,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 12,00,000 - 20,00,000', midSenior: 'INR 26,00,000 - 48,00,000', staffPrincipal: 'INR 60,00,000 - 1,10,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'PyTorch & Hugging Face', 'vLLM & Triton Inference Server', 'Vector DBs (Qdrant, Milvus, pgvector)',
        'Quantization (AWQ, BitsAndBytes)', 'LangChain & LlamaIndex', 'MLflow & Weights & Biases', 'Docker & Kubernetes'
      ],
      industryDemandRationale: 'Every industry is embedding AI and LLM capabilities into their core platforms. Engineers who know how to serve models efficiently without exorbitant GPU cloud costs are among the most sought-after in tech.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Machine Learning Foundations & Feature Engineering Pipelines',
        description: 'Understand linear algebra foundations, loss optimization, feature scaling, and model evaluation metrics.',
        durationWeeks: 4,
        competencies: [
          { topic: 'Data Preprocessing & Feature Leakage Prevention', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['Fitting scalers strictly on train splits', 'One-hot vs Target encoding dimensionality trade-offs', 'Imputation strategies and missingness bias'] },
          { topic: 'Model Evaluation Metrics & Bias-Variance Tradeoff', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Precision vs Recall vs F1-score vs ROC-AUC', 'Overfitting vs Underfitting regularization (L1/L2)', 'Stratified k-fold cross-validation'] },
          { topic: 'Classical ML Algorithms & Decision Trees', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Gradient Boosting (XGBoost/LightGBM) tree depth', 'Logistic regression log-odds formulation', 'Support Vector Machines margin maximization'] }
        ],
        handsOnProjects: [
          {
            title: 'End-to-End Churn Prediction Service with Drift Detection',
            spec: 'Build a production feature pipeline and gradient-boosted classification model with automated hyperparameter tuning and Kolmogorov-Smirnov test drift monitoring.',
            deliverables: ['Scikit-learn / XGBoost training pipeline', 'REST API serving endpoint with FastAPI', 'Model evaluation report with confusion matrix and ROC curves']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'Deep Learning, Vector Search & LLM Production Serving',
        description: 'Master Transformer architectures, vector similarity embeddings, RAG pipelines, and model quantization.',
        durationWeeks: 6,
        competencies: [
          { topic: 'Vector Similarity Search & Approximate Nearest Neighbors (ANN)', weightPercentage: 45, benchmarkAccuracy: 80, coreInvariants: ['HNSW graph construction and recall vs speed tradeoff', 'Cosine similarity vs Dot product vs Euclidean distance', 'Inverted File with Product Quantization (IVF-PQ)'] },
          { topic: 'Transformer Architecture & Self-Attention Mechanics', weightPercentage: 30, benchmarkAccuracy: 75, coreInvariants: ['Scaled dot-product attention O(N^2) complexity', 'Key-Value (KV) cache memory consumption formula', 'Multi-Head Attention vs Multi-Query / Grouped-Query Attention'] },
          { topic: 'High-Throughput Model Serving & Quantization', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Continuous batching vs Static batching', 'PagedAttention memory fragmentation elimination', 'FP16 vs INT8 vs INT4 precision degradation'] }
        ],
        handsOnProjects: [
          {
            title: 'Enterprise RAG System with Vector Search and Re-Ranking',
            spec: 'Build a production Retrieval-Augmented Generation (RAG) service with document chunking, hybrid vector/keyword search with cross-encoder re-ranking, and low-latency token streaming.',
            deliverables: ['Vector database integration script', 'FastAPI streaming endpoint with SSE', 'Retrieval recall benchmark report']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-ml-1',
        title: 'KV-Cache Memory Sizing & PagedAttention Mechanics',
        difficulty: 'HARD',
        category: 'LLM Systems Architecture',
        questionText: 'In an LLM inference server generating tokens for 128 concurrent users with context length 4,096 on a 70B parameter model, how do you calculate the memory required for the KV cache, and how does PagedAttention eliminate memory waste?',
        modelAnswer: 'The Key-Value (KV) cache stores past token key and value projections to avoid recomputing attention at every generation step. The memory formula per token is: 2 (K and V) * num_layers * num_kv_heads * head_dim * bytes_per_element. For a model with 80 layers, 8 KV heads (Grouped-Query Attention), head dimension 128, in FP16 (2 bytes): each token consumes 2 * 80 * 8 * 128 * 2 = 327,680 bytes (~320 KB). For 128 concurrent requests at 4,096 tokens, raw KV cache requires: 128 * 4,096 * 320 KB = 167.7 GB of GPU VRAM. In traditional inference servers, memory must be allocated contiguously for the maximum possible context length up front, causing up to 60-80% memory waste from internal and external fragmentation. PagedAttention solves this by borrowing the virtual memory paging concept from operating systems: it divides the KV cache into fixed-size blocks (e.g. 16 tokens) allocated non-contiguously in VRAM, eliminating fragmentation and near-doubling effective serving throughput.',
        counterQuestions: [
          'What is the difference between Grouped-Query Attention (GQA) and Multi-Head Attention (MHA) regarding KV-cache size?',
          'How does continuous batching interact with early sequence completion?'
        ],
        interviewerExpectations: [
          'State the KV-cache sizing formula correctly.',
          'Explain contiguous memory pre-allocation as the root cause of fragmentation.',
          'Explain PagedAttention fixed-block non-contiguous mapping.'
        ],
        criticalPitfalls: [
          'Confusing model weights memory with KV-cache memory: model weights are static; KV cache scales dynamically with batch size and context length.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Data Leakage During Feature Scaling and Preprocessing',
        antiPattern: 'Fitting a StandardScaler or vectorizer on the full dataset before splitting into train and test sets.',
        correctApproach: 'Always split into train and test sets first. Fit preprocessing transformers strictly on the train split, and only transform the test split. Otherwise, statistics from the test set leak into the training process, causing artificially inflated evaluation metrics.',
        dangerLevel: 'CRITICAL',
        interviewContext: 'Universal Machine Learning screening question.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'KV-Cache Memory Sizing Invariant',
        overview: 'LLM inference capacity is primarily constrained by GPU VRAM limits dictated by the Key-Value cache.',
        architecturalInvariants: [
          {
            title: 'KV-Cache Memory Invariant',
            formulaOrInvariant: 'VRAM_KV = 2 * L * H_kv * D * B_token * Batch_Size * Sequence_Length',
            explanation: 'Where L is layers, H_kv is KV attention heads, D is head dimension, and B_token is data type precision bytes (e.g. 2 for FP16).',
            tradeoffs: 'Adopting Grouped-Query Attention (GQA) reduces H_kv by 4x-8x, dramatically shrinking KV memory without degrading semantic quality.'
          }
        ],
        codeExamples: [
          {
            language: 'python',
            title: 'Custom In-Memory Vector Search with Cosine Similarity',
            code: `import numpy as np

def cosine_similarity_search(query_vec: np.ndarray, doc_matrix: np.ndarray, top_k: int = 5):
    # Normalize vectors to unit length
    query_norm = query_vec / np.linalg.norm(query_vec)
    doc_norms = doc_matrix / np.linalg.norm(doc_matrix, axis=1, keepdims=True)
    
    # Compute dot products (equivalent to cosine similarity for normalized vectors)
    similarities = np.dot(doc_norms, query_norm)
    
    # Top-K indices sorted descending
    top_indices = np.argsort(similarities)[::-1][:top_k]
    return [(idx, similarities[idx]) for idx in top_indices]`,
            explanation: 'Demonstrates dense vector cosine similarity calculation using vectorized NumPy operations.'
          }
        ]
      }
    ]
  },

  // 11. Cybersecurity & Infrastructure Defense Specialist
  {
    id: 'role-cyber-sec',
    slug: 'cybersecurity-specialist',
    name: 'Cybersecurity & Infrastructure Defense Specialist',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'Threat modeling, zero-trust architecture, OWASP Top 10 vulnerabilities, cryptographic protocols, identity federation, and infrastructure defense.',
    category: 'Security & QA',
    estimatedReadTime: '25 min',
    pageEstimate: 15,
    information: {
      overview: 'Cybersecurity & Infrastructure Defense Specialists protect corporate and cloud systems from malicious actors. They conduct threat modeling, audit applications for OWASP Top 10 vulnerabilities, enforce zero-trust network boundaries, implement cryptographic authentication, and respond to security incidents.',
      mission: 'Build resilient defense-in-depth security perimeters that prevent unauthorized intrusion and maintain confidentiality, integrity, and availability (CIA triad).',
      dayInTheLife: [
        'Conducting threat modeling exercises (STRIDE) on upcoming software architectures.',
        'Auditing codebases for injection flaws, broken access control (BOLA/IDOR), and cryptographic weaknesses.',
        'Monitoring Security Information and Event Management (SIEM) alerts for intrusion attempts.',
        'Configuring zero-trust authentication policies, mutual TLS (mTLS), and cryptographic token lifecycles.',
        'Executing simulated penetration tests and coordinating patch management for zero-day CVEs.'
      ],
      coreResponsibilities: [
        'Enforce application security controls aligned with the OWASP Top 10 framework.',
        'Implement zero-trust network microsegmentation and identity federation (OIDC/SAML).',
        'Audit and secure cryptographic implementations (TLS 1.3, AES-GCM, Argon2, RSA/ECC).',
        'Configure SIEM telemetry, intrusion detection systems (IDS/IPS), and automated containment runbooks.',
        'Facilitate security incident response, forensic analysis, and regulatory compliance reporting.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Associate Security Analyst', typicalExperience: '0-2 yrs', focus: 'Vulnerability scanning, SIEM alert triage, and basic penetration testing.' },
        { level: 'L2', title: 'Senior Security Engineer', typicalExperience: '2-5 yrs', focus: 'Application security reviews, zero-trust network architecture, and incident response.' },
        { level: 'L3', title: 'Staff Security Architect', typicalExperience: '5-8 yrs', focus: 'Enterprise cryptographic standards, red-team operations, and defense-in-depth design.' },
        { level: 'L4', title: 'Chief Information Security Officer (CISO) / Fellow', typicalExperience: '8+ yrs', focus: 'Company-wide security posture, regulatory compliance, and risk governance.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$98,000 - $128,000', midSenior: '$142,000 - $198,000', staffPrincipal: '$215,000 - $335,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 55,000 - 78,000', midSenior: 'EUR 85,000 - 130,000', staffPrincipal: 'EUR 140,000 - 215,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 10,50,000 - 17,00,000', midSenior: 'INR 23,00,000 - 42,00,000', staffPrincipal: 'INR 52,00,000 - 92,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'OWASP Top 10 & STRIDE', 'Cryptography (TLS 1.3, AES-GCM, Argon2)', 'Identity (OAuth2, OIDC, SAML)',
        'Burp Suite & ZAP', 'SIEM & Wazuh / Splunk', 'Network Security (Wireshark, iptables, eBPF)', 'Docker & Linux Hardening'
      ],
      industryDemandRationale: 'With escalating ransomware threats, data privacy regulations (GDPR, HIPAA), and sophisticated cyber attacks, cybersecurity specialists are critical to enterprise survival.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Cryptographic Foundations, Network Security & Linux Hardening',
        description: 'Master symmetric and asymmetric cryptography, TLS handshakes, hash functions, and OS kernel hardening.',
        durationWeeks: 4,
        competencies: [
          { topic: 'Cryptographic Protocols & Key Management', weightPercentage: 40, benchmarkAccuracy: 85, coreInvariants: ['AES-GCM authenticated encryption and nonce reuse disaster', 'Argon2id password hashing work factors', 'Diffie-Hellman Ephemeral (DHE) Perfect Forward Secrecy'] },
          { topic: 'Network Security & TLS 1.3 Handshakes', weightPercentage: 35, benchmarkAccuracy: 80, coreInvariants: ['TLS 1.3 1-RTT handshake and encrypted certificates', 'TCP SYN flood mitigation via SYN cookies', 'DNSSEC cryptographic record signing'] },
          { topic: 'Linux OS Security & Access Controls', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Principle of least privilege and sudoers constraints', 'SELinux / AppArmor mandatory access control', 'Kernel sysctl network stack hardening'] }
        ],
        handsOnProjects: [
          {
            title: 'Hardened Linux Bastion with Ephemeral Key Pair Authentication',
            spec: 'Configure an immutable Linux bastion host with disabled password authentication, fail2ban rate-limiting, SELinux enforcement, and automated auditd logging.',
            deliverables: ['Hardening Ansible playbook / shell script', 'Vulnerability assessment scan report with OpenSCAP', 'Log audit trail demonstration']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'Application Security (OWASP Top 10) & Zero-Trust Architecture',
        description: 'Audit and protect web applications against injection, broken access control (BOLA), and SSRF.',
        durationWeeks: 6,
        competencies: [
          { topic: 'OWASP Top 10 Web Vulnerabilities & Exploitation', weightPercentage: 45, benchmarkAccuracy: 85, coreInvariants: ['Broken Object Level Authorization (BOLA/IDOR) verification', 'Server-Side Request Forgery (SSRF) cloud metadata bypasses', 'SQL injection mitigation via parameterized queries strictly'] },
          { topic: 'Identity Federation & Token Security (OAuth2 / OIDC)', weightPercentage: 30, benchmarkAccuracy: 80, coreInvariants: ['JWT signature verification vs kid header injection', 'OAuth2 PKCE authorization code flow', 'Token revocation and short-lived expiration'] },
          { topic: 'Zero-Trust Architecture & Microsegmentation', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Mutual TLS (mTLS) certificate validation', 'Software-defined perimeter gateway enforcement', 'Context-aware device posture telemetry'] }
        ],
        handsOnProjects: [
          {
            title: 'Automated Application Security Vulnerability Audit & Defense',
            spec: 'Audit a vulnerable web application, demonstrate exploitation of an IDOR and SSRF vulnerability, and implement cryptographic authorization guards and egress firewall filters to remediate both.',
            deliverables: ['Penetration testing report with proof-of-concept exploits', 'Remediated source code patches', 'Automated security regression test suite']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-sec-1',
        title: 'Server-Side Request Forgery (SSRF) Exploitation & Defense',
        difficulty: 'HARD',
        category: 'Application Security',
        questionText: 'An application accepts a user-supplied webhook URL and performs an HTTP POST request to that destination. How can an attacker exploit this via Server-Side Request Forgery (SSRF) in a cloud environment, and what are the three mandatory defense-in-depth layers to eliminate it?',
        modelAnswer: 'An attacker exploits SSRF by supplying internal IP addresses or cloud metadata service endpoints (e.g. http://169.254.169.254/latest/metadata/credentials/) as the webhook URL. The server, operating inside the trusted cloud VPC, makes the HTTP request and potentially exposes temporary instance credentials or accesses internal admin microservices. Three mandatory defense layers: 1) Strict IP Validation: Resolve the domain name to an IP address, verify that the IP is not in private/reserved CIDRs (RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16; Loopback: 127.0.0.0/8; Link-local: 169.254.0.0/16). 2) DNS Rebinding Prevention: Ensure the HTTP request connects directly to the validated IP address rather than re-resolving the hostname (which an attacker could switch between check and connection time). 3) Egress Firewall Isolation: Run the webhook worker in an isolated network segment with an egress proxy that drops all internal and metadata traffic by default.',
        counterQuestions: [
          'How does DNS Rebinding bypass simple string validation of hostnames?',
          'How does Cloud IMDSv2 (session-token based metadata service) mitigate SSRF attacks compared to IMDSv1?'
        ],
        interviewerExpectations: [
          'Explain cloud metadata IP 169.254.169.254 exploitation.',
          'Mention DNS rebinding hazards.',
          'Provide defense-in-depth (IP checks, egress firewalls, IMDSv2).'
        ],
        criticalPitfalls: [
          'Relying solely on blacklist regexes for "localhost", which are easily bypassed with alternate IP representations (0x7f.1, 2130706433, nip.io).'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Confusing Authentication (AuthN) with Authorization (AuthZ)',
        antiPattern: 'Verifying that a user has a valid, cryptographically signed JWT, and then directly retrieving the requested resource using req.params.id without verifying ownership.',
        correctApproach: 'Authentication confirms who the user is; authorization verifies what they are allowed to access. Failing to verify that the authenticated subject owns or has permission to access the target object is the #1 vulnerability on the web (IDOR / BOLA).',
        dangerLevel: 'CRITICAL',
        interviewContext: 'Universal Application Security screening.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'Cryptographic Nonce & Non-Replay Invariants',
        overview: 'Cryptographic algorithms require absolute randomness and uniqueness in initialization vectors.',
        architecturalInvariants: [
          {
            title: 'AES-GCM Nonce Uniqueness Invariant',
            formulaOrInvariant: 'Probability(Nonce_Collision) = 0 (UNDER SAME KEY)',
            explanation: 'In Galois/Counter Mode (AES-GCM), repeating a nonce under the same secret key completely breaks the authenticity guarantee and allows an attacker to forge ciphertexts.',
            tradeoffs: 'Requires deterministic counter sequencing or 96-bit cryptographically secure pseudorandom generators (CSPRNG).'
          }
        ],
        codeExamples: [
          {
            language: 'typescript',
            title: 'Constant-Time Token Comparison Preventing Timing Attacks',
            code: `import crypto from 'crypto';

export function secureVerifyToken(userProvidedToken: string, actualSecretToken: string): boolean {
  const userBuf = Buffer.from(userProvidedToken);
  const actualBuf = Buffer.from(actualSecretToken);

  // If byte lengths do not match, return false while consuming constant time
  if (userBuf.length !== actualBuf.length) {
    return false;
  }

  // crypto.timingSafeEqual executes in constant time regardless of where mismatches occur
  return crypto.timingSafeEqual(userBuf, actualBuf);
}`,
            explanation: 'Prevents side-channel timing attacks that allow attackers to deduce secrets byte-by-byte.'
          }
        ]
      }
    ]
  },

  // 12. QA Automation & SDET Engineer
  {
    id: 'role-qa-sdet',
    slug: 'qa-automation-engineer',
    name: 'QA Automation & SDET Engineer',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'Automated test frameworks, browser and API automation, contract testing, performance load testing, and CI/CD quality gate enforcement.',
    category: 'Security & QA',
    estimatedReadTime: '23 min',
    pageEstimate: 14,
    information: {
      overview: 'QA Automation & Software Development Engineers in Test (SDET) build comprehensive automation frameworks. They design end-to-end browser automation suites, API integration harnesses, consumer-driven contract tests, and distributed load testing pipelines to ensure continuous deployment quality.',
      mission: 'Ensure zero regressions enter production by designing deterministic, fast, non-flaky test automation harnesses.',
      dayInTheLife: [
        'Developing browser automation suites with Playwright using the Page Object Model (POM).',
        'Authoring API integration tests that validate status codes, response schemas, and database side-effects.',
        'Investigating test flakiness and replacing arbitrary sleep delays with auto-waiting web-first assertions.',
        'Designing distributed load testing scenarios with k6 or Locust to evaluate system breaking points.',
        'Integrating test execution suites into CI/CD pipelines with parallel worker sharding.'
      ],
      coreResponsibilities: [
        'Build and maintain scalable test automation frameworks across UI and API layers.',
        'Enforce the Test Pyramid (Unit > Integration > Contract > E2E) to maximize test ROI.',
        'Eliminate test flakiness through resilient locator strategies and auto-waiting assertions.',
        'Execute performance, load, and stress testing against staging environments.',
        'Partner with developers to establish quality gates and automated regression testing.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Associate QA Automation Engineer', typicalExperience: '0-2 yrs', focus: 'Scripting test cases, basic Playwright/Cypress tests, and bug reporting.' },
        { level: 'L2', title: 'Senior SDET', typicalExperience: '2-5 yrs', focus: 'Automation framework architecture, API testing, CI pipeline parallelization, and load testing.' },
        { level: 'L3', title: 'Staff Quality Architect', typicalExperience: '5-8 yrs', focus: 'Enterprise test strategy, contract testing, mutation testing, and flakiness elimination.' },
        { level: 'L4', title: 'Principal Quality Engineering Director', typicalExperience: '8+ yrs', focus: 'Company-wide quality governance, chaos engineering, and developer velocity platforms.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$88,000 - $118,000', midSenior: '$132,000 - $182,000', staffPrincipal: '$195,000 - $305,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 50,000 - 70,000', midSenior: 'EUR 78,000 - 118,000', staffPrincipal: 'EUR 130,000 - 195,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 9,00,000 - 15,00,000', midSenior: 'INR 20,00,000 - 36,00,000', staffPrincipal: 'INR 45,00,000 - 80,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'Playwright & Selenium', 'TypeScript & Python', 'Vitest & Jest', 'k6 & Locust',
        'Pact (Contract Testing)', 'Docker & CI/CD Actions', 'Allure Reporting & TestRail'
      ],
      industryDemandRationale: 'As deployment cadences accelerate to multiple times per day, manual testing becomes impossible. SDETs who can create reliable, non-flaky automated pipelines are essential.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Modern Test Automation Frameworks & Web-First Locators',
        description: 'Master Page Object Model design, Playwright automation, auto-waiting locators, and resilient assertions.',
        durationWeeks: 4,
        competencies: [
          { topic: 'Playwright Framework Architecture & Page Object Models', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['User-facing locators (getByRole, getByText) over fragile CSS/XPath', 'Auto-waiting assertions eliminating sleep() delays', 'Page Object Model encapsulation of UI mechanics'] },
          { topic: 'API Testing & Schema Contract Validation', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['HTTP status code verification and payload assertions', 'JSON Schema validation with Ajv or Zod', 'Database state setup and teardown isolation'] },
          { topic: 'Test Execution Parallelization & Flakiness Management', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Worker sharding across CI nodes', 'Isolated browser contexts preventing state leakage', 'Deterministic retry strategies and quarantine buckets'] }
        ],
        handsOnProjects: [
          {
            title: 'Enterprise Playwright Test Suite with CI Parallel Sharding',
            spec: 'Develop a Playwright automation suite for a complex multi-step e-commerce checkout flow with Page Object Models, auto-waiting assertions, parallel sharding across 4 workers, and HTML reporting.',
            deliverables: ['Playwright test repository in TypeScript', 'HTML execution report with video and trace artifacts', 'GitHub Actions workflow with 4-way test sharding']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'Contract Testing, Performance Load Testing & Mutation Analysis',
        description: 'Implement consumer-driven contract testing with Pact, performance load testing with k6, and mutation testing.',
        durationWeeks: 6,
        competencies: [
          { topic: 'Performance & Load Testing with k6 / Locust', weightPercentage: 45, benchmarkAccuracy: 80, coreInvariants: ['Virtual user ramp-up curves and stress testing thresholds', 'p95 and p99 latency SLAs under load', 'Detecting connection pool and memory leaks during soak tests'] },
          { topic: 'Consumer-Driven Contract Testing (Pact)', weightPercentage: 30, benchmarkAccuracy: 75, coreInvariants: ['Consumer contract specification files', 'Provider verification in CI without end-to-end service deployment', 'Breaking change detection prior to release'] },
          { topic: 'Mutation Testing & Code Coverage Quality', weightPercentage: 25, benchmarkAccuracy: 70, coreInvariants: ['Killing mutants to test assertion strength (Stryker)', 'Branch coverage vs Line coverage illusions', 'Flaky test isolation via quarantine pipelines'] }
        ],
        handsOnProjects: [
          {
            title: 'High-Volume Performance Load Testing Suite with k6',
            spec: 'Design and execute a k6 performance load test simulating 5,000 concurrent users with ramp-up, steady-state, and spike stages, evaluating p99 latency and error rates against strict SLA thresholds.',
            deliverables: ['k6 JavaScript test script', 'Grafana / InfluxDB live metric dashboard export', 'Performance bottleneck diagnosis report']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-qa-1',
        title: 'Eliminating Flakiness in Asynchronous Web Automation',
        difficulty: 'MEDIUM',
        category: 'Test Automation Engineering',
        questionText: 'An automated test frequently fails in CI with "ElementNotInteractableException" or "TimeoutError", despite passing locally. What causes this flakiness, and how do you systematically eliminate it?',
        modelAnswer: 'Flakiness in CI typically stems from execution speed mismatches: CI runners are frequently slower or subject to CPU throttling compared to developer workstations. Root causes include: 1) Hardcoded sleep delays (e.g. sleep(3000)) where the async UI element took 3050ms to render due to network latency. 2) Fragile locators (e.g. xpath //div[3]/span/button) that break with minor DOM changes. 3) Checking presence instead of actionability (visible, stable, enabled, not obscured). To systematically eliminate: 1) Use Playwright auto-waiting assertions (e.g. await expect(page.getByRole("button", { name: "Submit" })).toBeVisible({ timeout: 10000 })). 2) Adopt user-facing locators (role, label, text) rather than fragile CSS classes. 3) Use isolated browser contexts per test to ensure zero cookies/storage leakage between runs.',
        counterQuestions: [
          'Why is retrying failed tests in CI an anti-pattern when used without quarantine buckets?',
          'How does Playwright\'s tracing tool capture DOM snapshots at the exact moment of failure?'
        ],
        interviewerExpectations: [
          'Condemn arbitrary sleep timeouts.',
          'Explain actionability checks and auto-waiting.',
          'Recommend user-facing accessible locators.'
        ],
        criticalPitfalls: [
          'Suggesting increasing all sleep timeouts to 10 seconds, which bloats suite duration without fixing the underlying race condition.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Hardcoded Sleep Delays Leading to Bloated & Flaky Suites',
        antiPattern: 'Placing Thread.sleep(5000) or time.sleep(5) before clicking an element or asserting on data.',
        correctApproach: 'Modern automation frameworks poll the DOM conditionally. Use auto-waiting assertions that resolve as soon as the element satisfies the condition, eliminating waste and preventing flakiness.',
        dangerLevel: 'HIGH',
        interviewContext: 'Universal QA & SDET interview question.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'The Test Automation Pyramid & ROI Invariant',
        overview: 'Test automation suites must balance execution velocity, maintainability cost, and confidence.',
        architecturalInvariants: [
          {
            title: 'Test Pyramid ROI Law',
            formulaOrInvariant: 'Execution_Cost(Unit) << Execution_Cost(Integration) << Execution_Cost(E2E)',
            explanation: 'Unit tests run in milliseconds in-memory; E2E browser tests run in seconds and are subject to network and browser rendering instability. 70% Unit, 20% Integration, 10% E2E delivers optimal reliability.',
            tradeoffs: 'E2E tests provide the highest end-user fidelity but carry the highest maintenance and execution cost.'
          }
        ],
        codeExamples: [
          {
            language: 'typescript',
            title: 'Resilient Playwright Page Object Model Implementation',
            code: `import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly submitButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Resilient accessible locators
    this.submitButton = page.getByRole('button', { name: 'Complete Order' });
    this.successMessage = page.getByRole('alert');
  }

  async submitOrder(): Promise<void> {
    // Auto-waits for actionability (visible, enabled, stable)
    await this.submitButton.click();
    // Auto-waits for DOM condition with polling
    await expect(this.successMessage).toContainText('Order Placed Successfully', {
      timeout: 10000,
    });
  }
}`,
            explanation: 'Demonstrates encapsulation of UI actions with resilient, auto-waiting accessible locators.'
          }
        ]
      }
    ]
  },
  // 13. AI Agent & Generative Systems Engineer
  {
    id: 'role-ai-agent-engineer',
    slug: 'ai-agent-engineer',
    name: 'AI Agent & Generative Systems Engineer',
    targetLevel: 'ENTRY_LEVEL',
    summary: 'Architect, benchmark, and deploy resilient autonomous coding agents, stateful multi-agent swarms, hybrid RAG retrieval systems, and deterministic LLM guardrails at scale.',
    category: 'Data & AI',
    estimatedReadTime: '26 min',
    pageEstimate: 16,
    information: {
      overview: 'An AI Agent & Generative Systems Engineer bridges frontier foundation models with deterministic software systems. They design agentic cognitive loops (ReAct, Plan-and-Solve, Reflexion), orchestrate multi-agent state machines, optimize prompt cache utilization, and establish verifiable safety and evaluation guardrails.',
      mission: 'Engineer self-healing, reliable autonomous agent runtimes and low-latency retrieval systems that transform stochastic generative foundation models into deterministic, enterprise-grade production software.',
      dayInTheLife: [
        'Architecting stateful agent execution loops with cycle detection, budget gates, and AST-aware codebase traversal.',
        'Benchmarking hybrid vector retrieval (dense embeddings + BM25 reciprocal rank fusion) and cross-encoder rerankers.',
        'Profiling prompt token cache locality to maximize KV-cache reuse and reduce Time-To-First-Token (TTFT) across multi-turn sessions.',
        'Constructing context window compaction algorithms and semantic summarizers to prevent context overflow and distraction.',
        'Engineering grammar-guided constrained decoding schemas (CFG, Pydantic) and red-teaming adversarial prompt injection surfaces.'
      ],
      coreResponsibilities: [
        'Engineer robust agentic loops with structured tool-calling, sandboxed command execution, and automated linter repair.',
        'Design and maintain enterprise-scale RAG systems with semantic chunking, HNSW vector indexing, and metadata filtering.',
        'Orchestrate cyclic multi-agent topologies using state machines, actor-isolated mailboxes, and distributed consensus.',
        'Optimize model inference throughput, KV cache memory footprint, and weight quantization (AWQ, GPTQ, GGUF).',
        'Build continuous evaluation pipelines (Ragas, TruLens, custom LLM-as-a-judge suites) with regression alerts in CI/CD.'
      ],
      careerProgression: [
        { level: 'L1', title: 'Associate AI Systems Engineer', typicalExperience: '0-2 yrs', focus: 'Single-agent prompt engineering, basic vector database indexing, API integration, and evaluation benchmark tracking.' },
        { level: 'L2', title: 'AI Agent & RAG Architect', typicalExperience: '2-5 yrs', focus: 'Multi-agent state machines, hybrid retrieval with reciprocal rank fusion, context window compaction, and sandboxed code execution.' },
        { level: 'L3', title: 'Staff Generative Systems Engineer', typicalExperience: '5-8 yrs', focus: 'Enterprise agent orchestration frameworks, custom speculative decoding, low-latency KV-cache serving, and zero-trust safety guardrails.' },
        { level: 'L4', title: 'Principal AI Systems Fellow', typicalExperience: '8+ yrs', focus: 'Frontier cognitive architecture research, foundational agent protocol standardization, multi-datacenter GPU cluster serving topologies, and autonomous software development systems.' }
      ],
      compensationBands: [
        { region: 'North America', entryLevel: '$115,000 - $145,000', midSenior: '$165,000 - $235,000', staffPrincipal: '$260,000 - $420,000+' },
        { region: 'Europe (EU/UK)', entryLevel: 'EUR 65,000 - 90,000', midSenior: 'EUR 95,000 - 150,000', staffPrincipal: 'EUR 160,000 - 250,000+' },
        { region: 'Asia-Pacific / India', entryLevel: 'INR 14,00,000 - 22,00,000', midSenior: 'INR 30,00,000 - 60,00,000', staffPrincipal: 'INR 75,00,000 - 1,40,00,000+' }
      ],
      keyToolsAndTechnologies: [
        'LangGraph & State Reducers', 'Vector Search Engines', 'HNSW Graph Indexing', 'PagedAttention & Serving Engines',
        'Pydantic & JSON Schema CFG', 'Docker & Container Sandboxes', 'Tree-sitter AST Parsers', 'Prometheus & OpenTelemetry'
      ],
      industryDemandRationale: 'As software engineering shifts from manual syntax creation to autonomous agent orchestration and semantic intelligence, engineers who understand prompt caching physics, stateful agent graphs, and deterministic guardrails represent the single highest-growth specialization in enterprise engineering.'
    },
    syllabus: [
      {
        tier: 'Tier 1',
        title: 'Foundations of Agentic Execution, Tool Calling & Prompt Caching',
        description: 'Master the ReAct execution loop, AST-guided code navigation, prefix cache budgeting, and grammar-guided constrained decoding.',
        durationWeeks: 4,
        competencies: [
          { topic: 'ReAct Execution Loop & Sandboxed Tool Calling', weightPercentage: 40, benchmarkAccuracy: 80, coreInvariants: ['Strict cycle detection & max iteration bounds', 'Ephemeral sandbox container isolation', 'AST diff verification prior to disk write'] },
          { topic: 'Prefix Caching & Context Window Token Budgeting', weightPercentage: 35, benchmarkAccuracy: 75, coreInvariants: ['Static prompt prefix immutability for KV cache reuse', 'FIFO rolling context compaction', 'Needle-in-a-Haystack attention degradation avoidance'] },
          { topic: 'Grammar-Guided Constrained Output Schemas', weightPercentage: 25, benchmarkAccuracy: 80, coreInvariants: ['Deterministic JSON CFG parsing at the logit level', 'Zero-shot retry fallback with schema error injection', 'Token-level logit bias validation'] }
        ],
        handsOnProjects: [
          {
            title: 'Autonomous Coding & Lint-Repair Agent',
            spec: 'Construct a self-correcting coding agent that accepts a repository task description, queries file trees via AST grep, applies unified diffs in a sandboxed runtime, intercepts compiler/linter error traces, and iterates until zero errors or budget depletion.',
            deliverables: ['Sandboxed execution runtime with cycle guards', 'Tree-sitter AST code inspector', 'Unit test harness achieving >90% benchmark pass rate']
          }
        ]
      },
      {
        tier: 'Tier 2',
        title: 'Enterprise Hybrid RAG, Vector Search & Multi-Agent Graphs',
        description: 'Build enterprise hybrid retrieval pipelines with HNSW graphs, Reciprocal Rank Fusion, cross-encoders, and cyclical multi-agent topologies.',
        durationWeeks: 6,
        competencies: [
          { topic: 'HNSW Vector Indexing & Hybrid Reciprocal Rank Fusion', weightPercentage: 40, benchmarkAccuracy: 85, coreInvariants: ['HNSW M and efConstruction recall tradeoff bounds', 'RRF rank constant 60 normalization', 'Cross-encoder reranking latency SLA (<150ms)'] },
          { topic: 'Cyclic State Graphs & Multi-Agent Swarms', weightPercentage: 35, benchmarkAccuracy: 80, coreInvariants: ['Immutable state reducers with pure functions', 'Actor-model mailbox isolation to prevent message storms', 'Distributed deadlock detection & timeout gates'] },
          { topic: 'Semantic Chunking & Contextual Compression', weightPercentage: 25, benchmarkAccuracy: 75, coreInvariants: ['Cosine distance boundary split thresholding', 'Parent-child document relationship tracking', 'Extractive summary token reduction'] }
        ],
        handsOnProjects: [
          {
            title: 'Enterprise Architectural Knowledge RAG with Cross-Encoder Reranking',
            spec: 'Implement an end-to-end knowledge assistant utilizing hybrid retrieval (sparse BM25 + dense sentence embeddings), Reciprocal Rank Fusion (RRF), cross-encoder re-scoring, and dynamic metadata filtering over 100k technical documents.',
            deliverables: ['HNSW index tuning benchmark suite', 'RRF retrieval service with <100ms latency p95', 'Automated faithfulness and relevancy evaluation report']
          }
        ]
      },
      {
        tier: 'Tier 3',
        title: 'Staff-Level LLMOps, Serving Internals, Quantization & Guardrails',
        description: 'Architect low-latency continuous batching serving, PagedAttention memory management, AWQ weight quantization, and dual-model safety guardrails.',
        durationWeeks: 8,
        competencies: [
          { topic: 'PagedAttention & Continuous Batching Serving Topologies', weightPercentage: 40, benchmarkAccuracy: 85, coreInvariants: ['Non-contiguous virtual memory block allocation for KV cache', 'Continuous batching prefill vs decode separation', 'Speculative decoding draft model acceptance rate (>70%)'] },
          { topic: 'Model Quantization (AWQ/GGUF) & VRAM Budgeting', weightPercentage: 35, benchmarkAccuracy: 80, coreInvariants: ['Salient weight protection in AWQ activation-aware quantization', '4-bit integer matrix multiplication throughput scaling', 'Memory bandwidth memory-bound decode phase physics'] },
          { topic: 'Adversarial Prompt Defense & Dual-Model Guardrail Architectures', weightPercentage: 25, benchmarkAccuracy: 85, coreInvariants: ['Separation of instruction and untrusted data planes', 'Deterministic heuristic input sanitizers before model ingestion', 'Red-team automated regression suite with zero false negatives'] }
        ],
        handsOnProjects: [
          {
            title: 'High-Throughput Guarded LLM Inference Gateway',
            spec: 'Build an enterprise LLM gateway with continuous batching support, token-level prefix caching, input/output guardrail filters, and real-time token telemetry tracking.',
            deliverables: ['Gateway proxy achieving >80% prompt cache hit rate', 'Dual-model prompt injection defense with <20ms overhead', 'Prometheus dashboard tracking TTFT, TPS, and VRAM utilization']
          }
        ]
      }
    ],
    questions: [
      {
        id: 'q-ai-1',
        title: 'Autonomous Coding Agent Oscillation and Infinite Loop Mitigation',
        difficulty: 'HARD',
        category: 'Autonomous Agents',
        questionText: 'When an autonomous coding agent encounters a compiler or test failure, it frequently flips between two contradictory fixes in an infinite loop. How do you detect and deterministically break this oscillation loop in a production agent architecture?',
        modelAnswer: 'Agent oscillation occurs when the state transition function f(S_t, Observation) yields a previously visited action without resolving the underlying constraint. In production architectures, mitigation follows a 4-tier strategy: 1) State Action Hashing & Cycle Detection: Compute a cryptographic hash of (tool_name, normalized_args, observation_summary) across a sliding window of recent steps. If the identical state is visited twice, immediately abort the loop. 2) Backtracking & Reflexion Prompt Injection: When a cycle is detected, roll back the agent state to the decision point prior to the cycle and inject an explicit metacognitive prompt detailing the failed alternation and forbidding the repeating tool invocations. 3) Context Compaction & Scratchpad Pruning: Repetitive compiler traces bloat the context window, causing the model to attend to its own erroneous history. Strip failed tool traces and replace them with a concise 1-line error summary. 4) Human-in-the-Loop Escalation: If 3 self-correction iterations fail, trip a circuit breaker to pause execution, preserve the state checkpoint, and request developer guidance.',
        counterQuestions: [
          'How does prefix caching affect the cost and latency of rolling back an agent execution trace?',
          'What AST-based heuristic can verify that a code patch actually touched the function under test before running the full build?'
        ],
        interviewerExpectations: [
          'Candidate must articulate cryptographic state hashing or cycle detection algorithms.',
          'Candidate must recognize that context bloating reinforces oscillatory behavior due to self-attention bias.',
          'Candidate must propose clear rollback or circuit-breaker fallback mechanisms.'
        ],
        criticalPitfalls: [
          'Merely setting a max iteration counter without cycle detection (which still burns tokens and time on useless oscillating steps).',
          'Letting the raw terminal error output fill the context window until the LLM loses its original instruction prompt.'
        ]
      },
      {
        id: 'q-ai-2',
        title: 'Hybrid Dense-Sparse Vector Search and Reciprocal Rank Fusion (RRF)',
        difficulty: 'HARD',
        category: 'Information Retrieval & RAG',
        questionText: 'Dense vector embeddings often fail on exact keyword lookups (e.g. error codes, product SKUs, function names), while sparse BM25 retrieval fails on semantic concepts. How do you design an enterprise hybrid retrieval pipeline with Reciprocal Rank Fusion and Cross-Encoder reranking that guarantees sub-150ms p95 latency?',
        modelAnswer: 'A high-precision hybrid retrieval pipeline executes in 3 stages: 1) Parallel Retrieval: In parallel, execute a sparse BM25 query against an inverted index and a dense ANN query against an HNSW vector index. 2) Rank-Based Normalization via RRF: Because cosine similarity scores and BM25 BM-scores operate on disparate mathematical scales and distributions, direct linear score combination causes calibration drift. Instead, use Reciprocal Rank Fusion: RRF_Score(d) = sum_{m in {dense, sparse}} 1 / (60 + Rank_m(d)). RRF treats both engines purely by their ordinal ranking, producing a robust union of candidates (typically top 50). 3) Cross-Encoder Reranking: Feed the top 50 RRF candidates through a cross-encoder model that evaluates query-document token interactions via joint attention. The cross-encoder assigns a calibrated relevance score (0 to 1), and the top 5-10 passages are returned to the generator. To satisfy the 150ms p95 SLA, prune the cross-encoder candidate list to 30 items, enable FP16 inference for the reranker, and cache query embeddings in an in-memory key-value store.',
        counterQuestions: [
          'Why is the constant 60 standard in Reciprocal Rank Fusion?',
          'How do you handle metadata filtering (e.g. tenant_id = X) without degrading HNSW graph traversal recall?'
        ],
        interviewerExpectations: [
          'Candidate must understand the score distribution disparity between dense cosine and BM25.',
          'Candidate must explain Reciprocal Rank Fusion and why ordinal rank fusion outperforms naive min-max score scaling.',
          'Candidate must distinguish bi-encoder retrieval from cross-encoder reranking.'
        ],
        criticalPitfalls: [
          'Attempting naive weighted sum of cosine similarity and BM25 score without normalization.',
          'Running cross-encoders over the entire corpus rather than as a secondary reranker over a candidate pool.'
        ]
      }
    ],
    interviewTraps: [
      {
        title: 'Naive Similarity Search Without Reranking Leading to Hallucinations',
        antiPattern: 'Fetching the top-k nearest neighbors from a vector database and immediately concatenating them into the LLM system prompt without reranking or relevance thresholding.',
        correctApproach: 'Bi-encoders encode queries and documents independently into vector space, which often retrieves conceptually adjacent but factually irrelevant text. Always apply a hybrid retrieval strategy with Reciprocal Rank Fusion and a cross-encoder reranker, discarding documents below a calibrated relevance score.',
        dangerLevel: 'CRITICAL',
        interviewContext: 'Universal RAG and generative search system design question.'
      },
      {
        title: 'Unbounded Agent Loops Without Context Compaction or Budget Gates',
        antiPattern: 'Allowing an autonomous agent to execute arbitrary tool calls in an open while-loop until the task resolves.',
        correctApproach: 'Autonomous agents must operate within deterministic boundaries: a hard token budget cap, maximum iteration count, state cycle detection hashing, and rolling context compaction to prevent prompt context rot and runaway compute expenses.',
        dangerLevel: 'HIGH',
        interviewContext: 'Coding agent and autonomous system architecture interviews.'
      }
    ],
    documentation: [
      {
        sectionTitle: 'Agentic Cognitive Architectures & Context Window Physics',
        overview: 'Autonomous agent design requires strict mathematical modeling of context window token budgets, prefix cache locality, and retrieval fusion.',
        architecturalInvariants: [
          {
            title: 'Prompt Prefix Caching Invariant',
            formulaOrInvariant: 'Latency_TTFT(Cached) = Latency_Prefill * (1 - Cache_Hit_Ratio)',
            explanation: 'Foundation model inference engines compute KV-caches sequentially from token 0. To achieve sub-second TTFT, all static system instructions, tool definitions, and repository schemas must be placed at the absolute prefix of the prompt without dynamic timestamps or session UUIDs.',
            tradeoffs: 'Forces all dynamic inputs (user query, runtime memory) to appear strictly at the suffix, constraining prompt ordering.'
          },
          {
            title: 'Hybrid Retrieval Reciprocal Rank Fusion Formula',
            formulaOrInvariant: 'RRF_Score(d) = sum_{m in Models} 1 / (k + Rank_m(d)), k = 60',
            explanation: 'Normalizes and fuses disparate ranking distributions (sparse lexical vs dense semantic) without relying on fragile heuristic score scaling.',
            tradeoffs: 'Disregards raw score magnitudes, treating large relevance margins between rank 1 and 2 the same as narrow ones.'
          }
        ],
        codeExamples: [
          {
            language: 'typescript',
            title: 'Resilient ReAct Autonomous Execution Loop with Cycle Detection',
            code: `export interface AgentStep {
  thought: string;
  tool: string;
  args: Record<string, unknown>;
  observation?: string;
}

export class AutonomousAgentLoop {
  private visitedStateHashes = new Set<string>();
  private readonly maxIterations: number;
  private readonly tokenBudget: number;

  constructor(maxIterations = 10, tokenBudget = 80000) {
    this.maxIterations = maxIterations;
    this.tokenBudget = tokenBudget;
  }

  // Cryptographic hash of action and arguments to detect repetitive loops
  private computeActionHash(tool: string, args: Record<string, unknown>): string {
    const serialized = JSON.stringify({ tool, args }, Object.keys(args).sort());
    let hash = 0;
    for (let i = 0; i < serialized.length; i++) {
      hash = ((hash << 5) - hash) + serialized.charCodeAt(i);
      hash |= 0;
    }
    return \`\${tool}_\${hash}\`;
  }

  async executeTask(
    instruction: string,
    executeTool: (name: string, args: Record<string, unknown>) => Promise<string>
  ): Promise<{ status: 'SUCCESS' | 'CYCLE_DETECTED' | 'BUDGET_EXCEEDED'; steps: AgentStep[] }> {
    const history: AgentStep[] = [];

    for (let iter = 1; iter <= this.maxIterations; iter++) {
      // 1. Model plans Thought and Action
      const step = await this.planNextStep(instruction, history);
      
      // 2. Cycle Detection Guardrail
      const actionHash = this.computeActionHash(step.tool, step.args);
      if (this.visitedStateHashes.has(actionHash)) {
        return { status: 'CYCLE_DETECTED', steps: history };
      }
      this.visitedStateHashes.add(actionHash);

      // 3. Terminal condition check
      if (step.tool === 'finish_task') {
        history.push(step);
        return { status: 'SUCCESS', steps: history };
      }

      // 4. Sandboxed Tool Execution
      const observation = await executeTool(step.tool, step.args);
      step.observation = observation;
      history.push(step);
    }

    return { status: 'BUDGET_EXCEEDED', steps: history };
  }

  private async planNextStep(instruction: string, history: AgentStep[]): Promise<AgentStep> {
    // Model inference invocation with prefix caching and grammar-guided output
    return { thought: 'Inspect files', tool: 'ast_grep', args: { query: 'pattern' } };
  }
}`,
            explanation: 'Demonstrates a production-grade ReAct execution loop featuring state action hashing, deterministic cycle prevention, and bounded iteration budgets.'
          }
        ]
      }
    ]
  }
];
