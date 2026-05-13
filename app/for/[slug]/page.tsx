import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SiteFooter } from "@/components/SiteFooter"

const SITE_URL = "https://meridiangtv.co.uk"

// ── Audience profiles ─────────────────────────────────────────────────────────
interface Audience {
  slug: string
  label: string                  // singular display ("Founder")
  plural: string                 // plural display ("Founders")
  h1: string
  intro: string                  // 2–3 sentence intro paragraph
  primaryKeyword: string         // appears in title + H1
  evidenceFocus: string[]        // 4–6 evidence types that matter most
  commonGaps: string[]           // 3–4 typical gaps for this audience
  category: string               // Talent vs Promise default
  extraKeywords: string[]
}

const AUDIENCES: Audience[] = [
  {
    slug: "founders",
    label: "Founder",
    plural: "Founders",
    primaryKeyword: "UK Global Talent Visa for Founders",
    h1: "UK Global Talent Visa for Founders",
    intro:
      "Founders make some of the strongest UK Global Talent Visa candidates — and some of the weakest applicants. The asymmetry comes from how founder evidence is presented, not what was built. Tech Nation's framework rewards independence of contribution and product-led impact, both of which founders have in abundance. Most founder rejections happen because the case reads like a startup pitch rather than an evidence portfolio.",
    evidenceFocus: [
      "Quantified product or company outcomes (revenue, ARR, MAU, fundraising rounds, exits)",
      "Independence of contribution — founding role, equity, decision authority",
      "External validation: investor letters, accelerator selections, press, awards",
      "Product-led innovation evidence — what the product solves and why it is non-obvious",
      "Sector influence beyond own company — speaking, advisory, ecosystem contribution",
      "Recognition from peer founders and operators in the digital technology sector",
    ],
    commonGaps: [
      "Pitch-deck language used in personal statement (vision-heavy, evidence-light)",
      "Recommendation letters from investors who describe the relationship instead of the founder's specific innovation",
      "Missing third-party validation when the company is early or in stealth",
      "Conflating company achievements with personal contributions evaluators can verify",
    ],
    category: "Most founders qualify under Exceptional Talent. Earlier-stage founders with strong trajectory may apply under Exceptional Promise.",
    extraKeywords: ["UK Global Talent Visa startup founders", "Tech Nation founder visa", "founder visa UK"],
  },
  {
    slug: "engineers",
    label: "Engineer",
    plural: "Engineers",
    primaryKeyword: "UK Global Talent Visa for Engineers",
    h1: "UK Global Talent Visa for Engineers",
    intro:
      "Engineers often have the strongest underlying credentials and the weakest applications. The work is technical, the impact is internal, and the evidence is locked inside private codebases. Tech Nation's framework rewards exceptional technical contribution — but only when it is presented as visible, externally-recognised, and independent. The strongest engineer applications translate technical work into sector-level impact.",
    evidenceFocus: [
      "Technical depth shown via open-source contribution, conference talks, or published work",
      "Architectural ownership — systems designed, not just built",
      "Quantified production impact (latency, throughput, cost, reliability)",
      "Recognition from senior engineers outside your direct reporting chain",
      "Patents, technical papers, or community-recognised technical contributions",
      "Independent contribution — side projects, open source maintainership, technical writing",
    ],
    commonGaps: [
      "Internal-only impact with no visible external footprint",
      "Recommendation letters from managers who describe collaboration rather than technical brilliance",
      "Personal statement that lists technologies instead of arguing innovation",
      "Confidentiality concerns blocking specific evidence — which can be navigated with structured anonymisation",
    ],
    category: "Senior engineers usually apply under Exceptional Talent. Earlier-career engineers with strong open-source or research signals may apply under Exceptional Promise.",
    extraKeywords: ["UK visa for software engineers", "Tech Nation engineer visa", "Global Talent Visa AI engineer"],
  },
  {
    slug: "product-managers",
    label: "Product Manager",
    plural: "Product Managers",
    primaryKeyword: "UK Global Talent Visa for Product Managers",
    h1: "UK Global Talent Visa for Product Managers",
    intro:
      "Product managers face a structural challenge with the Tech Nation framework. The role's value is cross-functional, integrative, and often invisible to people outside the team. The strongest PM applications reframe product leadership as innovation ownership — translating product decisions into measurable user, revenue, or market outcomes that meet the assessment criteria.",
    evidenceFocus: [
      "Quantified product outcomes — adoption, retention, revenue, engagement metrics tied to specific decisions",
      "Strategic ownership of product direction, not just feature delivery",
      "Cross-functional leadership of engineering, design, and go-to-market teams",
      "Recognition from senior product leaders outside the immediate company",
      "Public artefacts — talks, writing, podcasts, product launches with press coverage",
      "0-to-1 product launches or major strategic pivots driven by the applicant",
    ],
    commonGaps: [
      "Generic 'led product' language without specific decisions or outcomes attributed",
      "Recommendation letters from engineering managers who describe collaboration instead of product vision",
      "No external proof of product thinking — no writing, no talks, no public reflections",
      "Strong company brand carrying the application instead of the applicant's individual contribution",
    ],
    category: "Senior product leaders apply under Exceptional Talent. PMs with 5–8 years of strong trajectory may apply under Exceptional Promise.",
    extraKeywords: ["UK visa for product managers", "Tech Nation product visa", "Global Talent Visa product leader"],
  },
  {
    slug: "ai-researchers",
    label: "AI Researcher",
    plural: "AI Researchers",
    primaryKeyword: "UK Global Talent Visa for AI Researchers",
    h1: "UK Global Talent Visa for AI Researchers",
    intro:
      "AI researchers have one of the clearest paths through the UK Global Talent Visa — the framework is built to recognise exactly the kind of measurable, externally-validated contribution that AI research naturally produces. The challenge is selection and framing: which papers, citations, models, or applied contributions to foreground, and how to position research with industry impact alongside academic recognition.",
    evidenceFocus: [
      "Peer-reviewed publications with citation counts at top venues (NeurIPS, ICML, ICLR, ACL, CVPR)",
      "Open-source models, datasets, or tooling with significant adoption",
      "Industry impact — production AI systems shipped to scale, influence on a frontier lab or AI company",
      "Invited talks, panels, and workshop organisation at major AI conferences",
      "Recognition from senior researchers and lab leaders, not just co-authors",
      "Patents or applied research with commercial deployment",
    ],
    commonGaps: [
      "Citation counts undersold or poorly contextualised against field norms",
      "Pure-research applicants missing applied impact narrative — and vice versa",
      "Recommendation letters from PhD advisors that read as academic reference checks rather than peer endorsement of independent contribution",
      "No evidence of independence — work attributed to the lab or principal investigator",
    ],
    category: "Senior researchers apply under Exceptional Talent. PhD students and early postdocs with strong publications and trajectory apply under Exceptional Promise.",
    extraKeywords: ["UK Global Talent Visa AI", "Tech Nation AI researcher", "machine learning visa UK"],
  },
  {
    slug: "fintech-professionals",
    label: "Fintech Professional",
    plural: "Fintech Professionals",
    primaryKeyword: "UK Global Talent Visa for Fintech Professionals",
    h1: "UK Global Talent Visa for Fintech Professionals",
    intro:
      "Fintech is a Tech Nation focus sector, and the UK is the largest fintech ecosystem outside the US. The route is well-suited to fintech founders, senior operators, and specialist engineers — but the evidence requirements skew toward measurable scale, regulatory navigation, and cross-border impact. The strongest fintech cases translate sector experience into specific, externally-verifiable signals.",
    evidenceFocus: [
      "Customer or transaction scale (users, volume, ARR) with verifiable third-party sources",
      "Regulatory innovation or first-mover navigation in a complex jurisdiction",
      "Cross-border or emerging-market expansion led by the applicant",
      "Recognition from established fintech leaders, regulators, or institutional investors",
      "Public presence — writing, podcasts, conference speaking on fintech infrastructure",
      "Commercial outcomes — fundraising, revenue, partnerships with established financial institutions",
    ],
    commonGaps: [
      "Banking or finance background presented in financial-services language instead of fintech innovation language",
      "Strong company brand without clear individual contribution attribution",
      "Recommendation letters from corporate executives that describe seniority instead of innovation",
      "Missing UK or international ecosystem signals when the operator is based in an emerging market",
    ],
    category: "Senior fintech operators apply under Exceptional Talent. Earlier-stage operators with high-trajectory work may apply under Exceptional Promise.",
    extraKeywords: ["UK visa fintech founder", "Tech Nation fintech visa", "Global Talent Visa fintech operator"],
  },
  {
    slug: "data-scientists",
    label: "Data Scientist",
    plural: "Data Scientists",
    primaryKeyword: "UK Global Talent Visa for Data Scientists",
    h1: "UK Global Talent Visa for Data Scientists",
    intro:
      "Data scientists sit between research and engineering, which can confuse the Tech Nation evidence framework. The strongest data science applications choose a clear positioning — applied research, ML platform engineering, or business impact — and assemble evidence that matches. Tech Nation rewards demonstrable, externally-recognised contribution; it does not reward generic 'data science' role descriptions.",
    evidenceFocus: [
      "Production ML systems with quantified business impact (revenue lift, cost reduction, risk reduction)",
      "Published research, Kaggle achievements, or open-source ML contributions",
      "ML platform or infrastructure ownership at scale",
      "Recognition from senior data leaders and applied research leaders outside the immediate team",
      "Public artefacts — talks, blog posts, technical writing read by the data community",
      "Patents, publications, or applied research credited individually",
    ],
    commonGaps: [
      "Modelling work described in technical detail without business outcome attribution",
      "Recommendation letters from engineering or product managers instead of senior data leaders",
      "No external footprint — no Kaggle, no GitHub, no writing, no talks",
      "Confused positioning between research, applied ML, and analytics, weakening the criteria match",
    ],
    category: "Senior data leaders apply under Exceptional Talent. Mid-career data scientists with strong applied or research signals may apply under Exceptional Promise.",
    extraKeywords: ["UK visa data scientist", "Tech Nation data science visa", "Global Talent Visa machine learning"],
  },
  {
    slug: "startup-founders",
    label: "Startup Founder",
    plural: "Startup Founders",
    primaryKeyword: "UK Global Talent Visa for Startup Founders",
    h1: "UK Global Talent Visa for Startup Founders",
    intro:
      "Startup founders — especially at seed and Series A — have some of the most compelling raw evidence for the UK Global Talent Visa, and some of the hardest time presenting it. Early-stage work is fast, scrappy, and internal. Tech Nation's framework rewards independence of contribution, product-led innovation, and external validation — all of which startup founders have, but rarely document in assessment-ready form.",
    evidenceFocus: [
      "Founding role and equity stake — establishing independence of contribution from day one",
      "Product and company outcomes: revenue, ARR, user growth, fundraising rounds, key hires",
      "Investor letters and accelerator selections as third-party validation of your work",
      "Press coverage of the product or company that names the founder specifically",
      "Pitch deck evolution as evidence of product thinking and strategic decision-making",
      "Sector ecosystem signals — speaker slots, advisor roles, community presence",
    ],
    commonGaps: [
      "Applications written as startup pitches — vision-forward, evidence-light — rather than as personal credibility portfolios",
      "Recommendation letters from investors that describe the funding relationship instead of founder-specific innovation",
      "Missing evidence trail for early-stage companies where outcomes are nascent but trajectory is strong",
      "Conflating what the company achieved with what the founder personally designed and drove",
    ],
    category: "Startup founders with strong traction qualify under Exceptional Talent. Pre-seed and early-stage founders with high-signal trajectory often qualify under Exceptional Promise.",
    extraKeywords: ["UK Global Talent Visa startup founder", "Tech Nation founder visa", "early stage founder visa UK"],
  },
  {
    slug: "ctos",
    label: "CTO",
    plural: "CTOs",
    primaryKeyword: "UK Global Talent Visa for CTOs",
    h1: "UK Global Talent Visa for CTOs",
    intro:
      "CTOs occupy a uniquely strong position for the UK Global Talent Visa — they have architectural ownership, engineering leadership, and product influence simultaneously. The challenge is that CTO impact often registers as company outcomes rather than individual technical contribution. The strongest CTO applications disaggregate the company's technical trajectory from the decisions the CTO personally made.",
    evidenceFocus: [
      "Architectural decisions with quantified production impact — scale, reliability, speed shipped",
      "Engineering organisation built: team size, hiring philosophy, culture, retention outcomes",
      "Technical strategy documents, blog posts, or talks that shaped how the company or sector builds",
      "Recognition from senior engineers and operators outside the direct reporting chain",
      "Open-source contributions, conference keynotes, or community leadership in a specific technical domain",
      "Commercial outcomes tied to technical decisions — time-to-market, platform scalability enabling revenue",
    ],
    commonGaps: [
      "Recommendation letters from CEOs that describe business partnership rather than technical leadership",
      "Personal statement that reads as a company origin story instead of a technical credibility case",
      "Missing external footprint — no talks, no writing, no open-source — making the case hard to verify",
      "Conflating team output with CTO-specific architectural and leadership contribution",
    ],
    category: "CTOs at growth-stage and scaled companies apply under Exceptional Talent. Fractional or early-stage CTOs with strong technical trajectory may apply under Exceptional Promise.",
    extraKeywords: ["UK visa CTO", "Tech Nation CTO visa", "Global Talent Visa technical leader"],
  },
  {
    slug: "ai-ml-engineers",
    label: "AI / ML Engineer",
    plural: "AI / ML Engineers",
    primaryKeyword: "UK Global Talent Visa for AI and ML Engineers",
    h1: "UK Global Talent Visa for AI / ML Engineers",
    intro:
      "AI and ML engineers — those who build, train, deploy, and scale machine learning systems in production — sit at one of the highest-demand intersections of the Tech Nation framework. The route rewards demonstrable technical contribution with externally-visible impact. Unlike AI researchers, ML engineers need to show production systems that reached real users at scale, not just published work.",
    evidenceFocus: [
      "Production ML systems with measurable user or business impact (users served, accuracy at scale, latency improvements)",
      "Open-source ML tooling, model releases, or Hugging Face contributions with adoption metrics",
      "Technical writing, conference talks, or tutorials that the ML community recognises",
      "Architectural ownership of ML infrastructure — training pipelines, feature stores, model serving",
      "Cross-team influence — ML platform used by other teams, internal standards authored",
      "Recognition from senior ML engineers or applied research leads outside the direct team",
    ],
    commonGaps: [
      "Applications that list model architectures and frameworks without explaining impact on users or business",
      "Recommendation letters from product managers describing collaboration instead of technical depth",
      "Internal-only impact with no external proof — no GitHub, no papers, no talks, no open source",
      "Unclear distinction between research contribution and engineering contribution — different criteria apply",
    ],
    category: "Senior ML engineers with production systems apply under Exceptional Talent. Mid-career engineers with strong open-source or applied research signals may apply under Exceptional Promise.",
    extraKeywords: ["UK visa machine learning engineer", "Tech Nation AI engineer visa", "Global Talent Visa ML engineer"],
  },
  {
    slug: "data-engineers",
    label: "Data Engineer",
    plural: "Data Engineers",
    primaryKeyword: "UK Global Talent Visa for Data Engineers",
    h1: "UK Global Talent Visa for Data Engineers",
    intro:
      "Data engineers face one of the hardest positioning challenges for the UK Global Talent Visa: the work is foundational, high-impact, and almost entirely invisible. Pipelines don't have press coverage. Warehouses don't win awards. The strongest data engineering applications surface architectural decisions, production scale, and the downstream impact their infrastructure enabled — framed for evaluators who may not understand the technical domain.",
    evidenceFocus: [
      "Data platform ownership at scale — volume processed, latency, reliability, number of downstream consumers",
      "Architectural decisions: real-time vs batch, data modelling choices, infrastructure migrations",
      "Quantified business impact enabled by the data infrastructure (decisions made, revenue tracked, models trained)",
      "Open-source contributions to data tooling (dbt, Airflow, Spark, Kafka ecosystem) with adoption signals",
      "Recognition from senior data leaders, analytics engineers, and ML engineers who consumed the platform",
      "Technical writing or conference talks at data-focused events (dbt Coalesce, Spark Summit, etc.)",
    ],
    commonGaps: [
      "Applications that list tools and technologies without explaining architectural decisions or trade-offs made",
      "No external footprint — the entire career lived inside private company infrastructure",
      "Recommendation letters from product or business stakeholders who benefited but can't speak to technical depth",
      "Missing quantification of scale — data volume, pipeline reliability, query latency numbers absent",
    ],
    category: "Senior data platform engineers and architects apply under Exceptional Talent. Mid-career engineers with strong open-source signals or published work may apply under Exceptional Promise.",
    extraKeywords: ["UK visa data engineer", "Tech Nation data engineering visa", "Global Talent Visa data platform"],
  },
  {
    slug: "saas-founders",
    label: "SaaS Founder",
    plural: "SaaS Founders",
    primaryKeyword: "UK Global Talent Visa for SaaS Founders",
    h1: "UK Global Talent Visa for SaaS Founders",
    intro:
      "SaaS founders have a structural advantage with the Tech Nation framework: the business model generates the exact metrics assessors want to see. MRR, ARR, churn, NPS, NRR — these numbers translate directly to quantified product outcomes. The challenge is attributing those outcomes to the founder's personal contribution rather than to the company's brand, team, or market timing.",
    evidenceFocus: [
      "SaaS revenue metrics: MRR, ARR, net revenue retention, churn — with growth trajectory attributed to specific product decisions",
      "Customer outcomes: case studies, testimonials, and retention data showing product-market fit",
      "Product decisions — pricing model, ICP pivots, feature bets — with measurable downstream impact",
      "Investor letters and fundraising evidence that name the founder's specific product insight",
      "Press coverage, analyst reports, or G2/Capterra rankings naming the company and founder",
      "Ecosystem signals: conference appearances, advisory roles, community leadership in the SaaS sector",
    ],
    commonGaps: [
      "Revenue numbers presented without attribution to founder-specific decisions that drove them",
      "Applications that read like a SaaS pitch deck: TAM, ICP, and roadmap — but no individual evidence portfolio",
      "Recommendation letters from investors that describe the round rather than the founder's product insight",
      "Stealth or bootstrapped founders with strong metrics but no external validation trail",
    ],
    category: "SaaS founders with meaningful ARR and product traction typically apply under Exceptional Talent. Pre-revenue founders with strong trajectory evidence may apply under Exceptional Promise.",
    extraKeywords: ["UK Global Talent Visa SaaS founder", "Tech Nation SaaS visa", "B2B founder visa UK"],
  },
  {
    slug: "deep-tech-founders",
    label: "Deep Tech Founder",
    plural: "Deep Tech Founders",
    primaryKeyword: "UK Global Talent Visa for Deep Tech Founders",
    h1: "UK Global Talent Visa for Deep Tech Founders",
    intro:
      "Deep tech founders — building in semiconductors, quantum, robotics, photonics, or advanced materials — often have the strongest technical credentials and the least conventional evidence trail. The work is IP-heavy, long-horizon, and rarely covered by consumer press. The strongest deep tech applications translate research-grade technical contribution into sector-level innovation framing that Tech Nation's non-specialist assessors can evaluate.",
    evidenceFocus: [
      "Patents filed or granted, with clear attribution to the founder as inventor",
      "Peer-reviewed publications, conference papers, or technical reports with citation signals",
      "Fundraising from deep tech-specialist investors (Breakthrough Energy, Lux Capital, DCVC) as third-party validation",
      "Government grants, Innovate UK awards, or programme acceptances (Y Combinator, Entrepreneur First)",
      "Prototypes, pilots, or production deployments — even early-stage — that demonstrate technical feasibility",
      "Recognition from academic or industry leaders who can speak to the novelty of the technical approach",
    ],
    commonGaps: [
      "Technical papers cited without contextualising why the contribution is novel beyond the academic field",
      "Long R&D timelines with no external milestones, making progress hard to verify",
      "Recommendation letters from academics that read as PhD supervisor endorsements rather than peer validation of innovation",
      "Missing commercial traction narrative for companies that are pre-revenue by design",
    ],
    category: "Deep tech founders with IP, fundraising, or technical publication history typically apply under Exceptional Talent. PhD-founder spinouts with strong research records may apply under Exceptional Promise.",
    extraKeywords: ["UK Global Talent Visa deep tech", "Tech Nation deep tech founder visa", "UK visa hardware founder"],
  },
  {
    slug: "climate-tech-founders",
    label: "Climate Tech Founder",
    plural: "Climate Tech Founders",
    primaryKeyword: "UK Global Talent Visa for Climate Tech Founders",
    h1: "UK Global Talent Visa for Climate Tech Founders",
    intro:
      "Climate tech founders work at the intersection of technology innovation and one of the most externally-validated mission areas in the world — which creates both opportunity and a specific evidence challenge. The strongest climate tech applications separate the impact of the mission (carbon reduced, energy generated) from the technical contribution of the founder that made it possible.",
    evidenceFocus: [
      "Quantified environmental outcomes: carbon reduced or avoided, MWh generated, tonnes diverted — tied to founder decisions",
      "Technical innovation: what makes the product hard to replicate, not just impactful",
      "Climate-specific investor letters from funds (Breakthrough Energy, DCVC, Pale Blue Dot) validating technical approach",
      "Government or corporate partnerships, grants, or offtake agreements as third-party validation",
      "Press coverage in climate and technology media naming the founder's specific technical contribution",
      "Policy influence — participation in COP delegations, IPCC-adjacent advisory roles, standards bodies",
    ],
    commonGaps: [
      "Applications that lead with environmental mission rather than technical innovation — Tech Nation evaluates the latter",
      "Impact metrics attributed to the sector or the market tailwind rather than the founder's specific product",
      "Recommendation letters from climate advocates who describe the cause rather than the founder's technical work",
      "Pre-revenue companies with strong technical IP but no external validation of the approach",
    ],
    category: "Climate tech founders with deployed products or strong technical validation typically apply under Exceptional Talent. Earlier-stage climate founders with IP and fundraising signals may apply under Exceptional Promise.",
    extraKeywords: ["UK Global Talent Visa climate tech", "Tech Nation cleantech founder visa", "UK visa sustainability founder"],
  },
  {
    slug: "healthtech-founders",
    label: "Healthtech Founder",
    plural: "Healthtech Founders",
    primaryKeyword: "UK Global Talent Visa for Healthtech Founders",
    h1: "UK Global Talent Visa for Healthtech Founders",
    intro:
      "Healthtech founders navigate one of the most regulated and evidence-rich sectors for the UK Global Talent Visa. Clinical validation, regulatory approvals, and NHS or hospital partnerships generate exactly the kind of third-party validation Tech Nation's framework rewards. The challenge is framing these milestones as personal innovation evidence rather than company milestones.",
    evidenceFocus: [
      "Regulatory milestones: CE marking, FDA clearance, MHRA approval — attributed to the founder's technical design",
      "Clinical validation: trial data, peer-reviewed outcomes, NICE evaluations",
      "NHS, hospital, or insurance partnerships as institutional third-party validation",
      "Patient outcomes data: users served, clinical improvement metrics, safety records",
      "Healthcare investor letters (a16z Bio, Sofinnova, Earlybird Health) validating the technical approach",
      "Press coverage in healthcare and technology media with specific attribution to founder contribution",
    ],
    commonGaps: [
      "Regulatory approvals presented as company achievements without attributing the design decisions to the founder",
      "Clinical language used throughout — Tech Nation is a technology assessor, not a medical one; translation matters",
      "Long regulatory timelines with gaps in the evidence trail that look like periods of inactivity",
      "Recommendation letters from clinical advisors that validate efficacy rather than technical innovation",
    ],
    category: "Healthtech founders with regulatory milestones or deployed products typically apply under Exceptional Talent. Pre-clinical founders with strong IP and early validation may apply under Exceptional Promise.",
    extraKeywords: ["UK Global Talent Visa healthtech", "Tech Nation medtech founder visa", "UK visa digital health founder"],
  },
  {
    slug: "engineering-managers",
    label: "Engineering Manager",
    plural: "Engineering Managers",
    primaryKeyword: "UK Global Talent Visa for Engineering Managers",
    h1: "UK Global Talent Visa for Engineering Managers",
    intro:
      "Engineering managers have a harder Tech Nation application than individual contributors — the framework is designed to evaluate technical contribution, and management is defined by enabling others rather than doing the work yourself. The strongest engineering manager applications reframe the role as technical leadership: architectural influence, engineering culture designed, and systems built through people rather than by hand.",
    evidenceFocus: [
      "Engineering culture decisions: interview process designed, onboarding built, retention outcomes — with measurable team-level results",
      "Architectural influence: design documents authored, technical standards set, systems decisions owned (not just approved)",
      "Team scale and hiring track record: engineers hired, promoted, developed into senior roles",
      "Quantified delivery outcomes: deployment frequency, incident rate, time-to-production improvements tied to your management",
      "External recognition: engineering blog posts, conference talks on engineering culture or technical leadership",
      "Recommendation letters from senior engineers who can speak to the manager's technical depth and influence",
    ],
    commonGaps: [
      "Applications that describe management outputs (team grew, projects shipped) without the manager's specific technical and cultural contribution",
      "Recommendation letters from engineers who benefited from the management but can't articulate the innovation in approach",
      "Missing individual technical footprint — no writing, no talks, no open-source — making the case feel non-technical",
      "Strong delivery record presented without the decisions behind it: what was novel about how this team was built or run",
    ],
    category: "Engineering managers at Director level and above typically apply under Exceptional Talent. Mid-level managers with strong technical and cultural impact signals may apply under Exceptional Promise.",
    extraKeywords: ["UK visa engineering manager", "Tech Nation engineering leader visa", "Global Talent Visa director of engineering"],
  },
  {
    slug: "cybersecurity-engineers",
    label: "Cybersecurity Engineer",
    plural: "Cybersecurity Engineers",
    primaryKeyword: "UK Global Talent Visa for Cybersecurity Engineers",
    h1: "UK Global Talent Visa for Cybersecurity Engineers",
    intro:
      "Cybersecurity engineers have one of the most unusual evidence challenges: the most impressive work is often classified, undisclosed, or subject to responsible disclosure embargoes. The strongest cybersecurity applications build a case from public-facing contributions — CVEs published, talks given, tools released, competitions won — while using redacted internal work to establish context and scale.",
    evidenceFocus: [
      "CVEs discovered and responsibly disclosed, with attribution and CVSS score context",
      "Competitive recognition: DEF CON, Black Hat, Pwn2Own, CTF competition results",
      "Open-source security tooling with GitHub stars, forks, or community adoption metrics",
      "Conference talks at Black Hat, DEF CON, Usenix Security, or CCS with audience reach",
      "Bug bounty earnings and hall-of-fame listings from major programmes (Google, Microsoft, HackerOne)",
      "Security research published in academic venues or reputable practitioner blogs",
    ],
    commonGaps: [
      "Classified or NDA-restricted work with no public-facing evidence trail — requires creative anonymisation strategy",
      "Bug bounty and CTF participation presented without contextualising the significance of the findings",
      "Recommendation letters from employers describing the security team rather than the individual's novel contribution",
      "Offensive security work that cannot be discussed without legal risk — framing and redaction strategy essential",
    ],
    category: "Senior security researchers and red team leads typically apply under Exceptional Talent. Mid-career engineers with strong public research or competition records may apply under Exceptional Promise.",
    extraKeywords: ["UK visa cybersecurity engineer", "Tech Nation security visa", "Global Talent Visa information security"],
  },
  {
    slug: "startup-operators",
    label: "Startup Operator",
    plural: "Startup Operators",
    primaryKeyword: "UK Global Talent Visa for Startup Operators",
    h1: "UK Global Talent Visa for Startup Operators",
    intro:
      "Startup operators — COOs, Heads of Growth, VP Operations, and General Managers at high-growth technology companies — sit in one of the most ambiguous positions for the Tech Nation framework. The route is designed for digital technology, not for operators. The strongest startup operator applications reframe operational work as product and technology innovation: systems built, platforms scaled, and data-driven decisions that changed the trajectory of the company.",
    evidenceFocus: [
      "Operational systems designed and deployed: growth loops, hiring pipelines, financial infrastructure at scale",
      "Technology decisions owned: tools selected and implemented, data infrastructure, automation investments",
      "Quantified scaling outcomes: headcount growth, geographic expansion, revenue per employee trajectory",
      "Recognition from founders and senior investors who can speak to the operator's specific strategic contribution",
      "External presence: writing on operations, talks at operator events, community leadership (OnDeck, Lenny's, etc.)",
      "Evidence of innovation in operational approach — not just execution, but novel systems design",
    ],
    commonGaps: [
      "Applications that position the role as execution rather than innovation — Tech Nation needs the systems thinking, not just the results",
      "Recommendation letters from founders that describe reliability and trust rather than specific innovative contributions",
      "Weak external footprint — operators rarely speak publicly, which creates an evidence gap relative to builders",
      "Missing technology attribution — operators must show their work touched and improved the technology itself, not just ran around it",
    ],
    category: "Senior operators at scaled technology companies (Series B+) apply under Exceptional Talent. Earlier-stage operators with strong trajectory and external signals may apply under Exceptional Promise.",
    extraKeywords: ["UK visa startup operator", "Tech Nation COO visa", "Global Talent Visa head of growth"],
  },
  {
    slug: "angel-investors",
    label: "Angel Investor",
    plural: "Angel Investors",
    primaryKeyword: "UK Global Talent Visa for Angel Investors",
    h1: "UK Global Talent Visa for Angel Investors",
    intro:
      "Angel investors face the most unusual positioning for the UK Global Talent Visa: the route is designed to evaluate exceptional work in digital technology, not capital deployment. The strongest angel investor applications lead with the professional career that created the capital — and use the investment portfolio as supplementary evidence of ecosystem contribution and sector influence, not as the primary case.",
    evidenceFocus: [
      "Operational career as founder, engineer, or product leader — the professional work that preceded or runs alongside investing",
      "Portfolio companies with named outcomes: exits, Series A+ rounds, or significant user traction",
      "Advisory contribution to portfolio companies: specific technical or strategic input beyond writing the cheque",
      "Ecosystem presence: AngelList syndicate, writing on early-stage investing, community events",
      "Recognition from founders and co-investors who can speak to the depth of contribution, not just capital",
      "Board seat responsibilities and documented governance contribution at portfolio companies",
    ],
    commonGaps: [
      "Applications that lead with investment returns rather than the professional expertise that makes the investor valuable",
      "Portfolio metrics (IRR, MOIC) presented without connecting them to specific value-add contributions",
      "Recommendation letters from portfolio founders describing gratitude rather than specific technical or strategic contribution",
      "No underlying professional career evidence — investing alone, without an operational foundation, rarely meets the framework criteria",
    ],
    category: "Angel investors who are also active founders, operators, or engineers typically apply under Exceptional Talent. Earlier-career angels with a strong professional record and emerging portfolio may apply under Exceptional Promise.",
    extraKeywords: ["UK visa angel investor", "Tech Nation investor visa", "Global Talent Visa founder investor"],
  },
  {
    slug: "open-source-contributors",
    label: "Open Source Contributor",
    plural: "Open Source Contributors",
    primaryKeyword: "UK Global Talent Visa for Open Source Contributors",
    h1: "UK Global Talent Visa for Open Source Contributors",
    intro:
      "Open source contributors have one of the clearest evidence trails for the UK Global Talent Visa — all the work is public, all the contribution history is attributable, and the global reach of widely-adopted projects provides exactly the kind of sector-level influence Tech Nation's framework rewards. The challenge is translating GitHub metrics and community presence into the structured evidence portfolio the assessment requires.",
    evidenceFocus: [
      "Project adoption: GitHub stars, forks, npm/pip/crates.io download counts, dependent repositories",
      "Individual contribution record: commits, PRs merged, issues resolved — with evidence of architectural ownership not just bug fixes",
      "Maintainership and governance: decision-making authority over the project, RFC authorship, contributor onboarding",
      "Community recognition: core team membership, committer status, CNCF or Apache Foundation involvement",
      "Conference talks at relevant technical events (KubeCon, PyCon, RustConf, Node+JS Interactive) with reach",
      "Downstream impact: companies or products that depend on the project, with named examples",
    ],
    commonGaps: [
      "GitHub activity presented as raw metrics without contextualising the significance of the contributions relative to the project",
      "Contributor status without architectural ownership — many PRs merged still reads as execution, not innovation",
      "No recommendation letters from project maintainers or core team members who can speak to contribution significance",
      "Personal statement that lists technologies rather than arguing that the contributor's specific decisions shaped the project's direction",
    ],
    category: "Core maintainers and creators of widely-adopted open source projects typically apply under Exceptional Talent. Active contributors with strong adoption signals and trajectory may apply under Exceptional Promise.",
    extraKeywords: ["UK visa open source developer", "Tech Nation open source visa", "Global Talent Visa developer community"],
  },
]

