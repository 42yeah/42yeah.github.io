---
layout: post
title: 安卓动态壁纸的实现！
categories: [ android, cg ]
---


我在很小很小的时候就对安卓的动态壁纸着迷。我一直都很想搞一个类似天空草地的动态壁纸：一片草地在蓝天下摇曳。到了晚上，则是繁星满天，甚是好看……

现在也到了我能看懂这些东西是怎么造出来的时候了，所以今天我就无名火起，突然想试试动态壁纸的实现（其实还有跟着的 GLES）。虽然很早很早之前就已经想试试了，但是今天我感觉刚刚学完车，时间也还多，大创暂时还可以先放半边（对面催我已经有点急了……）并且我真的真的很想在我的手机上显示出酷炫的特效，而且这个特效别人在应用商店上是找不到的。所以马上开工！


## 开工！

安卓的动态壁纸是由 [`WallpaperService`](https://developer.android.com/reference/android/service/wallpaper/WallpaperService) 提供的。我们只要来一个继承了这个的 class ，就可以在我们自己的桌面上渲染出酷炫画面了。所以首先我们先改一下 [AndroidManifest.xml](https://developer.android.com/guide/topics/manifest/manifest-intro)，增加一个服务:


```xml
<service android:name=".Wallpaper"
    android:label="Wallpaper"
    android:permission="android.permission.BIND_WALLPAPER">
    <intent-filter>
        <action android:name="android.service.wallpaper.WallpaperService" />
    </intent-filter>

    <meta-data
        android:name="android.service.wallpaper"
        android:resource="@xml/wallpaper_main" />
</service>
```

这几行是我在我的 Activity 底下加的。是底下，不是在里面。如果你建的是空项目，那我就是在 Application 里面加的。

`android:name`, `android:label` 都是可以改的，我觉得这个名字比较通用而已。`meta-data` 里面的 `android:resource` 也是可以改的，你只要在你的 `xml` 文件夹底下创建相应的 xml 文件就可以了……但整体下来，这就是我要加的 service 的结构了:

- 首先我声明了一个 service (废话)
- 然后他的名字叫 Wallpaper
- 他对应的 class 也叫做 Wallpaper (android:name)
- 它使用了权限 `android.permission.BIND_WALLPAPER`
- 他会加入到安卓的 WallpaperService 里边 (也就是可以在动态壁纸里头可以被找到)
- 他的元数据，也就是动态壁纸的元数据，储存在 `xml/wallpaper_main.xml` 内

接下来，我们前往 res/xml 文件夹 (没有就创建)，然后创建一个名字叫 wallpaper_main.xml 的文件（或者你自己爱叫什么叫什么，保持跟 `android:resource` 一样就可以了），然后填入: 


```xml
<wallpaper
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:thumbnail="@drawable/ic_launcher_background"
    android:description="@string/description"
    android:settingsActivity="org.whatever.wallpaper.SettingsActivity" />
```

其中: 

- `android:thumbnail` 是你壁纸的预览图，在动态壁纸选择那里可以看得到
- `android:descrption` 就是你壁纸的介绍了……很抱歉我又说了废话……
- `android:settingsActivity` 就是你记得选择动态壁纸那里右上角会有一个小齿轮，让你可以设置你自己的动态壁纸的吗？没错这就是用户按了那个齿轮之后进入的 Activity 。记得自己改！当然压根没有这个 Activity 也是一样能过 build 的…… 只不过用户按那个齿轮的时候会停止运行而已。

**Very good!** 接下来，我们就可以新建一个 Wallpaper.java (因为 android:name! 再说一次可以自己改！) ，然后让他继承一下 `WallpaperService`! 


```java
package org.whatever.wallpaper;

import android.service.wallpaper.WallpaperService;


public class Wallpaper extends WallpaperService {

    @Override
    public Engine onCreateEngine() {
        return null;
    }

}

```

这就是结果了。很明显，`WallpaperService` 要你实现的东西很简单，就是一个 `onCreateEngine` 。那他要你返回的是一个什么呢？聪明！就是一个 [`Engine`](https://developer.android.com/reference/android/service/wallpaper/WallpaperService.Engine) 。我们可以改改上面那行 `return null`: 

```java
        return new Engine();
```

实际上，此时我们的动态壁纸已经完全可以用了。问题在于，他虽然可以用，但他完全没用……因为我们什么都没有实现，所以我们的动态壁纸将会永远是一个黑屏。<sub>啊，图形学！</sub>因此，为了让我们更进一步，在这个动态壁纸上面作画，我们需要继承自己的 WallpaperService.Engine。但是！在实现之前，要注意！**我们继承的 Engine 必须要在我们继承的 WallpaperService 里头:**

```java

package org.whatever.wallpaper;

import android.service.wallpaper.WallpaperService;


public class Wallpaper extends WallpaperService {

    @Override
    public Engine onCreateEngine() {
        return new WallpaperEngine();
    }



    class WallpaperEngine extends Engine {

    }

}


```

这就是最不舒服的时候了……因为如果你在用一个 IDE 的话<sub>你肯定在用吧</sub>，他什么都不会叫你实现……但是没关系！实际上，我们可以 `override` 一些方法来达到我们想要的效果。我们首当其冲应该 `override` `onCreate` ，因为这个函数会在 Engine 被初始化时调用:

```java
@Override
public void onCreate(SurfaceHolder surfaceHolder) {
    super.onCreate(surfaceHolder);
}
```

接下来，我们就发现，诶哟，那不是 [`SurfaceHolder`](https://developer.android.com/reference/android/view/SurfaceHolder) 吗？这种东西不是拿着一个 [`Surface`](https://developer.android.com/reference/android/view/Surface) 的吗？！也就是说，按照一般套路，我只要这样: 


```java
@Override
public void onCreate(SurfaceHolder surfaceHolder) {
    super.onCreate(surfaceHolder);

    Surface surface = surfaceHolder.getSurface();
    Canvas canvas = surface.lockCanvas();

    // 或者直接 
    Canvas canvas = surfaceHolder.lockCanvas();

    // ...
}
```

岂不美哉？！


## 很可惜…… 

很可惜，不行……因为在 `Engine` 初创的时候， Surface 根本就还没准备好！于是，我们别无他法，只好给他加上 callback:

```java
SurfaceHolder.Callback callback = new SurfaceHolder.Callback() {
    @Override
    public void surfaceCreated(SurfaceHolder surfaceHolder) {
        // Surface 准备好啦！
    }

    @Override
    public void surfaceChanged(SurfaceHolder surfaceHolder, int i, int i1, int i2) {
        // Surface 大小变了……或者是 Surface 失去了焦点（譬如用户打开了个程序！）
    }

    @Override
    public void surfaceDestroyed(SurfaceHolder surfaceHolder) {
        // Surface 毁了……
    }
};


@Override
public void onCreate(SurfaceHolder surfaceHolder) {
    super.onCreate(surfaceHolder);

    surfaceHolder.addCallback(callback);
}
```

然后接下来，你就可以在 `surfaceCreated` 被 call 了之后，开一条线程，然后愉快的画画了！但是，


## 发现并没有那么简单……

但是我还想要在 Surface 上绘制 OpenGL 内容……我不想要辣鸡 Canvas! 抱着这样的想法，我上网一搜，什么都没搜到……我只好看项目代码 + 查文档，搞了半天才终于让他可以运作……所以我要把过程放出来！也好避免我以后自己少走弯路……

我们都知道，OpenGL 要绘制，必须得有 Context 。[GLSurfaceView 的硬直+方便我们是知道的](https://developer.android.com/reference/android/opengl/GLSurfaceView) ，一个 [`Renderer`](https://developer.android.com/reference/android/opengl/GLSurfaceView.Renderer) 就足够了。但是这里不一样，因为我们没有 GLSurfaceView 。我们也创建不了，因为这是 Service ，不是 Activity 。所以怎么办呢？我们就只能用土办法了…… 


**接下来的动作都在 onCreate 内完成，并且，因为怕有些手机还没有 GLES3 ，所以我用 GLES2**

来！记住我们的步骤！

- 创建 [`EGLDisplay`](https://developer.android.com/reference/android/opengl/EGLDisplay)！

    ```java
    EGLDisplay display = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY);
    ```
- 初始化 [`EGLConfig`](https://developer.android.com/reference/android/opengl/EGLConfig)!

    ```java
    EGLConfig[] configs = new EGLConfig[1];
    int[] numConfigs = new int[1];
    int[] configAttrs = new int[] {
            EGL14.EGL_RED_SIZE, 8,
            EGL14.EGL_GREEN_SIZE, 8,
            EGL14.EGL_BLUE_SIZE, 8,
            EGL14.EGL_DEPTH_SIZE, 16,
            EGL14.EGL_STENCIL_SIZE, 8,
            EGL14.EGL_RENDERABLE_TYPE, EGL14.EGL_OPENGL_ES2_BIT,
            EGL14.EGL_NONE
    };

    EGL14.eglChooseConfig(display, configAttrs, 0, configs, 0, configs.length, numConfigs, 0);

    EGLConfig config = configs[0];
    ```

    在这里我们可以看到很浓重的 NDK 的身影。一个个的数组就像是强行的指针，一点都不幸福……

    我们可以看到 configAttrs 那里就像是一个字符串，以 属性/值 属性/值 这样的方法来按顺序排列，最后以 `EGL_NONE` 收尾……
- 初始化 [`EGLContext`](https://developer.android.com/reference/android/opengl/EGLContext)!

    ```java
    int[] contextAttrs = new int[] {
            EGL14.EGL_CONTEXT_CLIENT_VERSION, 2,
            EGL14.EGL_NONE
    };

    context = EGL14.eglCreateContext(display, config, EGL14.EGL_NO_CONTEXT, contextAttrs, 0);
    ```
    
    可以看到，我在用的版本是 GLES2 ，跟我上面的加粗字体遥相呼应。小声逼逼一句，[GLES3](https://en.wikipedia.org/wiki/OpenGL_ES#OpenGL_ES_3.0) 好像没太普及开来？
- 初始化 [`EGLSurface`](https://developer.android.com/reference/android/opengl/EGLSurface)!

    ```java
    int[] surfaceAttrs = new int[] {
            EGL14.EGL_NONE
    };

    surface = EGL14.eglCreateWindowSurface(display, config, surfaceHolder.getSurface(), surfaceAttrs, 0);
    ```

    EGL 普遍采用这种 attr 的记录样式……
- 最后！经典的 `makeContextCurrent`!

    ```java
    EGL14.eglMakeCurrent(display, surface, surface, context);
    ```

就是这样！我们终于把 Surface 中的 OpenGL context 给~~压榨~~创建出来了！为了验证，只需要进行简单的清一下屏: 

```java
GLES20.glClearColor(0.9f, 0.8f, 0.7f, 1.0f);
GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT | GLES20.GL_DEPTH_BUFFER_BIT);

EGL14.eglSwapBuffers(display, surface); // 别忘了！
```

然后编译+运行，然后选择壁纸！你就可以发现原本黑乎乎的，现在已经变成美妙的肉色了！

![肉肉的](/assets/meat.png)

## 搞定！

接下来，怎么处置这个东西，就看你了！
