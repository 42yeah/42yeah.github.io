---
layout: post
title: 关于打洞
categories: [ failure ]
---

<sub>今天做了一天的项目……最近想做个小东西，要用到 WebRTC ，然后发现这是点对点连接，然后就对点对点连接重新燃起了兴趣（之前大概燃过 10~20 回了），想今天就写关于打洞的玩意儿，然后就上网搜了一堆东西，尝试，然后失败……本来还觉得能写出东西来的，但既然是失败的经历，告诉大家也成。我对这一部分的内容不是特别熟悉，如果有说错的，务必把我给指正。谢谢啦！</sub>

## UDP 打洞
UDP 打洞的道理很简单，我们用一些图来概括:

![他们并不知道对方](/assets/punch1.png)

这里以相隔两地的小红和小蓝为例，可怜的他们因为 [NAT](https://en.wikipedia.org/wiki/Network_address_translation) ~~阴阳相隔~~相隔两地，无法发现对方，连牛郎织女都比不上……他们都很向往外面的自由世界，但却因为万恶的 NAT ，所以他们毫无办法。遇到这种情况，本来是有一种很简单的解决方案的：

![VPN!](/assets/punch2.png)

那就是 [VPN](https://en.wikipedia.org/wiki/Virtual_private_network)！中央服务器营造了一种局域网的假象，负责转发所有的数据，相当于一个假的网关；在这种情况下，小红和小蓝就可以 VPN 一线牵了。如果一切都能那么简单，那该多好啊……

但这种美妙的情况并不存在于现实中，至少是在一般的应用场景中。 别人提供的 VPN 是安全性不知道怎么样的东西，毕竟是别人提供的。万一那个人他居心不良呢？这个时候，你的所有数据都会落在他的魔爪中。你的账号，你的密码，所有的东西都会被他套走，这是其一。其二，你可能只是想写一个小游戏，点对点的、两个人玩的那种，这个时候如果要一个 VPN 服务器来**转发**……是不是有点太小题大做了……耗的是自己的带宽啊……

这就是点对点连接出场的时候了。两个用户，一个是客户端，一个是服务器，或者随便，反正都没所谓，只要不用自家的带宽就行。而且因为不是 VPN 这种全局导流的东西，所以用户很放心。那究竟有没有一种办法，能令小红和小蓝见面呢？

![打破壁垒！](/assets/punch3.png)

答案是有的<sub>吧</sub>！这就回到了我们的标题，打洞！~~终于绕回来了……~~ 就我们所知，NAT 过的服务器还是可以和公网服务器连接的（不然怎么上网？？？）。而真正的内网，肯定是没办法连接上公网的。这个时候，NAT 就会非常无奈的打开一个洞，让你跟公网架设连接了。:

![和公网服务器聊聊天](/assets/punch4.png)

又就我们所知，[UDP](https://en.wikipedia.org/wiki/User_Datagram_Protocol) 是[无连接协议](https://en.wikipedia.org/wiki/Connectionless_communication)。这也就意味着他并不需要稳定一个连接，就可以直接给那个地方发送消息。又因为连接上公网会逼着我们给他开个洞，那是不是意味着我们可以这样：

![Surprise!](/assets/punch5.png)

答案是部分肯定的！有部分的 NAT 的确是这样。只要中央服务器分别告诉他们两个另外一个人的信息，他们就可以把消息直接往对方 NAT 开的洞那投放过去，进而开始美妙的点对点连接。而这正是[这里](https://www.rapapaing.com/blog/2011/07/how-to-do-udp-hole-punching/)想要表达的意思：中央服务器记录连接数，每当有一个新的连接上来的时候，就会告知所有已经连接过中央服务器的人，然后点和点之间就会互相尝试连接。为了观赏方便，我会在下面贴上汉化过的代码，并且做了些改动来适配当今编译器苛刻的胃口。2011 年的东西，原作者……大概不会介意了？无论如何，侵删……

### 服务端
```c
// UDP 打洞示例, 服务端
// 基于从 http://www.abc.se/~m6695/udp.html 偷的 UDP 代码（译者注：原文真的是这样的……）
// 由 Oscar Rodriguez 写
// 代码是 public domain 的，但如果你打算用这里的任何一句代码，那你怕是疯了
#include <arpa/inet.h>
#include <netinet/in.h>

#include <sys/types.h>
#include <sys/socket.h>
#include <unistd.h>
#include <stdio.h>

#define BUFLEN 512
#define NPACK 10
#define PORT 9930
// 一个小小的，装着 UDP 信息的 struct 。我们会用这个来放服务端的数据。
struct client
{
    int host;
    short port;
};
// 这个就是个当程序出问题的时候的自杀通道。
void diep(char *s)
{
    perror(s);
    exit(1);
}
int main(void)
{
    struct sockaddr_in si_me, si_other;
    int s, i, j, slen=sizeof(si_other);
    char buf[BUFLEN];
    struct client clients[10]; // 10 个客户端. 注意我们没有做任何的 bound 检查。
    int n = 0;
    // 创建 UDP Socket
    if ((s=socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP))==-1)
        diep("socket");
    // si_me 保存着我们的本地地址。记住这个程序必须要运行在开放网络内，
    // 这样别人才可以连上来。长话短说，这玩意儿不能在 NAT 后面跑。
    memset((char *) &si_me, 0, sizeof(si_me));
    si_me.sin_family = AF_INET;
    si_me.sin_port = htons(PORT);
    si_me.sin_addr.s_addr = htonl(INADDR_ANY);
    if (bind(s, (struct sockaddr*)(&si_me), sizeof(si_me))==-1)
        diep("bind");
    while (1)
    {
        // 当一个新的客户端发了个包来的时候……
        if (recvfrom(s, buf, BUFLEN, 0, (struct sockaddr*)(&si_other), &slen)==-1)
            diep("recvfrom");
        // 现在用户的 IP 和端口都被存在 si_other 里面了.。
        // 注意我们根本就没打算管这个包里面是什么。
        // 如果我们想要同一个 NAT 下面的多个客户端，
        // 我们必须要把他们分开来保存。
        // 如果端口还是相同的话，那我们就必须指望这个包里面的内容可以区分他们了（并且把它们记下来）。
        printf("从 %s:%d 发来了个包\n", inet_ntoa(si_other.sin_addr), ntohs(si_other.sin_port));
        // Now we add the client's UDP endpoint in our list.
        clients[n].host = si_other.sin_addr.s_addr;
        clients[n].port = si_other.sin_port;
        n++;
        // 然后告诉所有人所有人的 IP 跟端口
        for (i = 0; i < n; i++)
        {
            si_other.sin_addr.s_addr = clients[i].host;
            si_other.sin_port = clients[i].port;
            // 我们对我们的连接里的每一个客户端都发一次 UDP 包。当然，
            // 我们也可以组装成一个大包然后一次性发。
            for (j = 0; j < n; j++)
            {
                // 包里的内容自然就是 clients[j] 里的 IP 和端口数据了。
                printf("Sending to %s:%d\n", inet_ntoa(si_other.sin_addr), ntohs(si_other.sin_port));
                // 我们在发二进制，用的是服务器的端/Endian（大端/小端？）
                // 在你的代码里面，你当然应该要保证所有客户端都用同一个 端/Endian 了。
                if (sendto(s, &clients[j], 6, 0, (struct sockaddr*)(&si_other), slen)==-1)
                    diep("sendto");
            }
        }
        printf("现在我们有 %d 个客户端了\n", n);
        // 然后我们再滚回去监听。注意因为 UDP 是无连接协议，
        // 我们可以用同一个 socket 来听不通客户端发的内容。
    }
    // 实际上，程序永远也到不了这里……
    close(s);
    return 0;
}
```

### 客户端
```c
// UDP 打洞示例, 服务端
// 基于从 http://www.abc.se/~m6695/udp.html 偷的 UDP 代码
// 由 Oscar Rodriguez 写
// 代码是 public domain 的，但如果你打算用这里的任何一句代码，那你怕是疯了
// 译者注：下面 “点” 跟 “客户端” 指代的东西是一样的，因为 “点”对“点” 连接嘛。
#include <arpa/inet.h>
#include <netinet/in.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <unistd.h>
#include <stdio.h>

#define BUFLEN 512
#define NPACK 10
#define PORT 9930
// 这是我们服务器的 IP 地址。如果你想知道我这里为什么要填这个的话，这是个 RFC 5737 的地址。
#define SRV_IP "203.0.113.61"
// 一个小小的，装着 UDP 信息的 struct 。我们会用这个来放每个端点的数据。
struct client
{
    int host;
    short port;
};
// 这个就是个当程序出问题的时候的自杀通道。
void diep(char *s)
{
    perror(s);
    exit(1);
}
int main(int argc, char* argv[])
{
    struct sockaddr_in si_me, si_other;
    int s, i, f, j, k, slen=sizeof(si_other);
    struct client buf;
    struct client server;
    struct client peers[10]; // 10 个客户端. 注意我们没有做任何的 bound 检查。
    int n = 0;
    if ((s=socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP))==-1)
        diep("socket");
    // 我们自己的网络数据。
    memset((char *) &si_me, 0, sizeof(si_me));
    si_me.sin_family = AF_INET;
    si_me.sin_port = htons(PORT); // 这个真的没必要，我们其实可以用 0 (any port)
    si_me.sin_addr.s_addr = htonl(INADDR_ANY);
    // 服务器的网络数据
    memset((char *) &si_other, 0, sizeof(si_other));
    si_other.sin_family = AF_INET;
    si_other.sin_port = htons(PORT);
    if (inet_aton(SRV_IP, &si_other.sin_addr)==0)
        diep("aton");
    // 把服务器的数据存下来，这样我们就可以分辨谁给我们发消息了；是服务端？还是另外一个点？
    server.host = si_other.sin_addr.s_addr;
    server.port = si_other.sin_port;
    // 发一个 UDP 包去让服务器知道我们的 IP/端口 数据。
    // 不止是服务器，其他点也会往这里发送消息。
    // 这个包里的内容真的没什么关系，但如果我们要想在同一个 NAT 后面加多个客户端，我们可以往里面摆识别码什么的。
    if (sendto(s, "hi", 2, 0, (struct sockaddr*)(&si_other), slen)==-1)
        diep("sendto");

    // 来到这里的时候，我们的 NAT 应该在维持一个从我们到公网服务器的连接了。
    // 我们现在只能希望别的客户端给我们发消息的时候能映射到相同的地点了……
    while (1)
    {
        // 从自己的 socket 处接受数据。注意 socket 是不需要变的。
        // 因此，我们会想要把服务器发回来的（因为那是添加新点的唯一途径），
        // 但也别忘记了 IP 什么的很容易就能被 NAT 改掉，
        // 因此，记得这里还要加一些验证包里的内容的代码。
        if (recvfrom(s, &buf, sizeof(buf), 0, (struct sockaddr*)(&si_other), &slen)==-1)
            diep("recvfrom");
        printf("从 %s:%d 接收到了包\n", inet_ntoa(si_other.sin_addr), ntohs(si_other.sin_port));
        if (server.host == si_other.sin_addr.s_addr && server.port == (short)(si_other.sin_port))
        {
            // 包是从服务器来的。服务器正在往每一个点都发包，
            // 而这个包里又存着其他点的网络数据（IP/端口）。
            // 我们在这里接的是二进制码，所以务必在你自己写的时候保证这个通讯可以顺利进行。
            f = 0;
            // 现在我们就把服务器给我们报告的客户端加到列表里
            for (i = 0; i < n && f == 0; i++)
            {
                if (peers[i].host == buf.host && peers[i].port == buf.port)
                {
                    f = 1;
                }
            }
            // 当然了，只有在发现列表中没有的时候才加。
            if (f == 0)
            {
                peers[n].host = buf.host;
                peers[n].port = buf.port;
                n++;
            }
            si_other.sin_addr.s_addr = buf.host;
            si_other.sin_port = buf.port;
            printf("增加新点 %s:%d\n", inet_ntoa(si_other.sin_addr), ntohs(si_other.sin_port));
            printf("现在我们有 %d 个点了。\n", n);
            // 这里就是打洞开始发生的地方了。我们准备给别的点发一堆包。
            // 因为我们用的 socket 根本就没变过，
            // 我们的网络数据（也就是 IP/端口）还是跟以前一样的。
            // 如果另外一个点的 NAT 真的让我们朝外面发的数据给映射了，
            // 我们就已经成功的构造了一场对话（也就是打穿了）了。
            // 第一个包可能不会过得了对面的 NAT ，但因为 UDP 是无状态的，
            // 我们根本就没有办法知道那个包是不是已经送达了。（嗯，我们的 NAT 可能会搞个 ICMP Destination Unreachable，
            // 但是大多数的会直接把包丢掉。）
            // 但当对面的点给我们也发了一个包的时候，NAT 就会开始信任我们的连接，然后数据就可以穿过那个洞，到我们的 recvfrom 里边去了。
            for (k = 0; k < 10; k++)
            {
                // Send 10 datagrams.
                for (i = 0; i < n; i++)
                {
                    si_other.sin_addr.s_addr = peers[i].host;
                    si_other.sin_port = peers[i].port;
                    // 再说多一次，包里的东西是没意义的。
                    // 当然，你也可以让他有意义。
                    if (sendto(s, "hi", 2, 0, (struct sockaddr*)(&si_other), slen)==-1)
                        diep("sendto()");
                }
            }
        }
        else
        {
            // 这包是从一个点传过来的！
            for (i = 0; i < n; i++)
            {
                // 看看他是从哪来的
                if (peers[i].host == buf.host && peers[i].port == (short)(buf.port))
                {
                    // 然后再对这个包做点东西
                    printf("收到了从点 %d 传来的数据！\n", i);
                    break;
                }
            }
            // 从一个没有注册过的点接受到数据也是可能的。这是我想到的可能的情况：
            // 1. 服务器还没把新的点出现的数据给传过来，新的点已经在给我们发消息了（比较可能）
            // 2. 一个怀有恶意的用户正在往这个洞里传数据（真的不大可能）
            // 3. 因为超时，点的 IP/端口 变了，或者他的发送被安排到了另外一个端口上。
            //    如果这个发生的时候，我们是完全可以探测得到的，并且把相应的数据改好。
            //    如果能处理好这个问题的话，就能实现即使有一个点不支持 NAT ，他们之间也能建立点对点通讯。
        }
    }
    // 实际上，程序永远也到不了这……
    close(s);
    return 0;
}
```

以上就是伟岸的 UDP 打洞源码了。但是……

## 不行！

由于某些神秘的原因，就是不行。虽然客户端的确可以收到点的消息：

![不行](/assets/nope.png)

<sub>（其中的 `Spreading datas all around` 跟 `x-x in total` 是我要来测试他是不是真的发了包的）</sub>

但就是不行。手机和电脑都不行。后来我在另外一个公网服务器上也开了这个客户端，然后连接，发现是可以的……别的点可以发给这个公网服务器，但公网服务器的包发不到这些点上……图我就不贴了。这就引导出了另外一个问题：

## 是我的 NAT 封的太严了吗？

于是，上网东搜西找，我找到了这个：

### [PyStun](https://github.com/jtriley/pystun)

他可以测试你家的 NAT 能不能被穿透……然后这是我的结果……

![MLGBD](/assets/comeon.png)

难道真的是太严了？emmm... 有点小失望……所以今晚就此结束了……

## 一堆名词

当然，因为这个本来不是我特别熟悉的东西，我搜的时候还搜到了一堆的名词。不是很懂，而且因为我已经写了一堆东西了，不想再写了。接下来我就放链接，你们有兴趣的话细细品味吧（当然有兴趣教一下我也行）：
- [STUN](https://en.wikipedia.org/wiki/STUN) - STUN 是一个标准化的，要来搞 NAT 穿透的协议（在我这不行）
- [coturn/coturn](https://github.com/coturn/coturn) - coturn 是一个实现了 RFC 5766 的服务器。就我所知，他在 [Ubuntu](https://www.ubuntu.com) 的仓库内，可以直接 `apt-get` 。
- [ICE](https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment) - 另外一种标准化的搞 NAT 穿透的东西（没试过，并且不知道他跟 STUN 是不是同类的东西，还是像辅助那样）
- [STUN, TURN, ICE 介绍](https://blog.csdn.net/byxdaz/article/details/52786600) - CSDN 上的一篇博客。为毛穿透的缩写都喜欢缩写成一个单词？疑惑不解.jpg
- [TURN](https://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT) - 既然说到了 TURN ，那就也上一下他的链接吧。我根本就没看过这个……
