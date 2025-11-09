# Tiago Oliveira

**Principal Engineer | Principal Architect | AI & Cloud Engineering Leader**

[tiago@tiago.sh](mailto:tiago@tiago.sh) | [LinkedIn](https://www.linkedin.com/in/tiagode) | [tiago.sh](https://tiago.sh) | Greater Seattle Area

---

## What I Do

I solve the architectural problems that keep organizations from scaling. Not theoretical problems—the ones where teams are stuck, leadership is worried, and the wrong choice costs millions or 6 months.

My pattern: Understand the constraint that matters most → Frame the tradeoffs clearly → Build proof that changes the conversation → Design for 10x the load → Enable teams to execute without me becoming the bottleneck.

Currently architecting telecom-native GenAI platforms serving tens of millions of concurrent users. Multi-modal systems (text/voice/image) where the real challenge isn't today's scale—it's building systems that evolve daily without platform rewrites. When major carriers need AI at network scale, the question is: "how do we build it so it doesn't become legacy in 6 months."

I spent 19 years rebuilding truck transmissions before writing my first line of code. That's why I understand complex systems from first principles—every distributed system is just another machine with predictable failure modes you can debug and prevent.

I learn new technologies fast — languages, frameworks, entire ecosystems — and ship production systems in weeks, not months. I've built at scale across AWS, Azure, private clouds, from serverless to Kubernetes to bare metal. The technology stack is the easy part. The hard part is knowing which problem actually needs solving.

---

## Experience

### Principal Architect | Generative AI Platforms
**Amazon Web Services (AWS)** | *October 2024 - Present | Seattle, WA*

*Leading telecom-native GenAI platform serving tens of millions of concurrent users*

→ Invented evolutionary "manifest model" architecture - Major telecom operators face a paradox: platforms rigid enough to handle tens of millions of concurrent users, yet flexible enough to add use-cases daily without rewrites. Traditional approaches forced choosing scale OR flexibility. The manifest model eliminated that tradeoff—use-case definitions live outside core infrastructure, enabling product teams to ship new AI capabilities independently. This architectural decision makes carrier-scale AI operationally viable.

→ Reduced troubleshooting time 25% by reframing the problem - Teams were drowning in device crashes, network logs, and customer profiles with no way to correlate. The breakthrough was recognizing this as a data architecture problem, not an AI model problem. Built real-time inference architecture that surfaces causation across previously siloed streams.

→ Established reusable architectural patterns across the AWS stack - Reference architectures spanning SageMaker, ECS/EKS, Lambda, ElastiCache, and multi-region load balancing. Teams deploy production AI services in weeks instead of quarters because the hard decisions around scale, cost, and reliability are proven. When to use serverless vs. containers vs. managed ML isn't a debate—it's a decision tree with known tradeoffs.

→ Direct technical influence at C-level and executive leadership - Working with VPs and Senior VPs at North America's largest telecom, where architectural decisions affect platforms serving hundreds of millions of subscribers. When critical bets need making—build vs. buy, multi-region strategy, AI model hosting — I build the proof that shifts executive conviction.

### Senior Product Architect | Computer Vision & AI
**Amazon Web Services (AWS)** | *October 2021 - October 2024 | Austin, TX*

*Built AI platform reducing investigation time by 35% for major security companies*

→ Built video intelligence platform reducing security investigation time 35% - Solved the "too much footage, no insight" problem by architecting edge-to-cloud continuum (MEC/Outposts for near-edge, TFLite for embedded edge). 40% reduction in false-positive dispatches through intelligent multi-stream correlation and GenAI-powered summarization.

→ Pioneered CVOps framework that became the team's foundation - Personally coded initial Python/Rust implementation to prove the pattern, then established CI/CD and shared libraries enabling the team to scale independently.

→ Achieved sub-100ms latency at 5,000+ predictions/second - Lambda control plane with auto-scaling Fargate data plane. Architecture handled seamless scaling from POC to production video processing workloads.

### Senior Solutions Architect | Industry 4.0 & Edge AI
**Amazon Web Services (AWS)** | *May 2020 - October 2021 | Stuttgart, Germany*

*Transformed manufacturing with edge-to-cloud AI achieving 99.99% reliability*

→ Solved the "cloud latency kills production lines" problem - Manufacturing control systems needed millisecond response times. Architected edge computing framework keeping critical decisions local while maintaining cloud connectivity for analytics. 99.99% reliability, 35% reduction in unplanned downtime.

→ Built IoT fleet management for 10,000+ heterogeneous industrial endpoints - The challenge was enabling modern AI/ML on decades-old legacy machinery that couldn't be replaced. Created abstraction layer bridging legacy equipment with cloud intelligence.

→ Reduced robot safety incidents through simulation, not sensors - Robotic arms with fixed routes became hazards as human behavior evolved. Architectural insight: optimize routes in the cloud where you can simulate thousands of variations. Built ROS-based system learning from human patterns and generating collision-free routes automatically. 33% reduction in space invasion, 21% fewer safety stops.

### Principal Software Engineer | Platform Architecture
**Mercedes-Benz.io** | *September 2018 - May 2020 | Stuttgart, Germany*

*Built the technical foundation for Mercedes-Benz's global digital transformation*

→ Solved the "every department needs a different view of the vehicle" problem through event sourcing - Legacy system required manual view creation and individual integrations per department. Architected event-sourcing platform (Lambda, containers, S3, DynamoDB, EventBridge, ElastiCache) creating unified vehicle state across all lifecycle stages. Any department could materialize their own view from the same event stream with query flexibility. 47% cost reduction by eliminating manual integration and view maintenance. Deployment velocity from months to days.

→ Pioneered Hypothesis-Driven Development for ML - Built production-grade MVPs to validate before scaling full pipelines. High-performance pricing engine processing 1,000+ evaluations/second on decades of sales data proved the pattern works under real load.

### Senior Staff Software Engineer | Security & IoT
**OSRAM** | *April 2018 - September 2018 | Berlin, Germany*

→ Architected zero-trust IoT security from scratch - Built custom OAuth 2.0/OpenID Connect extensions for fine-grained device permissions with HSM-backed cryptography. Azure infrastructure with Terraform automation.

### Senior Staff Software Engineer | FinTech Platform
**PayU** | *May 2017 - April 2018 | Berlin, Germany*

→ Consolidated 14 markets' payment reconciliation into single serverless platform - Each market was running independent reconciliation infrastructure and processes—expensive and duplicated effort. The architectural challenge was data engineering: normalizing disparate formats from banks, merchants, and acquirers across markets into a common model. Serverless architecture auto-scaled for any market's reconciliation jobs and scaled to zero when idle. 60% cost reduction from consolidation and elastic scaling.

→ Built ML-based fraud detection with autonomous weekly retraining - Fraud patterns evolve faster than manual model updates. Architected pipeline handling millions of daily transactions across all markets.

### Senior Software Architect | AgTech IoT
**e-Core** | *February 2016 - May 2017 | Porto Alegre, Brazil*

*Military-grade IoT platform for agricultural machinery*

→ Built near-realtime auth platform without sacrificing security - IoT devices needed sub-millisecond authorization, but military-grade requirements meant standard approaches were too slow or too weak. Implemented custom nonce calculation on mutual TLS using Erlang and RabbitMQ—contributed plugin back to RabbitMQ project. Built air-gapped firmware signing process using Yubikey hardware API (libuv) for supply chain integrity. 30% infrastructure cost reduction through protocol optimization.

→ Orchestrated autonomous machine-to-machine coordination - Harvesters and grain carts needed to communicate directly for autonomous operation (approach, align, transfer grain, signal when full, separate), then transition to manual control. Built MQTT-based handshake mechanism matching certificates and nonces, enabling machines to coordinate with sub-meter GPS accuracy. The challenge was the state machine across autonomous/manual transitions.

### Early Career Foundation
**Incrosolda Serviços e Mecânica - NewFocus - Nokia NSN - Zenvia Mobile - Dell technologies** | *1994 - 2016*

→ Bridged physical and digital systems before the software career - Started at age 8 as truck mechanic, spent years automating industrial machinery using PLCs, PIC MCUs, and Arduinos. Built digital controllers interfacing with mechanical, hydraulic, and pneumatic systems for wood processing, tube bending, and food manufacturing. Edge computing and IoT came naturally—I was already solving hardware/software integration at industrial scale.

→ Built ERP integrations connecting software to physical operations - At NewFocus, customized ERP modules for real-world integration: PDAs tracking truck departures, weighing systems feeding load data, connecting factory floor operations to business systems. Solved the "last mile" problem of getting physical world data into digital systems.

→ Pioneered early web and containerization architectures - At Dell, built Single Page Application with server-side JavaScript rendering via Java Nashorn—years before React SSR. At Zenvia, dockerized applications for unpredictable SMS traffic spikes when Docker was pre-1.0 (2014), enabling seamless vertical scaling for millions of users.

→ Created operational frameworks still in use - Built personnel safety system using cellular triangulation at Nokia Siemens. Created L1/L2/L3 escalation and "FireFighter" on-duty rotation at Zenvia when DevOps culture didn't exist—framework still operational today.

---

## Education & Skills

→ **Bachelor of Technology, Information Technology** | Universidade do Oeste de Santa Catarina

→ **Post-Graduate Specialization, Software Development with Java** | Universidade do Oeste de Santa Catarina

→ **Mechanical Engineer (incomplete)** | UnoChapecó

→ **Languages:** English (Native), Portuguese (Native), Spanish (Professional), German (Conversational), Italian (Basic)
