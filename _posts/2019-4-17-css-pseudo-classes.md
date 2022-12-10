---
title: CSS 中的伪 class
layout: post
categories: [ net ]
---

在 CSS 里头，有一系列的 伪 class。他们不是真正的 class，只是在某元素满足特定的条件的时候才会触发的 class。所以今天，就让我们一起看一看比较简单的，并且我懂的，并且 （可能） 利用的比较多的吧！

## :active

`active` 会在一切被激活（点中）的 `<a>` 元素上才有效。

```html
<style>
  .orangify-on-click {
    color: white;
  }
    
  .orangify-on-click:active {
    color: orange;
  }
</style>
<a href="javascript:void(0);" class="orangify-on-click">点我就会变成橙色</a>
```

效果长这样（大概已经被本站的 CSS 污染成按钮了）：

<style>
  .orangify-on-click {
    color: white;
  }
  
  .orangify-on-click:active {
    color: orange;
  }
</style>
<a href="javascript:void(0);" class="orangify-on-click">点我就会变成橙色</a>

---

## :only-child

`only-child` 将会选择某个节点，**当且仅当** 他的父节点只有他一个儿子的时候。

```html
<style>
  .alone:only-child {
    color: purple;  
  }
</style>
<div>
  <p class="alone">我是独生子（没第二个 p 了），所以我是紫色的</p>
</div>
<div>
  <p class="alone">我不是</p>
  <p class="alone">因为我有俩</p>
</div>
```

效果长这样：

<style>
  .alone:only-child {
    color: purple;  
  }
</style>
<div>
  <p class="alone">我是独生子（没第二个 p 了），所以我是紫色的</p>
</div>
<div>
  <p class="alone">我不是</p>
  <p class="alone">因为我有俩</p>
</div>

---

## :only-of-type

`only-of-type` 将会选择某个节点，**当且仅当** 他的父节点 **只有他个唯一一个这个类型的儿子** 的时候。

```html
<style>
  .unique:only-of-type {
    color: purple;  
  }
</style>
<div>
  <p class="unique">我是这里唯一的 p</p>
  <div class="unique">我是这里唯一的 div</div>
</div>
<div>
  <p class="unique">我不是</p>
  <p class="unique">因为咱有俩</p>
</div>
```

效果长这样：

<style>
  .unique:only-of-type {
    color: purple;  
  }
</style>
<div>
  <p class="unique">我是这里唯一的 p</p>
  <div class="unique">我是这里唯一的 div</div>
</div>
<div>
  <p class="unique">我不是</p>
  <p class="unique">因为咱有俩</p>
</div>

---

## :optional, :required

`:optional` 会选择各种类型的没有 `required` 的 `<input>`。`:required` 就……嗯……你知道了 :

```html
<style>
  .nope-not-really:optional {
    background-color: blue;
    color: white;
  }
</style>
<div style="margin-bottom: 10px;">
  <input required value="填满我吧" class="nope-not-really">
</div>
<div>
  <input value="不一定要填我的" class="nope-not-really">
</div>
``` 

效果：

<style>
  .nope-not-really:optional {
    background-color: blue;
    color: white;
  }
</style>
<div style="margin-bottom: 10px;">
  <input required value="填满我吧" class="nope-not-really">
</div>
<div style="margin-bottom: 10px;">
  <input value="不一定要填我的" class="nope-not-really">
</div>

---

## :checked

`:checked` 只会选择被勾选的元素（也就是说他被限制在了 radio 和 checkbox）：

```html
<style>
  .puff:checked {
    display: none;
  }
</style>
<div style="margin-bottom: 10px;">
  <input type="checkbox" class="puff"> 你勾了我的话，我就没了 <br />
  <input type="radio" class="puff"> 我也是
</div>
```

<style>
  .puff:checked {
    display: none;
  }
</style>
<div style="margin-bottom: 10px;">
  <input type="checkbox" class="puff"> 你勾了我的话，我就没了 <br />
  <input type="radio" class="puff"> 我也是
</div>

---

## :hover

真的，这个你应该知道吧……

`:hover` 会选择任何鼠标悬浮在上边的元素：

```html
<style>
  .rect:hover {
    border: 1px orange solid;
  }
</style>
<p class="rect">把鼠标放这看看？</p>
```

效果：

<style>
  .rect:hover {
    border: 1px orange solid;
  }
</style>
<p class="rect">把鼠标放这看看？</p>

---

## :out-of-range, :in-range

`:out-of-range` 会选择一切里头的值超出了最大允许值/低于最小允许值的 `<input>` 。

`:in-range` 呢，就是 `:out-of-range` 的相反……

```html
<style>
  .not-too-young:out-of-range {
    color: red;
  }
</style>

<input type="number" min="1" max="150" value="-1" class="not-too-young">
```

长这样：

<style>
  .not-too-young:out-of-range {
    color: red;
  }
