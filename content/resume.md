---
title: Resume
section: resume
banner: images/resume.jpg
---

# Tiago Oliveira

**Principal Engineer & Architect | AI Platforms at Carrier Scale**

[tiago@tiago.sh](mailto:tiago@tiago.sh) · [LinkedIn](https://www.linkedin.com/in/tiagode) · [tiago.sh](https://tiago.sh) · Greater Seattle Area

---

## Summary

Principal Engineer and Architect building real-time AI platforms at carrier scale. Architected a network-integrated AI platform for a top-three US operator: sub-100ms latency, millions of subscribers, foundation of an $800M+ strategic partnership. Now technical lead for the hands-on build, driving a 20-engineer core team within a ~120-person cross-functional initiative spanning verticals and domains. 12+ patents filed across computer vision, video intelligence, and multimodal systems. Prior platform work at Mercedes-Benz (event sourcing), PayU (serverless payments across 14 markets), OSRAM (zero-trust IoT). Before software, 19 years rebuilding diesel engines in my father's truck shop. Every distributed system is another machine with predictable failure modes.

---

## Skills

**Languages & Systems:** Rust, Go, Python, C, TypeScript, Erlang, Java; distributed systems, event sourcing, event-driven architecture, zero-trust, OAuth 2.0, OpenID Connect, mutual TLS, HSM, Domain-Driven Design, TLA+

**AI & Cloud:** OpenAI Realtime API, Amazon Nova Sonic, Gemini Live, Bedrock AgentCore, agentic systems, multi-tenant AI isolation, RAG, MCP, LLM inference optimization, RLHF; AWS (EKS, Lambda, Fargate, Outposts, MEC, IAM, SigV4, ABAC, Direct Connect), Kubernetes, serverless, cell-based architecture, multi-region HA, Firecracker microVMs

**Telecom & Observability:** SIP, RTP, B2BUA, G.711, STIR/SHAKEN, IMS AKA, GStreamer, WebRTC, WebSocket streaming; OpenTelemetry, SLO design, p50/p95/p99 analysis, privacy-preserving evaluation frameworks

---

## Experience

### Principal Solutions Architect | Generative AI Platforms
**Amazon Web Services (AWS)** · *October 2024 – Present · Seattle, WA*

*Architecting real-time AI platforms at carrier scale for major telecommunications operators*

- Built an overnight prototype that became the world's first network-integrated real-time AI platform for a top-three US carrier, announced at their investor event and now in beta serving millions of subscribers. Streaming architecture: bidirectional audio over SIP/RTP, dual-channel inference, custom B2BUA across 4 AWS regions. All with zero prior telecom experience, learned from first principles.

- Drove the strategic pivot from point solution to platform, unlocking AI agents, virtual assistants, and dozens of agentic workloads. Foundation of an $800M+ strategic partnership projected to become the largest customer for multiple flagship AWS AI services.

- Fully embedded in the customer's engineering organization; personal involvement made a contractual condition. Authored the open-source GStreamer plugin (C, libsoup-3.0) that became the carrier's core audio transport layer. Pioneered voice ducking and barge-in handling that turned translated calls from robotic turn-taking into natural conversation.

- Solo-built a multi-tenant AI agent platform (voice-over-WebSocket, multi-model inference across Nova Sonic, OpenAI Realtime, and Gemini Live, custom SIP UA, cell-based HA, MCP gateway). Designed full-silo tenant isolation on serverless managed services and published internal research on cross-tenant retrieval attacks, memory contamination, and credential leakage that application-level controls cannot address. Added utterance-level latency observability (OpenTelemetry) and a privacy-preserving translation quality evaluation framework (Go, patent pending).

### Senior Product Architect | Computer Vision & AI
**Amazon Web Services (AWS)** · *October 2021 – October 2024 · Austin, TX*

*Built AI platform reducing investigation time by 35% for major security companies*

- Built video intelligence platform reducing security investigation time 35%. Architected edge-to-cloud continuum (MEC/Outposts for near-edge, TFLite for embedded edge). 40% reduction in false-positive dispatches through intelligent multi-stream correlation and GenAI-powered summarization.

- Pioneered CVOps framework (Computer Vision Operations) that became the team's foundation. Personally coded initial Python/Rust implementation to prove the pattern, then established CI/CD and shared libraries enabling the team to scale independently. System handled millions of cameras with sub-millisecond inference. 12+ patents filed covering model monitoring, cryptographic video signing, multi-modal scene understanding, and device optimization.

- Achieved sub-100ms latency at 5,000+ predictions/second. Lambda control plane with auto-scaling Fargate data plane. Architecture handled seamless scaling from POC to production video processing workloads.

### Senior Solutions Architect | Industry 4.0 & Edge AI
**Amazon Web Services (AWS)** · *May 2020 – October 2021 · Stuttgart, Germany*

*Transformed manufacturing with edge-to-cloud AI achieving 99.99% reliability*

- Solved the "cloud latency kills production lines" problem. Manufacturing control systems needed millisecond response times. Architected edge computing framework keeping critical decisions local while maintaining cloud connectivity for analytics. 99.99% reliability, 35% reduction in unplanned downtime.

- Built IoT fleet management for 10,000+ heterogeneous industrial endpoints. The challenge was enabling modern AI/ML on decades-old legacy machinery that couldn't be replaced. Created abstraction layer bridging legacy equipment with cloud intelligence.

- Reduced robot safety incidents through simulation, not sensors. Built ROS-based system learning from human patterns and generating collision-free routes automatically. 33% reduction in space invasion, 21% fewer safety stops.

### Principal Software Engineer | Platform Architecture
**Mercedes-Benz.io** · *September 2018 – May 2020 · Stuttgart, Germany*

*Built the technical foundation for Mercedes-Benz's global digital transformation*

- Solved the "every department needs a different view of the vehicle" problem through event sourcing. Architected event-sourcing platform (Lambda, containers, S3, DynamoDB, EventBridge, ElastiCache) creating unified vehicle state across all lifecycle stages. Any department could materialize their own view from the same event stream with query flexibility. 60+ systems integrated, 47% cost reduction by eliminating manual integration and view maintenance. Deployment velocity from months to days.

- Pioneered Hypothesis-Driven Development for ML. Built production-grade MVPs to validate before scaling full pipelines. High-performance pricing engine processing 1,000+ evaluations/second on decades of sales data proved the pattern works under real load.

### Senior Staff Software Engineer | FinTech & IoT Security
**PayU · OSRAM** · *May 2017 – September 2018 · Berlin, Germany*

- Consolidated 14 markets' payment reconciliation into single serverless platform. Normalized disparate formats from banks, merchants, and acquirers across markets into a common model. 60% cost reduction from consolidation and elastic scaling. Built ML-based fraud detection with autonomous weekly retraining handling millions of daily transactions.

- Architected zero-trust IoT security for smart lighting infrastructure. Built custom OAuth 2.0 and OpenID Connect extensions for fine-grained device permissions with HSM-backed cryptography.

### Senior Software Architect | AgTech IoT
**e-Core** · *February 2016 – May 2017 · Porto Alegre, Brazil*

*Military-grade IoT platform for agricultural machinery*

- Built near-realtime auth platform without sacrificing security. Implemented custom nonce calculation on mutual TLS using Erlang and RabbitMQ, contributed plugin back to RabbitMQ project. Built air-gapped firmware signing process using Yubikey hardware API for supply chain integrity. 30% infrastructure cost reduction through protocol optimization.

- Orchestrated autonomous machine-to-machine coordination. Harvesters and grain carts communicating directly for autonomous operation (approach, align, transfer, signal, separate). Built MQTT-based handshake mechanism with sub-meter GPS accuracy.

### Early Career Foundation | 1994 – 2016 · Brazil

- **Zenvia Mobile, Principal Software Engineer** (2014 – 2016). Pioneered Docker pre-1.0 containerization (2014) for unpredictable SMS traffic spikes; built the L1/L2/L3 incident framework still in operational use today.

- **Dell Technologies, Senior Software Engineer** (2013 – 2014). Pioneered SPA architecture at Dell with Java Nashorn server-side components, years before React SSR. First recipient of Dell's Application Development Quality Gold Award.

- **Nokia Siemens Networks, Software Engineer** (2013). Built SLA maintenance matrix for global cellphone sites using graph theory, adjacency maps, and finite state machines; 3GPP and ETSI compliant.

- **NewFocus, ERP Consultant** (2013). Built bespoke ERP modules across industries; my favorite project was a PIC-controller hack that streamed readings from a semi-analog truck weighing scale straight into the ERP in real time.

- **Incrosolda Serviços e Mecânica, Truck Mechanic & Machine Builder** (1994 – 2013). 19 years maintaining diesel engines, hydraulics, and pneumatic systems starting at age 8 in my father's truck shop. Fabricated parts from scratch when none existed. Built machines and digital controllers bridging mechanical, hydraulic, and pneumatic systems for industrial automation.

---

## Education & Recognition

- **Bachelor of Technology, Information Technology**, Universidade do Oeste de Santa Catarina (2004 – 2007)
- **Mechanical Engineering**, Unochapecó (2011 – 2013)
- **Post-Graduate Specialization, Java Software Development**, Universidade do Oeste de Santa Catarina (2006 – 2007)
- **12+ Patents Filed** covering computer vision model monitoring, cryptographic video signing, multi-modal scene understanding, device optimization, smart storage, and privacy-preserving translation quality evaluation
- **AWS AllStar Award**, Customer Obsession
- **AWS Certifications:** Certified AI Practitioner, Well-Architected Proficient, Certified Solutions Architect – Associate
- **Languages:** English (Native-level), Portuguese (Native), Spanish (Professional), German (Conversational), Italian (Basic)
- **Mentorship:** Led hundreds of technical advisors. Promoted 25+ engineers across multiple seniority levels through hands-on mentorship.
