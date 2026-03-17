---
title: Why Agentic AI Needs Stronger Isolation
description: And why serverless makes full isolation the obvious choice for multi-tenant AI agent platforms
date: 2026-03-15
tags: [ai, multi-tenancy, security, serverless]
---

# Why Agentic AI Needs Stronger Isolation

*And why serverless makes full isolation the obvious choice*

---

In traditional SaaS, a human developer writes a WHERE clause to scope data to the right tenant. In agentic AI platforms, a language model decides what to retrieve. That single difference changes everything about how multi-tenant isolation should work, and most architects haven't caught up yet.

## The model that worked for 20 years

Most multi-tenant SaaS platforms use shared infrastructure with logical isolation: a PostgreSQL database with row-level security, a shared Redis cluster with key prefixes, maybe a shared object store with path-based access control. This works, and it has worked for decades, because the isolation boundary is well-understood: a SQL WHERE clause scopes queries to the right tenant, and if a developer forgets it, code review catches it.

AI agent platforms use an analogous mechanism: metadata filters on vector stores that scope retrieval to the right tenant. Technically, a SQL WHERE clause and a vector DB metadata filter are the same thing (logical isolation at the query tier), and both can fail if someone forgets to include them.

But in traditional SaaS, *a human developer* writes the query. In agentic systems, the LLM is often the entity constructing the query parameters or deciding what to retrieve. The orchestration layer delegates retrieval decisions to a probabilistic system susceptible to prompt injection, context confusion, and emergent behavior we can't fully predict. When your AI agent has long-term memory, a RAG knowledge base, tool credentials, and conversation context, the attack surface isn't a missing filter. It's the nature of who (or what) is responsible for applying that filter.

## Where things go wrong

### Memory contamination

AI agents maintain conversational memory across sessions (semantic facts, user preferences, conversation summaries), and this is precisely what makes them useful. A customer calls their insurance broker's AI agent, mentions they're pregnant, and six months later the agent remembers to ask about updating the policy for the new baby. That's the value proposition.

In a shared memory store, the boundary between Broker A's memory and Broker B's memory is a namespace convention, not a security boundary, just a namespace. One misconfigured parameter, one semantic search that drifts across namespaces, and your insurance broker's agent is suddenly recalling facts from a completely different broker's clients. The more sessions and memory tiers a shared store accumulates, the harder it is to guarantee that retrieval stays within boundaries. Per-tenant stores address this risk at the infrastructure level because the isolation mechanism becomes a hard boundary, not an application-level construct.

### RAG cross-tenant retrieval

This is the one that should keep you up at night.

[OWASP lists multi-tenant vector database leakage as a top-10 LLM risk](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/) (LLM08:2025): in a multi-tenant environment where different groups share the same vector database, embeddings from one group can be inadvertently retrieved in response to queries from another group's LLM, potentially leaking sensitive business information.

The typical pool model for RAG uses a shared vector store with metadata filtering to scope results per tenant. This is the cheapest option, and it is also vulnerable to three distinct failure modes:

1. Metadata filter bypass. Whether filtering happens before, during, or after vector similarity search depends on the search engine implementation, and that implementation is a black box we don't control. A bug in filter application (or a misconfigured sidecar file, or a missing filter parameter) means you're serving cross-tenant data. And in agentic architectures, the filter parameters themselves may be constructed or influenced by the LLM, which means the isolation boundary depends on the correct behavior of a probabilistic system.

