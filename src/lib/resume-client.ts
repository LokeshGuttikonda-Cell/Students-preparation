import { DEFAULT_ROLES_CATALOG } from './catalog-data';
import { triggerBrowserFileDownload } from './admin-database-client';

// ---------------------------------------------------------------------------
// Domain Types & Interfaces
// ---------------------------------------------------------------------------

export interface ResumeContact {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
  honors?: string;
}

export interface ResumeExperience {
  id: string;
  company: string;
  roleTitle: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
}

export interface ResumeProject {
  id: string;
  title: string;
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  bullets: string[];
}

export interface ResumeSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  toolsAndCloud: string[];
  coreConcepts: string[];
}

export interface ResumeCredentialItem {
  id: string;
  code: string;
  title: string;
  issueDate: string;
  verificationUrl: string;
}

export interface StudentResume {
  id: string;
  targetRoleSlug: string;
  contact: ResumeContact;
  summary: string;
  skills: ResumeSkills;
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  credentials: ResumeCredentialItem[];
  lastModified: string;
}

export type AtsTier = 'HIGH_INTERVIEW_CHANCE' | 'BORDERLINE' | 'ATS_FILTER_RISK';

export interface AtsAnalysis {
  overallScore: number;
  tier: AtsTier;
  tierLabel: string;
  roleName: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  actionVerbCount: number;
  quantifiedMetricCount: number;
  keywordScore: number;
  impactScore: number;
  verbScore: number;
  formatScore: number;
  suggestions: string[];
}

// ---------------------------------------------------------------------------
// ATS Keyword & Heuristics Catalog (100% Vendor-Neutral)
// ---------------------------------------------------------------------------

export const ROLE_KEYWORD_DICTIONARIES: Record<string, string[]> = {
  'aws-cloud-engineer': [
    'Cloud Architecture', 'Infrastructure as Code', 'Virtual Private Cloud', 'Object Storage',
    'Serverless Functions', 'Container Orchestration', 'Auto Scaling', 'Load Balancing',
    'High Availability', 'Disaster Recovery', 'Identity and Access Management', 'Terraform',
    'Distributed Systems', 'Monitoring & Telemetry', 'Cost Optimization'
  ],
  'azure-cloud-engineer': [
    'Cloud Computing', 'Virtual Networks', 'Active Directory', 'Resource Management',
    'Blob Storage', 'Infrastructure Automation', 'Disaster Recovery', 'Hybrid Cloud',
    'Network Security Groups', 'CI/CD Pipelines', 'Site Reliability', 'Containerization'
  ],
  'devops-engineer': [
    'CI/CD Pipelines', 'Docker', 'Kubernetes', 'Terraform', 'Infrastructure as Code',
    'GitOps', 'Observability', 'Prometheus', 'Grafana', 'Linux Systems',
    'Bash Scripting', 'Site Reliability Engineering', 'Zero Downtime Deployment', 'Artifact Repository'
  ],
  'java-backend-developer': [
    'Java', 'Spring Framework', 'Microservices', 'REST APIs', 'SQL & Relational DBs',
    'Hibernate / ORM', 'Multithreading & Concurrency', 'Distributed Caching', 'JVM Tuning',
    'Design Patterns', 'Kafka / Event Streaming', 'Unit Testing & JUnit', 'ACID Transactions'
  ],
  'python-developer': [
    'Python', 'FastAPI / Django', 'RESTful Services', 'Asynchronous Programming',
    'PostgreSQL / SQLite', 'Redis Caching', 'Pandas & Data Processing', 'Unit Testing & PyTest',
    'Docker', 'API Integration', 'Task Queues & Celery', 'Algorithm Optimization'
  ],
  'fullstack-javascript-developer': [
    'TypeScript', 'JavaScript (ES6+)', 'React / Next.js', 'Node.js', 'Express',
    'REST & GraphQL', 'State Management', 'Tailwind CSS', 'PostgreSQL / MongoDB',
    'Web Performance Optimization', 'Unit Testing & Vitest', 'WebSockets', 'Responsive Design'
  ],
  'data-analyst': [
    'SQL & Complex Queries', 'Data Modeling', 'ETL Pipelines', 'Data Visualization',
    'Statistical Analysis', 'Business Intelligence', 'Window Functions', 'Data Cleaning',
    'Excel / Spreadsheets', 'Python / R Analysis', 'Exploratory Data Analysis', 'KPI Dashboards'
  ],
  'crm-specialist': [
    'CRM Architecture', 'Business Process Automation', 'Data Migration', 'Schema Design',
    'Workflow Rules', 'REST API Integrations', 'Role-Based Access Control', 'User Management',
    'Reporting & Analytics', 'Enterprise Systems Integration'
  ],
  'data-engineer': [
    'Apache Spark', 'Data Warehousing', 'ETL / ELT Pipelines', 'Kafka / Event Ingestion',
    'SQL Optimization', 'Columnar Storage', 'Data Lake Architecture', 'Airflow Orchestration',
    'Schema Evolution', 'Distributed Data Processing', 'Data Quality Checks'
  ],
  'ml-ai-engineer': [
    'Machine Learning', 'Deep Learning', 'PyTorch / TensorFlow', 'Model Evaluation & Metrics',
    'Feature Engineering', 'NLP / Computer Vision', 'Model Serving & Inference',
    'Vector Embeddings', 'Data Preprocessing', 'MLOps & Experiment Tracking', 'Hyperparameter Tuning'
  ],
  'cybersecurity-specialist': [
    'Network Security', 'Vulnerability Assessment', 'Cryptography & Public Key Infrastructure',
    'Penetration Testing', 'Threat Modeling', 'Identity & Access Management', 'Incident Response',
    'Firewalls & Intrusion Detection', 'Security Auditing', 'OWASP Top 10 Security'
  ],
  'qa-automation-engineer': [
    'Test Automation Frameworks', 'Playwright / Selenium', 'End-to-End Testing',
    'API Testing', 'Performance & Load Testing', 'CI/CD Test Integration',
    'Test Case Design', 'Bug Reporting & Tracking', 'Regression Testing', 'BDD / TDD Methodologies'
  ]
};

