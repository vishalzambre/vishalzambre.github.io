---
layout: post
section-type: post
title: Confusing behavior of File.dirname
category: ruby-3.1.2
tags: [ 'ruby', 'tech' ]
comments: true
---

If you are using `File.dirname` to get the directory path and delete and do some other processing on path, then make sure you consider below use cases.

```
irb(main):001:0> File.dirname("")
=> "."
irb(main):002:0> File.dirname("   ")
irb(main):002:0> File.dirname("   ")
=> "."
irb(main):003:0> File.dirname("   foo")
=> "."
irb(main):004:0> File.dirname("   foo/bar")
=> "   foo"
irb(main):005:0> File.dirname("foo/bar")
=> "foo"
irb(main):006:0>
```

If dirname received empty string or string withouth `/` then it returns the current directory.


Not sure if this is a bug or feature &#128517;
