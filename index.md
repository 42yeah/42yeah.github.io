---
title: Frame of 42yeah
layout: default
---

## Hark, visitor!

欢迎来到 [42yeah](https://github.com/POTION4) 的个人博客！如果想知道更多关于我的消息，往下滚到关于我就行了。

<div class="paperi floats stick">
  <h2>所有分类</h2>
  <div>
    {% assign first = true %}
    {% for category in site.categories %}
      {% if first %}
        {% assign first = false %}
      {% else %}
        <span class="gnome">,</span>
      {% endif %}
      <span style="padding-left: 5px; padding-right: 5px;">
        <a href="/category/{{ category | first }}">{{ category | first }}</a>
      </span>
    {% endfor %}
  </div>
</div>

## 晚报

我大概会在晚上才更新。以下是最新的推：

<div style="display: flex; justify-items: between; align-items: center; overflow-x: auto; padding: 2.5rem;">
  {% for i in (0..6) %}
    {% if i >= site.posts.length %}
      {% break %}
    {% endif %}
    {% assign post = site.posts[i] %}
    
<a href="{{ post.url }}">
  <div style="padding: 0px px 0px 5px; margin-left: -1.5rem; border-color: black; border-style: solid; border-width: 1px; max-width: 200px;" class="card">
    <h2>{{ post.title }}</h2>
    <p style="padding: 0.25rem;">
      <small>{{ post.excerpt }}</small>
    </p>
  </div>
</a>

  {% endfor %}

  <div style="padding: 0px px 0px 5px; margin-left: -1.5rem; border-color: black; border-style: dashed; border-width: 2px; max-width: 200px;" class="card">
    <h2 style="color: #555;">还有很多……</h2>
    <p style="padding: 0.25rem; color: #555;">
      <small>前往相应的分类看吧！</small>
    </p>
  </div>
</div>

## 友情

以下的链接包括了友情链接链接:

<div style="display: flex; justify-items: between; align-items: center; overflow-x: auto;">
  <a href="https://zzkdev.github.io">
    <div style="padding: 5px; margin: 10px; border-color: black; border-style: solid; border-width: 1px; color: green; background-color: white;">
      <h2>杀不死的坏蛋</h2>
      <small>父子关系，我是父</small>
    </div>
  </a>
  <a href="http://www.moonsekai.xyz">
    <div style="padding: 5px; margin: 10px; border-color: black; border-style: solid; border-width: 1px; color: green; background-color: white;">
      <h2>moonmagian</h2>
      <small>It's been a long time. <br /><sub>注: 2018-2-4，我更新了 moon 的博客传送门（他终于有域名了），之前的我就不链了……</sub></small>
    </div>
  </a>
  <a href="https://gamejilu.com">
    <div style="padding: 5px; margin: 10px; border-color: black; border-style: solid; border-width: 1px; color: green; background-color: white;">
      <h2>gamejilu</h2>
      <small>脆饼的博客。他说要更好地體驗遊戲的樂趣！</small>
    </div>
  </a>
</div>



<details> <summary><h2 style="display: inline">关于我</h2></summary>
<ul>
  <li>我是一个来自 <a href="http://www.dgut.edu.cn/">东莞理工学院</a> 的学生。</li>
  <li>我非常想学图形学。</li>
  <li> 
    我喜欢玩独立游戏，包括但不限于：
    <ul>
      <li>Nethack</li>
      <li>一系列的经典偏硬核 Roguelike</li>
      <li>一些可以多人游戏的游戏，<b>一般不包括 FPS</b></li>
    </ul>
  </li>
  <li>我喜欢玩 4X，但是我很菜</li>
  <li>我学过一系列的程序语言，但大部分都是浅尝辄止，没啥技术</li>
  <li>我支持 LGBT ，虽然我本人是直的</li>
  <li>我不喜欢吃牛肉丸，干蒸，烧卖，虾饺，云吞，^(?!.*(韭菜)).*饺子，牛奶，重芝士，etc……</li>
  <li>我的邮箱是 <a href="mailto:potion@live.cn">potion@live.cn</a></li>
  <li>我做过很多小作品，有兴趣的大佬可以发我邮箱问一下我</li>
  <li>我觉得可口可乐比百事可乐要好喝</li>
  <li>我觉得麦当劳比肯德基要好吃，虽然肯德基有奥尔良系列</li>
  <li>我觉得尊宝是所有 Pizza 当中最好吃的，第二是 Domino</li>
</ul>
</details>