export const ACTION_VERBS = [
  'Architected', 'Engineered', 'Designed', 'Implemented', 'Optimized',
  'Spearheaded', 'Automated', 'Scaled', 'Containerized', 'Deployed',
  'Refactored', 'Benchmarked', 'Configured', 'Streamlined', 'Pioneered',
  'Resolved', 'Accelerated', 'Integrated', 'Orchestrated', 'Constructed'
];

export const IMPACT_METRIC_REGEX = /\b(\d+(\.\d+)?%|\$\d+|\d+x|\d+\s*(ms|seconds|qps|users|req\/s|rps|million|thousand|GB|TB))\b/i;

// ---------------------------------------------------------------------------
// ATS Analysis Engine
// ---------------------------------------------------------------------------

export function analyzeResumeAts(resume: StudentResume): AtsAnalysis {
  const role =
    DEFAULT_ROLES_CATALOG.find((r) => r.slug === resume.targetRoleSlug) ||
    DEFAULT_ROLES_CATALOG[0];

  const targetKeywords = ROLE_KEYWORD_DICTIONARIES[role.slug] || ROLE_KEYWORD_DICTIONARIES['aws-cloud-engineer'];

  // Flatten resume content to lowercase text corpus
  const allText = [
    resume.contact.fullName,
    resume.summary,
    ...resume.skills.languages,
    ...resume.skills.frameworks,
    ...resume.skills.databases,
    ...resume.skills.toolsAndCloud,
    ...resume.skills.coreConcepts,
    ...resume.experience.flatMap((e) => [e.company, e.roleTitle, ...e.bullets]),
    ...resume.projects.flatMap((p) => [p.title, ...p.techStack, ...p.bullets]),
    ...resume.education.flatMap((ed) => [ed.degree, ed.fieldOfStudy, ed.institution]),
    ...resume.credentials.map((c) => c.title + ' ' + c.code),
  ]
    .join(' ')
    .toLowerCase();

  // 1. Keyword Matching (50% weight)
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  targetKeywords.forEach((kw) => {
    // Check keyword or split sub-terms
    const kwLower = kw.toLowerCase();
    const parts = kwLower.split(/[ /&]+/).filter((p) => p.length > 2);
    const isMatched =
      allText.includes(kwLower) ||
      (parts.length > 0 && parts.every((part) => allText.includes(part)));

    if (isMatched) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordCoveragePct = targetKeywords.length > 0
    ? (matchedKeywords.length / targetKeywords.length) * 100
    : 100;
  const keywordScore = Math.min(100, Math.round(keywordCoveragePct));

  // 2. Action Verbs Count (15% weight)
  const allBullets = [
    ...resume.experience.flatMap((e) => e.bullets),
    ...resume.projects.flatMap((p) => p.bullets),
  ];

  let actionVerbCount = 0;
  const upperText = allBullets.join(' ');
  ACTION_VERBS.forEach((verb) => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    if (regex.test(upperText)) {
      actionVerbCount++;
    }
  });

  const verbScore = Math.min(100, Math.round((actionVerbCount / 6) * 100));

  // 3. Measurable Impact Metrics (25% weight)
  let quantifiedMetricCount = 0;
  allBullets.forEach((bullet) => {
    if (IMPACT_METRIC_REGEX.test(bullet)) {
      quantifiedMetricCount++;
    }
  });

  const impactScore = Math.min(100, Math.round((quantifiedMetricCount / 4) * 100));

  // 4. Formatting & Completeness (10% weight)
  let formatScore = 0;
  if (resume.contact.fullName && resume.contact.email) formatScore += 25;
  if (resume.summary.length > 40) formatScore += 25;
  if (resume.experience.length > 0) formatScore += 20;
  if (resume.projects.length >= 2) formatScore += 15;
  if (resume.education.length > 0) formatScore += 15;

  // Composite Weighted ATS Score
  const overallScore = Math.round(
    keywordScore * 0.5 +
    impactScore * 0.25 +
    verbScore * 0.15 +
    formatScore * 0.10
  );

  // Assign Tier
  let tier: AtsTier = 'ATS_FILTER_RISK';
  let tierLabel = 'High ATS Filter Risk (<60%)';

  if (overallScore >= 80) {
    tier = 'HIGH_INTERVIEW_CHANCE';
    tierLabel = 'High Interview Shortlist Probability (>=80%)';
  } else if (overallScore >= 60) {
    tier = 'BORDERLINE';
    tierLabel = 'Borderline / Needs Keywords (60-79%)';
  }

  // Actionable Suggestions
  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    suggestions.push(
      `Incorporate top missing domain keywords: ${missingKeywords.slice(0, 3).join(', ')}.`
    );
  }
  if (quantifiedMetricCount < 3) {
    suggestions.push(
      'Quantify your impact in project/experience bullets using metrics (e.g., "reduced latency by 35%", "scaled to 10k users").'
    );
  }
  if (actionVerbCount < 4) {
    suggestions.push(
      'Begin bullet points with strong active engineering verbs (e.g., "Architected", "Engineered", "Optimized", "Refactored").'
    );
  }
  if (resume.credentials.length === 0) {
    suggestions.push(
      'Link your verified platform credentials from the Placement Readiness Profiler to validate technical mastery.'
    );
  }

  return {
    overallScore,
    tier,
    tierLabel,
    roleName: role.name,
    matchedKeywords,
    missingKeywords,
    actionVerbCount,
    quantifiedMetricCount,
    keywordScore,
    impactScore,
    verbScore,
    formatScore,
    suggestions,
  };
}

