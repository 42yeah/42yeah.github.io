---
layout: post
title: html 中的 flexbox
category: [ net ]
---

HTML 中的 Flexbox ，是一个贼强大，同时又有点儿恶心的东西。今天，为了加强我自个儿的记忆，以及那啥，我决定做这么一个可以动态浏览各种 Flexbox 配置的东西！

## 开始！

我就随便挑几张图片吧……

<style>
  .flex {
    display: flex;
    border: 1px orange solid;
    padding: 1rem;
    height: 150px;
    margin-bottom: 2rem;
  }
  
  .wrap {
    flex-wrap: wrap;
  }
  
  .overflow {
    overflow: auto;
  }

  .little-pic {
    width: 100px;
    height: 100px;
    padding: 0.4rem;
  }
</style>

<div class="flex overflow" id="flexbox">
  <img src="/assets/comeon.png" class="little-pic">
  <img src="/assets/cheating.png" class="little-pic">
  <img src="/assets/fire.png" class="li````ttle-pic">
  <img src="/assets/frame.png" class="little-pic">
  <img src="/assets/ftk.jpeg" class="little-pic">
  <img src="/assets/function.png" class="little-pic">
  <img src="/assets/hmm.png" class="little-pic">
  <img src="/assets/horray.png" class="little-pic">
  <img src="/assets/plot.png" class="little-pic">
  <img src="/assets/punch1.png" class="little-pic">
  <img src="/assets/shitty.png" class="little-pic">
  <img src="/assets/starfort.jpg" class="little-pic">
  <img src="/assets/tent.jpg" class="little-pic">
  <img src="/assets/tile.png" class="little-pic">
  <img src="/assets/traffic_jam.jpg" class="little-pic">
</div>

---

## 各种控制

<a href="javascript:toggFlex()" id="flexButton">关闭 display: flex</a>
<a href="javascript:toggJustify()" id="justifyButton"></a>
<a href="javascript:toggAlign()" id="alignButton"></a>
<a href="javascript:toggOverflow()" id="overflowButton">关闭 overflow: auto</a>
<a href="javascript:toggFlexWrap()" id="flexWrapButton">flex: nowrap</a>
<a href="javascript:toggWrapDir()" id="flexWrapDirButton">flex-direction: column</a>

---

## 对应的 CSS 

```html
<style>
  .flex {
    display: flex;
    border: 1px orange solid;
    padding: 1rem;
    height: 150px;
    overflow: auto;
  }
</style>
```

---

<script>
  let flex = true;
  let overflow = true;
  let wrap = false;
  let wrapDirection = false;
  let flexbox = document.getElementById("flexbox");
  let flexButton = document.getElementById("flexButton");
  let overflowButton = document.getElementById("overflowButton");
  let justifyButton = document.getElementById("justifyButton");
  let alignButton = document.getElementById("alignButton");
  let flexWrapDirButton = document.getElementById("flexWrapDirButton");
  let justifies = [
    "auto", "baseline", "center", "end", "first", "flex-end", "flex-start",
    "last", "left", "legacy", "normal", "right", "safe", "self-end", "self-start",
    "start", "stretch", "unsafe", "inherit", "initial", "revert", "unset"
  ];
  let justifyNow = 0;
  let alignNow = 0;
  
  function toggFlex() {
    flex = !flex;
    if (!flex) {
      flexbox.classList.remove("flex");
      flexButton.innerText = "开启 display: flex";
    } else {
      flexbox.classList.add("flex");
      flexButton.innerText = "关掉 display: flex";
    }
    updateStyle();
  }
  
  function toggOverflow() {
    overflow = !overflow;
    if (!overflow) {
      flexbox.classList.remove("overflow");
      overflowButton.innerText = "开启 overflow: auto";
    } else {
      flexbox.classList.add("overflow");
      overflowButton.innerText = "关掉 overflow: auto";
    }
    updateStyle();
  }
  
  function toggFlexWrap() {
    wrap = !wrap;
    if (!wrap) {
      flexbox.classList.remove("wrap");
      flexWrapButton.innerText = "flex-wrap: nowrap";
    } else {
      flexbox.classList.add("wrap");
      flexWrapButton.innerText = "flex-wrap: wrap";
    }
    updateStyle();
  }

  function toggJustify() {
    justifyNow++;
    if (justifyNow >= justifies.length) {
      justifyNow = 0;
    }
    
    updateStyle();
  }
  
  function toggAlign() {
    alignNow++;
    if (alignNow >= justifies.length) {
      alignNow = 0;
    }
    
    updateStyle();
  }
  
  function toggWrapDir() {
    wrapDirection = !wrapDirection;

    updateStyle();
  }

  function updateStyle() {
    let build = "";
    build += "justify-content: " + justifies[justifyNow] + ";";
    build += "align-items: " + justifies[alignNow] + ";";
    build += "flex-direction: " + (wrapDirection ? "column" : "row") + ";"; 
    
    justifyButton.innerText = "justify-content: " + justifies[justifyNow];
    alignButton.innerText = "align-items: " + justifies[alignNow];
    flexWrapDirButton.innerText = "flex-direction: " + (wrapDirection ? "column" : "row");
    flexbox.style = build;
    
    let code = document.getElementsByTagName("code")[0];
    let str = `<span class="nt">&lt;style&gt;</span>
  <span class="nc">.flex</span> <span class="p">{</span>
    ` + (flex ? `<span class="nl">display</span><span class="p">:</span> <span class="n">flex</span><span class="p">;</span>` : `<span class="nl">display</span><span class="p">:</span> <span class="n">block</span><span class="p">;</span>`) + `
    ` + (wrap ? `<span class="nl">flex-wrap</span><span class="p">:</span> <span class="n">wrap</span><span class="p">;</span>` : `<span class="nl">flex-wrap</span><span class="p">:</span> <span class="n">nowrap</span><span class="p">;</span>`) + `
    ` + (wrapDirection ? `<span class="nl">flex-direction</span><span class="p">:</span> <span class="n">column</span><span class="p">;</span>` : `<span class="nl">flex-direction</span><span class="p">:</span> <span class="n">row</span><span class="p">;</span>`) + `
    <span class="nl">justify-content</span><span class="p">:</span> <span class="nb">` + justifies[justifyNow] + `</span><span class="p">;</span>
    <span class="nl">align-items</span><span class="p">:</span> <span class="nb">` + justifies[alignNow] + `</span><span class="p">;</span>
` + (overflow ? `    <span class="nl">overflow</span><span class="p">:</span> <span class="nb">auto</span><span class="p">;</span><br />  ` : `  `) +
`<span class="p">}</span>
<span class="nt">&lt;/style&gt;</span>`;
    code.innerHTML = str;
  }
  
  updateStyle();
</script>