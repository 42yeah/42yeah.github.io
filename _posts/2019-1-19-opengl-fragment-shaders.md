---
layout: post
title: OpenGL 中的着色器
categories: [ cg ]
---

![FIRE!](/assets/fire.png)

## 前言

还记得我们 [昨天]({{ page.previous.url }}) 发的那一篇吗？在里面，我们实现了粒子的效果。但是有了 OpenGL 的着色器（因为我今天是来吹他的），一切皆有可能。就像我们的标题图那样，用着色器的力量，来把那个什么都不像的粒子系统做成一堆火吧！

## 火！

其实这个的道理并不难，只要在生成粒子那里把粒子可能生成的方向改为：

```c++
points[furthest].alive = true;
points[furthest].position = glm::vec3(0.0f, 0.0f, 0.0f);
points[furthest].direction = glm::vec3((distrib(device) - 0.5f), // 范围变小了，因为范围太大会很丑
                               distrib(device), // 这里有变化，只生成 0~1.0
                               0.0f);
```

因为很明显，火焰是不会往下走的，只会往上，并且没有见过肥的一批的火。

而后，为了防止粒子走得太慢，我们要把这个方向标准化一下（因为如果的确走得太慢，看起来火焰会一味往上升，不会往两边走）:

```c++
points[furthest].direction = glm::normalize(points[furthest].direction);
```

然后我们去到每一帧刷新那里：

```c++
if (living) {
    points[i].position += points[i].direction * delta;

    glBufferSubData(GL_ARRAY_BUFFER, (i * 3) * sizeof(glm::vec3), sizeof(glm::vec3), &points[i].position);
}
```

<sub>每一帧刷新原本长这样</sub>

但是根据我们上面改的，这个时候火星虽然不会往下串，但还是会往 0~180 度周围瞎飞（假设我在 0, 0 处摆着个圆规，你就能 get 到了）。

这和正宗的火一点儿都不符合，正宗的火应该往上串才对啊。所以我们在更新那里放多一句：

```c++
if (living) {
    points[i].position += points[i].direction * delta;
    points[i].direction.y += 1.0 * delta;

    glBufferSubData(GL_ARRAY_BUFFER, (i * 3) * sizeof(glm::vec3), sizeof(glm::vec3), &points[i].position);
}
```

这就相当于给火星加了一个向上的重力。

![没事，我们还没说到着色器呢](/assets/going_up.png)

虽然我们发现他的确是往上了，但是你坑谁呢……这火明显还是在往两边飘啊！因此在这时，我们就要开始想象真正的火了：

![By Andrikkos - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=33765289](/assets/Candle-light-animated.gif)

我们可以看到，火是从底盘扩散没错，但是到了差不多中间的时候，火是会朝着中间靠回来的。因此，我们也要这么做：

```c++
if (living) {
    points[i].position += points[i].direction * delta;
    points[i].direction.y += 1.0 * delta;

    float dist = points[i].position.x;
    points[i].direction.x -= dist * 10 * delta;
    glBufferSubData(GL_ARRAY_BUFFER, (i * 3) * sizeof(glm::vec3), sizeof(glm::vec3), &points[i].position);
}
```

在这里，我是在看火离中央有多远，然后把火的方向掰过去。&times;10 是为了加强这种效果，因为火星越靠近中间的时候，他的 `dist` 会越低。这个时候 &times;10 就可以起到继续往中间掰的效果了。与此同时，在更远方的火会更快的回来。

这样一做出来，就很像火苗了。但是还有一个问题，就是为啥现在他连颜色都一样了？其实的确是的，因为我已经写好了着色器了，懒得该回去昨天那样子了……按昨天的着色器，他应该长这样:

![呕。。。](/assets/ugh.png)