2. Embedding proximity attacks. [Thornton et al.(2026)](https://arxiv.org/abs/2602.08668) demonstrated that in hybrid RAG systems, cross-tenant retrieval pivot paths form *organically* through naturally shared entities (vendors, compliance standards, common industry terms) with injection budgets as small as 10 to 20 chunks. No adversarial action required, the leakage happens through normal business data overlap. Separately, [Jiang et al. (2024)](https://arxiv.org/abs/2411.14110v1) showed that private data can be systematically extracted from RAG applications at scale, reinforcing that shared retrieval infrastructure is not just a theoretical risk.

3. Domain overlap in shared embedding spaces. Consider two accounting firms on the same AI platform. Both upload engagement letters, tax preparation checklists, and IRS guidance documents, so their embedding distributions are nearly identical. A query about "S-Corp quarterly filing deadlines" from Firm A could easily surface Firm B's specific client engagement terms or fee schedules from a shared index. Not because anyone attacked anything, but because that's how vector similarity works when two businesses operate in the same domain.

Per-tenant vector stores and indexes address all three failure modes by removing shared vector infrastructure between tenants.

### Tool credential exposure

AI agents don't just talk, they act: booking appointments on Google Calendar, sending follow-up emails via MS365, processing payments through Stripe, looking up patient records in an EHR, and each of these integrations requires OAuth tokens, API keys, or service credentials.

In a shared credential store, a confused or compromised agent runtime could access another tenant's OAuth tokens. For a platform where agents manage calendars, send emails, and process transactions on behalf of businesses, credential leakage isn't a security incident, it's a business-ending event. Per-tenant credential stores (scoped by infrastructure-level access control, not application logic) reduce this risk to near zero.

### Compliance and the right to deletion

Businesses on AI agent platforms handle PII in voice recordings, conversation transcripts, and knowledge base documents. Healthcare businesses handle PHI and need HIPAA-compliant isolation. SOC 2 requires system boundaries preventing unauthorized access. GDPR Article 17 requires demonstrable deletion of all of a customer's data.

The key word there is *demonstrable*. With per-tenant resources, proving deletion is straightforward: delete the bucket, the memory store, the vector store, the credentials, and the access roles. An auditor can verify it in minutes because the customer's entire resource scope is known and self-contained.

With shared storage, answering "have we deleted all of Tenant X's data?" requires forensic archaeology across shared databases, vector stores, memory tiers, and credential stores. Shared infrastructure doesn't make compliance impossible, it makes compliance expensive and fragile (and if an auditor asks you to prove it, good luck).

## The cost argument has changed

The traditional argument against full silo isolation is cost: dedicated VMs per tenant, reserved instances per customer, idle capacity during off-hours. For traditional infrastructure, this argument was absolutely valid.

But here's the thing (and this is the part most architects miss): serverless managed services fundamentally change this cost equation. In the platforms I've been building, the incremental cost of full per-tenant isolation on serverless lands at roughly $1 to $3 per tenant per month for the infrastructure premium (a dedicated DynamoDB table, S3 bucket, memory store, vector index, and IAM roles). That's the actual delta between pool and silo in my experience, and your mileage will vary depending on the services you use, but the order of magnitude holds.

Services like [Amazon Bedrock AgentCore](https://aws.amazon.com/bedrock/agentcore/) are purpose-built for exactly this pattern: serverless agent runtimes with session isolation, managed memory stores, and managed tool integration, all provisioned per-tenant without you babysitting infrastructure. I built on this and the per-tenant isolation story genuinely holds up at production scale (is there bias? of course there is, so take the endorsement with appropriate skepticism and go test it yourself).

At hyperscale (think 10,000+ tenants), that $1 to $3 adds up to maybe $30,000 per month in silo premium over a massively optimized shared cluster. But the cost calculus changes completely when you factor in what a single cross-tenant data breach does to enterprise trust, regulatory standing, and customer retention. The infrastructure savings from pooling are real, but they're dwarfed by the cost of the headline you're trying to avoid.

## What you get that pool models can't provide

Full silo isn't just about security, it also unlocks capabilities that are difficult or impractical to achieve with shared infrastructure:

Per-tenant experimentation. Each tenant's runtime is independently configured, so you can run Claude for some customers, run Llama for others, and compare resolution rates and satisfaction without any customer being aware of the test. In a shared runtime, A/B testing requires complex per-request routing and carries blast radius risk, while per-tenant runtimes make experimentation safe by default.

Per-tenant compliance posture. A healthcare customer gets 30-day memory retention for HIPAA, a retail customer gets 365-day memory for personalization, a European customer gets data residency in eu-west-1. Each tenant's configuration is independent because their resources are independent.

Per-tenant encryption keys. Each tenant's data encrypted with their own key means you can revoke access to a single tenant's data instantly without affecting anyone else. Combined with per-tenant IAM roles, this gives you cryptographic isolation on top of access control isolation.

Per-tenant break-glass process. When something goes wrong with a specific tenant's agent (and it will), having isolated resources means your troubleshooting is scoped to that tenant's runtime, memory, and logs. You can inspect, debug, and remediate without wading through multi-tenant noise or risking exposure to other tenants' data. This is one of those operational benefits that doesn't show up in architecture diagrams but makes a massive difference during incidents.

Clean lifecycle management. Provisioning creates a complete isolated environment without touching existing tenants, deletion removes everything idempotently, upgrades are per-tenant rather than platform-wide, and incident response can pause one tenant's runtime without disrupting others. Every resource tagged with tenant identifiers gives you per-tenant cost attribution with zero custom metering.

## The architecture

The pattern is simpler than it sounds. Shared infrastructure handles routing and management: load balancers, API gateways, phone number lookup tables, authentication. Everything downstream of the routing layer is per-tenant: agent runtimes, memory stores, vector stores, knowledge bases, credential stores, data buckets. This maps to what the [AWS SaaS Lens](https://docs.aws.amazon.com/wellarchitected/latest/saas-lens/silo-pool-and-bridge-models.html) calls a bridge model at the system level, but with full silo at every data and compute layer.

The non-negotiable boundary: agent runtimes and memory stores must remain per-tenant silo, permanently. These are the resources where tenant context lives (conversation state, semantic facts, user preferences, business credentials, agent behavior configuration). [AWS's own guidance on tenant isolation for AI agents](https://aws.amazon.com/blogs/machine-learning/implementing-tenant-isolation-using-agents-for-amazon-bedrock-in-a-multi-tenant-environment/) puts it bluntly: *"FMs act on unstructured data and respond in a probabilistic fashion.These properties make FMs unfit to handle tenant context securely."* Tenant context should be passed between deterministic components, not delegated to a foundation model.

The remaining silo resources (object stores, vector stores, knowledge bases, credential stores) are silo today because the security and operational benefits outweigh the marginal cost. As the platform matures, some could migrate to pool models where isolation can be maintained through other means. The architecture should be designed to evolve, but the runtime and memory boundary is permanent.

## What about tool invocation policies?

The industry is evolving, and approaches like tool invocation policies and guardrails are gaining traction. These are useful and worth adopting, but it's important to understand what they are: post-LLM enforcement. They constrain what the model can *do* after it decides to act, but they don't prevent the model from *seeing* data it shouldn't have access to in the first place. A tool policy can block an agent from calling a calendar API it shouldn't use, but it can't prevent cross-tenant retrieval from a shared vector store or memory contamination from a shared memory tier. They're a valuable layer of defense in depth, not a substitute for infrastructure-level isolation.

## The industry is going to learn this the hard way

I've been building multi-tenant AI voice agent platforms, and the more I dig into the research, the more convinced I am that shared infrastructure for AI agents is an accident waiting to happen. The first major cross-tenant data leak in a shared AI agent platform will rewrite how everyone thinks about multi-tenancy for AI.

The research is unambiguous: OWASP flags it, academic papers demonstrate it happening organically, and foundation models are explicitly unfit to enforce tenant boundaries.

Don't wait for that headline. If you're building an AI agent platform, the question isn't whether you can afford full silo, the question is whether you can afford not to.

---

*What's your experience with multi-tenant isolation for AI workloads? Are you running shared vector stores in production with multiple tenants? I'd genuinely love to hear how others are approaching this.*
