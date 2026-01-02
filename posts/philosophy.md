# How I Think

> "The gap between demo and production is where I live."

Most architects can design for the happy path. The value is in knowing what breaks at 3am under 10x load with a team that's never seen the code.

---

## [First Principles](https://en.wikipedia.org/wiki/First_principle) from the Shop Floor

Every distributed system is just another machine with predictable failure modes you can debug and prevent. _The more complex the systems get the harder it is to predict, but never impossible!_

I spent 19 years diagnosing mechanical failures without manuals. When a diesel engine fails under load, you don't guess. You systematically eliminate variables: fuel delivery, compression, timing, electrical systems. You decompose the problem until you find the constraint.

Software systems work the same way. The abstractions are different, but the physics are the same: latency is limited by speed of light, compute requires energy, energy generates heat, heat requires cooling. Every system has constraints. Find them.

---

## Core Beliefs

### [Constraint Thinking](https://thedecisionlab.com/reference-guide/management/theory-of-constraints)

Every problem has one constraint that matters most. Find it. Everything else is noise until that constraint is addressed.

In manufacturing, it's usually throughput at a specific station. In distributed systems, it's usually the slowest component in the critical path. In organizations, it's usually the decision that's blocked or the person who's overloaded.

### Tradeoff Clarity

Frame decisions so stakeholders can choose. Don't hide complexity. **Expose it clearly enough that the right people can make informed tradeoffs**.

"We can have consistency or availability, not both during a partition" is useful. "It's complicated" is not.

This applies to technical and organizational decisions equally. When a team is stuck, it's often because the tradeoffs aren't visible to the people who need to make them.

### Teaching as Liberation

I love teaching. But not the kind that produces copies of the teacher.

Following [Paulo Freire's](https://www.freire.org/paulo-freire) thinking, [I see education as a tool for liberation, not indoctrination](https://sph.emory.edu/info/faculty-staff/rollins-teaching-learning-core/teaching-learning-principles/critical-pedagogy#:~:text=A%20central%20tenet%20of%20Freire%E2%80%99s%20critical%20pedagogy%20is%20%22conscientizacao%22%20or%20critical%20awareness%20that%20precedes%20action.%20Critical%20awareness%20begins%20when%20learners%20become%20aware%20of%20sociopolitical%20inequities%20and%20then%20take%20action%20to%20mitigate%20those%20contradictions.). The goal isn't to make people think like me. It's to help them think for themselves. Questioning, dialogue, co-discovery. The best outcome is when someone reaches a conclusion I wouldn't have, and it's better than mine.

Individual contribution doesn't scale. What scales is enabling others to solve problems you'll never see. The best architectural decisions are the ones teams can extend without you. The best debugging sessions are the ones where someone else finds the root cause because they learned how to look.

### [Design for Evolution](https://evolutionaryarchitecture.com/)

Today's architecture is tomorrow's legacy. Build systems that can be replaced piece by piece, not rewritten wholesale.

Event sourcing at Mercedes-Benz wasn't just about current requirements. It was about enabling views we couldn't predict yet. One source of truth, infinite flexible views.

### [Two-Way Door Decisions](https://www.youtube.com/watch?v=rxsdOQa_QkM)

I'm a fervent advocate for reversibility.

One-way doors are decisions that are costly or impossible to undo. They deserve caution, analysis, and buy-in. Two-way doors are decisions you can reverse if wrong. They deserve speed and experimentation.

Most decisions are two-way doors mistaken for one-way doors. Teams slow down unnecessarily, seeking consensus for choices that could simply be tried and reverted. Recognizing which type you're facing changes everything about how you should move.

---

## The Mechanical Foundation

I maintain a full workshop in my garage for building metal pieces. This isn't nostalgia. It's philosophy.

Pure abstraction without physical reality feels incomplete. The best software systems account for real-world constraints that pure software engineers often miss:

- **Vibration** affects sensors and connections
- **Temperature** changes component behavior
- **Electromagnetic interference** corrupts signals
- **Network reliability** varies by environment
- **Power availability** isn't guaranteed

When you've rebuilt an engine in a shop where the nearest replacement part is 500km away, you develop a different relationship with operational excellence. You build systems that can be diagnosed and repaired, not just deployed and replaced.

One lesson that stuck: never assemble without proof you're going in the right direction. I've mounted an engine back into the chassis only to discover I needed to pull it again for one oil retainer I missed. That teaches you something about validation. You learn to verify before you commit. Check the next layer before closing up the current one. In software, this translates directly: don't merge without confidence, don't deploy without verification, don't architect yourself into a corner you can't back out of.

---

## How I Work

### Hands-On Leadership

I don't design systems in ivory towers. For my current telephony work, I didn't just draw architecture diagrams. I built WebSocket servers, tuned GStreamer pipelines, debugged SIP flows, and solved jitter buffer timing issues.

This keeps architectural decisions grounded in implementation reality. It's also how you earn credibility with engineering teams. People trust your judgment differently when they've seen you debug alongside them.

### Prototype-First Validation

Plans are hypotheses. Prototypes are evidence.

When new AI capabilities emerge, I don't write documents about what we could do. I build working prototypes, sometimes within 24 hours. Those prototypes accelerate enterprise decisions and de-risk architectural choices.

The pattern:
1. Identify the riskiest assumption
2. Build the smallest thing that tests it
3. Learn from reality, not theory
4. Scale what works

### Navigating Organizations

[Technical problems are often organizational problems in disguise](https://en.wikipedia.org/wiki/Conway%27s_law). A system that requires three teams to coordinate for every deployment isn't a technical architecture problem. It's a team boundary problem.

I've learned to read organizational dynamics the same way I read system architecture: where are the bottlenecks, who holds context that others need, what decisions are blocked and why. Sometimes the right technical choice is the one that works with organizational reality rather than against it.

### Operational Excellence as Default

I come from environments where system failure had immediate economic consequences. Factory lines stopping. Trucks broken down. I build observability and failure recovery from day one.

Not as an afterthought. Not as a "phase 2." From day one.

---

## What I'm Skeptical Of

**Process theater.** Meetings about meetings. Documentation that no one reads. Ceremonies that don't produce decisions.

**Premature abstraction.** Three similar lines of code are better than a premature abstraction. Build for today's requirements, not tomorrow's hypotheticals.

**Architecture astronauts.** People who design systems they'll never implement or operate. The gap between diagram and deployment is where most architectures fail.

**"Best practices" without context.** What works for Google doesn't work for a 5-person startup. What works in a microservices architecture doesn't work for a monolith. Context determines correctness.

---

## What I Optimize For

**Clarity over cleverness.** Readable code over clever code. Explicit over implicit. Boring technology over exciting technology.

**Operational simplicity.** Can someone debug this at 3am? Can a new team member understand it in a week? Can it fail gracefully?

**Speed on two-way doors.** If a decision can be reversed, make it fast. Save the deliberation for the ones that can't.

**Learning velocity.** How fast can we discover what we don't know? Prototypes beat documents. Production beats staging. Customer feedback beats internal review.

**Team capability.** Am I leaving this team better equipped than I found them? Can they operate and evolve this system without me?

---

## The Through-Line

Whether debugging diesel engines or distributed systems, the approach is the same:

1. **Decompose** to fundamental components
2. **Identify** where constraints bite
3. **Build** prototype to test assumptions
4. **Iterate** based on reality, not theory
5. **Operationalize** before scaling

The tools changed. The thinking didn't.
