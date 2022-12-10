---
layout: post
title: fork 和他的朋友们
categories: [ algorithm ]
---

fork()! 

好吧……不知道说什么……让我们直接切入正题吧……我不知道大家，但是我呢，就是要考操作系统的人了。这也是我现在在写这个东西的原因。

## fork

那么首先我们来看一哈 `fork()` 。他有啥用呀？它是一个属于 UNIX 的 syscall ，他的作用是创建一条新的进程。但他创建新进程的方法很特别：**它是通过拷贝和当前调用这个函数的进程** 。拷贝完的东西完全一毛一样，甚至连指针指向的地址也是有效的数据。那么，我们咋判断 fork 完之后，哪个是爸爸，哪个是儿子呢？超简单！

```c
    int pid = fork();
    if (pid == 0) {
        // 我是儿子
    } else {
        // 我是爸爸！
    }
```

没了。就是这么简单。

## wait

接下来，我们得先立个规矩，爸爸必须是最后退出的。或者说，爸爸必须等待儿子们都完事了之后才退出（我是个负责任的爸爸）。为了实现这个，我们可以有两种方法：

- 我们当然可以用 `wait(NULL)` 了 —— 这会让爸爸等带所有的子进程完事。
- 也可以 `waitpid(pid, &ret, 0)` ，其中 ret 是子进程返回值。

```c
#include <sys/wait.h>
// ... {
    int pid = fork();
    if (pid == 0) {
        // 我是儿子
    } else {
        // 我是爸爸！
        wait(NULL); // 等儿子们！
        // 或者
        int sonRet;
        waitpid(pid, &sonRet, 0); // 等一个儿子
    }
// }
```

我个人认为，用下面的更好。

## pipe

我们已经知道爸爸怎么等儿子了，还有爸爸和儿子在 fork 完之后的数据状态了。但是之后我们就会发现，即使连地址都一模一样，但是他们之间的数据不是互通的（毕竟本身地址是逻辑地址，然后数据还在不同的进程上）。对于父亲和儿子之间的通讯，我们首先就可以用 pipe() —— 管道通讯。超级方便！

```c
    int fd[2];
    int rc = pipe();
    if (rc == -1) {
        // 开管道出错了
        return -1;
    }
    int pid = fork();
    if (pid == 0) {
        // 我是儿子
        write(fd[1], "Papa I love you", 16);
    } else {
        // 我是爸爸！
        char in[64] = { 0 };
        int len = read(fd[0], in, sizeof(in));
        printf("Son said: %s\n", in);
        
        // waitpid...
        close(fd[0]);
        close(fd[1]);
    }
```

如上所示， pipe() 接受的是一个小数组，他的长度为 2。其中，数组的 \[0] 是要来读的， \[1] 是要来写的。在 \[1] 写进去的东西能够在 \[0] 被读出来。完事了记得把管道关掉！虽然不关也不是不行，就是习惯不太好而已。

## IPC

最后，就到了最恶心但也是最强的东西了：[IPC (Inter Process Communication)](https://en.wikipedia.org/wiki/Inter-process_communication) 。他允许我们在两个进程之间开一片共享的内存！还附送信号量等各种帅气功能。但在这帖子里，我只稍微谈搜一下共享内存这东西：

```c
#include <sys/ipc.h>
#include <sys/types.h>
#include <sys/shm.h>

#define SHMKEY 0x1337

// ... {
    int shmid = shmget(SHMKEY, 128, 0644 | IPC_CREAT);
    if (shmid == -1) {
        // 失败……
    }
    char *sharedMemory = (char *) shmat(shmid, NULL, 0);
    if ((int) sharedMemory == -1) {
        // 失败……
    }
    // 我们有一片进程共享的内存啦！
    int pid = fork();
    if (pid == 0) {
        // 我是儿子
        sprintf(sharedMemory, "Papa I love you");
    } else {
        // 我是爸爸！
        int ret;
        waitpid(pid, &ret, 0);
        printf("Son says: %s\n", sharedMemory); // 此处 @ZZK，我一直都在等你这样说
        shmdt(sharedMemory); // 别忘了把解除掉共享内存！
    }
// }
```

这里有一些函数。咱们来一个个快速过（主要是现在三点了，该睡觉了）：
- `shmget`: 第一个参数是 `SHMKEY` , 注意：这个 key **不能重复** ，不然 perror 会报 invalid argument。然后的参数分别是大小和类型。
- `shmat`: 接受参数 ID 和另外两个东西。那两个参数分别是共享内存地址和 flag，目前我们先姑且别管他

进行这两步后，我们就拥有了一片共享的内存啦！然后我们对他干啥都行啦！只要别在最后别忘了 `shmdt` 掉就行了，不然的话下一次会开不了的。

## IPC 信号量！

接下来，我们即将迎来另外一个东西：IPC 信号量！其实还有更加简单的信号量，不过我们就是要看这个。直接上代码：

注意，这里的代码极其简陋，并且没有任何错误处理（和判断）。主要是我有点赶时间。不好意思呀！

```c
#include <sys/ipc.h>
#include <sys/sem.h>
#include <sys/types.h>
// ... 以及各种 include

#define SEMKEY 0x1337

void P(int semid);
void V(int semid);

// ... {
    // 创建信号量
    int semid = semget(SEMKEY, 1, 0644 | O_CREAT);
    // 给信号量赋初值
    int initialVal = 1;
    semctl(semid, 0, SETVAL, initialVal);

    int pid = fork();
    // 自己玩 P/V 吧！
// }

void P(int semid) {
    struct sembuf p;
    p.sem_num = 0;
    p.sem_op = -1;
    p.sem_flg = 0;
    semop(semid, &p, 1);
}

void V(int semid) {
    struct sembuf v;
    v.sem_num = 0;
    v.sem_op = 1;
    v.sem_flg = 0;
    semop(semid, &v, 1);
}
```

## 就先这样啦！

啊……操作系统啊…… 还有计算机组成原理考试…… 大家祝我好运！感觉今晚有点儿语无伦次的，之后有空咱再补上吧，虽然我感觉大概率不会了。。。byebye! 
