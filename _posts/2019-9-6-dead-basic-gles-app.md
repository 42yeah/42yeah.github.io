---
layout: post
title: 在 Android GLSurfaceView 上画一个三角形
categories: [ cg, android ]
---

鉴于我 **每一次** 都可以忘记怎么在安卓项目正好新建好的时候画一个三角形出来……真的不是忘了这个就是忘了那个……所以我决定写一个最最最简单的用 GLES 画一个三角形的出来（这应该网上到处都是了吧），来防止自己再忘掉某一步……

这不是个教程，完全是给自己的一个备忘录而已。有兴趣的就看看吧。

## 第一步：新建项目

此部跳过

## 第二步：把当前 view 改成自己新建的 `GLSurfaceView`

```java
public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        GLSurfaceView view = new GLSurfaceView(this);
        view.setEGLContextClientVersion(3);
        view.setRenderer(new Renderer(this));
        setContentView(view);
    }
}
```

**记得 setEGLContextClientVersion 啊……**

## 第三步：实现 `Renderer`

```java
public class Renderer implements GLSurfaceView.Renderer {
    Renderer() {}
    Renderer(Context context) {
        this.context = context;
    }

    @Override
    public void onSurfaceCreated(GL10 gl10, EGLConfig eglConfig) {
        program = new Program(
                readRawFile(R.raw.vertex),
                readRawFile(R.raw.fragment)
        );
        program.link();
        polygon = new Polygon(new float[] {
                0.0f, 0.0f, 0.0f,
                0.5f, 0.0f, 0.0f,
                0.0f, 0.5f, 0.0f
        });
        GLES30.glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
    }

    @Override
    public void onSurfaceChanged(GL10 gl10, int i, int i1) {
        // ...
    }

    @Override
    public void onDrawFrame(GL10 gl10) {
        GLES30.glClear(GLES30.GL_COLOR_BUFFER_BIT | GLES30.GL_DEPTH_BUFFER_BIT);
        polygon.draw(program);
        // ...
    }

    private String readRawFile(int resId) {
        // 读出 raw 内的文件，以字符串返回。用来读取 shader 
    }

    private Context context;
    private Polygon polygon;
    private Program program;
}
```

## 第四步：实现 Program

```java
public class Program {
    Program() {}
    Program(String vertex, String fragment) {
        vertexSource = vertex;
        fragmentSource = fragment;
        aPosLocation = 0;
        prog = 0;
    }

    void link() {
        prog = GLES30.glCreateProgram();
        GLES30.glAttachShader(prog, compile(GLES30.GL_VERTEX_SHADER, vertexSource));
        GLES30.glAttachShader(prog, compile(GLES30.GL_FRAGMENT_SHADER, fragmentSource));
        GLES30.glLinkProgram(prog);
        String log = GLES30.glGetProgramInfoLog(prog);
        Log.i("ShaderLog", "Log of program: " + log);
        aPosLocation = GLES30.glGetAttribLocation(prog, "aPos");
    }

    void use() {
        GLES30.glUseProgram(prog);
    }

    int getAPosLocation() {
        return aPosLocation;
    }

    // ... 扩展 uniform 和别的东西

    private int compile(int type, String source) {
        int shader = GLES30.glCreateShader(type);
        GLES30.glShaderSource(shader, source);
        GLES30.glCompileShader(shader);
        String log = GLES30.glGetShaderInfoLog(shader);
        Log.i("ShaderLog", "Log of shader " + type + ": " + log);
        return shader;
    }

    private int prog;
    private int aPosLocation;
    // 加别的 location 防止重复查找
    private String vertexSource;
    private String fragmentSource;
}
```

**记住 program 要 link！**

## 第五步：写 GLSL

- vertex.glsl
```glsl
attribute vec3 aPos;

void main() {
    gl_Position = vec4(aPos, 1.0);
}
```

- fragment.glsl
```glsl
void main() {
    gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0);
}
```

## 第六步：实现 Polygon

```java
public class Polygon {
    Polygon() {}
    Polygon(float[] vertices) {
        fbo = ByteBuffer.allocateDirect(vertices.length * 4).order(ByteOrder.nativeOrder()).asFloatBuffer();
        fbo.position(0);
        fbo.put(vertices);
        fbo.position(0);
    }

    void draw(Program program) {
        program.use();
        GLES30.glEnableVertexAttribArray(program.getAPosLocation());
        GLES30.glVertexAttribPointer(program.getAPosLocation(), 3, GLES30.GL_FLOAT, false, 0, fbo);
        GLES30.glDrawArrays(GLES30.GL_TRIANGLES, 0, 3);
    }

    private FloatBuffer fbo;
}
```

- `FloatBuffer` 的 order 必须为 native order ，同时必须是用 direct allocate 的才行！
- `put` 完数据进去记得 `position(0)` 啊……
- 记得记得记得要 `glEnableVertexAttribArray` ，不然既不报错又不会显示出来……
- 记住 ES 不是 OpenGL 不能 `layout (location = X)` 啊……所以 `glVertexAttribPointer` 的第一个参数是 aPos 的实际位置，而不是 X 

## 没了

就这样了。这么点玩意儿怎么老是可以漏啊…… 不管了！反正到时候忘记就回来这看。88！