// ── Static params + metadata ──────────────────────────────────────────────────
export function generateStaticParams() {
  return AUDIENCES.map((a) => ({ slug: a.slug }))
}

function getAudience(slug: string): Audience | null {
  return AUDIENCES.find((a) => a.slug === slug) ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const audience = getAudience(slug)
  if (!audience) return {}

  return {
    title: `${audience.primaryKeyword} — Meridian Advisory`,
    description: `Strategic UK Global Talent Visa advisory for ${audience.plural.toLowerCase()}. Evidence architecture, narrative engineering, and recommendation strategy specific to ${audience.plural.toLowerCase()} — by Amit Tyagi, Exceptional Talent visa holder.`,
    keywords: [
      audience.primaryKeyword,
      ...audience.extraKeywords,
      "UK Global Talent Visa",
      "Tech Nation visa",
      "Exceptional Talent visa",
      "Meridian Advisory",
    ],
    openGraph: {
      title: `${audience.primaryKeyword} — Meridian`,
      description: `UK Global Talent Visa advisory for ${audience.plural.toLowerCase()} — evidence architecture, narrative engineering, and recommendation strategy from Amit Tyagi.`,
      type: "article",
      url: `${SITE_URL}/for/${audience.slug}`,
      siteName: "Meridian Global Talent Visa",
    },
    alternates: { canonical: `${SITE_URL}/for/${audience.slug}` },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AudiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const audience = getAudience(slug)
  if (!audience) notFound()

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Knowledge Hub", item: `${SITE_URL}/knowledge` },
      { "@type": "ListItem", position: 3, name: audience.primaryKeyword, item: `${SITE_URL}/for/${audience.slug}` },
    ],
  }

  const faqs = [
    {
      q: `Can ${audience.plural.toLowerCase()} apply for the UK Global Talent Visa?`,
      a: `Yes. ${audience.plural} are explicitly recognised by Tech Nation as eligible under the digital technology route. ${audience.category}`,
    },
    {
      q: `What is the strongest evidence for ${audience.plural.toLowerCase()}?`,
      a: `For ${audience.plural.toLowerCase()}, the strongest evidence usually includes: ${audience.evidenceFocus.slice(0, 3).join("; ").toLowerCase()}.`,
    },
    {
      q: `What is the most common reason ${audience.plural.toLowerCase()} get rejected?`,
      a: `${audience.commonGaps[0]}. Most rejections come from how the case is framed — not from the underlying credentials.`,
    },
  ]

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-void">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Header */}
      <div className="border-b border-void-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-base text-gradient-brand leading-none">Meridian</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">Global Talent Visa</span>
          </Link>
          <Link href="/scorecard" className="btn-primary text-xs text-white px-4 py-2 rounded-lg font-medium">
            Free assessment →
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-14">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">For {audience.plural}</p>
          <h1 className="font-display text-4xl md:text-5xl text-platinum mb-5 leading-tight">{audience.h1}</h1>
          <p className="text-platinum-dim text-lg leading-relaxed">{audience.intro}</p>
        </header>

        {/* Category guidance */}
        <section className="card-border p-7 mb-12" aria-label="Category guidance">
          <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">Talent vs Promise</p>
          <p className="text-platinum-dim leading-relaxed">{audience.category}</p>
        </section>

        {/* Evidence focus */}
        <section className="mb-14" aria-label="Strongest evidence">
          <h2 className="font-display text-3xl text-platinum mb-3 leading-tight">
            What evidence matters most for {audience.plural.toLowerCase()}
          </h2>
          <p className="text-platinum-dim mb-6 leading-relaxed">
            The Tech Nation framework applies universally — but the evidence that lands strongest looks different
            for each profession. For {audience.plural.toLowerCase()}, the strongest signals are:
          </p>
          <ul className="space-y-3">
            {audience.evidenceFocus.map((e) => (
              <li key={e} className="card-border p-5 flex gap-4 text-sm text-platinum-dim leading-relaxed">
                <span className="text-brand flex-shrink-0 mt-0.5">✦</span>
                {e}
              </li>
            ))}
          </ul>
        </section>

        {/* Common gaps */}
        <section className="mb-14" aria-label="Common gaps">
          <h2 className="font-display text-3xl text-platinum mb-3 leading-tight">
            Where {audience.plural.toLowerCase()} typically lose the case
          </h2>
          <p className="text-platinum-dim mb-6 leading-relaxed">
            These are the patterns that cause strong {audience.plural.toLowerCase()} to receive rejections — usually
            structural, not credentials-based.
          </p>
          <ul className="space-y-3">
            {audience.commonGaps.map((g) => (
              <li key={g} className="card-border p-5 flex gap-4 text-sm text-platinum-dim leading-relaxed">
                <span className="text-[#EF4444] flex-shrink-0 mt-0.5">✕</span>
                {g}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-14" aria-label="FAQ">
          <h2 className="font-display text-3xl text-platinum mb-6 leading-tight">Common questions</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="card-border p-6 group">
                <summary className="font-display text-base text-platinum cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>{f.q}</span>
                  <span className="text-brand text-2xl flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 pt-4 border-t border-void-border text-platinum-dim text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section className="mb-14" aria-label="Related">
          <h2 className="font-display text-2xl text-platinum mb-6 leading-tight">Related</h2>
          <div className="space-y-2">
            <Link href="/knowledge"
              className="card-border p-5 group hover:shadow-md transition-all flex items-center justify-between gap-4 block">
              <span className="text-platinum">UK Global Talent Visa knowledge hub — full guide</span>
              <span className="text-brand group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/methodology"
              className="card-border p-5 group hover:shadow-md transition-all flex items-center justify-between gap-4 block">
              <span className="text-platinum">How Meridian builds cases — methodology</span>
              <span className="text-brand group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/blog"
              className="card-border p-5 group hover:shadow-md transition-all flex items-center justify-between gap-4 block">
              <span className="text-platinum">Strategy blog — evidence, narrative, and recommendation deep dives</span>
              <span className="text-brand group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="card-border p-10 text-center">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-3">Where do you stand?</p>
          <h2 className="font-display text-2xl text-platinum mb-4">Take the free 4-minute readiness assessment.</h2>
          <p className="text-platinum-dim mb-7 max-w-md mx-auto text-sm leading-relaxed">
            12 questions. Scored breakdown across the four credibility dimensions. Built for {audience.plural.toLowerCase()}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/scorecard"
              className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-white font-semibold text-sm">
              Check my readiness — free →
            </Link>
            <Link href="/apply"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-platinum">
              Apply to work with Amit
            </Link>
          </div>
        </section>
      </article>
      <SiteFooter />
    </div>
  )
}
