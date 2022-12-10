---
layout: post
title: Rising World 架设专用服务器
categories: [ game ]
---

![Rising World!](/assets/rising_world.jpg)

## Rising World

Rising World 是一个自由度很高的沙盒游戏，跟 [Minecraft](https://minecraft.net) 有点像！但是他不一样的是他并不是一个方块状的游戏，然后的话，他是一个（一堆？）德国人做的。大家有兴趣可以来我的服务器！

`123.207.43.62:4255`

然后的话，就开始看看假如 __你__ 想搭一个专用服务器的话咋办吧！

## 专用服务器

Rising World 的版本其实一直在更新，有人看到这个东西的时候我也怕已经过期了。但是无论如何，按照惯例，[这里是服务器下载的地址](/assets/RisingWorldDedicatedServer.zip)。假如版本实在是太低的话，你也可以在 Steam 里面下载：

- 打开 Steam 工具：

![工具](/assets/tools.png)
- 稍微搜索一哈：

![找](/assets/server_search.png)
- 下载
- 传到你的服务器上去
- 解压
- cd 进去
- (可以忽略） `cp server.properties.example server.properties`

首先，你的服务器上面必须装好 Java 。然后的话，你可以改一下你自己的 server.properties ，一般是开箱即用的，你随便改改服务器名字什么的就 OK 了。

## 服务器，启动！

然后就开始启动服务器了！启动的方法有很多种：

- `java -jar -nobatch server.jar`
- `sh linux_startscript.sh`
- `sh linux_screen.sh`

成吧，仨种……

## 出错了！

哈哈哈哈哈！那就跟我一样了！但是，首先要看的是你的错误是啥。我的错误是：

`steamclient.so not found.`

我上网找遍了各种 Rising World 和这个关键词的东西，都找不到……后来把 Rising World 这个关键词去掉就行了。我可能火星了，但是很明显有个东西叫 [steamcmd](https://developer.valvesoftware.com/wiki/SteamCMD:zh-cn) ，然后你只有装完它之后才有这个依赖。他需要 glibc/libstdc++，不同操作系统的要求不一样，因为我用 CentOS 我就贴我自己的吧（其实一般的都已经装好了）：

```shell
sudo yum -y install glibc libstdc++
mkdir steamcmd && cd steamcmd
./steamcmd +quit
```

运行完之后，他会自己去拉一堆库，其中就包括我们亲爱的 `steamclient.so` 。接下来要做的就很简单了：改 path，或者是建软链接。我做的是后者：

```shell
cd /usr/lib64
ln -s ${HOME}/steamcmd/linux64/steamclient.so
```

再运行。他大！错误没拉！

其他的错误可以在 [这帖子](https://steamcommunity.com/sharedfiles/filedetails/?id=788739671) 里解决……吧。反正我的没有，但是他 troubleshoot 里头东西挺多的。

## 我开好了，但是别人连不上来，咋办？

防火墙。默认情况下，服务器端口是开在 `4255` 的，但是他不只需要这个端口。根据官网原话：

> Ports

> The server port can be set in the server.properties file. By default, the server uses port 4255. The http query port is always serverport-1 TCP (so when using the default server port, it's 4254).

> Please keep in mind that the server also requires the port range serverport to serverport+4 TCP and UDP (both protocols are required), so when using default server port, the server requires ports 4254, 4255, 4256, 4257, 4258 and 4259 TCP and UDP.

所以说，端口要一直开，从 4254 开到 4259，TCP/UDP 的都要开。所以一系列的 iptables/firewall-cmd 就行了……吧？反正我行了。

## 没啦！

祝你玩的开心！
