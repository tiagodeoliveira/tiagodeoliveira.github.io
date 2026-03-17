---
title: What Truck Mechanics Know About Distributed Systems
description: Six lessons from 19 years fixing trucks that turned out to apply directly to distributed systems
date: 2026-01-03
tags: [systems-thinking, distributed-systems, first-principles]
---

# What Truck Mechanics Know About Distributed Systems

I spent 19 years fixing trucks before writing my first line of production code. I machined parts that weren't available anywhere. I welded cracked engine blocks and bent chassis back into shape. I fixed hydraulic cylinders, fuel injection systems, differentials, and pretty much anything else that rolled into the shop broken.

This isn't a career story. It's a set of lessons that turned out to apply directly to distributed systems.

When I started working on diesel engines at 8 years old in my father's shop in [Xanxerê, Santa Catarina, Brazil](https://maps.app.goo.gl/mwV16AmwHwieV14i6), I had no idea I was learning systems architecture. I was just trying to figure out why a truck wouldn't start, or why it lost power under load, or why the hydraulics failed after twenty minutes of operation.

Years later, when I started building software, I realized the mental models were the same.

## The trucks that taught me

Three trucks shaped how I think about systems.

The [Ford F-13000](https://en.wikipedia.org/wiki/Ford_Caminh%C3%B5es#/media/File:Ford_F-13000_1986_(16224034796).jpg), aka Fordão ("big Ford") was popular for hauling timber in southern Brazil. These things came into the shop caked in mud and pine resin, that sticky sap that gets everywhere and doesn't wash off. The F-13000 had no hydraulic steering. In Brazil we called it queixo duro ("hard chin") because turning the wheel required your whole body. My father invented a wood-chopping attachment that ran on hydraulic power, connected to the PTO (power take-off), which is an auxiliary output on the transmission that lets you run equipment off the engine. In winter, the diesel would gel up so badly that the only way to start these trucks was to pour gasoline into a port on the engine block and light it on fire to warm things up. That was normal.

The [Mercedes-Benz LP 321](https://mercedes-benz-publicarchive.com/marsClassic/en/instance/picture/Mercedes-Benz-LP-321.xhtml?oid=127598) was a different kind of beast. More refined, but more complex. Once a driver lost his key, and my dad taught me how to start it using a nail bridging the ignition contacts. I found a manual for one of these trucks years later. It was written in German, which I couldn't read at the time. The engine had diesel fuel lines routed over electrical components, which meant troubleshooting required understanding both systems simultaneously. Nothing was isolated.

The [FNM D-11.000](https://en.wikipedia.org/wiki/F%C3%A1brica_Nacional_de_Motores#/media/File:FNM_D-11.000_tractor.JPG) was Brazilian-made and practically indestructible. These trucks would run forever if you could keep them from leaking hydraulic fluid everywhere. The surface finishing on the castings was rough, so factory gaskets never sealed properly. You'd spend hours fabricating custom gaskets, applying sealant, reassembling everything, and then watch a new leak appear in a different spot. Disassemble. Try again. The problem was never where you thought it was.

Each of these trucks taught me something that still applies today.

## Lesson 1: Complex systems have predictable failure modes

A diesel engine that dies under load is telling you something specific. It's not random, the failure pattern narrows the problem space.

Does it die suddenly or gradually? Under acceleration or at steady state? When hot or cold? After how many minutes?

Each answer eliminates variables. Sudden death under load points to fuel starvation. Gradual power loss when hot points to compression issues or turbo failure. Intermittent problems that clear themselves are usually electrical, but can also be due to bad fuel quality.

We didn't have diagnostic manuals. Most of the trucks that came into our shop were old enough that documentation didn't exist, or it was written in German. So you learned to read the system by how it failed.

> The same applies to distributed systems. A service that times out under load is telling you something. Gradual degradation versus sudden failure means different things. Intermittent issues that resolve themselves point to resource contention or garbage collection. The failure mode is information.

Once you start treating failures as signals rather than just problems to fix, debugging becomes a conversation with the system.

## Lesson 2: You can't fix what you can't observe

In a mechanical shop, observation is physical: you listen to the engine, you feel the vibration, you smell the exhaust, you watch the gauges (when they work 😂). Every sense is a monitoring channel.

*To this day, I am still amazed with the capacity my dad had to diagnose problems simply by listening or feeling.*

Starting a frozen F-13000 with gasoline and fire wasn't reckless. It was the result of understanding exactly what was happening in that engine block. The diesel had gelled, the glow plugs couldn't generate enough heat (*believe or not, in the southern Brazil we get freezing temperatures*). You needed external thermal energy, and you needed to know exactly where to apply it without blowing something up.

> The same questions apply to any system: What is it telling us? Where are the gauges? What changes under load?


The goal is to know what the system feels like when it's healthy versus when it's struggling. Logs tell you what happened. Metrics tell you how often. But the real question is: can you sense when something is off before it breaks?

In my father's shop, we had a saying: if you can't measure it, you can't fix it (*ok, it was a much more popular variation of it, "Como que tu vai curar a bicheira se tu não sabe onde que tá a ferida?", and I can't properly translate it 😂*).

This wasn't philosophy, it was economics. A customer paying by the hour doesn't want you guessing: you diagnose, you fix, you move on.

Observability isn't optional. It's how you stay in business.

## Lesson 3: Dependencies are invisible until they break

The Mercedes LP 321 taught me this.

Diesel lines running over electrical components. To understand why the engine misfired, you had to understand that heat from the fuel lines affected the wiring harness, which affected the injector timing, which affected combustion. The symptom was in the cylinders. The cause was in the layout.

A hydraulic system looks simple too. Pump pushes fluid, fluid moves cylinders, cylinders do work. Three components.

Except it's not three components. It's the pump, the reservoir, the filter, the lines, the fittings, the seals, the fluid viscosity, the operating temperature, the environment temperature, the relief valves, and the return path. Every connection is a potential failure point.

When the hydraulics fail, you don't just check the pump. You check everything upstream and downstream because the symptom is rarely at the source.

> Software architectures work the same way. A "simple" request path might touch dozens of services. The trick is mapping those dependencies before an outage forces you to discover them the hard way.

Draw the dependency graph first. Not the happy path. The failure path. What breaks when this component goes down? What's upstream? What's downstream?

You can't prevent every failure, but you can stop being surprised by them.

## Lesson 4: Fabricating parts teaches you what actually matters

The FNM D-11.000's leaking gaskets were my graduate education in first-principles thinking.

You couldn't order replacement gaskets that worked. The factory ones didn't seal against those rough castings, so you made them yourself. Cutting gasket material, matching the bolt patterns, adjusting thickness based on how much the surfaces deviated from flat.

This meant understanding what a gasket actually does: it fills the gap between imperfect surfaces and maintains a seal under pressure and temperature variation. A gasket isn't just "the rubber thing that goes between the parts." It's a pressure boundary with specific requirements.

When I machined a replacement part because nobody made it anymore, I had to understand what that part actually needed to do. **Not copy its shape, understand its function.**

> Architecture decisions work the same way. The question worth asking is: what's structural and what's convention? Some patterns exist because they solve real constraints, others exist because someone made a choice years ago and it stuck. Knowing the difference is how you avoid inheriting problems you don't actually have.

The ability to strip a problem to first principles comes from asking: **what does this actually need to do?**

## Lesson 5: Physical systems punish sloppy thinking immediately

When you wire a hydraulic system wrong, the consequences are immediate. At best, it doesn't work, at worst, a high-pressure line fails and someone gets hurt.

There's no "it works on my machine", there's no staging environment. The system either works or it doesn't, and the feedback loop is measured in seconds, at best, often milliseconds.

Starting a truck with a nail across the ignition contacts? That works if you understand exactly which contacts to bridge. Get it wrong and you fry the electrical system or start a fire (I am never, ever, admitting the latter ever happened).

This creates discipline, you think before you act, you double-check connections, you pressure-test before you trust. **You design for failure because failure is expensive and sometimes dangerous.**

> Software has longer feedback loops, which can make it tempting to skip steps. But the mechanic's mindset still applies: before you deploy, ask what happens when this fails. What's the blast radius? How do you recover? Do you have a recovery plan? Is that plan comprehensive enough? If you can answer those questions, you're ready.

## Lesson 6: The real skill is diagnosis, not repair

Anyone can swap parts, the skill is knowing which part to swap.

*My dad used to joke: "changing a bolt is R$100, R$1 is for the bolt, and R$99 is for knowing which bolt to replace!".*

Diagnosis is pattern matching built from experience. You see a symptom, you map it to a cause, you test your hypothesis, you iterate. Over time, you build a mental database of failure modes and their signatures.

This is why experienced mechanics are valuable. Not because they turn wrenches faster, young mechanics are often faster (I know I was much faster... and felt less joint pain). It's because they diagnose faster, they see the pattern that would take someone else three hours to find.

> Distributed systems reward the same skill. The fastest path to resolution isn't typing speed. It's knowing where to look first. And that comes from treating every incident as a chance to build your mental database of failure patterns. Post-Incident analysis is how you make sure that the learning is documented and you have a plan to solve it.

You can't shortcut this, it's accumulated experience (as Werner Vogels say: "There is no compression algorithm for experience"). **But you can accelerate it by paying attention.**

## First principles don't care about the medium

People ask how I went from mechanic to engineer, like they're different disciplines. The medium changed, the thinking didn't!

Architecting a platform that handles tens of millions of concurrent requests isn't fundamentally different from staring at a transmission that won't shift. You decompose the system, you map dependencies, you find the failure modes, and you design for recovery.

> Complex systems are understandable if you're willing to do the work.

> Failure is information.

> You can't fix what you can't observe.

> The symptom is rarely at the source.

These ideas came from trucks, but they apply to software, and they probably apply to anything complex enough to break in interesting ways.

**Every distributed system is just another machine.**
