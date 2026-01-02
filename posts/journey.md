# The Journey

From rebuilding diesel engines in rural Brazil to architecting AI platforms serving tens of millions—this is a story of systems thinking.

---

## The Shop Floor (1994-2013)

I started working at age 8 in my father's truck mechanic shop in [Xanxerê](https://maps.app.goo.gl/mwV16AmwHwieV14i6), a small city in southern Brazil. For 19 years, I worked on diesel engines, hydraulic systems, and pneumatic equipment.

This wasn't hobby work. It was full-time mechanical engineering in an environment where diagnostic manuals didn't exist and parts had to be fabricated rather than ordered.

Diagnosing why a diesel engine fails under load requires systematic elimination of variables—fuel delivery, compression, timing, electrical systems. This same mental model later applied to debugging distributed systems at scale.

As automation became more common in heavy machinery, I began working with PLCs, PIC microcontrollers, and early Arduino boards. I built digital controllers interfacing with mechanical, hydraulic, and pneumatic systems for wood processing equipment, tube bending machines, and food manufacturing.

**The critical insight:** Edge computing and IoT came naturally later because I was already solving hardware-software integration at industrial scale. The jump to cloud infrastructure wasn't abandoning mechanical work—it was taking the same systems thinking from factory floors to distributed platforms.

---

## The Forced Upgrade (2004-2007)

My mother recognized that physical labor, while honorable, limited long-term opportunity. She insisted I enroll in a three-year software development bootcamp while continuing to work in the shop.

This wasn't a gentle suggestion. It was a forced update—Mom.exe pushing a mandatory patch.

The bootcamp taught Java, SQL, and web development basics. The value wasn't the specific technologies—it was learning that software systems could be decomposed and debugged using the same systematic thinking I'd developed with diesel engines.

I earned a Bachelor of Technology in Information Technology and a Post-Graduate Specialization in Software Development with Java from Universidade do Oeste de Santa Catarina.

---

## The Bridge Years (2013-2017)

My first professional software role at **NewFocus** involved customizing ERP systems for industrial clients. This was the perfect bridge between my mechanical background and software development—solving the "last mile" problem of connecting physical operations to digital systems.

A wood processing company needed to track trucks leaving their premises and capture load weights automatically. I built custom ERP modules integrating PDA devices, industrial weighing scales, and real-time data pipelines. I wasn't just writing database queries—I was solving how to make factory floor operations visible to business systems.

At **Nokia Siemens Networks**, I built a personnel safety system for cell tower technicians using cellular triangulation before GPS was ubiquitous in mobile devices. If a technician didn't physically move within a specified time window, the system escalated automatically. This was real distributed systems work—sensor data, time-series analysis, event-driven alerting.

At **Dell Technologies**, I pioneered server-side JavaScript rendering in 2013—years before React SSR became standard practice.

At **Zenvia Mobile**, I dockerized applications when Docker was pre-1.0. The goal was handling unpredictable SMS traffic spikes—political campaigns, breaking news, marketing blasts. I built L1/L2/L3 escalation procedures and a "FireFighter" on-duty rotation system that's still operational at Zenvia today, a decade later.

At **AGCO**, I built military-grade IoT security for agricultural machinery: sub-millisecond authorization using custom nonce calculation on mutual TLS with Erlang and RabbitMQ. Orchestrated autonomous machine-to-machine coordination for harvesters and grain carts using MQTT-based handshakes with sub-meter GPS accuracy.

---

## The International Protocol (2017-2020)

In 2017, I moved to Berlin. 

At **PayU**, I consolidated 14 markets' payment reconciliation—normalizing disparate formats from banks, merchants, and acquirers into serverless platform. 60% cost reduction.

At **OSRAM**, I architected zero-trust IoT security with OAuth 2.0 extensions and HSM-backed cryptography.

Then to Stuttgart at **Mercedes-Benz.io**. Multiple departments needed different views of vehicle data across the lifecycle. Legacy system required manual view creation and individual integrations per department.

My architectural insight: event sourcing. Unified vehicle state across all lifecycle stages, allowing any department to materialize their own view from the same event stream.

Built platform using AWS Lambda, containers, S3, DynamoDB, EventBridge, ElastiCache. Connected 60+ global systems, 47% cost reduction, deployment velocity from months to days.

**The principle:** One source of truth, infinite flexible views, no tight coupling.

Each move required rebuilding credibility: learning new languages, adapting to different engineering cultures, navigating compliance requirements. The gap between internal certainty and external validation creates energy but also stress.

---

## The Cloud Native Era (2020-Present)

I joined AWS in May 2020 as Senior Solutions Architect in Stuttgart, focused on Germany's premier manufacturing companies: BMW, Bosch, Siemens, Festo; implementing Industry 4.0 initiatives.

Manufacturing systems have strict reliability requirements. A production line stopping costs hundreds of thousands per hour. My background in mechanical systems gave me intuitive understanding of physical constraints that pure software engineers often miss—vibration, temperature, electromagnetic interference, network reliability in industrial environments.

In October 2021, I moved to Austin as Senior Product Architect at AWS Industry Products, working on computer vision platforms. I invented the **CVOps framework**: extending MLOps principles to cover the entire computer vision lifecycle. I demonstrated how it works, and led platform development. I focused on the embedded stack, creating a flexible Rust-based system enabling cloud flexibility on resource-constrained devices.

In October 2024, I became Principal Architect focused on telecommunications and generative AI, moving to Seattle.

### Real-Time AI Telephony

My current work focuses on real-time AI-powered voice platforms: enabling generative AI interactions over traditional phone systems for major telecommunications carriers.

**The technical challenge:** Building systems that bridge 1970s telephony protocols (SIP/RTP) with modern AI inference platforms, maintaining carrier-grade reliability and real-time performance.

This is genuinely uncharted territory. When new AI capabilities emerge, I build working prototypes within hours to validate architectural approaches. These prototypes become the foundation for production systems spanning multiple regions, handling sub-100ms latency requirements at massive scale.

The work includes invention disclosures for privacy-preserving AI quality evaluation, and agent-to-agent handover.

---

## The Through-Line

From 1994 to today—truck mechanic's shop in rural Brazil to architecting AI systems at global scale—the through-line is consistent:

**Systems thinking applied to ambiguous problems with real-world constraints.**

Whether diagnosing why a diesel engine fails under load or why a distributed system fails under load, the mental model is the same:

1. Decompose to fundamental components
2. Identify where constraints bite
3. Build prototype to test assumptions
4. Iterate based on reality, not theory
5. Make it operationally excellent before scaling

The tools changed—wrenches to keyboards, diesel engines to distributed systems, mechanical shops to cloud infrastructure, **but the approach remained constant!**
