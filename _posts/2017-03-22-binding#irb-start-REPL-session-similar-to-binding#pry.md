---
layout: post
section-type: post
title: 'Binding#irb Start a REPL session similar to binding.pry'
category: ruby-2.4.0
tags: [ 'ruby', 'tech' ]
---
Ruby 2.4.0 introduced new feature for debugging

While you are debugging, you may often use <code>p</code> to see the value of variables. With <a target='_blank' href='https://github.com/pry/pry'>pry</a> you can use <code>binding.pry</code> in your application to launch a REPL and run any Ruby code. <a target="_blank" href="https://github.com/ruby/ruby/commit/493e48897421d176a8faf0f0820323d79ecdf94a">Ruby 2.4.0</a> introduces <code>binding.irb</code> which behaves like that with irb.
<pre><code data-trim class="yaml">
  irb(main):001:0> def test_irb
  irb(main):002:1>   p 'before irb'
  irb(main):003:1>   binding.irb
  irb(main):004:1>   p 'after irb'
  irb(main):005:1> end
  => :test_irb
  irb(main):006:0> test_irb
  "before irb"
  irb(main):001:0> exit
  "after irb"
  => "after irb"
  irb(main):007:0>
</code></pre>
