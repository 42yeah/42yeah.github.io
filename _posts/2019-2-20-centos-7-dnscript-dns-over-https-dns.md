---
title: 在 CentOS 7 搭建基于 DNSCrypt 和 Nginx 的 DNS-over-HTTPS
layout: post
date: 2019-02-20 21:49:28
categories: [ net ]
---
DNS-over-HTTPS 是一个强大，但未成熟的技术。通过 SSL 传输原本未经加密的 DNS 查询，使过程更加安全。已经有许多关于原理的文章，在这里我们尝试在 CentOS 7 上搭建一个后端基于 DNSCrypt 的 DoH。

如果您想玩玩最新技术，可以试着自己做一做。
<!--more-->

# 注意：这是一篇转载自 [moon](https://www.moonsekai.xyz) 的文章。原文地址在 [这里](https://www.moonsekai.xyz/2019/02/13/%E5%9C%A8CentOS-7%E6%90%AD%E5%BB%BA%E5%9F%BA%E4%BA%8EDNSCrypt%E7%9A%84DNS-over-HTTPS-DNS/) 。他已经授权了。

## 为什么
从原理上来说，自己用免费证书搭的 DoH 没有任何实用价值。这个技术也尚处在实验性阶段，并没有广泛使用（如果您想玩玩稍微成熟一点的技术，可以去试试 DNS-over-TLS）。因为，搭这个东西完全是为了**好玩**。
## 基本架构
DoH 与传统的 DNS 查询相比最大的不同就是通过SSL发送和接收查询请求，他的架构是这样的：

![the Structure of DoH](/assets/DOH.svg)

就像图上所显示的，我们需要配置 DNSCrypt，DOH-Server与Nginx。
# 安装 dnscrypt-proxy
这一部分我们配置一个常规的 DNS Server。

