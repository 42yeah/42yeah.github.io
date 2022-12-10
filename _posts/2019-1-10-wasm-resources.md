---
layout: post
title: WebAssembly 外部资源
categories: [ webassembly ]
---


写了好几天了，我也觉得如果有看官的话，大概也看腻了。今天我也不是特别想写什么了，我就发一下我学 WebAssembly 过程的外部资源吧。实际上，说到这里，就大概是我会的所有跟 WebAssembly 的知识了。

- [mbasso/awesome-wasm](https://github.com/mbasso/awesome-wasm) - 这里有大量的资源。说句题外话，[Awesome](https://github.com/sindresorhus/awesome) 系列的东西都是真心不错的。之后的资源有的是跟这里面的重复的。
- [chai2010/awesome-wasm-zh](https://github.com/chai2010/awesome-wasm-zh) - 这里有大量的跟 Wasm 有关的中文资源，但我自己没怎么看过。。
- [EMScripten 官网](https://kripken.github.io/emscripten-site/)
- [WebAssembly 官网](https://webassembly.org)
- [WebAssembly 初步](https://blog.openbloc.fr/webassembly-first-steps/) 还是一篇教程。这个教程挺中肯的，适合学过一点 Javascript 的人，因为用到了 webpack 之流。
- [WebAssembly - 缺失的教程(2016)](https://medium.com/@MadsSejersen/webassembly-the-missing-tutorial-95f8580b08ba) - 注意，这个教程是打算深挖 Wasm 的 —— 从根源解释 Wasm。Wasm，从根本来说，就是个字节码机。说到字节码机，~~就想到了在取西经的时候，师傅念的紧箍咒跟字节码机的本质有那么一点像。今年下半年，中美合拍的西游记即将正式开机，我将继续扮演美猴王孙悟空，弘扬社会正能量，文体两开花~~**有一本很好的书，我也推荐大🔥去看看：[Game Programming Patterns](https://gameprogrammingpatterns.com)。它囊括了很多软件设计模式，既包括了原汁原味的 GOF 软件模式，也有作者自己很独到的、可以用在游戏里面的见解，当然也包括了怎么实现字节码机。没打广告，这书网上阅读是免费的！！！！！而且现在就有人找我打广告的话，那人怕是想不开吧。。。**
- [asm.js](http://asmjs.org) - `asm.js` 更像是一种 Javascript 中字节码机的实现，而不是像浏览器默认支持的一样，在原生的层面上跑字节码；尽管是这样， `asm.js` 仍然比高级的 Javascript 代码快多了。也就是说，如果浏览器不支持原生的 WebAssembly, `asm.js` 可以作为一个 Fallback。
- [Big Web App? Compile It!](http://kripken.github.io/mloc_emscripten_talk) - 实际上这个 slide 就在 [asm.js](http://asmjs.org) 中，我特地单出来是认为他挺有启发性的。里面有很多东西都把我给洗脑了。
- [emscripten-qt](http://vps2.etotheipiplusone.com:30176/redmine/projects/emscripten-qt/wiki/Demos/) - 这个是要来激发学习的热情的。这个网站把一大堆 Qt 应用给**直接搬了上 WebAssembly**，譬如 ********_Kate_********！！！！

大概就是这么多了。其实大量的资料你都可以在第一个链接或者 [EMScripten 官网](https://kripken.github.io/emscripten-site/) 找到。

WebAssembly 的未来充满希望。引用 [chai2010/awesome-wasm-zh](https://github.com/chai2010/awesome-wasm-zh) 引用的一个 Ending 定律：

> 有那么一天，能用 WemAssembly 实现的东西，都会用 WebAssembly 实现。

你还能怀疑什么？**Kate** 都被移植上去了。WebAssembly 甚至支持原生的 OpenGL 代码，还有 SDL。但是你要自己试过才知道。所以，快点打开一个代码编辑器，

# **To far and beyond 吧！**
