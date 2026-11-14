import { RESUME_TEXT } from './resumeText'

export const SECTION_DEFINITIONS = [
  {
    id: 'summary',
    label: 'Professional Summary',
    shortLabel: 'Summary',
    description: 'The story behind the title',
    icon: 'FileText',
  },
  {
    id: 'skills',
    label: 'Skills',
    shortLabel: 'Skills',
    description: 'Tools and capabilities',
    icon: 'Sparkles',
  },
  {
    id: 'experience',
    label: 'Work Experience',
    shortLabel: 'Experience',
    description: 'Roles, responsibilities, and growth',
    icon: 'BriefcaseBusiness',
  },
  {
    id: 'projects',
    label: 'Projects',
    shortLabel: 'Projects',
    description: 'Solutions built and supported',
    icon: 'Layers3',
  },
  {
    id: 'education',
    label: 'Education',
    shortLabel: 'Education',
    description: 'Academic foundation',
    icon: 'GraduationCap',
  },
  {
    id: 'certifications',
    label: 'Certifications',
    shortLabel: 'Certifications',
    description: 'Professional learning',
    icon: 'BadgeCheck',
  },
  {
    id: 'achievements',
    label: 'Achievements',
    shortLabel: 'Achievements',
    description: 'Moments worth noting',
    icon: 'Trophy',
  },
  {
    id: 'languages',
    label: 'Languages & Interests',
    shortLabel: 'Languages',
    description: 'Beyond the work',
    icon: 'Languages',
  },
  {
    id: 'resume',
    label: 'Resume',
    shortLabel: 'Resume',
    description: 'The complete document',
    icon: 'FileDown',
  },
  {
    id: 'contact',
    label: 'Contact',
    shortLabel: 'Contact',
    description: 'Start a conversation',
    icon: 'Send',
  },
]

export const AUDIO_SCRIPT = `Hello, I'm Manikanta Teja, a .NET Full Stack Developer based in Hyderabad. With over three years of experience, I build and support enterprise web and desktop applications using C#, ASP.NET Core, REST APIs, SQL Server, and React.js. My work has spanned forensic laboratory, inventory management, dispatch, and employee operations solutions, and I'm currently building full-stack fintech features with React.js, Node.js, TypeScript, and PostgreSQL. I care about reliable APIs, optimized data access, and applications that make everyday operations smoother. Thank you for listening.`

