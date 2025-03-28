# 📖 Docsify Editor
🚀 **Docsify Editor**  is a simple web-based Markdown editor built with Docsify and EasyMDE, supporting real-time preview and optional server-side storage.

![](/uploads/20250328095506256.png)

```mermaid
graph LR;
A --> B
C --> D
B --> C
我的--> 你的
他的-->我的
你的-->高级的
```

```javascript
function abc(){
		var test = 23;
		var test2 = 456;
		var hello = "23234234"
}
```

```powershell
Invoke-RestMethod "abc"
```

```bash
$ echo "hello"
cp aaa bbb
```

```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title       Adding GANTT diagram functionality to mermaid
    excludes    weekends
    %% (`excludes` accepts specific dates in YYYY-MM-DD format, days of the week ("sunday") or "weekends", but not the word "weekdays".)

    section A section
    Completed task            :done,    des1, 2014-01-06,2014-01-08
    Active task               :active,  des2, 2014-01-09, 3d
    Future task               :         des3, after des2, 5d
    Future task2              :         des4, after des3, 5d

    section Critical tasks
    Completed task in the critical line :crit, done, 2014-01-06,24h
    Implement parser and jison          :crit, done, after des1, 2d
    Create tests for parser             :crit, active, 3d
    Future task in critical line        :crit, 5d
    Create tests for renderer           :2d
    Add to mermaid                      :until isadded
    Functionality added                 :milestone, isadded, 2014-01-25, 0d

    section Documentation
    Describe gantt syntax               :active, a1, after des1, 3d
    Add gantt diagram to demo page      :after a1  , 20h
    Add another diagram to demo page    :doc1, after a1  , 48h

    section Last section
    Describe gantt syntax               :after doc1, 3d
    Add gantt diagram to demo page      :20h
    Add another diagram to demo page    :48h
```

我的内容在这里

好吧，都在这里了

不要加载新的内容

## Filelist
[filelist](filelist.md ':include')