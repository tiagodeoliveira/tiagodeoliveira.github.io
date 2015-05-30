---
title: "Spring Framework - Far Beyond CDI"
tags: [spring, presentation, cloud, springboot]
---

### A presentation showing a bit of some Spring Framework capabilities

[Here](https://github.com/tiagodeoliveira/spring-micro-arch) is possible to see some code example of how use some Spring Projects (based on Spring Framework) to build modern, resilient, message driven and distibuted cloud applications.

> The idea behind this project is to receive a REST json message on the receiver module.
> The message holds a callback URL that will be called when the process is done, and a message on the [Brainfuck](http://en.wikipedia.org/wiki/Brainfuck) format. 
> The receiver module will add a *start_time* tag on the message and post it on a RabbitMQ instance.
>
> The processor module will be notified when a new message arrives on the specific queue and will translate the Brainfuck message. After that it will put on another queue with messages *to be delivered*.
> 
> The sender module will get the message and sent to the callback url from the original message.
> 
> The module register will receive the converted message (because its endpoint was specified on the first message call) and records it on a mongodb instance.
> 
> Provider module is a configuration server that provides the access to the configurations files of each module registered under [a git repository](https://github.com/tiagodeoliveira/spring-micro-arch-configurations).

Enjoy :D

<iframe
	style="width: 100%; min-height: 500px;"
        src="https://rawgit.com/tiagodeoliveira/spring-framework-presentation/master/_site/index.html"
        allowfullscreen="true">&nbsp;</iframe>

The presentation source is here https://github.com/tiagodeoliveira/spring-framework-presentation
