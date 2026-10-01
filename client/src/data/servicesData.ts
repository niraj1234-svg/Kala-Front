export interface DigitalService {
  id: 'web-dev' | 'app-dev' | 'whatsapp-bot'
  badge: string
  title: string
  subtitle: string
  tagline: string
  description: string
  iconName: string
  features: string[]
  technologies: string[]
  deliverables: string[]
  idealFor: string[]
  whatsappMessage: string
}

export const DIGITAL_SERVICES: DigitalService[] = [
  {
    id: 'web-dev',
    badge: 'FULL-STACK & MODERN',
    title: 'Web Development',
    subtitle: 'High-performance websites, custom web applications & e-commerce stores.',
    tagline: 'Modern, ultra-fast & conversion-focused web solutions built for scale.',
    description:
      'We design and develop bespoke, high-converting websites and scalable web applications. From corporate landing pages to complex e-commerce portals and SaaS platforms, we combine sleek UI/UX design with rock-solid full-stack architecture.',
    iconName: 'globe',
    features: [
      'Custom Responsive UI/UX Design (Mobile & Desktop)',
      'Modern Next.js / React / TypeScript Stack',
      'High-Speed Performance & Core Web Vitals Optimization',
      'SEO-Friendly Architecture & Meta Management',
      'Secure Payment Gateway & Backend API Integrations',
      'Admin Dashboards, CMS & Analytics Integration',
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'MongoDB / PostgreSQL'],
    deliverables: [
      'Production-ready, deployed web application',
      'Responsive design across all devices & screen sizes',
      'Complete source code & documentation',
      'Fast loading speed & SEO optimization',
    ],
    idealFor: [
      'Startups launching new products or MVPs',
      'Businesses wanting a modern, high-converting website',
      'E-commerce brands needing custom shopping experiences',
      'Organizations needing dedicated internal portals & dashboards',
    ],
    whatsappMessage: "Hi, I'm interested in your Web Development service. I'd like to discuss a website/web app project.",
  },
  {
    id: 'app-dev',
    badge: 'IOS & ANDROID',
    title: 'App Development',
    subtitle: 'Native and cross-platform mobile apps with seamless user experiences.',
    tagline: 'Native feel, fluid animations, and robust backend engineering for mobile.',
    description:
      'We build intuitive, robust, and scalable mobile applications for Android and iOS. Using industry-leading cross-platform and native technologies, we deliver fluid mobile experiences that keep your users engaged and your business growing.',
    iconName: 'smartphone',
    features: [
      'Cross-Platform iOS & Android Mobile Apps',
      'Sleek UI/UX with smooth micro-interactions & animations',
      'Real-time Push Notifications & Deep Linking',
      'Offline Storage & Cloud Database Synchronization',
      'Payment Gateway, Auth & Third-Party API Integrations',
      'Google Play Store & Apple App Store Deployment Support',
    ],
    technologies: ['Flutter', 'React Native', 'Kotlin / Swift', 'Firebase', 'REST & GraphQL APIs'],
    deliverables: [
      'Ready-to-publish Android APK / AAB & iOS build',
      'Modern, user-tested mobile application interface',
      'Cloud backend & secure authentication integration',
      'App store submission guidance and documentation',
    ],
    idealFor: [
      'Brands needing an iOS and Android mobile presence',
      'Startups building consumer or B2B mobile applications',
      'Businesses wanting to automate field operations or customer loyalty',
      'Creators and communities launching mobile experiences',
    ],
    whatsappMessage: "Hi, I'm interested in your App Development service. I'd like to build an iOS / Android mobile application.",
  },
  {
    id: 'whatsapp-bot',
    badge: 'AI & AUTOMATION',
    title: 'WhatsApp Auto Reply Bot',
    subtitle: '24/7 automated lead capture, instant replies & customer support on WhatsApp.',
    tagline: 'Automate inquiries, orders, and customer support with intelligent WhatsApp bots.',
    description:
      'Turn WhatsApp into an automated sales and support engine. We build custom WhatsApp Auto Reply Bots and automated workflows that instantly respond to customer inquiries, capture qualified leads, send order updates, and resolve questions 24/7.',
    iconName: 'message-circle',
    features: [
      '24/7 Instant Automated Replies & Smart Menus',
      'Custom Keyword Triggers & Interactive Chat Flows',
      'Automated Lead Qualification & Inquiry Collection',
      'Order Status Tracking & Notification Broadcasting',
      'WhatsApp Cloud API & Webhook CRM Integration',
      'Human Handover / Live Agent Notification System',
    ],
    technologies: ['WhatsApp Cloud API', 'Node.js / Python', 'OpenAI / Rule Engines', 'Webhooks', 'CRM Integrations'],
    deliverables: [
      'Configured and tested WhatsApp Auto-Reply Bot',
      'Custom conversational flow for your business needs',
      'Lead notifications to email / Google Sheets / CRM',
      'Step-by-step handover and testing support',
    ],
    idealFor: [
      'E-commerce & retail brands wanting instant customer response',
      'Service providers receiving high volumes of WhatsApp inquiries',
      'Businesses wanting automated order updates & lead qualification',
      'Marketing teams running WhatsApp broadcast & promotion campaigns',
    ],
    whatsappMessage: "Hi, I'm interested in your WhatsApp Auto Reply Bot service. I'd like to automate our WhatsApp inquiries and customer support.",
  },
]