export const DEFAULT_PORTFOLIO = {
  version: 1,
  identity: {
    name: 'Manikanta Teja',
    resumeName: 'MANIKANTA TEJA',
    title: '.NET FULL STACK DEVELOPER | C# | ASP.NET CORE | REACT.JS | NODE.JS | AZURE',
    location: 'Hyderabad, India',
    intro:
      'I build dependable enterprise applications with backend depth in C#, ASP.NET Core, and SQL Server — paired with thoughtful frontend work in React.js. I’m currently exploring fintech with Node.js, TypeScript, and PostgreSQL.',
  },
  summary:
    '.NET Full Stack Developer with 3+ years of experience developing, maintaining, and supporting enterprise web and desktop applications using C#, ASP.NET Core, MVC, REST APIs, SQL Server, and React.js. Experienced in backend development, database query optimization, authentication, authorization, API integrations, and IIS deployments. Contributed to forensic laboratory, inventory management, dispatch, and employee operations solutions, with ongoing full-stack fintech development using React.js, Node.js, TypeScript, and PostgreSQL.',
  contact: {
    email: 'manikantatejageddada249@gmail.com',
    phone: '+91 8555948249',
    visible: {
      email: true,
      phone: true,
    },
    links: [
      {
        id: 'linkedin',
        label: 'LinkedIn',
        url: 'https://linkedin.com/in/manikantateja-dotnet',
        visible: true,
      },
    ],
  },
  skills: [
    {
      id: 'languages',
      category: 'Languages',
      items: ['C#', 'JavaScript', 'TypeScript', 'SQL'],
    },
    {
      id: 'backend',
      category: 'Backend',
      items: [
        '.NET 6',
        'ASP.NET Core',
        'ASP.NET MVC',
        'Web API',
        'Node.js',
        'Express.js',
        'REST APIs',
        'Microservices',
      ],
    },
    {
      id: 'frontend',
      category: 'Frontend / Desktop',
      items: ['React.js', 'HTML', 'CSS', 'jQuery', 'WPF'],
    },
    {
      id: 'data',
      category: 'Databases / Data Access',
      items: [
        'SQL Server',
        'PostgreSQL',
        'MongoDB',
        'Entity Framework',
        'NHibernate',
        'ADO.NET',
        'Prisma ORM',
      ],
    },
    {
      id: 'cloud',
      category: 'Cloud / Security',
      items: [
        'Azure Blob Storage',
        'Azure Key Vault',
        'Authentication',
        'Authorization',
        'Role-Based Access Control (RBAC)',
      ],
    },
    {
      id: 'integrations',
      category: 'Integrations',
      items: ['Razorpay Payment Gateway', 'WebSocket', 'Third-Party APIs'],
    },
    {
      id: 'tools',
      category: 'Tools / Delivery',
      items: [
        'Git',
        'GitHub',
        'Azure DevOps',
        'Visual Studio',
        'VS Code',
        'IIS',
        'CI/CD',
        'Agile',
        'Swagger',
      ],
    },
    {
      id: 'ai',
      category: 'AI Development Tools',
      items: ['Cursor', 'Claude Code', 'OpenAI Codex', 'GitHub Copilot'],
    },
  ],
  experience: [
    {
      id: 'progience',
      role: '.NET Developer',
      company: 'Progience Technologies',
      location: 'Hyderabad, India',
      dates: 'May 2023 – Present',
      summary:
        'Developing and supporting enterprise web and desktop applications across laboratory, inventory, and dispatch workflows.',
      bullets: [
        'Develop and maintain enterprise web and desktop applications using C#, ASP.NET Core/MVC, Web API, and WPF for laboratory, inventory, and dispatch workflows.',
        'Build backend business logic, REST API integrations, data access layers, and input validation to support business operations.',
        'Optimize SQL Server and NHibernate queries and troubleshoot application defects to improve responsiveness and reliability.',
        'Contribute to authentication, authorization, microservices-based services, and Azure Blob Storage and Key Vault integrations.',
        'Collaborate with cross-functional teams on code reviews, QA, UAT, CI/CD activities, IIS deployments, and ongoing enhancements.',
      ],
      skills: [
        'C#',
        'ASP.NET Core',
        'ASP.NET MVC',
        'Web API',
        'WPF',
        'SQL Server',
        'NHibernate',
        'Microservices',
        'Azure Blob Storage',
        'Azure Key Vault',
        'CI/CD',
        'IIS',
      ],
      achievements: [],
    },
  ],
  projects: [
    {
      id: 'cims',
      name: 'CIMS',
      subtitle: 'Consumable Inventory Management System',
      summary:
        'Chemical inventory, consumable usage logging, and quality-control workflows for forensic laboratories.',
      role: '.NET Full Stack Developer',
      status: '',
      featured: false,
      technologies: ['.NET 6', 'ASP.NET MVC', 'C#', 'NHibernate', 'SQL Server', 'IIS'],
      stackNote: '',
      purpose:
        'Support chemical inventory, consumable usage logging, and quality-control workflows for forensic laboratories.',
      contribution:
        'Developed and maintained the workflows, implemented backend validation and business logic, optimized NHibernate queries, and supported QA, UAT, and IIS deployments.',
      features: [
        'Chemical inventory management',
        'Consumable usage logging',
        'Quality-control workflows',
      ],
      challenges: '',
      screenshots: [],
      links: [],
    },
    {
      id: 'lims-plus-dna',
      name: 'LIMS-plus DNA',
      subtitle: 'Forensic DNA Laboratory Management',
      summary:
        'Forensic DNA sample management and tracking across casework and databank processing workflows.',
      role: '.NET Full Stack Developer',
      status: '',
      featured: false,
      technologies: [],
      stackNote: 'Specific technology stack was not provided in the resume.',
      purpose:
        'Support forensic DNA sample management and tracking across casework and databank processing workflows.',
      contribution:
        'Contributed to application maintenance and workflow enhancements supporting laboratory sample processing.',
      features: [
        'Forensic DNA sample management',
        'Casework processing tracking',
        'Databank processing workflows',
      ],
      challenges: '',
      screenshots: [],
      links: [],
    },
    {
      id: 'cad-8',
      name: 'CAD 8',
      subtitle: 'Computer-Aided Dispatch',
      summary:
        'Desktop functionality for incident classification, department assignment, and dispatch operations.',
      role: '.NET Full Stack Developer',
      status: '',
      featured: false,
      technologies: ['C#', '.NET 10', 'WPF'],
      stackNote: '',
      purpose:
        'Support incident classification, department assignment, and dispatch operations through desktop functionality.',
      contribution:
        'Developed and maintained desktop functionality, enhanced WPF user-interface behavior and data validation, and supported integrations for reliable dispatch workflows.',
      features: [
        'Incident classification',
        'Department assignment',
        'Dispatch operations',
        'Data validation',
      ],
      challenges: '',
      screenshots: [],
      links: [],
    },
    {
      id: 'employee-management',
      name: 'Employee Project Management System',
      subtitle: 'Employee Operations',
      summary:
        'Employee operations covering records, timesheets, task assignments, leave requests, and performance tracking.',
      role: '.NET Full Stack Developer',
      status: '',
      featured: false,
      technologies: [
        'ASP.NET MVC',
        'C#',
        'NHibernate',
        'SQL Server',
        'React.js',
        'TypeScript',
        'Node.js',
        'Express.js',
        'Prisma ORM',
        'PostgreSQL',
      ],
      stackNote: '',
      purpose:
        'Manage employee records, timesheets, task assignments, leave requests, and performance tracking.',
      contribution:
        'Initially developed the application with ASP.NET MVC, NHibernate, and SQL Server, then migrated it to React.js and TypeScript with Node.js/Express.js APIs, Prisma ORM, and PostgreSQL.',
      features: [
        'Employee records',
        'Timesheets',
        'Task assignments',
        'Leave requests',
        'Performance tracking',
      ],
      challenges: '',
      screenshots: [],
      links: [],
    },
    {
      id: 'fintech-project',
      name: 'Fintech Project',
      subtitle: 'Product Engineering',
      summary:
        'Ongoing fintech platform work across React.js, Node.js APIs, PostgreSQL, payments, cloud storage, and real-time updates.',
      role: '.NET Full Stack Developer',
      status: 'Ongoing',
      featured: true,
      technologies: [
        'React.js',
        'Node.js',
        'Express.js',
        'TypeScript',
        'PostgreSQL',
        'Prisma ORM',
        'Razorpay',
        'WebSocket',
        'Azure Blob Storage',
        'Azure Key Vault',
        'Third-Party APIs',
      ],
      stackNote: '',
      purpose: 'Build an ongoing fintech application across frontend, APIs, data, and payments.',
      contribution:
        'Building React.js frontend components and Node.js/Express.js REST APIs; working on PostgreSQL data models, Prisma schema, authentication, authorization, and Razorpay payment integration; integrating Azure Blob Storage, Azure Key Vault, and third-party APIs; implementing WebSocket-based real-time communication and payment-status updates.',
      features: [
        'React.js frontend components',
        'Node.js / Express.js REST APIs',
        'PostgreSQL data models and Prisma schema',
        'Authentication and authorization',
        'Razorpay payment integration',
        'WebSocket real-time communication',
        'Payment-status updates',
      ],
      challenges: '',
      screenshots: [],
      links: [],
    },
  ],
  education: [
    {
      id: 'btech',
      degree: 'Bachelor of Technology (B.Tech), Computer Science and Engineering',
      institution: 'Swarnandhara College of Engineering and Technology',
      location: 'Narsapuram, Andhra Pradesh',
      dates: '2019 – 2023',
      details: '',
    },
  ],
  certifications: [],
  achievements: [],
  languages: ['English', 'Telugu'],
  interests: [],
  sections: {
    order: SECTION_DEFINITIONS.map((section) => section.id),
    hidden: [],
  },
  audio: {
    key: null,
    fileName: '',
    mimeType: '',
    transcript: AUDIO_SCRIPT,
    durationHint: 0,
    speed: 1,
  },
  photo: {
    key: null,
    fileName: '',
    zoom: 1,
    x: 50,
    y: 50,
  },
  resume: {
    key: null,
    fileName: 'Manikanta_Teja_Resume.pdf',
    size: null,
    builtinUrl: '/Manikanta_Teja_Resume.pdf',
  },
  resumeText: RESUME_TEXT,
  reviewNotes: [],
  uncategorized: '',
  featuredProjectId: 'fintech-project',
  lastSavedAt: null,
}

export function createDefaultPortfolio() {
  return JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO))
}

export const THEMES = [
  {
    id: 'midnight',
    name: 'Midnight Violet',
    description: 'Ink-blue canvas, violet syntax, and cyan highlights.',
    colors: ['#070a14', '#10162b', '#a78bfa', '#eef1ff'],
  },
  {
    id: 'pearl',
    name: 'Pearl Light',
    description: 'Light editor paper, indigo syntax, and crisp contrast.',
    colors: ['#f4f2ec', '#fffefa', '#4f46e5', '#101320'],
  },
  {
    id: 'ocean',
    name: 'Ocean Teal',
    description: 'Deep terminal teal, mint syntax, and calm contrast.',
    colors: ['#03171a', '#082a2e', '#2dd4bf', '#e6fffb'],
  },
]