这篇 Blog 使用 DNSCrypt 作为后端，确保安全性的同时也更加省事，如果您愿意的话，用万能的 Bind 想想办法也是没问题的。
## 配置 dnscrypt-proxy
为了省事，我们使用github的预编译包，你可以在[这里](https://github.com/jedisct1/dnscrypt-proxy/releases)下载。

之后，需要进行一些配置。重命名 `example-dnscrypt-proxy.toml` 为 `dnscrypt-proxy.toml`，使配置文件生效。
之后，编辑 `dnscrypt-proxy.toml` ,找到 `#server_names` 行，去掉注释，并选择几个你喜欢的DNS Provider，改成类似这样：

```shell
server_names = ['google' ,'cloudflare']
```
之后，你应该可以正常运行 `dnscrypt-proxy` 。
### 为 dnscrypt-proxy 编写服务
方便起见，我们将 `dnscrypt-proxy` 做成服务。

创建文件 `/etc/systemd/system/dnscrypt.service` ，权限设置为 745 并写入这些内容：
```
[Unit]
Description=DNSCrypt Service
After=network.target
Wants=network.target

[Service]
Type=simple
PIDFile=/var/run/dnscrypt.pid
# 当然，你需要根据你的路径对这里做改动
ExecStart=/usr/local/bin/dnscrypt-proxy
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
之后，使用 `systemctl start dnscrypt && systemctl enable dnscrypt` 运行服务，如果你不放心，用 `systemctl status dnscrypt` 确保他在正常工作。

至此，你已经在53端口搭建了一个正常的 DNS 服务器。

## 安装 DoH Server
现在已经有不同语言编写的 DoH Server。我们使用 Go 语言的版本。使用 `yum install -y go` 安装 Go 语言。 之后，按照 https://github.com/m13253/dns-over-https 的步骤编译安装DoH Server，如果你使用国外的服务器，这会十分迅速。

当然，事情没这么简单。

在某些内核（我使用Liunx 3.10.0-327.el7.x86_64），使用 `systemctl status doh-server` ，你会看到 `(code=exited, status=218/CAPABILITIES)` 的错误。我的解决方法比较粗暴：编辑 `/lib/systemd/system/doh-server.service` ，注释掉 `AmbientCapabilities=CAP_NET_BIND_SERVICE` 这一行，之后重启服务，目前并没有发现什么不良影响。

如果你确保 `doh-server` 跑起来了，就可以改一下 `/etc/dns-over-https/doh-server.conf` ，将 `upstream` 属性改为下面的样子：

```
upstream = [
    "127.0.0.1:53",
]
```
这让 `doh-server` 使用我们架设的 `dnscrypt` 解析。最后，用 `sudo systemctl restart doh-server` 重启服务。

至此，你完成了 `DoH Server` 的配置。

## Nginx
之后，我们配置最后一部分： `nginx` 。如果你还未安装 `nginx` ，使用 `yum install -y nginx` 安装。
## 配置HTTPS
如果你之前已经为 `nginx` 配置过 HTTPS ，可以跳过这一部分。如果没有，推荐你使用 `certbot` 的一键脚本。依次键入下列命令来安装。

```shell
$ yum -y install yum-utils
$ yum-config-manager --enable rhui-REGION-rhel-server-extras rhui-REGION-rhel-server-optional
$ yum install python2-certbot-nginx
```

之后，运行 `certbot --nginx`， 按指示操作，你便为 `nginx` 配置了 HTTPS，访问你的域名，应该能看到 HTTPS 正常工作了。

### 支线：配置 certbot 自动续期
`certbot` 申请的 Let's Encrypt 证书有效期只有3个月，可以配置自动续期，如果你只是随便玩玩，不做也没关系。

运行 `certbot renew --dry-run` ，如果没有错误发生，说明自动续期是正常工作的。（但他并不会立刻续期，因为还没达到续期所要求的期限）。

确认无误后，编辑 `/etc/crontab` ，加入下列内容
```shell
0 3 */5 * * certbot renew --disable-hook-validation --renew-hook "systemctl nginx reload"
```
`certbot` 就会将证书保持有效了。

## 配置 Nginx
如果之前你都没做错，编辑 `/etc/nginx/nginx.conf` ，你会在文件底部找到许多注释有 `# managed by Certbot` 的部分。我们需要改动的部分并不多。

首先，将
```shell
listen [::]:443 ssl ipv6only=on; # managed by Certbot
listen 443 ssl; # managed by Certbot
```
改为
```shell
listen [::]:443 ssl ipv6only=on http2; # managed by Certbot
listen 443 ssl http2; # managed by Certbot
```
之后，在
```shell
location / {
    }
```
下方插入
```shell
location /dns-query {
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_redirect off;
    proxy_buffering off;
    proxy_pass http://dns_backend;
    }
```
最后，在 `server` 作用域前，插入代码，使它变成这样：
```shell
## 插入 upstream 作用域。
upstream dns_backend {
         server [::1]:8053;
         # 当然，如果你的服务器没有 ipv6，在这里需要使用 ipv4 地址，原理是一样的。
}
## 以下为原有内容。
server {
    server_name www.example.com; # managed by Certbot
```

之后，使用 `systemctl restart nginx` 重启 `nginx`，如果一切正常，访问 `www.example.com/dns-query` 应该会看到一个错误字符串，长这样
```json
{"Status":2,"Comment":"Invalid argument value: \"ct\" = \"\""}
```
如果你愿意的话，也可以拒绝这个地址的 `GET` 请求，或者把 `GET` 重定向。

至此，恭喜你，你已经搭建起了一个 `DoH Server`，可以试着使用了。

## 那么，我怎么知道他工作正常呢
有很多方法，就目前来说，最方便的方式是使用 `Firefox` 。你需要在 `about config` 中修改这些内容：

network.trr.mode ：  3 ， 使用3将强制使用 DoH 解析，方便测试

network.trr.uri : https://www.example.com/dns-query ， 你搭建的 DoH 服务器地址

network.trr.bootstrapAddress : 123.123.123.123， 你的服务器地址， 说实话我不太知道这个东西意义何在，总之设置成你的服务器地址他是工作的就没错了

**如果你知道bootstrapAddress究竟是做什么的，请教教我orz**

之后，重启 `Firefox` ，尝试打开几个你常用的网站，他应该可以正常解析。

如果你还是不放心，可以打开 `about:networking#dns` ，如果 `TRR` 那一栏都是 true，就说明你成功了。

恭喜你，你刚刚体验了（虽然目前处于高度实验状态）但是很新的技术，祝你玩的愉快。

## 后记
搭完这个东西玩了 1 个小时后，我重新打开了 CloudFlare 的 CDN。这也意味着之前做的东西都没用了，几个服务也关掉了。所以可能是浪费了时间？然而并不这么觉得。

至少过程非常开心，而且也有学到很多东西，这也就是所谓 "折腾" 的乐趣所在吧。

## 参考资料
这些文章为我提供了巨大的帮助，感谢他们：
https://www.aaflalo.me/2018/10/tutorial-setup-dns-over-https-server/

https://certbot.eff.org/lets-encrypt/centosrhel7-nginx

https://facebookexperimental.github.io/doh-proxy/tutorials/nginx-dohhttpproxy-unbound-centos7.html

## 转者注（也就是我）

我喜欢这种 Just For Fun 的精神！还有这看起来的确挺好玩儿的，我就转了