我们发现这样是真的丑……很明显，着色器在美观里面占了贼大的一部分。那我们今天就来看看进阶的着色器吧！没看基础的请自行前往 [LearnOpenGL](https://learnopengl.com) 。

## 着色器！

自从有了着色器以来，除了在源码那 `glPointSize`，我们也可以从着色器那调整点的大小了。要开启这个功能，我们只要打多一句 `glEnable(GL_PROGRAM_POINT_SIZE)` 就 OK 了。为什么要这个效果呢？因为我们想要升到高处的火星更小:

```glsl
gl_PointSize = max(50.0 * (-length(aPos.xy) * 0.9 + 1.01), 0.0);
```

可以看到，虽然看不懂多少东西，但我在点的大小和点的位置之间形成了一到关系。那究竟是什么关系呢？我们就来看看。

- 首先，我们求到了 aPos.xy 的长度，其实也就是 aPos 离中央点的距离。我们把它设成 $x$ 。
- 剩下的就是关于这条 $x$ 的一元一次方程了:

![对不起，但我真的没钱用 Wolfram](/assets/function.png)

可以看出来，离中点为 0 的时候点是最大的（也是原始尺寸，50）。然后离得越远，点就越小。运行之后发现现在我们的 “火” 长这样：

![差不多了！](/assets/close.png)

是不是感觉有、像了？接下来我们只要把火上色就行了。上色就要用到片元着色器了。我们可以知道，火的中央是亮白的，靠的越远（也就是温度变低），火会变成暖暖的红色。我们把对应的焰色变化理解为一个颜色变化的过程，就发现他有点像 RGB 分别的衰减:

![没钱只能截图](/assets/plot.png)

其中蓝色线为我们的 R，红色线为我们的 G，绿色线为我们的 B ……

可以发现，离得最近的时候，RGB 都很大，这时候显亮白色；然后离得越远，衰减的最快的是绿色，其次是蓝色。他们衰减完了以后，还有淡淡的红色，完美的仿造出了我们要的火的效果。所以我们马上套用:

```glsl
color = vec4(pow(1.2 - len, 1), pow(1.2 - len, 3), pow(1.0 - len, 2), 1.0);
```

然后，运行！我们已经看得到，这就是开头的效果了……漂亮吧？

## 额外内容！

但是就发这一些东西太没意思了……我在那还学了点东西，我决定也用在这个火上边。用的什么呢？其实用的就是 [`Uniform buffer object`](https://www.khronos.org/opengl/wiki/Uniform_Buffer_Object) 。假设你有 10000 个着色器。如果你每一个着色器都要在渲染的时候 `for` 一次来 `glUniformxx` 的话，那该多捞啊！不仅捞，而且浪费资源:

```c++
for (int i = 0; i < shaders.size() /* 10000 个 */; i++) {
    glUniformMatrix4fv(glGetUniformLocation(shaders[i], "view"), 1, false, value_ptr(view));
    glUniformMatrix4fv(glGetUniformLocation(shaders[i], "perspective"), 1, false, value_ptr(perspective));
}
```

本来显卡跟 CPU 通讯起来的资源并不便宜。你在 10000 个循环里边，每一个循环你都用了 4 次……这样是何等的浪费资源啊……他们本来就是一样的东西。那这个时候，我们能不能搞一个类似全局变量一样的东西，然后每一个着色器程序都能直接用呢？答案是 OK 的，他就叫做 UBO 。他是怎么用的呢？其实很简单:

- 创建一个 UBO 对象:
    ```c++
    GLuint UBO;
    glGenBuffers(1, &UBO);
    glBindBuffer(GL_UNIFORM_BUFFER, UBO);
    ```
- 往里面装填数据(我们就放一个 float 吧):
    ```c++
    float base[] = { 2.0f };
    glBufferData(GL_UNIFORM_BUFFER, sizeof(base), base, GL_STATIC_DRAW);
    ```
- 把他绑到对应的位置:
    ```c++
    glBindBufferBase(GL_UNIFORM_BUFFER, 0, UBO);
    ```
    - 这里的 0 叫做 “绑点” 。OpenGL 支持很多很多个绑点，也就是说同时可以有很多个 UBO 在运作。我们这里就是在把 UBO 绑去 0。
- 回到着色器的源码那里，加一句
    ```glsl
    layout (std140) uniform Settings {
        float base;
    };
    ```
    - 这里的 layout (std140) 证明我这里是在读取 Uniform Buffer Object 的内存。 Settings 这个名字是我瞎取的，其实是想让里面的 base 可以对火的颜色进行影响，所以就取了 Settings:
    ```glsl
    color = vec4(pow(1.2 - len, base), pow(1.2 - len, base + 2), pow(1.0 - len, base + 1), 1.0);
    ```
    在这里这样用只是测试一哈效果而已……
- 回到 program 那里，把 “Settings” 绑去 “0” ，这样子着色器看 Settings 里边的数据的时候，就会找对应的绑点 0 里面绑着有什么数据。然后发现咦挺巧的，因为我们在 “0” 这个绑点正好绑了个 UBO。 但是注意这里 __每一个着色器都要绑定一次__ :
```c++
glUniformBlockBinding(prog, glGetUniformBlockIndex(prog, "Settings"), 0);
```

运行一下程序，你就会发现火黑的更快了。然后问题就来了: 尽管内存之间的确可以通讯了，但是 OpenGL 是怎么知道偏移为 0 的地方的数据正好对应了 `float base` 呢？换句话说，OpenGL 是怎么知道 UBO 里边的数据的结构是怎样的呢？

实际上，他的确不知道。或者说他是最后一秒才知道的，因为我们是在这里告诉他的：

```glsl
layout (std140) uniform Settings {
    float base;
};
```

我们都知道一个 float 是 4 个字节大。他此时就会把我们的 UBO 看作这样的一个结构体，一个空格为四个字节:

`[ ]`

没错，就是一个四字节的东西。如果我们往 `Settings` 里面放多一个 float ，他就会看成这样（虽然这样会导致溢出，但我就是想举个例子:

`[ ][ ]`

然后在读取的时候会按着顺序读出来。有点像网络通讯的 “包” 的概念……这几天正好看了一堆……

但是！OpenGL 并不是全部都是这么处理的。譬如说，如果我们的 `Settings` 长这样:

```glsl
layout (std140) uniform Settings {
    float base;
    vec3 extra;
    float hai;
};
```

虽然这里是 `vec3` ，但实际上 OpenGL 会把它的大小当作 `vec4` 处理！因此这里的实际内存会变成这样:

`[b][ ex ][h]`

所以谨记住这些偏移的要求，不然 OpenGL 会读出很奇怪的东西。再具体的话可以参照 LearnOpenGL 给出来的表:


| 种类                  | 规则                                                                                                                                       |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| 标量 (int, bool 之类) | 4个字节                                                                                                                                    |
| 向量                  | 大小必须为 2 倍或者 4 倍。也就是说 vec1 (如果有的话) 大小会按照 vec2 算， vec3 会按照 vec4 的大小去算。                                    |
| 数组                  | 所有数组的大小都会按照四倍的余数来补。也就是说，如果一个数组长度为 1，那 OpenGL 还是会当他长度为 4。如果长度为 5， OpenGL 会按他长度为 8。 |
| 矩阵                  | 会被当作一个贼长的向量数组来算。里边的每一个向量会被当作一个 vec4。                                                                        |
| 结构体                | 里边的元素跟上面的规则一样，但是整个结构体最后的大小会按照 vec4 的大小的余数来补，也就是说结构体的大小必须能被 vec4 的大小整除。           |

示例代码:

```c++
layout (std140) uniform ExampleBlock
{
                     // 基础大小        // 偏移量
    float value;     // 4               // 0
    vec3 vector;     // 16              // 16  (必须是 16 的倍数所以 4->16)
    mat4 matrix;     // 16              // 32  (第 0 列)
                     // 16              // 48  (第 1 列)
                     // 16              // 64  (第 2 列)
                     // 16              // 80  (第 3 列)
    float values[3]; // 16              // 96  (values[0])
                     // 16              // 112 (values[1])
                     // 16              // 128 (values[2])
    bool boolean;    // 4               // 144
    int integer;     // 4               // 148
};
```

然后……就没了。白白！
