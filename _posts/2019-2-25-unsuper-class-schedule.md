---
title: 不超级课程表
categories: [ meta ]
layout: post
---


我就不大喜欢超级课程表这种东西，然后新学期又要开始了，我就瞎几把写了一个课程表。当然是只给我自己用的……

## 开始

注意：因为太懒，所以我直接用了 `setTimeout` 。希望你两秒之内能加载好下面那个表！

<script src="/assets/index.js"></script>
<link rel="stylesheet" href="/assets/index.css">

<p>这是一个课程表，很明显我只想要他来记录我自己的课程，所以如果你不是 17 计科 1 班的，就算了</p>
<p id="now"></p>

<div class="fat">
    <table style="width:100%" id="schedule">
        <tr>
            <th>Firstname</th>
            <th>Lastname</th> 
            <th>Age</th>
        </tr>
        <tr>
            <td>Jill</td>
            <td>Smith</td> 
            <td>50</td>
        </tr>
        <tr>
            <td>Eve</td>
            <td>Jackson</td> 
            <td>94</td>
        </tr>
    </table>
</div>

不过源码就在这里了！想要就拿去玩吧，[我的整个博客都是开源的](https://github.com/POTION4/potion4.github.io)……毕竟 gh_pages 我也没钱买闭源……