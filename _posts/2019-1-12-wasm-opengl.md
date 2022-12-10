---
layout: post
title: WebAssembly 中的 OpenGL(ES?)
categories: [ webassembly, cg ]
---


**注意，看这个可能需要有一定的 OpenGL/WebGL 基础。**

OpenGL 是一个计算机图形学的库。更确切的说（防刚），是一套 specification 。通过 OpenGL 给的各种接口你可以绘制出各种炫酷玩意儿。对这个有兴趣的可以来 [这里](https://learnopengl.com) 学一下。强烈推荐！！

WebAssembly 可以和 Javascript 互相通讯，进而调整 DOM 中的内容。所以，很明显，用 C/C++ 写 OpenGL/ES 代码，然后把内容显示在网页上，再也不是不可能了！！！

## 马上开始！！
我们现在要用多一个头文件了。除了 `emscripten.h` 之外，我们还要 `#include` 多一个 [`emscripten/html5.h`](http://kripken.github.io/emscripten-site/docs/api_reference/html5.h) ，这样我们才有 WebGL 的各种接口。废话少说，我们可以马上看一下我们的 `include` 模版：

```c
#include <emscripten.h>
#include <GLES3/gl2.h>
#include <EGL/egl.h>
#include <emscripten/html5.h>
```

- 第一条 include 还是原来的配方，还是熟悉的味道。
- 第二条我们 include 了 GLES2 的头文件。
- 第三条我们 include 了 EGL。
- 第四条我们 include 了上文提及的 `emscripten/html5.h`。

有了这一堆头文件，我们至少可以画出一个三角形了。所以我们的下一步是。。。

## 创建上下文！！
如果有一点 OpenGL 家族的基础的话，就会知道 **在创建 context 之前，画什么都是没用的。** 因此，我们要先创建一个 Context ，接下来才能愉快的玩耍。

```c
int main(void) {
  EmscriptenWebGLContextAttributes attrs;
  attrs.explicitSwapControl = 0;
  attrs.depth = 1;
  attrs.stencil = 1;
  attrs.antialias = 1;
  attrs.majorVersion = 2;
  attrs.minorVersion = 0;

  EMSCRIPTEN_WEBGL_CONTEXT_HANDLE context = emscripten_webgl_create_context(0, &attrs);

  return 0;
}
```

我不喜欢 emscripten 的命名的一个地方就是名字都长的跟串儿似的。看看别人 OpenGL 命名的多好，都是 `gl啥啥啥` 的。

跑题了。咱可以看得见，首先我们搞了个 attrs ，然后给里面的一堆东西赋了个值。看起来贼多对不？没事，我们一个个看（里面有一部分可能你已经知道是什么了）：
- `attrs.explicitSwapControl = 0`: 如果知道 canvas ，你就会知道在 canvas 中，他更新一桢是 “隐式更新” 的。啥意思呢？就是他会猜你这一桢画好了没，如果画好了，就直接交换缓冲。我们在这里设成了 0，也就是就让他这么做；当然我们也可以设成 1。如果设置成了 1 的话，那交换缓冲这个步骤就需要我们手动完成：[每一桢绘制好之后加多一句 `emscripten_webgl_commit_frame()`](https://github.com/kripken/emscripten/pull/5581/files#diff-16eca2b70acff1fd624285ab9390a9c7R1954) 。
- `attrs.depth = 1`: 跟 [`glEnable(GL_DEPTH_TEST)`](https://learnopengl.com/Advanced-OpenGL/Depth-testing) 大概一个意思。
- `attrs.stencil = 1`: 跟 [`glEnable(GL_STENCIL_TEST)`](https://learnopengl.com/Advanced-OpenGL/Stencil-testing) 大概一个意思。
- `attrs.antialias = 1`: 跟 [`glEnable(GL_MULTISAMPLE)`](https://learnopengl.com/Advanced-OpenGL/Anti-Aliasing) 大概一个意思，就是多重采样嘛。
- `attrs.majorVersion` 和 `attrs.minorVersion`: GLES 的版本。其实为什么我要用 2.0 呢？不是有 GLES3 吗？的确有，但是我试过了，不行。。。我 include 了 GLES3/gl3.h ，然后编译了，创建不了 context 。2 倒是直接 OK 了。很气。

接下来我们往下看，就看到创建 context 的步骤了:

```c
EMSCRIPTEN_WEBGL_CONTEXT_HANDLE context = emscripten_webgl_create_context(0, &attrs);
```

我们可以看到，命名仍然是长的一批。但是没关系，这里大概可以看得懂了吧：我们通过 `emscripten_webgl_create_context` 创建了一个上下文。

在这个创建上下文的函数里面，有两个参数。第一个参数我用了 0 ，[但其实这里可以填任意 canvas 的 ID; 如果为 0 ，就会用在 Javascript 里面 **预先由你** 定义好的变量：`Module.canvas` ](http://kripken.github.io/emscripten-site/docs/api_reference/html5.h#c.emscripten_webgl_create_context)。创建完毕之后的 context ，其实就是个 int ，只是被 `typedef` 了一下而已。他应该返回一个正数，如果返回的是 0 ，那就是意味着创建失败了；如果返回的是负数，那你就可以通过把它当成 [`EMSCRIPTEN_RESULT`](http://kripken.github.io/emscripten-site/docs/api_reference/html5.h#c.EMSCRIPTEN_RESULT) 然后 switch 这堆东西来看看是什么地方出错了。

当然咯，创建好之后还要把这个 context 设置成当前的 context 。我们只需要这样：

```c
emscripten_webgl_make_context_current(context);
```

就可以了。

## 测试！
要测试你是不是成功了非常简单，清一下屏幕就可以了：

```c
glClearColor(0.3f, 0.2f, 0.1f, 1.0f);
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
```

然后。。。我发现我好像一直都忘了说编译！！

## 编译！
编译带 GL 的规则跟平时的略有不同，我直接上命令了，方便大家：

```bash
emcc main.c -o main.js -s WASM=1 -s EXTRA_EXPORTED_RUNTIME_METHODS="[ 'ccall', 'cwrap' ]" -s FULL_ES2=1 -s USE_WEBGL2=1
```

之前的那一堆都差不多是一样的；我加上 `EXTRA_EXPORTED_RUNTIME_METHODS` 只是为了防止不时之需，不一定需要。但看看后面那两句：

`-s FULL_ES2=1 -s USE_WEBGL2=1`

这两句才是这编译能过的主要原因。我们可以看得出我们这里在用 GLES2/WebGL2 。然后按下回车，他大！我们编译好啦！

## 回到测试！
在浏览器里打开，我们应该能够看见一个屎黄色的矩形：

![屎黄色](/assets/shitty.png)

## 成功！！！！
这就证明我们成功了！！为了再吸引一下你们的兴趣，给你看看我之后写好的三角形（来到这，诸位学过的应该都已经会了吧）:

对了，说多一句，因为有点怕这个三角形会卡爆你的浏览器（真的会吗？？？），所以我弄了个按钮，点了才会开始主循环哦：

对了，再说多一句，点了之后 Javascript 控制台可能会抛出个异常，没事，他只是在模拟真正的主循环而已：

<a href="javascript:_beginMainLoop()">开始！</a>
<canvas width="480px" height="320px" style="max-width: 100%;" id="canvas">
<p id="message"></p>

<script>
  var Module = {
    canvas: document.getElementById("canvas")
  }
</script>
<script src="/assets/triangle.js"></script>
