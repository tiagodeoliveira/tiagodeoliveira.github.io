# Tiago Oliveira

**Principal Engineer & Architect | AI Platforms at Carrier Scale**

[tiago@tiago.sh](mailto:tiago@tiago.sh) | [LinkedIn](https://www.linkedin.com/in/tiagode) | [tiago.sh](https://tiago.sh) | Greater Seattle Area

---

## What I Do

I build the systems that turn ambitious technical bets into production platforms. The pattern is consistent: walk into an ambiguous, high-stakes problem, prototype something that changes the conversation, then architect it for scale and operational excellence.

My current work is real-time AI embedded directly into telecommunications networks, serving tens of millions of subscribers with sub-second latency requirements. The platforms I build don't just solve today's problem; they're designed so product teams can ship new AI capabilities independently without platform rewrites.

I spent 19 years rebuilding truck transmissions before writing my first line of code. That's not a fun fact, it's the foundation. Every distributed system is just another machine with predictable failure modes. Whether diagnosing why a diesel engine fails under load or why a distributed system fails under load, the mental model is the same.

I learn new technologies fast and ship production systems in weeks. I've built at carrier scale across cloud providers, from serverless to Kubernetes to bare metal. The technology stack is the easy part. The hard part is knowing which problem actually needs solving.

---

## Experience

### Principal Solutions Architect | Generative AI Platforms
**Amazon Web Services (AWS)** | *October 2024 - Present | Seattle, WA*

*Architecting real-time AI platforms at carrier scale for major telecommunications operators*

→ Built an overnight prototype that displaced an incumbent multi-year engagement. What started as a proof of concept became the foundation for the world's first network-integrated real-time AI platform, announced at the carrier's investor event and now in beta serving millions of subscribers.

→ Drove the strategic pivot from point solution to platform. Fought for and won the architectural framing that positions real-time AI as a network capability, not a standalone feature. This platform approach directly enabled expansion into AI agents, virtual assistants, and dozens of additional agentic workloads. Single-handedly closed a multi-million dollar professional services contract to build the next wave, establishing the foundation for an $800M+ strategic partnership projected to become the largest customer for multiple flagship AWS AI services.

→ Fully embedded in the customer's engineering organization, not treated as a vendor. Perform code reviews, push code, and mentor engineers across all levels. Customer senior leadership made my personal involvement a contractual condition, with directors and senior directors putting their own career reputations behind the project. Hands-on across the full stack: designed dual-channel inference architecture (independent streams per speaker) that outperformed all prior approaches, and pioneered voice ducking techniques that transformed translated calls from robotic turn-taking into natural conversation.

→ Designed comprehensive tenant isolation architecture for multi-tenant AI agent platforms using full-silo isolation on serverless managed services. Published internal research demonstrating why shared infrastructure for AI agents creates structural vulnerabilities (cross-tenant retrieval attacks, memory contamination, credential leakage) that application-level isolation cannot address. Built utterance-level latency observability exported to OpenTelemetry for p50/p95/p99 analysis and a privacy-preserving evaluation framework for translation quality (Go, patent filing in progress).

→ All of this with zero prior telecommunications experience. Learned SIP/RTP, network hairpinning, carrier-grade reliability patterns, and regulatory requirements from first principles, then became the person carrier engineers seek out for guidance.

### Senior Product Architect | Computer Vision & AI
**Amazon Web Services (AWS)** | *October 2021 - October 2024 | Austin, TX*

*Built AI platform reducing investigation time by 35% for major security companies*

→ Built video intelligence platform reducing security investigation time 35%. Architected edge-to-cloud continuum (MEC/Outposts for near-edge, TFLite for embedded edge). 40% reduction in false-positive dispatches through intelligent multi-stream correlation and GenAI-powered summarization.

→ Pioneered CVOps framework (Computer Vision Operations) that became the team's foundation. Personally coded initial Python/Rust implementation to prove the pattern, then established CI/CD and shared libraries enabling the team to scale independently. System handled millions of cameras with sub-millisecond inference. 12+ patents filed covering model monitoring, cryptographic video signing, multi-modal scene understanding, and device optimization.

→ Achieved sub-100ms latency at 5,000+ predictions/second. Lambda control plane with auto-scaling Fargate data plane. Architecture handled seamless scaling from POC to production video processing workloads.

### Senior Solutions Architect | Industry 4.0 & Edge AI
**Amazon Web Services (AWS)** | *May 2020 - October 2021 | Stuttgart, Germany*

*Transformed manufacturing with edge-to-cloud AI achieving 99.99% reliability*

→ Solved the "cloud latency kills production lines" problem. Manufacturing control systems needed millisecond response times. Architected edge computing framework keeping critical decisions local while maintaining cloud connectivity for analytics. 99.99% reliability, 35% reduction in unplanned downtime.

→ Built IoT fleet management for 10,000+ heterogeneous industrial endpoints. The challenge was enabling modern AI/ML on decades-old legacy machinery that couldn't be replaced. Created abstraction layer bridging legacy equipment with cloud intelligence.

→ Reduced robot safety incidents through simulation, not sensors. Built ROS-based system learning from human patterns and generating collision-free routes automatically. 33% reduction in space invasion, 21% fewer safety stops.

### Principal Software Engineer | Platform Architecture
**Mercedes-Benz.io** | *September 2018 - May 2020 | Stuttgart, Germany*

*Built the technical foundation for Mercedes-Benz's global digital transformation*

→ Solved the "every department needs a different view of the vehicle" problem through event sourcing. Architected event-sourcing platform creating unified vehicle state across all lifecycle stages. 60+ systems integrated, 47% cost reduction by eliminating manual integration. Deployment velocity from months to days.

→ Pioneered Hypothesis-Driven Development for ML. Built production-grade MVPs to validate before scaling full pipelines. High-performance pricing engine processing 1,000+ evaluations/second on decades of sales data proved the pattern works under real load.

### Senior Staff Software Engineer | FinTech & IoT Security
**PayU · OSRAM** | *May 2017 - September 2018 | Berlin, Germany*

→ Consolidated 14 markets' payment reconciliation into single serverless platform. Normalized disparate formats from banks, merchants, and acquirers across markets into a common model. 60% cost reduction from consolidation and elastic scaling. Built ML-based fraud detection with autonomous weekly retraining handling millions of daily transactions.

→ Architected zero-trust IoT security for smart lighting infrastructure. Built custom OAuth 2.0/OpenID Connect extensions for fine-grained device permissions with HSM-backed cryptography.

### Senior Software Architect | AgTech IoT
**e-Core** | *February 2016 - May 2017 | Porto Alegre, Brazil*

*Military-grade IoT platform for agricultural machinery*

→ Built near-realtime auth platform without sacrificing security. Implemented custom nonce calculation on mutual TLS using Erlang and RabbitMQ, contributed plugin back to RabbitMQ project. Built air-gapped firmware signing process using Yubikey hardware API for supply chain integrity.

→ Orchestrated autonomous machine-to-machine coordination. Harvesters and grain carts communicating directly for autonomous operation (approach, align, transfer, signal, separate). Built MQTT-based handshake mechanism with sub-meter GPS accuracy.

### Early Career Foundation
**Incrosolda Serviços e Mecânica · NewFocus · Nokia Siemens · Zenvia Mobile · Dell Technologies** | *1994 - 2016*

→ 19 years as truck mechanic starting at age 8, maintaining diesel engines, hydraulics, pneumatic systems, and fabricating parts from scratch when none existed. Built digital controllers interfacing with mechanical, hydraulic, and pneumatic systems for industrial automation.

→ Pioneered early containerization (Docker pre-1.0, 2014) for handling unpredictable traffic spikes serving millions of users. Built server-side JavaScript rendering years before React SSR existed. Created incident management frameworks still in operational use today.

→ Built ERP integrations connecting physical operations to digital systems: PDAs tracking truck departures, weighing systems feeding load data, factory floor operations flowing into business systems.

---

## Education & Recognition

→ **Bachelor of Technology, Information Technology** | Universidade do Oeste de Santa Catarina

→ **Post-Graduate Specialization, Software Development with Java** | Universidade do Oeste de Santa Catarina

→ **12+ Patents Filed** | Computer vision model monitoring, cryptographic video signing, multi-modal scene understanding, device optimization, smart storage

→ **AWS AllStar Award** | Customer Obsession

→ **Languages:** English (Native-level), Portuguese (Native), Spanish (Professional), German (Conversational), Italian (Basic)

→ **Led hundreds of technical advisors.** Promoted 25+ engineers across multiple seniority levels through hands-on mentorship.
