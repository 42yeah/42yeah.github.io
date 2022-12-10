---
layout: post
title: 用 vbs 写进程守卫
categories: [ meta ]
---

其实到现在，我也不知道这个应该叫什么好……我一开始想叫他守卫进程的，但想起这个东西是 daemon ，而我要写的并不是 daemon……

我要写的东西是一个进程的观察进程，或者叫进程守卫？我也不清楚。他的唯一作用就是，当发现一个进程没响应的时候，就重启他。对，我就是有这么奇葩的需求……那我们马上开始吧！

## 伟大的 VBScript!

首先呢，我并不想要东西有多麻烦；这就是我决定用 VBScript 写这个的时候了！他唯一的作用就是发现一个进程是否还存活而已嘛，那么复杂干嘛？

## 查看正在运行的进程

无论如何，首先我们都要有查看所有正在运行的进程的方法，对吧？不然我们怎么知道那个进程是不是在运行呢？

很遗憾，VBScript 本身并没有这个本事……但是靠 Word ，一切皆有可能！来源于 [Stack Overflow](https://stackoverflow.com/questions/191206/how-to-get-list-of-running-applications-using-powershell-or-vbscript)：

```vb
Set Word = CreateObject("Word.Application")
Set Tasks = Word.Tasks
For Each Task in Tasks
   If Task.Visible Then Wscript.Echo Task.Name
Next
Word.Quit
```

那么然后就有人要说了（譬如我），因为没有装 Word 的机子里咋办？嗯，这就是我用的方法了，来自 [Stack Overflow 的另外一个角落](https://stackoverflow.com/questions/44081448/viewing-running-processes-with-vbscript): 用 tasklist 和输出重定向。

```vb
Dim ProTFPath, ProTF, StrPrInfo, StrPrInfoA, PrInfo

Set WshShell = WScript.CreateObject("Wscript.Shell")
Set FSO = WScript.CreateObject("Scripting.FileSystemObject")

ProTFPath = "C:\PROCESSES.txt" ' 路径

WshShell.Run "CMD /C TASKLIST /V /FO LIST > """ + ProTFPath + """", 0, True
' Here Run is used instead Exec to avoid console window flashes.

If FSO.FileExists(ProTFPath) Then
    Set ProTF = FSO.OpenTextFile(ProTFPath, 1, False)
End If

StrPrInfoA = ProTF.ReadAll

PrInfo = Split(StrPrInfoA, VbCrLf + VbCrLf)

For I = 0 To UBound(PrInfo)
    WScript.Echo PrInfo(I)
Next

Erase PrInfo
ProTF.Close
```

路径那最好改一下，一般 C 盘根下的文件一般权限都不够……但无论如何，我们就已经拿到了所有进程的消息了。然后呢，咱就可以看一看他拿到的消息长什么样了：

![进程信息](/assets/process.png)

我们发现，他很明显是一个列表一样下来的。第一行是进程的名字，第六行是进程的状态。一般由界面的进程才能拿到状态（好像）。每一行差不多就是 `键 - 值`，值肯定在最后面。于是我们就可以这样分。改一下 `WSCript.Echo PrInfo(I)`：

```vbs
    InfoList = Split(PrInfo(I), VbCrLf)
    ProcessName = Split(InfoList(0), " ") ‘ 拿到进程的名字
    Msgbox ProcessName(UBound(ProcessName)) ' 值在最后面，这就是进程名
```

那么我们就拿到了进程的名字了。按空格分割是因为他分的最好。问题是，在我们这样打的时候，他却出现了错误。这又是为什么呢？

## 为什么呢？

原因很简单，就是因为导出来的 PROCESSES.TXT 的第一行是完全空行……所以在 Split 的时候就分割出了完全空的一行。又由于第一行的那个任务一般都不是我们要监视的任务（是吗？），所以偷懒只要加个 `If` 判断一下就好了：

```vb
    If UBound(ProcessName) = -1 Then
        ' 第一行……
    Else
        ' 不是第一行
    End If
```

在我记忆中，vbs 没有 Continue 这种操作。有的话提醒一哈我，我去改。Thank you!

无论如何，我们改完这样后，就真的可以了：他精准的输出了进程的名字。假如是一个判断进程是否存活，否则重启的守护，现在已经做好了；但是我要做的并不是这个。我要做的是一个可以判断进程是否在正常工作的东西。假如他没在正常工作，那么就重启他。咋办呢？

要改成这样也不难。还记得我上面说过第六行是进程的状态不……只要判断一下那个状态是不是 Running 就行了。

```vb
    For I = 0 To UBound(PrInfo)
        InfoList = Split(PrInfo(I), VbCrLf)
        ProcessName = Split(InfoList(0), " ")
        If UBound(ProcessName) = -1 Then
        Else
            If ProcessName(UBound(ProcessName)) = "process.exe" Then
                States = Split(InfoList(5), " ")
                State = States(UBound(States))
                If State <> "Running" Then
                    WshShell.Run "Taskkill /f /im process.exe"
                    ' TODO: And reboot here
                    Msgbox "process.exe was rebooted cause it went wrong."
                End If
            End If
        End If
    Next
```

最后，我们只需要加一个死循环在外面，然后过一秒检查一次就可以了。voila!

```vb
Dim ProTFPath, ProTF, StrPrInfo, StrPrInfoA, PrInfo

Set WshShell = WScript.CreateObject("Wscript.Shell")
Set FSO = WScript.CreateObject("Scripting.FileSystemObject")

Do
    ' TODO: Change path here
    ProTFPath = "\PROCESSES.txt"

    WshShell.Run "CMD /C TASKLIST /V /FO LIST > """ + ProTFPath + """", 0, True
    ' Here Run is used instead Exec to avoid console window flashes.

    If FSO.FileExists(ProTFPath) Then
        Set ProTF = FSO.OpenTextFile(ProTFPath, 1, False)
    Else
        Msgbox "Ugh, Could not open the task export. Goodbye!"
        WScript.Quit
    End If

    StrPrInfoA = ProTF.ReadAll

    PrInfo = Split(StrPrInfoA, VbCrLf + VbCrLf)

    For I = 0 To UBound(PrInfo)
        InfoList = Split(PrInfo(I), VbCrLf)
        ProcessName = Split(InfoList(0), " ")
        If UBound(ProcessName) = -1 Then
        Else
            If ProcessName(UBound(ProcessName)) = "process.exe" Then
                States = Split(InfoList(5), " ")
                State = States(UBound(States))
                If State <> "Running" Then
                    WshShell.Run "Taskkill /f /im process.exe"
                    ' TODO: And reboot here
                    Msgbox "process.exe was rebooted because it went wrong."
                End If
            End If
        End If
    Next

    WScript.Sleep 5000
Loop

Erase PrInfo
ProTF.Close
```

搞定！
