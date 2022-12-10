---
layout: post
title: WebAssembly 中的多线程
categories: [ webassembly ]
---


我们总会在某个时候用到多线程的，无论是文件读写，异或是 socket I/O ，总之在某个时候，我们肯定是要用到这个玩意儿的。那么 WebAssembly 对这玩意儿的支持如何呢？我们先来欣赏一下这一片源代码：


## 出发！

```c++
#include <iostream>
#include <thread>


void count(void) {
    for (int i = 1; i <= 3; i++) {
        std::cout << "Counting " << i << std::endl;
    }
}


int main(void) {
    for (int i = 0; i < 3; i++) {
        std::thread worker(count);
        worker.detach();
    }
    return 0;
}
```

不难看出，这就是平平无奇的数数。好像的确如此。那我们现在马上编译 + 运行吧！

![错了……](/assets/uh_oh.png)

这个奇怪的什么 abort 是啥玩意儿？

## 提出问题

那问题就来了。为什么会有这个奇怪的问题呢？结果其实就是 emscripten 默认是没有打开多线程支持的。如果要带着多线程支持去编译，那编译的时候必须加上 `-s USE_PTHREADS=1` 这个条件才行。来到了这里，就必须要说说 emscripten 多线程的方法了。因为说到底，Webassembly 只是一个字节码的解析机，所以 emscripten 所做的多线程不是真正的多线程；[在 POSIX Thread API 的下面，他的实现方法其实是套用了 Web Worker 。](https://kripken.github.io/emscripten-site/docs/porting/pthreads.html) 也就是说，真正的、是不是究竟是多线程，还是由你的浏览器的实现方法说了算的。

废话结束，我们再编译一次：

```bash
em++ threads/main.cpp -o threads/threads.html -s EXTRA_EXPORTED_RUNTIME_METHODS="[ 'ccall', 'cwrap' ]" -s USE_PTHREADS=1
```

好了！测试开始！

![又错了……](/assets/hmm.png)

……嘛意思弟弟？


## 再次提出问题
不过其实这次的错误已经挺明显了，[上网一找就能搜到对应的 issue。](https://github.com/kripken/emscripten/issues/7581)或者说如果你有点开上一个链接的话，并且认真看过一下的话，也能发现这一句话：

> 2018 年 1 月份打后，因为 [Spectre](https://meltdownattack.com/) 大部分浏览器都关掉了 SharedArrayBuffer 功能。直到他被修好之前，这个功能都会默认关闭。但是你随时都可以通过在浏览器中通过设置对应的 flag 来打开。

<sup>注意: 当你看到这个日志的时候，我不知道这漏洞是不是已经被修好了。如果修好了就评论一句呗，我好把它去掉。</sup>

浏览器的设置不难打开，如果你忘了我可以给你：
- [Firefox 入口](about:config): `about:config`
- [Chrome 入口](about:flags): `about:flags`

浏览器不给加载本地内容的话，直接复制链接到新窗口粘贴就可以了。

打开完了之后，这里以我的 Chromium 为例，搜索 WebAssembly:

![在这里](/assets/there_you_go.png)

Firefox 的选项应该也很接近吧。把它打开就完事了。你可能需要重启浏览器，但最后这个应该是你看到的效果：

![OK 了](/assets/horray.png)

## 题内话
最后，说多一句题内话，编译的时候，可以增加多一个选项

```bash
-s PTHREAD_POOL_SIZE=X
```

其中 X 是你想一开始就预留好的线程。这样做的话，可以在创建线程的时候省点时间。**注意，这个选项不是允许的最大线程数，而是预分配多少条线程！** 如果 X = -1 的话，浏览器会弹窗问你要预留多少条，debug 起来方便。


## 测试！
如果你按着我的做法去做的话，或者你就是想看看效果的话，我这里可以给你做个输出的示范（我用了 `s PTHREAD_POOL_SIZE=3`，你可能在输出那看到他预留了三条线程的消息）：

<a href="javascript:_start()">开始！</a>

<p id="output" style="font-family: sourcecode;"></p>
<script>
    let output = document.getElementById("output")

    var Module = {
        print: function(what) {
            output.innerHTML += what + "<br />"
        }
    }
</script>
<script src="/assets/threads.js"></script>


## 题外话
再说多一句题外话，没想到这么简单的东西都能说这么一大堆，我决定以后这些简单的东西就说少一点了……

还有就是，今天考完线代了，从简单的一批到难得一批，感觉有点凉。。。

最后的最后，还要说一句，**测试完就把那 flag 给关了吧……毕竟别人默认关闭不是没有理由的……**
