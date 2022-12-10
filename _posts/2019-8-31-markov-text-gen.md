---
layout: post
title: 用马尔可夫链生成各种文本
categories: [ algorithm ]
---

马尔可夫链 (Markov Chain) ，也可以叫他离散时间马尔可夫链或者别的东西（别看我，我不是专业学概率论和数理统计的好吧），是由俄国数学家安德烈·马尔可夫（Андрей Андреевич Марков）发现的。他是描述空间从一个状态到另一个状态转换的随机过程。

## 废话结束！

![Markov chain](/assets/markov.png)

马尔可夫链本身其实一点都不好玩。但是有趣的地方就是因为他的特性，我们可以用它来脑作各种很傻逼的故事！这玩意不需要知道什么机器学习，神经网络之类的玩意儿，只要知道他最简单的原理就可以了。那么我们就马上来看看怎么用这个名字看起来很高端的东西来做各种奇奇怪怪的东西吧！

## 原理

我不是数学老师，所以很明显我是不会好好的说这个东西的；我直接用实例来开始说，好吧：

```
The cat asked the dog: "What is true love?" Answered the dog: "Loving the cat."
```

这是一段很简单的文字，或者叫 corpus （文集）。不用从网上找是从哪来的，这是我为了举个例子瞎掰的。那么马可夫链是怎么工作的呢？

## 走文集

首先，我们会进行一个叫做 ”走文集“ 的操作：
- 先看头两个单词：`The cat`。
- 然后我们看这两个单词的下一个单词：`asked` 。
- 然后我们把它组成一个小集合：`{ "The cat": [ "asked" ] }` 。
- 没了。接下来往下移，我们来看第一个单词和第二个单词的组合： `cat asked` 。
- 和他的下一个单词： `the` 。
- 把他们的组合加到小集合里：`{ "The cat": [ "asked" ], "cat asked": [ "the" ] }`。
- 一直移动下去，直到填满整个集合。额外值得注意的是，标点符号是保留的。

你可能会疑惑。为什么值是一个数组呢？因为仔细观察上面的那个文集。在里面，`the dog:` 这个组合出现了两次。于是在走到那里的时候，这个数组关于 the dog 的那部分就会变成这样：

```json
{
    ...
    "the dog": [ "\"What", "\"Loving" ],
    ...
}
```

分别出自于 `...asked the dog: "What is t...` 和 `...Answered the dog: "Loving th...` 。

因此，走完文集之后，集合应该长这样：

```json
{ "The cat": [ "asked" ],
  "cat asked": [ "the" ],
  "asked the": [ "dog:" ],
  "the dog:": [ "\"What", "\"Loving" ],
  "dog: \"What": [ "is" ],
  "\"What is": [ "true" ],
  "is true": [ "love?\"" ],
  "true love?\"": [ "Answered" ],
  "love?\" Answered": [ "the" ],
  "Answered the": [ "dog:" ],
  "dog: \"Loving": [ "the" ],
  "\"Loving the": [ "cat.\"" ],
  "the cat.\"": [ null ] }
```

可以看到，最后那里结尾处就是 null ，也被叫做 suffix 。从我刚刚说的话可以推断出，第一句话（也就是第一个词和第二个词的组合），当然也就叫做 prefix 了。

prefix 自己应该自成一个数组，这样程序就知道应该从什么开始脑作了： `[ "The cat" ]` 。因为我给的文集太小（只有一句话），所以当然只有一个词了。当文集变大之后，就不是这么简单了。具体的会在后面说。

那么既然文集已经走完了，并且我们已经有了整个这个集合和一个 prefix 的集合了，我们就可以开始生成文本了！我们先从 prefix 开始，一句句的生成吧：

## 生成文本

生成文本的过程非常简单。先从 prefix 开始，不断检查这句话目前的最后两个单词对应集合内哪个键位，有什么元素，然后就把元素加上去（有点像链表）：

1. `The cat`
2. `[The cat]` -> `asked`
3. `The cat asked`
4. `The [cat asked]` -> `the`
5. `The cat asked the`
6. `The cat [asked the]` -> `dog:`
7. `The cat asked the dog:`
8. `The cat asked [the dog:]` -> `"What`, `"Loving`

现在这里停一下。很明显这里出现了分叉！这就是马尔可夫链的美妙之处了：现在我们假设我们完全随机的选了后面那个。好了继续：

9. `The cat asked the dog: "Loving`

再停一下。这里出现了些很丑陋的情况，譬如这个引号开了不一定会有的关（这里的确有的关，但在别的情况里就不一定了）。这个就你们自己去解决吧，我就算了，毕竟年纪大了：

10. `The cat asked the [dog: "Loving]` -> `the`
11. `The cat asked the dog: "Loving the`
12. `The cat asked the dog: ["Loving the]` -> `cat."`
13. `The cat asked the dog: "Loving the cat."`

