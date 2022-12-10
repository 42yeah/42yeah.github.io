---
layout: post
title: 粒子系统！
categories: [ cg ]
---

我已经大概有很久很久没有看过 OpenGL 了吧……所以我决定今天看一哈，于是我恢复了我龟速的进度，也就是 [这里](https://learnopengl.com/Advanced-OpenGL/Advanced-Data) 。于是，咱们来总结一下我看了的内容。

OpenGL 的 [VBO](https://www.khronos.org/opengl/wiki/Buffer_Object) 是很灵活的。从我的个人理解来说，它就是一条储存在 GPU 里边的数组。所以，我们不仅可以在一开始的时候直接用 [`glBufferData`](https://www.khronos.org/opengl/wiki/GLAPI/glBufferData) 来初始化他，还可以用很多很多的方法！这里是官方文档给出的：

- [`glBufferData`](https://www.khronos.org/opengl/wiki/GLAPI/glBufferData) 可以初始化一个 VBO ，具体的参数是:
    - `target`: 可以从这些里边选一个: `GL_ARRAY_BUFFER, GL_ATOMIC_COUNTER_BUFFER, GL_COPY_READ_BUFFER, GL_COPY_WRITE_BUFFER, GL_DRAW_INDIRECT_BUFFER, GL_DISPATCH_INDIRECT_BUFFER, GL_ELEMENT_ARRAY_BUFFER, GL_PIXEL_PACK_BUFFER, GL_PIXEL_UNPACK_BUFFER, GL_QUERY_BUFFER, GL_SHADER_STORAGE_BUFFER, GL_TEXTURE_BUFFER, GL_TRANSFORM_FEEDBACK_BUFFER, ` 或者 `GL_UNIFORM_BUFFER`。通常都选择 `GL_ARRAY_BUFFER`……吧？
    - `size`: 第三个参数的大小
    - `data`: 可以是指向一个数组的指针，也可以是 `NULL/nullptr` 。如果是后边那个的话，会给你初始化一个 `size` 大的空 VBO(里边的值全为 0)。
    - `usage`: 可以从这些里边选一个: `GL_STREAM_DRAW, GL_STREAM_READ, GL_STREAM_COPY, GL_STATIC_DRAW, GL_STATIC_READ, GL_STATIC_COPY, GL_DYNAMIC_DRAW, GL_DYNAMIC_READ, ` 或者 `GL_DYNAMIC_COPY`。别的我不太清楚，但是如果选了 `GL_STATIC_DRAW`，那每一次 `glBufferData` 都会在显卡那边重新初始化 VBO 一次，导致如果重复调用的话会效率奇低。（虽然如果不需要的话那这个挺好的……）
- [`glBufferStorage`](https://www.khronos.org/opengl/wiki/GLAPI/glBufferStorage) 也可以初始化一个 VBO。但和上面那个不一样的是，这个东西初始化过之后，里面的内容再也不能用 __这个和上面那个__ 再初始化一次了。参数很接近，但因为我没用到，这里就不给出来了。你可以上网查，或者你看到的上一条链接。

……对，其实就两种，所以没有很多很多种方法。但是没关系！这不还是初始化好了吗？但是，这时别以为里边的内容就再也不能更改了！即使是通过 [`glBufferStorage`](https://www.khronos.org/opengl/wiki/GLAPI/glBufferStorage) 来初始化的，里面的内容也是可以更改的。这个感觉就像在 C++ 里边来了一句 `char * const buf` 一样吧……指针不能再改了，但不代表里边的内容不能改:

- [`glMapBufferRange`](https://www.khronos.org/opengl/wiki/GLAPI/glMapBufferRange) 跟 [`glMapBuffer`](https://www.khronos.org/opengl/wiki/GLAPI/glMapBuffer) 都是很好的方法。现在我们假设你已经有了一个初始化完毕的 VBO ，并且已经绑定好了。这个时候你只需要 `void *ptr = glMapBuffer(GL_ARRAY_BUFFER, GL_WRITE_ONLY)` 就能把对应的内存给映射出来，接下来你就可以好像操作一块正常内存一样操作这片区间了。但在修改完之后欧，记住要 `glUnmapBuffer(GL_ARRAY_BUFFER)` 就行了。在 Unmap 之后，指针会变成无效的，所以……也不需要 free 了。
- [`glBufferSubData`](https://www.khronos.org/opengl/wiki/GLAPI/glBufferSubData) 是另外一种更改里面的内容的方法，其实我觉得可能就是这里第一条的一个封装（？）虽然跟 `glBufferData` 样子差不多，但实际上在特定情况下作用是完全不一样的，譬如说 `glBufferSubData` 必须要用在一条已经初始化好的 VBO 上。官方文档那边说: “看你怎么用，可能会特别浪费性能。” 但我还是用了，感觉一点也不慌。

于是现在我们知道了有什么初始化 VBO 的数组，还有怎么修改一个已经初始化过的 VBO 了。我们发现了 VBO 很灵活，那实际上，可不可以根据 `glMapBuffer` 或者 `glBufferSubData` 来进行每一桢对 VBO 的修改呢？答案是可以的！而且实际上，这个很可能就是 Instancing 出来之前大家对粒子系统的实现（毕竟一帧一次 glBufferData 太浪费内存了）。所以说干就干，马上开写！

![粒子系统！](/assets/particles.png)

经过了一会儿的脑热和半个小时左右的 debug ，终于写好了……话说 OpenGL debug 是真的费时间……有的时候什么都看不到，就看到一个黑屏还是很绝望的……有的时候看到的不是黑屏，显示效果却很迷，又一时不知道为什么，就更绝望了……

我的粒子系统其实就是一开始先 book 好 1000 个点:

```c++
// generate points
std::vector<Point> points;
for (int i = 0; i < MAX_PARTICLES; i++) {
    points.push_back(Point());
    points[i].alive = false;
}
```

然后进入主循环，对于每一个点都看一次，如果对应的点是 alive 的，我们则根据他的运动方向更新他。如果不 alive ，我们就生成他。但是一帧只生成一个点，避免爆破式增长（虽然程序运行一开始还是爆破式增长了……）：

```c++
// 生成一个点, 如果点满了就杀一个，然后更新其他的
int furthest = 0; // 离得最远的索引
bool spacious = false; // 是不是还有空位
int i;
for (i = 0; i < points.size(); i++) {
    // 如果这个点活着，并且这个点比最远的还要离得更远，并且我们已经没有更多点可以用了，
    // 那他就是我们的新的最远的点了（准备把这个点删掉）
    if (points[i].alive && !spacious &&
        fabs(points[i].position.x) > fabs(points[furthest].position.x) &&
        fabs(points[i].position.y) > fabs(points[furthest].position.y)) {
        furthest = i;
    }

    // 如果活着，我们就根据这个点的运动方向，移动一下这个点
    if (living) {
        points[i].position += points[i].direction * delta;
        glBufferSubData(GL_ARRAY_BUFFER, (i * 3) * sizeof(glm::vec3), sizeof(glm::vec3), &points[i].position);
    }

    // 如果这个点没活着，挺好，那之后大概也没有活着的点了（点满1000个的时候，因为每一帧都是生成一个，销毁一个，所有的点都应该永远活着
    if (!points[i].alive) {
        spacious = true;
        furthest = i; // 我们假设他是离得最远的
        break;
    }
}
```

最后，还记得上面那串代码的 furthest 吗？这个东西记录的索引要不就是最远，也就是 __准备被删然后在原位重新生成__，要不就是 __准备生成__ 的。所以实际上，我们完全可以把这个当成 “我们准备在这里创建一个新的粒子” 的点。怪我没命名好，可以叫 `gen` 什么的:

```c++
points[furthest].alive = true;
points[furthest].position = glm::vec3(0.0f, 0.0f, 0.0f);
points[furthest].direction = glm::vec3((distrib(device) - 0.5f) * 2,
                               (distrib(device) - 0.5f) * 2,
                               0.0f); // 随机生成个新的方向，给点走
```

这样一来，一个粒子系统就完工啦！

![会动！](/assets/animated.gif)

这里是完整的源码，注释会少一点（因为有些注释是我写这个的时候加的）：


## main.cpp
```c++
#include <iostream>
#include "../include/glad/glad.h"
#include <GLFW/glfw3.h>
#include <fstream>
#include <sstream>
#include <vector>
#include <random>
#include <glm/glm.hpp>

#include "utility.hpp"


#define MAX_PARTICLES 1000


struct Point {
    glm::vec3 position;
    glm::vec3 direction;
    bool alive;
};


int alive(std::vector<Point> array) {
    int count = 0;

    for (int i = 0; i < array.size(); i++) {
        if (array[i].alive) { count++; }
    }
    return count;
}


int main(int argc, const char * argv[]) {
    // init glfw
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);

    GLFWwindow *window = glfwCreateWindow(800, 600, "buffer", nullptr, nullptr);
    glfwMakeContextCurrent(window);

    gladLoadGL();


    // compile programs!
    GLuint prog = program("shaders/vertex.glsl", "shaders/fragment.glsl");

    glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
    glPointSize(20.0f);


    // generate points
    std::vector<Point> points;
    for (int i = 0; i < MAX_PARTICLES; i++) {
        points.push_back(Point());
        points[i].alive = false;
    }

    // get random machine up & running!
    std::random_device device;
    std::uniform_real_distribution<float> distrib;


    GLuint VAO, VBO;
    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);
    glBindVertexArray(VAO);
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, MAX_PARTICLES * sizeof(glm::vec3), nullptr, GL_DYNAMIC_DRAW);

    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(float) * 3, nullptr);


    float past = glfwGetTime();
    while (!glfwWindowShouldClose(window)) {
        float now = glfwGetTime();
        float delta = now - past;
        past = now;

        glfwPollEvents();

        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

        glUseProgram(prog);
        glBindVertexArray(VAO);

        int living = alive(points);
        glDrawArrays(GL_POINTS, 0, living);

        // gen one particles, kill one if too much, and move others
        int furthest = 0;
        bool spacious = false;
        int i;
        for (i = 0; i < points.size(); i++) {
            if (points[i].alive && !spacious &&
                fabs(points[i].position.x) > fabs(points[furthest].position.x) &&
                fabs(points[i].position.y) > fabs(points[furthest].position.y)) {
                furthest = i;
            }

            if (living) {
                points[i].position += points[i].direction * delta;
                glBufferSubData(GL_ARRAY_BUFFER, (i * 3) * sizeof(glm::vec3), sizeof(glm::vec3), &points[i].position);
            }

            if (!points[i].alive) {
                spacious = true;
                furthest = i;
                break;
            }
        }
        points[furthest].alive = true;
        points[furthest].position = glm::vec3(0.0f, 0.0f, 0.0f);
        points[furthest].direction = glm::vec3((distrib(device) - 0.5f) * 2,
                                       (distrib(device) - 0.5f) * 2,
                                       0.0f);

        glfwSwapBuffers(window);
    }

    return 0;
}
```

那就这样啦！