// ---------------------------------------------------------------------------
// Sample Resume Generator
// ---------------------------------------------------------------------------

export function generateSampleResume(roleSlug: string): StudentResume {
  const role =
    DEFAULT_ROLES_CATALOG.find((r) => r.slug === roleSlug) ||
    DEFAULT_ROLES_CATALOG[0];

  const keywords = ROLE_KEYWORD_DICTIONARIES[role.slug] || ROLE_KEYWORD_DICTIONARIES['aws-cloud-engineer'];

  return {
    id: 'resume_default_sample',
    targetRoleSlug: role.slug,
    contact: {
      fullName: 'Rahul Sharma',
      email: 'rahul.sharma@example.edu',
      phone: '+91 98765 43210',
      location: 'Bengaluru, India',
      githubUrl: 'https://github.com/rahul-sharma',
      linkedinUrl: 'https://linkedin.com/in/rahul-sharma-dev',
      portfolioUrl: 'https://rahulsharma.dev',
    },
    summary: `Proactive Software Engineer specializing in ${role.name}. Proven track record in architecting distributed, fault-tolerant architectures, optimizing relational database queries by 45%, and implementing scalable pipelines. Holds verified platform credential SP-2026-READY.`,
    skills: {
      languages: ['TypeScript', 'Python', 'Java', 'SQL', 'Bash'],
      frameworks: ['React', 'Next.js', 'Spring Boot', 'FastAPI', 'Node.js'],
      databases: ['PostgreSQL', 'Redis', 'MongoDB', 'SQLite'],
      toolsAndCloud: [keywords[0] || 'Docker', keywords[1] || 'Kubernetes', keywords[2] || 'Terraform', 'Git', 'Linux'],
      coreConcepts: [keywords[3] || 'Distributed Systems', keywords[4] || 'Microservices', 'Concurrency', 'REST APIs', 'System Design'],
    },
    experience: [
      {
        id: 'exp-1',
        company: 'Apex Core Labs',
        roleTitle: `Associate ${role.name} Intern`,
        location: 'Bengaluru, India',
        startDate: 'Jan 2026',
        endDate: 'Jun 2026',
        isCurrent: false,
        bullets: [
          `Architected high-throughput data pipelines using ${keywords[1] || 'event streaming'}, reducing end-to-end latency by 38% under 5000 req/s load.`,
          `Optimized database queries and index schemas across PostgreSQL clusters, slashing p99 query latency from 220ms to 42ms.`,
          `Automated CI/CD integration workflows with automated unit tests, accelerating deployment cycle frequency by 3x.`,
        ],
      },
    ],
    projects: [
      {
        id: 'proj-1',
        title: 'Distributed In-Memory Key-Value Store & Consensus Lab',
        techStack: ['TypeScript', 'Node.js', 'Raft Consensus', 'Docker'],
        liveUrl: 'https://demo.consensuslab.dev',
        githubUrl: 'https://github.com/rahul-sharma/consensus-lab',
        bullets: [
          'Engineered a fault-tolerant distributed replicated state machine implementing Raft leader election and log compaction.',
          'Benchmarked cluster throughput achieving 12,000 QPS with sub-5ms commit latency across 5 node topologies.',
          'Containerized local clusters using Docker Compose and automated partition tolerance testing simulations.',
        ],
      },
      {
        id: 'proj-2',
        title: 'Autonomous System Performance Telemetry Dashboard',
        techStack: ['React', 'Tailwind CSS', 'WebSockets', 'PostgreSQL'],
        liveUrl: 'https://telemetry.preview.dev',
        githubUrl: 'https://github.com/rahul-sharma/telemetry-monitor',
        bullets: [
          'Implemented real-time WebSocket telemetry aggregator tracking V8 heap memory pressure and event loop delays.',
          'Designed responsive multi-dimensional SVG spider matrix and anomaly detection algorithms for latency spikes.',
          'Reduced client-side bundle size by 42% through aggressive tree-shaking and dynamic module code splitting.',
        ],
      },
    ],
    education: [
      {
        institution: 'National Institute of Technology',
        degree: 'Bachelor of Technology',
        fieldOfStudy: 'Computer Science and Engineering',
        startDate: 'Aug 2022',
        endDate: 'May 2026',
        gpa: '8.8 / 10.0',
        honors: "Dean's Academic Merit List",
      },
    ],
    credentials: [
      {
        id: 'cred-1',
        code: 'SP-2026-VERIFIED-A8F4',
        title: `Verified Placement Ready: ${role.name}`,
        issueDate: 'Sep 2026',
        verificationUrl: '/verify/SP-2026-VERIFIED-A8F4',
      },
    ],
    lastModified: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Browser LocalStorage Persistence
// ---------------------------------------------------------------------------

const RESUME_STORAGE_KEY = 'sp_student_resume_v1';

export function getSavedResume(roleSlug?: string): StudentResume {
  if (typeof window === 'undefined') {
    return generateSampleResume(roleSlug || DEFAULT_ROLES_CATALOG[0].slug);
  }
  try {
    const saved = localStorage.getItem(RESUME_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as StudentResume;
    }
  } catch {
    // Fallback to sample
  }
  return generateSampleResume(roleSlug || DEFAULT_ROLES_CATALOG[0].slug);
}

export function saveResume(resume: StudentResume): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = {
      ...resume,
      lastModified: new Date().toISOString(),
    };
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore error
  }
}