至此，一段由马尔可夫链生成的废话完成。在这种情况下，这就是很符合语法的废话：对面完全没有感受到上下文，并且其实本身的意义也好像没有。但是管啥呢！从此，你可以用马尔可夫链生成废话和别人聊天了！

## 文集能大一点吗？有很多句话怎么办？

很简单，我们只要把这个大的文集用句号分割：

```js
let paras = corpus.split(".");
```

然后对于 para 里面的每一段，都把它走一次就行了！（记得在句尾把句号加回去！）假如你想要，也能根据叹号逗号诸如此类的来分割，完全没问题：

```js
for (let i = 0; i < paras.length; i++) {
    walk(paras[i] + ".");
}
```

对于你自己来说，假如要生成多个段落的话，只要重复执行几次生成那个步骤就可以了！

## 写作手法

我们都知道，不同的作者有不同的写作手法。挑选的文集不一样通常也会出现各种各样的结果。假如我们挑选很科幻的文章（例如阿西莫夫的《基地》），就会出现各种高端科学字眼。假如我们挑选魔幻的文章（《指环王》！），就会出现魔幻的字眼。假如我们挑选科学性的文章（论文？）就会出现很严谨的字眼，让整篇文章虽然看不懂，但好像跟论文一样。把不同文学作品混在一起还会出现很多奇怪的玩意儿。你也能用这个来生成属于自己的 lorem ipsum! 

当然，在哪里能看这么多免费网上爽文呢？当然是 [古登堡计划](https://www.gutenberg.org) 啦！有个不好的地方，就是我上面括号里的文章都不在……因为他们还有版权。

## 实例

说完了！接下来假如你自己想玩又不想写，这里是一个小玩具：

<textarea id="corpus" rows="10">Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversation?'
So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.
There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, 'Oh dear! Oh dear! I shall be late!' (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.
In another moment down went Alice after it, never once considering how in the world she was to get out again.
The rabbit-hole went straight on like a tunnel for some way, and then dipped suddenly down, so suddenly that Alice had not a moment to think about stopping herself before she found herself falling down a very deep well.
Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next. First, she tried to look down and make out what she was coming to, but it was too dark to see anything; then she looked at the sides of the well, and noticed that they were filled with cupboards and book-shelves; here and there she saw maps and pictures hung upon pegs. She took down a jar from one of the shelves as she passed; it was labelled 'ORANGE MARMALADE', but to her great disappointment it was empty: she did not like to drop the jar for fear of killing somebody, so managed to put it into one of the cupboards as she fell past it.
'Well!' thought Alice to herself, 'after such a fall as this, I shall think nothing of tumbling down stairs! How brave they'll all think me at home! Why, I wouldn't say anything about it, even if I fell off the top of the house!' (Which was very likely true.)
Down, down, down. Would the fall never come to an end! 'I wonder how many miles I've fallen by this time?' she said aloud. 'I must be getting somewhere near the centre of the earth. Let me see: that would be four thousand miles down, I think--' (for, you see, Alice had learnt several things of this sort in her lessons in the schoolroom, and though this was not a very good opportunity for showing off her knowledge, as there was no one to listen to her, still it was good practice to say it over) '--yes, that's about the right distance--but then I wonder what Latitude or Longitude I've got to?' (Alice had no idea what Latitude was, or Longitude either, but thought they were nice grand words to say.)
Presently she began again. 'I wonder if I shall fall right through the earth! How funny it'll seem to come out among the people that walk with their heads downward! The Antipathies, I think--' (she was rather glad there was no one listening, this time, as it didn't sound at all the right word) '--but I shall have to ask them what the name of the country is, you know. Please, Ma'am, is this New Zealand or Australia?' (and she tried to curtsey as she spoke--fancy curtseying as you're falling through the air! Do you think you could manage it?) 'And what an ignorant little girl she'll think me for asking! No, it'll never do to ask: perhaps I shall see it written up somewhere.'
Down, down, down. There was nothing else to do, so Alice soon began talking again. 'Dinah'll miss me very much to-night, I should think!' (Dinah was the cat.) 'I hope they'll remember her saucer of milk at tea-time. Dinah my dear! I wish you were down here with me! There are no mice in the air, I'm afraid, but you might catch a bat, and that's very like a mouse, you know. But do cats eat bats, I wonder?' And here Alice began to get rather sleepy, and went on saying to herself, in a dreamy sort of way, 'Do cats eat bats? Do cats eat bats?' and sometimes, 'Do bats eat cats?' for, you see, as she couldn't answer either question, it didn't much matter which way she put it. She felt that she was dozing off, and had just begun to dream that she was walking hand in hand with Dinah, and saying to her very earnestly, 'Now, Dinah, tell me the truth: did you ever eat a bat?' when suddenly, thump! thump! down she came upon a heap of sticks and dry leaves, and the fall was over.
Alice was not a bit hurt, and she jumped up on to her feet in a moment: she looked up, but it was all dark overhead; before her was another long passage, and the White Rabbit was still in sight, hurrying down it. There was not a moment to be lost: away went Alice like the wind, and was just in time to hear it say, as it turned a corner, 'Oh my ears and whiskers, how late it's getting!' She was close behind it when she turned the corner, but the Rabbit was no longer to be seen: she found herself in a long, low hall, which was lit up by a row of lamps hanging from the roof.
There were doors all round the hall, but they were all locked; and when Alice had been all the way down one side and up the other, trying every door, she walked sadly down the middle, wondering how she was ever to get out again.
Suddenly she came upon a little three-legged table, all made of solid glass; there was nothing on it except a tiny golden key, and Alice's first thought was that it might belong to one of the doors of the hall; but, alas! either the locks were too large, or the key was too small, but at any rate it would not open any of them. However, on the second time round, she came upon a low curtain she had not noticed before, and behind it was a little door about fifteen inches high: she tried the little golden key in the lock, and to her great delight it fitted!
Alice opened the door and found that it led into a small passage, not much larger than a rat-hole: she knelt down and looked along the passage into the loveliest garden you ever saw. How she longed to get out of that dark hall, and wander about among those beds of bright flowers and those cool fountains, but she could not even get her head though the doorway; 'and even if my head would go through,' thought poor Alice, 'it would be of very little use without my shoulders. Oh, how I wish I could shut up like a telescope! I think I could, if I only know how to begin.' For, you see, so many out-of-the-way things had happened lately, that Alice had begun to think that very few things indeed were really impossible.
There seemed to be no use in waiting by the little door, so she went back to the table, half hoping she might find another key on it, or at any rate a book of rules for shutting people up like telescopes: this time she found a little bottle on it, ('which certainly was not here before,' said Alice,) and round the neck of the bottle was a paper label, with the words 'DRINK ME' beautifully printed on it in large letters.
It was all very well to say 'Drink me,' but the wise little Alice was not going to do that in a hurry. 'No, I'll look first,' she said, 'and see whether it's marked "poison" or not'; for she had read several nice little histories about children who had got burnt, and eaten up by wild beasts and other unpleasant things, all because they would not remember the simple rules their friends had taught them: such as, that a red-hot poker will burn you if you hold it too long; and that if you cut your finger very deeply with a knife, it usually bleeds; and she had never forgotten that, if you drink much from a bottle marked 'poison,' it is almost certain to disagree with you, sooner or later.
However, this bottle was not marked 'poison,' so Alice ventured to taste it, and finding it very nice, (it had, in fact, a sort of mixed flavour of cherry-tart, custard, pine-apple, roast turkey, toffee, and hot buttered toast,) she very soon finished it off.
</textarea>
<a href="javascript:generate()">生成</a>

