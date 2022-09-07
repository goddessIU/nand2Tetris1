# project3
this project , is similar to project 2. We just make Bit， RAM， PC and so on. What's the difference of this project with project2? 第二章的原件是同步的，类似alu；但是第三章是异步的，也就是我们本周期的状态取决于上个周期。例如Register， 我们要存储数据。如何存呢？你把本次的输出再连到输入，用Mux这些来选择我们是选择哪个输入，如果我们想一直存储，那就一直留着上次的输出；或者也可以借此修改。

Bit是1bit的存储， Register是16Bit的存储，RAM8就是8个Register，以此类推，就是封装的思想，此时我们只需要有RAM8的api即可，而无须关注其内部是怎么构成的。如果想知道，打开它，就是8个register，再打开register...

PC： Program Counter， 我们如何知道本周期执行哪个命令，PC可以决定， 每一次PC+1， 就是下一条指令，当然，我们可以jump来实现循环。