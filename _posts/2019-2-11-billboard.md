---
layout: post
title: OpenGL 中的广告牌
categories: [ cg ]
---


搞图形学搞到某一个阶段，你就会开始用到模型。但是，当你太特么的懒了，根本不想学建模，但是又想做好玩的东西的时候咋办捏？

这时候就轮到 [广告牌](http://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/billboards/) 来搭救了！好好看看，你有没有兴趣实现以下的效果：

![性感广告牌](/assets/southpine.png)

完全不需要建模，一样能搞到跟真的一样。


## 废话少说，马上开波！

实则来说，广告牌不是很难；但是我搜了一下，发现实现广告牌的方法有非常多种，并不限制于一种。我在试的头崩额裂之后，终于试出了一些简单易懂外加可行的方法了！

## 难的

_以下参考 [opengl-tutorial](http://www.opengl-tutorial.org/intermediate-tutorials/billboards-particles/billboards/)。_

我们直接用那里的 "The 3D Way" :

![旋转的带血条的立方体](/assets/spin.gif)

实际上，实现这个的方法不难，虽然我没懂。我真的挺想懂的，可能我老了……有人可以明了一点儿的跟我说说嘛……感激不尽……

按照他的方法，他是这样说的：

> 你可以把这个问题当作生成一个 model 矩阵，虽然事实上比这个简单多了。咱们这里的主要主意是广告牌的每个角落都位于中心位置，他们都被摄像机的**上向量**和**右向量**移位了:

![他的方法，我没看懂他怎么移的](/assets/billboard1.png)

> 问题在于，我们只知道广告牌的世界坐标，所以很明显我们需要相机的上/右向量的世界坐标。

> 在相机坐标内，相机的上向量是 `(0, 1, 0)` 。要进入到世界空间里头的话，只要把这个乘以那个把相机空间转换为世界空间的矩阵就行了。通俗点儿来说，就是 view 矩阵的逆。

> 这情况下可以直接写成这样：

```c++
CameraRight_worldspace = {ViewMatrix[0][0], ViewMatrix[1][0], ViewMatrix[2][0]}
CameraUp_worldspace = {ViewMatrix[0][1], ViewMatrix[1][1], ViewMatrix[2][1]}
```

> 一旦我们有这个了，那么算上最后顶点的位置就好办了：

```glsl
vec3 vertexPosition_worldspace =
    particleCenter_worldspace
    + CameraRight_worldspace * squareVertices.x * BillboardSize.x
    + CameraUp_worldspace * squareVertices.y * BillboardSize.y;
```

- particleCenter\_worldspace 就是广告牌的中点位置。他应该是一个 `uniform vec3` 。
- CameraRight\_worldspace 就是相机的右向量。
- squareVertices 就是网格坐标。
- BillboardSize 就是在你世界单位里面的广告牌的大小，譬如 `vec2(2.0, 1.0)` 。当然咯，是多大的话是你自己说了算的。

我们拿到这个之后最后的 `gl_Position` 就是: 

```glsl
gl_Position = perspec * view * vertexPosition_worldspace; 
```

这样就有我们想要的广告牌了。简单不？(我：不简单……)

![效果图](/assets/pinch.gif)

## 缺点

为啥我把这个管叫做难的呢？这是因为我没懂他里面的意思……虽然我连下面我即将说的简单的的意思也没懂，但起码比这个难的的容易理解一点点……

并且，这个有他的缺点。就是如果你只想要顺着 x 轴旋转的话，咋办？譬如说，你想画一堆的树。当你在飞起来的时候，这些树不应该看起来像倒了一样吧：

![立着的树](/assets/billboard_trees.jpg)

要是我飞高了，这些树为了向着摄像头，全部都跟倒了一样……那我要这广告牌干哈？

在这里，opengl-tutorial 是 **这样** 解释的: 

---

## Solution #4 : Vertical rotation only

Some systems model faraway trees and lamps as billboards. But you really, really don’t want your tree to be bent : it MUST be vertical. So you need an hybrid system that rotates only around one axis.

Well, this one **is left as an exercise to the reader !**

---

WTF? An exercise? 我连上面的都没懂……

因此，为了解决这个问题，我上网搜了各种关键词，终于找到了……

## 简单的方法！

_以下参考 [lighthouse3d](http://www.lighthouse3d.com/opengl/billboarding/billboardingtut.pdf)。_

首先我们通过他的截图和源码，可以知道这是一个**很老**的教程，但无论如何，这个比别的容易懂很多:

![雪人](/assets/snowman.png)

但无论如何，马上开波！

首先，回想一下我们的 MVP 矩阵。通常的时候，我们是这样变换我们的坐标的：

```glsl
gl_Position = perspec * view * model * vec4(aPos, 1.0);
```

其中，perspec<sub>tive</sub> 只是透视罢了；也就是说，所有的坐标变换实际上都在 `view * model` 处早已处理完毕，包括移位，旋转，放大，缩小，哔哩吧啦。因此，我们好好看看这个矩阵：

![矩阵](/assets/billboard2.png)

红框的三行就是现在相对于相机的位置和朝向了。而 3x3 的篮框子矩阵上则是缩放和旋转等操作。于是，我们只要把篮框变成一个单位向量，就能 **非常有效** 的把缩放和旋转之类的完全逆掉了，等于渲染出来的东西将会永远朝向咱们：

![牛逼](/assets/brilliant.png)

也就是说，我们只要把 view * model 计算出来，然后: 

```c++
for (int row = 0; row < 3; row ++) {
    for (int col = 0; col < 3; col++) {
        modelView[row][col] = (row == col) ? 1 : 0;
    }
}
```

就能达到和刚刚困难的那个的一样的广告牌效果了。

## 那树咋办？

我们回到这个矩阵。

![矩阵](/assets/billboard2.png)

实际上，蓝色框框内的每一列都是有他的特殊含义的。实际上: 
- 第一列记录的是右向量。
- 第二列记录的是上向量。（我好像懂了难的那里为啥要这样提取了）
- 第三列记录的是要看向啥地方。（也就是 `lookAt` 向量） 

于是乎，我们只要保留上向量不变的，其他列都按单位矩阵的形式来改的话，东西渲染出来的时候因为没有旋转，所以当然还是朝向摄像头；但是当向上/下看的时候，广告牌就不会动了。也就是说，现在广告牌只会在玩家朝左/右看的时候才会旋转了:

![真的牛逼，卧槽](/assets/BRILLIAANT.png)

而这就是结果了！

![Southpine!](/assets/billboard3.png)

全文完！

## 或者还没完？

当然，实际上，我刚刚说的并不是真的广告牌；按照 [lighthouse3d](http://www.lighthouse3d.com/) 的说法，这些方法充其量只是 “作弊”。

为啥呢？因为，广告牌是要在任何时候都 **朝向** 你，才叫做广告牌。这里有一个很鲜明的，并不是朝向你的例子：

![作弊!](/assets/cheating.png)

如果是广告牌，根据他们应该 **朝向你** 的规定，因为这里的人他们的位置不一样，他们如果都要朝向你的话，他们的方向很明显不应该一致。

因此，以上所说的所有方法都只能算是作弊。

但没关系，[这里](http://www.lighthouse3d.com/opengl/billboarding/billboardingtut.pdf) 给出来的解决方案着实完美，但由于时间关系以及我的 “我都已经大概实现这个功能了随便啦” 的想法，我就没往后看了。有兴趣的可以自个儿去看。祝你好运！