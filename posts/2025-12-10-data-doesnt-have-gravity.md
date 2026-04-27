---
title: Data Doesn't Have Gravity. It Generates It.
description: Why "data has gravity" is sloppy thinking, and what changes when you treat gravity as something we generate around data, not something data possesses by existing.
date: 2025-12-10
tags: [architecture, systems-thinking, data]
---

# Data Doesn't Have Gravity. It Generates It.

*A small reframing that changes how you design around your data*

---

Honestly, I'm tired of hearing "data has gravity."

I've sat through enough architecture reviews where someone says it like it's a natural law. *"Data is heavy, it attracts applications, it resists movement. Just accept it and move on,"* they say.

As Camus would put it: [*I rebel!*](https://www.amazon.com/Rebel-Albert-Camus/dp/B001L9O14A) I refuse to accept a premise that ties my hands before I even start.

The phrase has become so comfortable that nobody questions it anymore. "Data has gravity" treats attraction as an intrinsic property, something data possesses just by existing. But that's sloppy thinking. And sloppy thinking leads to sloppy architecture.

IMO, **data generates gravity**, and I believe the difference matters more than it sounds!

A terabyte sitting in cold storage attracts nothing. It's inert. The gravitational pull only shows up when dependencies form around it, services querying it, pipelines transforming it, schemas that 50 teams now couple to, compliance frameworks anchoring it to a jurisdiction. The gravity isn't in the data, **it's in the ecosystem we build around it**.

I love physics, especially astrophysics. So, consider a neutron star. It can be smaller than a city, yet it packs so much mass into that space that it warps spacetime and bends light. Meanwhile, a nebula can stretch across light-years and exert almost no pull at all. The difference isn't size, it's density. **Mass per unit volume**.

Map this to your architecture. **Volume** is bytes on disk. **Mass** is accumulated coupling, criticality, and consistency constraints. A 100KB reference table with 200 dependent services is a neutron star. Compact, impossibly dense, anchoring everything around it. A 50TB analytics archive with two batch consumers is a diffuse gas cloud. Large, sure. Gravitational? Barely.

I believe that this reframing changes how you approach the problem. If gravity is intrinsic, you're stuck, minimize data or accept lock-in, those are your options. But if gravity is generated, you actually have room to maneuver. You can design systems that resist densification, keep coupling loose, put abstraction layers between consumers and data, and draw clear ownership boundaries so dependencies don't silently multiply. You can't always control how much data you accumulate, but you can absolutely **influence how tightly everything else grabs onto it**.

Which brings me to the question every architect should be asking: **what's your density trajectory?**

Volume shows up in dashboards. You can monitor it, alert on it, budget for it. Density is invisible until it's too late. Coupling accumulates quietly, one integration at time, one "quick" direct database read at time, one schema dependency at time. Then suddenly that "small" system has become the unmovable center of your entire platform. You crossed an event horizon without noticing, and no amount of effort will extract you from that gravity well without a full rewrite.

So the next time someone tells you data has gravity, push back. Ask them what's generating it. Ask about the coupling density. Ask about the trajectory.

**Because data doesn't attract anything on its own.** We build the gravity wells ourselves.

And I say: it's about time we started owning that! :D