// ---------------------------------------------------------------------------
// Multi-Format Exporters: LaTeX, Markdown & PDF
// ---------------------------------------------------------------------------

export function exportResumeAsLatex(resume: StudentResume): string {
  const sanitize = (str: string) =>
    str.replace(/([&%$#_{}~^\\])/g, '\\$1');

  return `\\documentclass[letterpaper,11pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-0.5in}
\\addtolength{\\textheight}{1.0in}

\\titleformat{\\section}{\\scshape\\raggedright\\large}{}{0em}{}[\\titlerule]

\\begin{document}

% --- Contact Header ---
\\begin{center}
  {\\Huge \\textbf{${sanitize(resume.contact.fullName)}}} \\\\ \\vspace{4pt}
  ${sanitize(resume.contact.location)} \\textbar{} ${sanitize(resume.contact.phone)} \\textbar{} ${sanitize(resume.contact.email)} \\\\
  \\href{${resume.contact.githubUrl}}{GitHub} \\textbar{} \\href{${resume.contact.linkedinUrl}}{LinkedIn} \\textbar{} \\href{${resume.contact.portfolioUrl}}{Portfolio}
\\end{center}

% --- Professional Summary ---
\\section{Professional Summary}
${sanitize(resume.summary)}

% --- Technical Skills ---
\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\item \\textbf{Languages}: ${sanitize(resume.skills.languages.join(', '))} \\\\
  \\textbf{Frameworks \\& Libraries}: ${sanitize(resume.skills.frameworks.join(', '))} \\\\
  \\textbf{Databases}: ${sanitize(resume.skills.databases.join(', '))} \\\\
  \\textbf{Tools \\& Cloud Platforms}: ${sanitize(resume.skills.toolsAndCloud.join(', '))} \\\\
  \\textbf{Core Competencies}: ${sanitize(resume.skills.coreConcepts.join(', '))}
\\end{itemize}

% --- Experience ---
\\section{Experience}
${resume.experience.map((exp) => `
\\textbf{${sanitize(exp.roleTitle)}} \\hfill ${sanitize(exp.startDate)} -- ${sanitize(exp.endDate)} \\\\
\\textit{${sanitize(exp.company)}} \\hfill \\textit{${sanitize(exp.location)}}
\\begin{itemize}[leftmargin=0.2in]
${exp.bullets.map((b) => `  \\item ${sanitize(b)}`).join('\n')}
\\end{itemize}
`).join('\n')}

% --- Projects ---
\\section{Technical Projects}
${resume.projects.map((proj) => `
\\textbf{${sanitize(proj.title)}} \\textbar{} \\textit{${sanitize(proj.techStack.join(', '))}} \\\\
\\begin{itemize}[leftmargin=0.2in]
${proj.bullets.map((b) => `  \\item ${sanitize(b)}`).join('\n')}
\\end{itemize}
`).join('\n')}

% --- Education ---
\\section{Education}
${resume.education.map((ed) => `
\\textbf{${sanitize(ed.institution)}} \\hfill ${sanitize(ed.startDate)} -- ${sanitize(ed.endDate)} \\\\
\\textit{${sanitize(ed.degree)} in ${sanitize(ed.fieldOfStudy)}} \\hfill GPA: ${sanitize(ed.gpa)}
`).join('\n')}

% --- Verified Credentials ---
${resume.credentials.length > 0 ? `
\\section{Verified Credentials}
\\begin{itemize}[leftmargin=0.15in, label={}]
${resume.credentials.map((c) => `  \\item \\textbf{${sanitize(c.title)}} -- Code: ${sanitize(c.code)} (${sanitize(c.issueDate)})`).join('\n')}
\\end{itemize}
` : ''}

\\end{document}
`;
}

export function exportResumeAsMarkdown(resume: StudentResume): string {
  return `# ${resume.contact.fullName}
${resume.contact.location} | ${resume.contact.phone} | ${resume.contact.email}
[GitHub](${resume.contact.githubUrl}) | [LinkedIn](${resume.contact.linkedinUrl}) | [Portfolio](${resume.contact.portfolioUrl})

---

## Professional Summary
${resume.summary}

---

## Technical Skills
- **Languages:** ${resume.skills.languages.join(', ')}
- **Frameworks & Libraries:** ${resume.skills.frameworks.join(', ')}
- **Databases:** ${resume.skills.databases.join(', ')}
- **Tools & Cloud Platforms:** ${resume.skills.toolsAndCloud.join(', ')}
- **Core Competencies:** ${resume.skills.coreConcepts.join(', ')}

---

## Experience
${resume.experience.map((exp) => `### ${exp.roleTitle} — ${exp.company} (${exp.startDate} - ${exp.endDate})
*${exp.location}*
${exp.bullets.map((b) => `- ${b}`).join('\n')}
`).join('\n')}

---

## Technical Projects
${resume.projects.map((proj) => `### ${proj.title}
*Technologies:* ${proj.techStack.join(', ')}
${proj.bullets.map((b) => `- ${b}`).join('\n')}
`).join('\n')}

---

## Education
${resume.education.map((ed) => `- **${ed.degree} in ${ed.fieldOfStudy}**, ${ed.institution} (${ed.startDate} - ${ed.endDate}) — GPA: ${ed.gpa}`).join('\n')}

---

## Verified Platform Credentials
${resume.credentials.map((c) => `- **${c.title}** [Code: \`${c.code}\`] — Issued: ${c.issueDate}`).join('\n')}
`;
}

export function exportResumeAsPdf(resume: StudentResume): void {
  const filename = `${resume.contact.fullName.toLowerCase().replace(/\\s+/g, '-')}-resume.pdf`;

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
    '<< /Length 1200 >>',
    'stream',
    'BT',
    '/F2 18 Tf',
    '50 800 Td',
    `(${resume.contact.fullName.toUpperCase()}) Tj`,
    '/F1 9 Tf',
    '0 -18 Td',
    `(${resume.contact.location} | ${resume.contact.email} | ${resume.contact.phone}) Tj`,
    '0 -14 Td',
    `(${resume.contact.githubUrl} | ${resume.contact.linkedinUrl}) Tj`,
    '0 -24 Td',
    '/F2 12 Tf',
    '(PROFESSIONAL SUMMARY) Tj',
    '/F1 9 Tf',
    '0 -14 Td',
    `(${resume.summary.substring(0, 90)}) Tj`,
    '0 -12 Td',
    `(${resume.summary.substring(90, 180)}) Tj`,
    '0 -22 Td',
    '/F2 12 Tf',
    '(TECHNICAL SKILLS) Tj',
    '/F1 9 Tf',
    '0 -14 Td',
    `(Languages: ${resume.skills.languages.slice(0, 6).join(', ')}) Tj`,
    '0 -12 Td',
    `(Frameworks: ${resume.skills.frameworks.slice(0, 5).join(', ')}) Tj`,
    '0 -12 Td',
    `(Databases & Tools: ${[...resume.skills.databases, ...resume.skills.toolsAndCloud].slice(0, 6).join(', ')}) Tj`,
    '0 -22 Td',
    '/F2 12 Tf',
    '(EXPERIENCE) Tj',
    '/F1 9 Tf',
  ];

  resume.experience.forEach((exp) => {
    pdfLines.push(
      '0 -14 Td',
      '/F2 10 Tf',
      `(${exp.roleTitle} - ${exp.company} [${exp.startDate} - ${exp.endDate}]) Tj`,
      '/F1 9 Tf',
    );
    exp.bullets.slice(0, 2).forEach((b) => {
      pdfLines.push(
        '0 -12 Td',
        `( - ${b.substring(0, 85)}) Tj`,
      );
    });
  });

  pdfLines.push(
    '0 -22 Td',
    '/F2 12 Tf',
    '(TECHNICAL PROJECTS) Tj',
    '/F1 9 Tf',
  );

  resume.projects.forEach((proj) => {
    pdfLines.push(
      '0 -14 Td',
      '/F2 10 Tf',
      `(${proj.title} [${proj.techStack.slice(0, 4).join(', ')}]) Tj`,
      '/F1 9 Tf',
    );
    proj.bullets.slice(0, 2).forEach((b) => {
      pdfLines.push(
        '0 -12 Td',
        `( - ${b.substring(0, 85)}) Tj`,
      );
    });
  });

  pdfLines.push(
    '0 -22 Td',
    '/F2 12 Tf',
    '(EDUCATION) Tj',
    '/F1 9 Tf',
  );

  resume.education.forEach((ed) => {
    pdfLines.push(
      '0 -14 Td',
      `(${ed.degree} in ${ed.fieldOfStudy} - ${ed.institution} [GPA: ${ed.gpa}]) Tj`,
    );
  });

  pdfLines.push(
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
    '0000001480 00000 n ',
    '0000001550 00000 n ',
    'trailer',
    '<< /Size 7 /Root 1 0 R >>',
    'startxref',
    '1625',
    '%%EOF',
  );

  triggerBrowserFileDownload(filename, pdfLines.join('\n'), 'application/pdf');
}