## 故事

**以下内容不是我写的。**

<span id="story"></span>

<script>
let logs = {};
let prefixes = [];

function trim(corpus, from, to = " ") {
    let prev;
    do {
        prev = corpus;
        corpus = corpus.replace(from, to);
    } while (prev != corpus);
    return corpus;
}

function walkParagraph(corpus) {
    corpus = trim(corpus, "\n");
    corpus = trim(corpus, "  ");
    corpus = trim(corpus, ". ", ".");
    let sentences = corpus.split(".");
    for (let i = 0; i < sentences.length; i++) {
        walk(sentences[i] + ".");
    }
}

function walk(corpus) {
    let words = corpus.split(" ");
    for (let i = 0; i < words.length - 1; i++) {
        let w = words[i] + " " + words[i + 1];
        let next = null;
        if (i + 2 < words.length) {
            next = words[i + 2];
        }
        if (logs[w] != undefined) {
            logs[w].push(next);
        } else {
            logs[w] = [ next ];
        }
        if (i == 0) {
            prefixes.push(w);
        }
    }
}

function babble() {
    let sentence = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    // look for next
    while (true) {
        let frags = sentence.split(" ");
        let current = frags[frags.length - 2] + " " + frags[frags.length - 1];
        let candidates = logs[current];
        let next = candidates[Math.floor(Math.random() * candidates.length)];

        if (next == null) {
            return sentence;
        } else {
            sentence += " " + next;
        }
    }
    return "Never used";
}

function genParagraph(sentenceCount) {
    let build = "";
    for (let i = 0; i < sentenceCount; i++) {
        build += babble() + " ";
    }
    return build;
}

function generate() {
    let corpus = document.getElementById("corpus").value;
    logs = [];
    prefixes = [];
    walkParagraph(corpus);
    document.getElementById("story").innerHTML = genParagraph(3)
}

generate();
</script>