---
layout: post
title: GLSL 的各种着色器效果
categories: [ cg ]
---

![从 SR 来的 Map!](/SomethingRandom/map.png)

## GLSL 很牛逼

首先，我要说的是，GLSL 很牛逼。我知道大家都知道，但是今天我就来给大家展示一哈我为了我那个作业做的着色器（们），其中有很大一部分都是从 [ShaderToy](https://www.shadertoy.com/) 上参考的！

## Vignette 

Vignette 我不知道咋翻译，他的中文是小插图？这也太奇怪了吧…… 但是总而言之，我们是可以知道 Vignette 的作用是可以让远离中心的地方（屏幕边缘）变黑，然后整个看起来就有点像 70 年代的电影一样的东西:

![vignette](/assets/vignette.png)

这个着色器一般在静物，或者是复古的六七十年代的东西的时候渲染起来效果很好。他的原理很简单，就是远离中心的就变黑：

```glsl
vec2 uv = 1.0 - uv.yx;
float vig = uv.x * uv.y * 15.0; // 15.0 是 intensity
vig = pow(vig, 0.2);

gl_FragColor = vec4(pixel * vig, 1.0);
```

其中，`intensity` 的作用就是让结果曝光，如果太大会过度曝光，而太小又会太暗。在 `intensity` 的下一行的 0.2 可以说是扩大范围，如果这个数字越大，暗的范围就越大。最后，用输出的像素和 vignette 值相乘就可以了。

## ScanLine 

ScanLine 就是扫描线。在老机器里面，扫描线经常是清晰可见的。现在由于科技呀，他进步了，扫描线就没了。但是假如还是为了这个美感的话，我们很容易用现代的，数学的方法把以前的 __缺陷__ 给渲染出来。

![scanline!](/assets/scanline.png)

实现 ScanLine 的方法有很多种。我这里用我自个儿的，其实不大高效，因为用了 if 。

```glsl
vec2 realUV = vec2(uv.x * resolution.x, uv.y * resolution.y); // gl_FragCoord
pixel.rgb -= (
    mod(realUV.y, 2.0) <= 1.0 ? 
    0.1 :
    0.0
);

gl_FragColor = vec4(pixel, 1.0);
```

这个贼明显，就是看看 realUV (gl_FragCoord) 的 y 值对 2 取余。如果是 1.0 的话，就直接把对应的像素哪一行 __变暗__ 。

假如你喜欢的话，可以把 time 加上去，这样扫描线就会一直往下（上）移动：

```glsl
vec2 realUV = vec2(uv.x * resolution.x, uv.y * resolution.y); // gl_FragCoord
pixel.rgb -= (
    mod(realUV.y + ceil(time * <移速>), 2.0) <= 1.0 ? 
    0.1 :
    0.0
);

gl_FragColor = vec4(pixel, 1.0);
```

你想扫描线移多快，就自个儿调移速吧。我觉得 20.0 还不错的。

实现扫描线的方法还有很多种。我找到的有 [这种](https://www.shadertoy.com/view/XdXXD4) ，[这种](https://www.shadertoy.com/view/ldXGW4) ，还有 [这种是我参考的做法](https://www.shadertoy.com/view/XdsGD8) 。

## Pixelate 

Pixelate 是像素化的意思。我 ShaderToy 上没找到，自个儿想的。如果有的话可以告诉我一哈，三克油！

![像素化！！](/assets/pixelate.png)

我的做法其实很简单。我把屏幕分成比分辨率更小的小块，然后判断要渲染的点在哪个小块里头，对应采样那个小块的左上角的那个像素。（也就是强行下降分辨率）:

```glsl
vec2 realUV = vec2(uv.x * resolution.x, uv.y * resolution.y); // gl_FragCoord
vec2 fakeUV = floor(realUV / 8.0) * 8.0;
vec2 uv = fakeUV / resolution.xy;
vec4 pixel = texture2D(texture, uv);
```

可以看到，我们就是把真实坐标除了 8.0 以后，舍掉了一切的小数点，然后把他恢复成了原来的坐标。帅不？

## Frosted Glass

还记得 Windows7 Aero 的酷炫毛玻璃效果吗？现在咱们也能大概实现它的效果啦！看回来我们的头图：

![从 SR 来的 Map!](/SomethingRandom/map.png)

看到了吗？下面的对话框那里就是毛玻璃的效果。

其实毛玻璃的效果不难，就是瞎取样。这个来自 [这里](https://www.shadertoy.com/view/MtsSWs) 。我们来看看：

```glsl
float rand(vec2 uv) {
    float a = dot(uv, vec2(92.0, 80.0));
    float b = dot(uv, vec2(41.0, 62.0));
    float x = (sin(a) + cos(b)) * 51.0;
    return fract(x);
}

void main() {
    // ... 拿到 uv
    vec2 rnd = vec2(rand(uv), rand(uv));
    uv += rnd * 0.05;
    gl_FragColor = texture2D(texture, uv);
}
```

`rand()` 可以说是一个伪随机函数吧？输入 uv ，然后通过 uv 和两个奇怪的向量点乘，并且把他们的正弦值和余弦值相加，然后放大 51 倍（这个可以改），最后舍弃掉整数部分，返回小数点后就可以了。回到 `main` 可以发现，结果被进一步减小了 - 为了不过分采样（就是离得太远）。这样就能让采样稍稍偏离原来的位置了！

当然，除此之外，其实你可以发现，假如不乘那个 51 ，然后点乘的那两个向量比较小的话 —— 就可以呈现出晶体的效果了：

![晶体](/assets/crystal.png)

帅不帅？快点儿去自己试试吧！

## 没了

上头就是我用的所有的着色器了。其实要模仿旧的 CRT 显示屏的话，这里还有：

- [Meta CRT](https://www.shadertoy.com/view/4dlyWX)
- [CRT Effect](https://www.shadertoy.com/view/4sf3Dr)
- [Fixing Pixel Art](https://www.shadertoy.com/view/4scSR8)

玩得开心！
