---
title: Resume - IC Systems
section: resume
banner: images/resume.jpg
draft: true
---

# Tiago Oliveira

**Principal Engineer | Real-Time Distributed Systems & AI Infrastructure**

[tiago@tiago.sh](mailto:tiago@tiago.sh) · [LinkedIn](https://www.linkedin.com/in/tiagode) · [GitHub](https://github.com/tiagodeoliveira) · [tiago.sh](https://tiago.sh) · Greater Seattle Area

---

## Summary

Build production AI infrastructure where latency, multi-tenancy, and telco integration meet. Designed, built, and operate a multi-tenant real-time agent platform spanning Nova Sonic, OpenAI Realtime, and Gemini Live: sub-100ms p99 end-to-end across four regions, full-silo tenant isolation, custom SIP UA, MCP gateway. Authored the open-source GStreamer plugin (C, libsoup-3.0) deployed as the audio transport layer for a top-three US telecom operator's production rollout, now serving millions of subscribers. Earlier: event-sourcing platform at Mercedes-Benz, serverless payments across 14 markets at PayU, zero-trust IoT at OSRAM.

---

## Skills

**Languages:** Rust, Go, C, Python, TypeScript, Erlang, Java

**Systems:** distributed systems, low-latency real-time inference, multi-tenant isolation, event sourcing, cell-based architecture, multi-region HA, OpenTelemetry, SLO design, p50/p95/p99 analysis, TLA+

**AI Infrastructure:** real-time multi-model inference (OpenAI Realtime, Nova Sonic, Gemini Live), agentic systems, MCP, RAG, LLM serving, privacy-preserving evaluation

**Networking & Streaming:** SIP, RTP, B2BUA, GStreamer, WebRTC, WebSocket streaming, IMS AKA, STIR/SHAKEN, mutual TLS, OAuth 2.0, OIDC, HSM, zero-trust

**Cloud:** AWS (EKS, Lambda, Fargate, Firecracker, Outposts), Kubernetes, serverless

---

## Experience

### Principal Engineer / Architect, Generative AI Platforms
**Amazon Web Services** · *October 2024 – Present · Seattle, WA*

- Designed, built, and operate a multi-tenant real-time AI agent platform: voice-over-WebSocket, multi-model inference across Nova Sonic, OpenAI Realtime, and Gemini Live, custom SIP UA, cell-based HA, and an MCP gateway. Designed full-silo tenant isolation on serverless infrastructure and authored internal research on cross-tenant retrieval attacks, memory contamination, and credential leakage that application-level controls cannot address.

- Authored the [open-source GStreamer plugin](https://github.com/tiagodeoliveira/gst-websockettransceiver) (C, libsoup-3.0) deployed as the audio transport layer for a top-three US telecom operator's production rollout. Implemented voice ducking and barge-in handling that converted robotic turn-taking into natural real-time conversation.

- Built a network-integrated real-time inference platform: bidirectional audio over SIP/RTP, dual-channel inference, custom B2BUA across four AWS regions, sub-100ms end-to-end. Now in production serving millions of subscribers.

- Built utterance-level latency observability with OpenTelemetry, and a privacy-preserving translation-quality evaluation framework in Go.

### Senior Engineer / Architect, Computer Vision & AI
**Amazon Web Services** · *October 2021 – October 2024 · Austin, TX*

- Implemented the initial Python/Rust core of CVOps, a computer-vision operations framework, then scaled it to a multi-engineer team. Established the CI/CD and shared libraries that let the team work independently. Production system served sub-millisecond inference across a fleet of millions of cameras.

- Designed and built an edge-to-cloud inference continuum: MEC/Outposts for near-edge, TFLite for embedded edge, Lambda control plane with auto-scaling Fargate data plane. 5,000+ predictions/second at sub-100ms inference latency.

- Multi-stream correlation and GenAI-powered scene summarization drove ~40% fewer false-positive dispatches and ~35% faster investigations for security operators.

### Senior Architect, Industry 4.0 & Edge AI
**Amazon Web Services** · *May 2020 – October 2021 · Stuttgart, Germany*

- Built an edge computing framework for manufacturing control systems: critical decisions stay local at millisecond response times while cloud handles analytics. 99.99% reliability, ~35% fewer unplanned outages.

- Built IoT fleet management for 10,000+ heterogeneous industrial endpoints. Created an abstraction layer bridging decades-old legacy machinery with modern AI/ML pipelines.

- Built a ROS-based path planner that learned from human operator patterns and generated collision-free routes in simulation. ~30% fewer robot space-invasion events, ~20% fewer safety stops.

### Principal Software Engineer, Platform Architecture
**Mercedes-Benz.io** · *September 2018 – May 2020 · Stuttgart, Germany*

- Designed and built an event-sourcing platform (Lambda, containers, S3, DynamoDB, EventBridge, ElastiCache) creating a unified vehicle state across all lifecycle stages. Any team could materialize their own view from the same event stream. 60+ systems integrated, ~50% cost reduction, deployment cycles from months to days.

- Built a high-performance pricing engine processing 1,000+ evaluations/second on decades of sales data, validating a hypothesis-driven ML pipeline pattern under production load.

### Senior Staff Software Engineer, IoT Security
**OSRAM** · *April 2018 – September 2018 · Berlin, Germany*

- Built zero-trust IoT security for smart lighting infrastructure from scratch — custom OAuth 2.0 and OpenID Connect extensions for fine-grained device permissions, with hands-on cryptographic implementation and HSM integration for key management.

### Senior Staff Software Engineer, FinTech
**PayU** · *May 2017 – March 2018 · Berlin, Germany*

- Consolidated payment reconciliation across 14 markets into a single serverless platform, normalizing disparate bank/merchant/acquirer formats into a common model. ~60% cost reduction; auto-scaled per market and to zero when idle.

- Built ML-based fraud detection with autonomous weekly retraining, handling millions of daily transactions.

### Senior Software Engineer, AgTech IoT
**e-Core** · *February 2016 – May 2017 · Porto Alegre, Brazil*

- Implemented custom nonce calculation on mutual TLS using Erlang and RabbitMQ; contributed the plugin back to the RabbitMQ project. Built an air-gapped firmware signing process using the Yubikey hardware API. ~30% infrastructure cost reduction through protocol optimization.

- Built MQTT-based handshake mechanism with sub-meter GPS accuracy for autonomous machine-to-machine coordination between harvesters and grain carts (approach, align, transfer, signal, separate).

### Earlier Career

- **Zenvia Mobile, Principal Software Engineer** (2014 – 2016). Deployed Docker 0.x in production (2014) for unpredictable SMS traffic bursts; built an L1/L2/L3 incident framework still in operational use.
- **Dell Technologies, Senior Software Engineer** (2013 – 2014). Server-side SPA architecture using Java Nashorn, years before React SSR. First recipient of Dell's Application Development Quality Gold Award.
- **Nokia Siemens Networks, Software Engineer** (2013). SLA maintenance matrix for global cellphone sites using graph theory and finite state machines; 3GPP and ETSI compliant.
- **Earlier**: bespoke ERP modules at NewFocus, including a PIC-controller hack streaming semi-analog truck-scale readings into the ERP in real time. Background in industrial mechanical, hydraulic, and pneumatic systems before software.

---

## Education & Recognition

- **B.Tech, Information Technology**, Universidade do Oeste de Santa Catarina (2004 – 2007)
- **Mechanical Engineering coursework** (incomplete), Unochapecó (2011 – 2013)
- **12 patents filed** in computer vision model monitoring, cryptographic video signing, multi-modal scene understanding, device optimization, and privacy-preserving evaluation
- **AWS AllStar Award**, Customer Obsession
- **Languages**: English (fluent), Portuguese (native), Spanish (professional), German (conversational), Italian (conversational)
- **Mentorship**: Mentored 35+ engineers to promotion across multiple seniority levels through 1:1 coaching, design reviews, and promo doc support.
