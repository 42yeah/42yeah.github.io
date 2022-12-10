---
layout: post
title: "WebAssembly 续篇"
categories: [ webassembly ]
---

我们上回说到了 [WebAssembly](https://webassembly.org) 世界中的你好世界，然后现在我们知道了，用近乎 native 的速度在浏览器上跑东西的确是可能的。但是你可能同时也发现了一点，那就是：

**他默认的界面也太丑了吧。。。**

![丑恶的界面](/assets/ugly_interface.png)

总之，我相信在将来的某一天，你会讨厌这个画面的。于是，这就给我们带出来了另外一个问题：**怎么样直接在自己写的页面里面调用 wasm 里头的方法呢？**

往回看，一开始编译好的时候，你会发现他生成了三个东西，每个都有自己不同的后缀，分别是：
- `xxx.wasm`
- `xxx.js`
- `xxx.html`

实际上，`xxx.js` 跟 `xxx.wasm` 才是这个的核心，编译好的 html 只不过是一个壳而已。你甚至可以找到这个壳的位置，他就在 `[emcc安装路径]/[某个版本号]/src/shell.html` 中。如果你对这个默认界面不满意，你是可以在编译 html 的时候更换模版的，但我不准备说这个了，上网找找你就知道了。回到正题，也就是`xxx.wasm` 跟 `xxx.js` 才是核心，对吧？所以也就是说，我完全可以新建一个我自己喜欢的页面，然后引用他们了。实际上这非常简单，而且虽然很简单，但我还是想说一下这个步骤，不然文章看起来挺短的。

_注意：打后， `xxx` 全部用 `main` 替换，反正就是指你编译好的那一堆文件。因为 `xxx` 看起来太别扭了。 `main` 是我上一条推中用的名字，你可以去看看。_

废话少说，我们要怎么做呢？

### 新建一个空网页
新建一个文件，就叫 `index.html` 吧。

### 往里面填你自己喜欢的内容
你在里面想加什么都行。

### 加上这句引用：
`<script src="main.js"></script>`

接下来，我们直接打开我们的 [本地服务器](http://127.0.0.1:8080) ，就可以看到一个上面是你的内容的网页了。然后进入检索/开发者模式的控制台，你就可以发现 main 会被自动执行，并且 hello world 会输出在你的控制台中。真好！再也不用看那个丑的一批的界面了。

### 引出了新的问题
但是，这样又有了新的问题了。既然我都已经可以用自己的 html 了，是不是也就意味着我能够什么时候调用 wasm 的方法都行呢？因为有的时候我们的确不想他一开始就运行一个 main()，输出句话，然后退出。有的时候我们会想等待用户的输入，然后再执行相应的 wasm 代码。

在 emcc 之中，你编译好的方法一般会存在于 `window.Module.asm` 当中:
![补全](/assets/autocomplete.png)

你可以看到，`malloc`, `free`, `main` 之类的以前面加了条下划线的形式存在于里面。其实你还可以尝试调用一下：
`_main()`

你就可以发现，的确是可以执行的。

### 除了 main 以外的方法呢？
但是，对于 main 以外的， main 又没有调用的函数， `emcc` 可不是这样对待的。他会把这些全部当成死代码，然后在编译的时候一并删掉。那怎么保持它们存活呢？其实很简单，这里以一个 `int addOne(int what)` 为例：

```c
int EMSCRIPTEN_KEEPALIVE addOne(int what) {
    return what + 1;
}
```

可以看得到，唯一不同的就是多了一个 `EMSCRIPTEN_KEEPALIVE` 在函数签名那。这个宏可以防止 emcc/em++ 在编译的时候删掉这个函数。你也可以尝试编译一下，然后完了以后打开 [本地服务器](http://127.0.0.1:8080) ，并且输入 `_addOne(100)`。正常来说，应该会输出 101 的，对吧？也就是说，你现在掌握了一半怎么样在 Javascript 中调用 wasm 的内容了！

### 一半？
为什么说是一半呢？因为有的函数是不能通过这种方式调用的：
```c
void EMSCRIPTEN_KEEPALIVE print(char *what) {
    printf("%s\n", what);
}
```
如果通过上面说的那种方式调用，也就是 `_print("hello world")` ，是不行的。如果要调用这一类跟指针或者之类的有关的函数，我们必须要用 `cwrap`。

`cwrap` 是什么呢？其实就是 emscripten 给的一个方法，他可以把原生函数包装成 javascript 函数。怎么做到的呢？以上面的 `void EMSCRIPTEN_KEEPALIVE print(char *what)` 为例，其实就是这样：

`let print = Module.cwrap("print", "void", [ "string" ])`

不是太难理解，这里有三个参数：第一个是函数的名字，第二个是函数的返回值，第三个是一个列表，里面是每个参数的类型。但是还有一个问题，就是必须在编译的时候告诉编译器启用 cwrap，Javascript 才可以调用 `Module.cwrap`，不然 `Module.cwrap` 就会是 `undefined` 了。这里要加上的参数是（还是以 `main.c` 作为文件）：

`emcc main.c -o main.html -s EXTRA_EXPORTED_RUNTIME_METHODS="[ 'ccall', 'cwrap' ]"`

这样一来，编译的时候就会知道要支持 cwrap 了。也就是说，现在我们已经可以自由的在 Javascript 中调用 Wasm 的函数了！

### 后记
有的时候你想在窗体加载好的时候运行某段代码。但如果在这个时候在 `window.onload` 之类直接调用的话，他会告诉你他还没准备好所以没办法调用。这个时候的解决方案很简单，因为 `EMScripten` 加载好的时候是有自己的事件的，你只要在你的某个 javascript 文件中写一个处理函数就可以了：

```javascript
// 这段代码会在 Wasm 准备好之后马上被调用
function onRuntimeInitialized() {
    // ...
}

Module["onRuntimeInitialized"] = onRuntimeInitialized
```

<small>就是这样了。玩得愉快！</small>


### 后后记 - Errata
我也是刚学，我觉得上面的东西可能会存在错误。如果你发现了错误，请及时纠正我。你可以在评论区说我哪错了，直接喷我，或者发到我的 [邮箱](mailto:potion@live.cn) 都行。
