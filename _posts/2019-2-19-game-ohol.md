---
layout: post
title: 游戏推荐，One Hour One Life!
categories: [ game ]
---


![One Hour One Life!](/assets/ohol.jpg)

又到了过一会儿就推荐一次游戏的时间了！这次我要推的游戏叫做 One Hour One Life! 这是一个由 [Jason Rohrer](http://hcsoftware.sourceforge.net/jason-rohrer/) 创作的关于文明和养育的游戏。但实际上，这个游戏十分硬核，特别是开局的时候，因为万事开头难嘛。

## 游戏哲学

在这个游戏里面，每一个加入玩家一出生可能有两种形态：婴儿和 [夏娃](https://en.wikipedia.org/wiki/Eve) 。婴儿一开始呱呱坠地，一点用都没有，他们的母亲则要担当起养育他们的责任。而夏娃则一开始就是一个 14 岁的少女，很快就可以生孩子了。一般来说，一个人最多活到 60 岁，因此游戏的名字就叫 One Hour One Life 。

在游戏里面，你会发现你能做的东西很少。一开始你很容易饿死，并且一次只能说一个字。随着你慢慢长大，你能单独去做的事情越来越多，搜集食物、编织篮子、加盖房屋，诸如此类。

然而，只凭借你自己的力量在 60 分钟之内是根本不可能可以做成这么多的事情的。这就是集体存在的意义了。你的妈妈是一个玩家，你的女儿也是玩家，你的叔叔也是玩家，每一个人都是玩家。在游戏里面，你们可以分工，有的去开田，有的去找食物，有的去拉木头，有的照顾婴儿。只有这样，文明才会蓬勃发展。

但是，无论你做什么，你都会在 60 分钟之内死去。所以你做了这么多，意义是什么呢？

意义就是为了后代着想。虽然你死了，但是你对村落/城市作出的贡献将会一直在那，可能你盖好了面包房，这样你的后代就能用了；你生前拿着你爷爷传下来的斧子，死了之后传给自己的儿子，一点问题都没有。后代得益于前人做的贡献，不必再走弯路：不用走老远去找醋栗；不用自己再编织衣服；不用自己再摘香蕉；不用自己再烧碗。后代就可以把自己的一生投入到更高级的创作去。这就是一个微缩的人类。

## 游戏开始 

![开波阶段](/assets/start.jpg)

游戏一开始就是这样的：你在一片荒郊野岭，啥也没有。接下来，你就要开始建设自己的文明了。保证香火不断，然后再开始发展。

当然，你也可能会有幸运的时候。你可能是一个住在大城市的母亲的儿子/女儿。这种情况下，你要做的东西就截然不同了。但是我就不剧透这么多了，因为我没这么好运气过…… 

## 那么，在哪里可以买得到呢？

Steam 上有: 

<iframe src="https://store.steampowered.com/widget/595690/" frameborder="0" width="646" height="190"></iframe>

官网能买: 

- [官网](http://onehouronelife.com/)
- [购买页面](https://sites.fastspring.com/jasonrohrer/instant/onehouronelife?referrer=)

## Steam 只有 Windows 版本的。我是 macOS 用户，但我又没有信用卡。咋办？

诶哟，这不是跟我一毛一样的问题嘛？你真好运气！[这游戏在 github 上开源](https://github.com/jasonrohrer/OneLife) 。你只要在同一个目录 clone 下这三件东西就可以开始 build 了：[OneLife](https://github.com/jasonrohrer/OneLife)，[OneLifeData7](https://github.com/jasonrohrer/OneLifeData7)，和 [minorGems](https://github.com/jasonrohrer/minorGems) 。为了方便，我直接这么写把：

```bash
git clone https://github.com/jasonrohrer/OneLife
git clone https://github.com/jasonrohrer/OneLifeData7
git clone https://github.com/jasonrohrer/minorGems
```

保证自己已经装了 `SDL` 和 `SDL2` 和 `ImageMagick`: 

```bash
brew install sdl sdl2 imagemagick 
```

要知道更多的编译条件，可以看 [这里](http://onehouronelife.com/compileNotes.php) 。

OK 了以后，我们可以: 

```bash
cd OneLife
./configure # 然后选 mac 
cd gameSource
make 
```

这样就大概可以了。但你还是有可能会经历找不到 SDL 库的问题，没关系，看看自己的 SDL 该咋链接：

```bash
pkg-config --libs --cflags sdl2
pkg-config --libs --cflags sdl
```

然后改改 Makefile 里面的内容就行了。确切的来说，是改第 24 行里面的 

```
-framework SDL 
```

这一边。

build 好之后，你就可以 cd 回去，然后打包：

```bash
cd ../build
./makeDistributionMacOSX OneLife macOS /Library/Frameworks/SDL2.framework
cd mac
cd OneLife_OneLife
open OneLife_OneLife.app/
```

然后就恭喜你！你玩上了！！

当然，如果你懒得看上面那些的话，（因为我就是这样的），我自己 build 了一份，你可以在这 [下载](/assets/OneLife_build.zip) (注：2019-4-17，由于这文件着实太大，所以我删掉了）。


## 账号密码在哪注册？

打开了之后，你还要一个自己的账号/密码。这个账号密码呢，就是要买了游戏才能有的。它能让你进这个游戏的官服，但是不代表这个游戏的私服你进不了……对吧？游戏的源码是有服务器的源代码的，就在 `server` 目录下。`./configure` 一下，`make` 一下（这里要把 `values.h` 的 include 换成 `float.h` ，因为很明显这个头文件名字早变了，不然过不了编译），这不就是自己的私服了嘛，对不。

## 但是连接的时候说版本不一样，咋办？

在 `server` 或者是你的服务器二进制目录下：

```bash
echo "客户端说的版本" > serverCodeVersionNumber.txt
```

## 还是登陆失败，咋办？

把登陆那的要求去掉就行了。不过这样不就是在教你玩盗版游戏了嘛，诶嘿嘿……我可不是那样的人……自己摸索吧！
