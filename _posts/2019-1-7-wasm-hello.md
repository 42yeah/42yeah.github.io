---
layout: post
title: "你好，WebAssembly!"
categories: [ webassembly ]
---

WebAssembly 是一个很强大的东西，具体可以参照 [WebAssembly.org](https://webassembly.org) 给出的说明：

> WebAssembly (缩写 Wasm) 是一个二进制的，给一个基于堆栈的虚拟机的，指令格式。Wasm 设计出来是为了成为一个高端语言（C/C++/Rust) 的可移植性目标，并且开放这些语言在客户端网页或者服务端程序上的部署。


## 准备

WebAssembly 最常用的编译器好像就是 [EMScripten](https://emscripten.org) 。这个东西可以把 C/C++ 直接翻译成 Wasm ，然后放在浏览器上跑。因此，如果你准备开搞，你需要先去[这里](http://kripken.github.io/emscripten-site/docs/getting_started/downloads.html) 下载一份 emsdk。如果把那边的英文翻译过来，是这样的：

```bash
# 拿到 emsdk 的库
git clone https://github.com/juj/emsdk.git

# 进入那个目录
cd emsdk

# 抓取最新版本
./emsdk install latest

# 启用最新版本
./emsdk activate latest

# 改一下环境变量
source ./emsdk_env.sh
```

**注意，如果你是 Windows 的话，把 `./emsdk` 换成 `emsdk` ，把 `source ./emsdk_env.sh` 换成 `emsdk_env.bat` 就行了。搞定完之后，他大！你现在可以在 `cmd` 上跑 `emcc`/`em++` 了！！**

## 你好世界！

实际上，要写一份远要比想象中的简单。在这里要先特殊说明一下，因为 WebAssembly 好像还不支持本地的 `file://` 协议。所以，我提议你在本地开一个服务器，并且服务器要就要可以 reload 的。我会推荐这个：

`yarn global add simple-autoreload-server`

或者

`npm install -g simple-autoreload-server`

跟 `http-server` 不同的是，这个会不断的自动重新加载。由于你的浏览器会为了省流量而进行缓存，而你在开发的阶段网页啊，wasm啊什么的变化都会很大，所以我推荐可以自动重新加载的服务器。在你喜欢的地方新建一个空目录，然后运行：

`autoreload-server .`

就可以了。

到目前为止，你装上了 emsdk，可能还装上或者没装上我推荐的一个网页服务器。都没关系，因为我本来也不是很熟悉这些（港真，熟悉还写博客干嘛？）。但是接下来，进入这个文件夹，新建一个文件，你就可以开始尝试写一个自己的 hello world 了：

### main.c
```c
#include <stdio.h>


int main(void) {
    printf("Hello world, wasm!\n");
    return 0;
}
```

名字叫什么都行，你自己喜欢。写好了之后，你就可以编译他了：

`emcc -s WASM=1 -o main.html main.c`

这里的 `WASM=1` 这个设置是在让 emcc 编译出 wasm 来。如果你设置成 `WASM=0`，那么就会编译成纯 Javascript。好像不加也行。但是总之！！编译好了之后，你就可以直接打开 [这个](http://127.0.0.1:8080/main.html) 然后看到你的成果了！！（如果你一直什么都跟着我做的话！）

<small>然后。。就写这么多了？感觉我还是不大会写博客啊。。。</small>
