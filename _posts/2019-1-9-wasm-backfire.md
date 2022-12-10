---
layout: post
title: WebAssembly 反着用回 Javascript
categories: [ webassembly ]
---

前两天我们讲了一下各种 Wasm 的基本操作，以及 Javascript 中怎么样方便的调用 wasm 中存在的函数。那么你有没有想过，在 C/C++ 中有没有可能可以调用 Javascript 呢？答案是可以的，而且方法有很多种：

## `EM_JS`
直接在 C/C++ 的源码中加入 `EM_JS` 可以在 C/C++ 中直接申明一个用 Javascript 写的函数：

```c
EM_JS(void, alerts, (), {
    alert("hai")
    alert("bai")
});


int main(void) {
    alerts();
    return 0;
}
```

很明显可以看出来，上例中 `EM_JS` 就是在申明一个 Javascript 的函数：`function alerts() { ... }` 。其中第一个参数是返回值，第二个参数是函数名，第三个参数是参数列表，第四个参数就是用 Javascript 写的函数的实现部分了。这样一来，在 C/C++ 中调用 Javascript 里的东西可谓是超级方便，可以当作是一个外部库之类的。

你还可以参考多一个例子：

```c
EM_JS(int, sum, (x, y), {
    return x + y
});
```

这个很明显就是求和了。

## `EM_ASM`
有的时候，可能因为心态炸了，或者是贼懒，你压根就不想声明一个函数然后再调用他。这么烦干嘛呢？很幸运，我们还有 `EM_ASM`:

```c
#include <stdio.h>

int main(void) {
    printf("hello world in C/C++!\n");
    EM_ASM({
        console.log(UTF8ToString($0))
    }, "hello world in javascript and the argument is even passed from C/C++!");
    return 0;
}
```

不难看出，`EM_ASM` 在写完要执行的那段代码之后，后面是可以跟无限个参数的。而执行的那一段是可以看到这些参数的，从 $0 开始，然后是 $1, $2, ... 自己用类比推理法吧。。。

总而言之，`EM_ASM` 可以通过这种方式来达成 C/C++/Javascript ~~滥交~~混交。通过这些方法，你既可以有的时候 C/C++，也可以有的时候 Javascript ，也可以在 Javascript 中调用 C 中调用 Javascript 中调用 C 中调用 Javascript 中调用 C 中调用 Javascript 中调用 C 中调用 Javascript 中调用 C 中调用 Javascript 中调用 C 中调用 Javascript 中调用 C 中调用 Javascript 中调用 C 中调用 Javascript 中调用 C 中调用 Javascript 中调用 C 中调用 Javascript 中调用 C 中调用 Javascript 了！！！

## `emscripten_run_script`
忘记了还有一种方法了。。。就是这个，`emscripten_run_script`。这个几乎是一个完全本土化的 C 函数了，他接受的参数是一个 char * 。也就是说你可以这样用：

```c
int main(void) {
    emscripten_run_script("console.log('hello world')");
    return 0;
}
```

通过这种方式，可以动态的执行 javascript 代码，因为是直接调用 js 中的 eval() 方法的。但是注意，如果你编译的时候增加了参数 `-s DYNAMIC_EXECUTION=0` ，那么这个函数将会不可用🚫🙅🈲️。（话说不可用的 emoji 可真多。。。）


# 提起兴趣！！！
经过了连续三天的 Wasm 日志！我决定用我自己写的一些小东西来提起一下大家的兴趣（里面核心功能都由 C/C++ 实现！）。。

## 斐波拉契数列
<a href="javascript:oneMore()">算多一个</a>
<p id="fibonacci"></p>

## 旋转的方块
<div id="picture" style="width: 100px; height: 100px; background-color: orange; margin-left: 1em;">
    &nbsp;
</div>

## 字符串 => 二进制码
<input id="input">
<a href="javascript:accepted()">转换</a>
<p id="output"></p>

---
你随时可以进入检索来看看我实现的方法。


# *玩得开心！*

<script>
    let picture = document.getElementById("picture")
    let output = document.getElementById("output")
    let fibonacci = document.getElementById("fibonacci")
    let input = document.getElementById("input")
    let frame, binarify, fib;

    function onRuntimeInitialized() {
        function animation() {
            requestAnimationFrame(animation)
            frame()
        }
        animation()
    }


    function oneMore() {
        fibonacci.innerHTML = fib()
    }


    function accepted() {
        binarify(input.value)
    }


    var Module = {
        print: function(text) {
            output.innerHTML += "<br />" + text
        },

        onRuntimeInitialized: function() {
            frame = Module.cwrap("frame", "void", [])
            binarify = Module.cwrap("binarify", "void", [ "string" ])
            fib = Module.cwrap("fib", "string", [])

            onRuntimeInitialized()
        },
    }
</script>
<script src="/assets/jff.js"></script>
