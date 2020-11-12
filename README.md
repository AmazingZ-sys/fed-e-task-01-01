# fed-e-task-01-01

#### js异步编程

JavaScript是在单线程下执行的，我们的代码在执行的时候会作为执行上下文按照先进后出的方式依次执行，我们编写的同步代码最大的问题就是会阻塞后面任务的执行，而与同步相对应的异步则可以理解为在异步操作完成后索要执行的任务，也就是我们不等待任务执行完毕就可以执行下一个任务。现在的异步操作通常使用回调函数或者promise对象的方式进行实现，JavaScript通过异步使它在单线程环境尽可能快的执行任务

#### EventLoop和消息队列

在JavaScript执行的时候我们将同步任务先推入栈中等待执行，然后创建一个队列来存放异步任务中的待执行事件，也就是消息队列，在JavaScript引擎解析并执行代码的时候先看栈中是否还有同步任务，如果有的话就执行任务（出栈），执行完毕之后栈被清空，然后再读取消息队列中的待处理任务，将这些任务中的回调函数压入栈中等待处理，然后引擎又再执行栈中的任务。JavaScript引擎从消息队列中读取任务是不断循环的，每次栈被清空之后都会在消息队列中读取到新的任务，如果没有新的任务栈就是空的，这时就会等待新任务的执行，因为每次引擎总是从消息队列到调用栈再到消息队列，所以这就叫作事件循环（EventLoop）

#### 宏任务和微任务

因为JavaScript引擎是单线程的，同一时间只能处理同一件事情。在事件循环中，异步事件并不会放到当前任务的执行队列中，而是放入一个回调队列中，当前的任务队列执行结束之后，JavaScript引擎会检查回调队列中的任务是否已经执行完，如果没有就把第一个任务放入执行队列执行。每次执行栈执行的代码都是一个宏任务，包括每次从事件队列中获取的第一个事件回调，每一个宏任务都会从头到尾执行完毕，不会执行其他。微任务我们可以理解为当前执行栈执行的任务在执行完毕之后立即执行的一个任务，在每个执行栈中的任务开始之前，引擎会先查看在微任务队列中是否存在微任务等待执行，如果存在就先执行队列中的微任务，直到微任务队列清空，再执行执行栈中的任务。总的来说，宏任务就是我们一般的异步任务，比如事件回调，setTimeout，而微任务类似于插队，我不等你的宏任务全部执行完才执行，而是你当前执行的任务执行完就要立马执行微任务，比如promise等

