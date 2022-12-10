---
layout: post
title: THREE.js 初入门
categories: [ cg, net ]
---

> 给一个男人一个框架，他就能要来做出一个游戏！给一个男人写框架的方法，嗯……我也不知道……他应该是第三次在写框架了吧？

所以，我们就来到了 [THREE.js](http://threejs.org) 的世界了！THREE.js 缤纷、多彩、绚丽。他把一切的数学基础都搞定了并且把实现的细节隐藏了起来。包括但不限于光照、摄像头、诸如此类。下面是一些用 THREE.js 做出来的东西：

![看到 Transmission 了嘛？](/assets/threejs.png)

所以在这个帖子里，咱们就来学一些特别基础的内容吧！就从渲染一个立方体开始！

首先，我们初始化一个 `WebGLRenderer`，然后把它加到 DOM 里头去: 

```js
let renderer = new THREE.WebGLRenderer();
renderer.setSize(500, 500);
document.body.apppendChild(renderer.domElement);
```

就是这么简单！这个就是我们 THREE.js 的渲染器了！接下来，我们就可以初始化 Camera 了:

```js
let canvas = renderer.domElement;
let cam = new THREE.PerspectiveCamera(
    45.0, // fov
    canvas.width / canvas.height, // aspectRatio
    0.01, // zNear
    100.0 // zFar
);
cam.position.z = 1.0;
```

还是这么简单！一个透视摄像头就弄好了！不用一点点数学，比 glm 还方便啊……

在摄像头和渲染器都弄好了之后，我们就要开始做一个世界了 - 也就是 `Scene` 。摄像头负责看这个世界，渲染器负责把摄像头看到的东西渲染出来 。是不是感觉特别简单？实际上，`Scene` 本身的代码也一点儿都不复杂！

```js
let scene = new THREE.Scene();

let box = new THREE.BoxGeometry(0.2, 0.2, 0.2);
let material = new THREE.MeshLambertMaterial({color: 0xfd59d7});
let cube = new THREE.Mesh(box, material);
scene.add(cube);

let light = new THREE.PointLight(0xffff00);
light.position.set(10, 0, 25);
scene.add(light);
```

可以看得见: 
- 在第一段里，我们初始化了一个场景。
- 然后在第二段里，我们往 `scene` 里加了一个 `cube` 。`cube` 是什么呢？他就是一个由几何 `box` 和材料 `material` 构成的网格了。在这可以看得出来，THREE.js 高度抽象了这些概念，你自己是压根不需要去实现他的。
- 然后最后，在第三段里，我们加了一个点光源在场景里头。就这样就没了。

所以在弄好一切的东西之后，现在我们就该把这些东西画出来啦！

```js
function render() {
    requestAnimationFrame(render);
    cam.updateProjectionMatrix();
    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;
    renderer.render(scene, cam);
}

render();
```

一个立方体的代码，外加光照，只需要 27 行以内就可以实现了！卧槽！这不用？？

这里是一个小小的测试：

<div id="canvasHolder"></div>

<script src="https://threejs.org/build/three.min.js"></script>
<script>
(function() {
    let canvas;
    let scene, cam, renderer, cube;
    
    function render() {
        requestAnimationFrame(render);
        cam.updateProjectionMatrix();
        cube.rotation.x += 0.1;
        cube.rotation.y += 0.1;
        renderer.render(scene, cam);
    }
    
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(500, 500);
    canvas = renderer.domElement;
    let holder = document.getElementById('canvasHolder');
    holder.appendChild(canvas);
    scene = new THREE.Scene();
    cam = new THREE.PerspectiveCamera(
        45.0,
        canvas.width / canvas.height,
        0.01,
        100.0
    );
    cam.position.z = 1.0;
        
    let geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    let material = new THREE.MeshLambertMaterial({color: 0xfd59d7});
    cube = new THREE.Mesh(geo, material);
    scene.add(cube);
        
    let light = new THREE.PointLight(0xffff00);
    light.position.set(10, 0, 25);
    scene.add(light);
        
    render();
}())
</script>
