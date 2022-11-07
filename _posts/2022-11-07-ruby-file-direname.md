---
layout: post
section-type: post
title: Confusing behavior of File.dirname
category: ruby-3.1.2
tags: [ 'ruby', 'tech' ]
comments: true
---

If you are using [File.dirname](https://ruby-doc.org/core-3.1.2/File.html#method-c-dirname) to get the directory path and delete and do some other processing on path, then make sure you consider below use cases.

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

To get absolute path you should always use [File.expand_path](https://ruby-doc.org/core-3.1.2/File.html#method-c-expand_path)

`File.expand_path(File.dirname(__FILE__))`

If you are on above [Ruby 2.0](http://www.ruby-lang.org/en/news/2013/02/24/ruby-2-0-0-p0-is-released/) then `File.expand_path('..', __FILE__)` can be use to get current path