</style>

你几岁？
<input type="number" min="1" max="150" value="-1" class="not-too-young">

---

## :default

`:default` 会选中默认的勾选框/按钮/选项，诸如此类。

```html
<style>
  .coolzies:default + label {
    color: red;
    font-size: 40px;
  }
</style>

谁最帅？
<div>
  <input type="radio" id="car" value="车" name="handsome" class="coolzies">
  <label for="car">车</label>
  <input type="radio" id="me" value="42yeah" checked name="handsome" class="coolzies">
  <label for="me">42yeah</label>
  <input type="radio" id="gf" value="01page" name="handsome" class="coolzies">
  <label for="gf">01page</label>
</div>
```

效果：

<style>
  .coolzies:default + label {
    color: red;
    font-size: 40px;
  }
</style>

谁最帅？
<div>
  <input type="radio" id="car" value="车" name="handsome" class="coolzies">
  <label for="car">车</label>
  <input type="radio" id="me" value="42yeah" checked name="handsome" class="coolzies">
  <label for="me">42yeah</label>
  <input type="radio" id="gf" value="01page" name="handsome" class="coolzies">
  <label for="gf">01page</label>
</div>

---

## :invalid, :valid

`:invalid` 会选择一切输入了错误信息的 `<input>` 。`:valid` 则相反。

```html
<style>
  .nope-thats-not-right:invalid {
    color: orangered;
  }
  
  .yep-thats-right:valid {
    color: green;
  }
</style>

邮箱: 
<input type="email" value="dev@null." class="nope-thats-not-right yep-thats-right spam-the-line">
```

<style>
  .nope-thats-not-right:invalid {
    color: orangered;
  }
  
  .yep-thats-right:valid {
    color: green;
  }
</style>

邮箱: 
<input type="email" value="dev@null." class="nope-thats-not-right yep-thats-right spam-the-line">

---

行吧，写到这里我开始懒起来了，以后一些一样的我直接归类，好吧？不好？反正我都会帮你归类的！

## :read-only, :read-write

`:read-only` 只选择一切 **只读** 的 **`<input>`** 。`:read-write` 则反过来（也不算吧），自个儿看英文顺推。

```html
<style>
  .just-read-me:read-only {
    color: green;
  }
</style>

写我:
<input value="写我" class="just-read-me">

你不能写我:
<input value="the quick brown fox jumps over the lazy do" readonly class="just-read-me">
```


<style>
  .just-read-me:read-only {
    color: green;
  }
</style>

写我:
<input value="写我" class="just-read-me spam-the-line">

你不能写我:
<input value="the quick brown fox jumps over the lazy do" readonly class="just-read-me spam-the-line">

---

## :enabled, :disabled

分别选择 **启用** 和 **不启用** 的元素。

```html
<style>
  .traffic-light:enabled {
    color: green;
  }
  
  .traffic-light:disabled {
      color: red;
  }
</style>

<input class="traffic-light" value="能写">
<input class="traffic-light" value="不能写" disabled>
```

示例：

<style>
  .traffic-light:enabled {
    color: green;
  }
  
  .traffic-light:disabled {
      color: red;
  }
</style>

<input class="traffic-light" value="能写">
<input class="traffic-light" value="不能写" disabled>

---

## :before, :after

分别选择这个元素 **之前** 的伪元素，和 **之后** 的伪元素。**注意！伪元素并不真正存在！**

```html
<style>
  .on-fire:before {
    content: "!";
    color: red;
  }
  
  .on-fire:after {
    content: "!";
    color: red;
  }
</style>
<p class="on-fire">Cacame Awemedinade</p>
```

<style>
  .on-fire:before {
    content: "!!";
    color: red;
  }
  
  .on-fire:after {
    content: "!!";
    color: red;
  }
</style>

例子：

<p class="on-fire">Cacame Awemedinade</p>

---

## :link, :visited

`:link` 和 `:visited` 分别选择链接，和进入过的链接。

示例：

```html
<style>
  .have-you-been-to-bing:link {
    font-weight: 900;
  }
  
  .have-you-been-to-bing:visited {
    background-color: green;
    border-bottom: 3px darkgreen solid;
    color: white;
  }
</style>
<a href="https://bing.com" class="have-you-been-to-bing">如果你没去过必应的话，这字应该不是绿色的。</a>
```
<style>
  .have-you-been-to-bing:link {
    font-weight: 900;
  }
  
  .have-you-been-to-bing:visited {
    background-color: green;
    border-bottom: 3px darkgreen solid;
    color: white;
  }
</style>
<a href="https://bing.com" class="have-you-been-to-bing">如果你没去过必应的话，这字应该不是绿色的。</a><br />
<a href="#strange-tag" class="have-you-been-to-bing">为了显示出区别，这是一条你肯定没去过的链接。</a>

---

