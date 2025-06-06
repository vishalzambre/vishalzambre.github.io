---
layout: post
section-type: post
title: 'String#concat, Array#concat and String#prepend Now takes multiple arguments.'
category: ruby-2.4.0
tags: [ 'ruby', 'tech' ]
comments: false
---
Now <code>String#concat</code>, <code>Array#concat</code> and <code>String#prepend</code>
<ul class='list-unstyled text-left content'>
  <li>
    String#concat
  </li>
  <li>
    <pre><code data-trim class="yaml">
      # Before 2.4.0

      irb(main):004:0&gt; "Zambre".concat(" ", "Vishal", " ", "M")
      ArgumentError: wrong number of arguments (given 4, expected 1)
        from (irb):4:in `concat`
        from (irb):4
        from /home/vishalz/.rvm/rubies/ruby-2.3.1/bin/irb:11:in `&lt;main&gt;`
      irb(main):005:0&gt;

      # In 2.4.0

      irb(main):022:0&gt; "Zambre".concat(" ", "Vishal", " ", "M")
      =&gt; "Zambre Vishal M"
      irb(main):023:0&gt;
    </code></pre>
  </li>
  <li>
    Array#concat
  </li>
  <li>
    <pre><code data-trim class="yaml">
      # Before 2.4.0

      irb(main):002:0&gt; [1,2].concat([3],[4,5])
      ArgumentError: wrong number of arguments (given 2, expected 1)
        from (irb):2:in `concat'
        from (irb):2
        from /home/vishalz/.rvm/rubies/ruby-2.3.1/bin/irb:11:in `&lt;main&gt;'
      irb(main):003:0&gt;

      # In 2.4.0

      irb(main):017:0&gt; [1,2].concat([3],[4,5])
      =&gt; [1, 2, 3, 4, 5]
      irb(main):018:0&gt;
    </code></pre>
  </li>
  <li>
    String#prepend
  </li>
  <li>
    <pre><code data-trim class="yaml">
      # Before 2.4.0

      irb(main):003:0&gt; "Zambre".prepend("Vishal", " ", "M", " ")
      ArgumentError: wrong number of arguments (given 4, expected 1)
      	from (irb):3:in `prepend'
      	from (irb):3
      	from /home/vishalz/.rvm/rubies/ruby-2.3.1/bin/irb:11:in `&lt;main&gt;'
      irb(main):004:0&gt;

      # In 2.4.0

      irb(main):021:0&gt; "Zambre".prepend("Vishal", " ", "M", " ")
      =&gt; "Vishal M Zambre"
      irb(main):022:0&gt;
    </code></pre>
  </li>
</ul>
<small>Many thanks to <a target="_blank" href='https://bugs.ruby-lang.org/issues/12333'>Tsuyoshi Sawada</a> for the feature!</small>
