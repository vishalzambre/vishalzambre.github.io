---
layout: post
section-type: post
title: String supports Unicode case mappings
category: ruby-2.4.0
tags: [ 'ruby', 'tech' ]
comments: false
---
<code data-trim class="yaml">String/Symbol#upcase/downcase/swapcase/capitalize(!)</code> now handle Unicode case mappings instead of only ASCII case mappings

<pre><code data-trim class="yaml">
  # Before 2.4.0

  irb(main):001:0> 'Türkiye'.upcase
  => "TüRKIYE"
  irb(main):002:0>

  # In 2.4.0

  irb(main):001:0> 'Türkiye'.upcase
  => "TÜRKIYE"
  irb(main):002:0>

  # German mapping
  irb(main):004:0> 'ß'.upcase =>
  => "SS"
</code></pre>

<small>Many thanks to <a target="_blank" href='https://bugs.ruby-lang.org/issues/10085'>Martin Dürst</a> for the feature!</small>
