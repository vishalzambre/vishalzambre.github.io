---
layout: post
section-type: post
title: "How to Write Thread-Safe Ruby Code"
category: ruby
tags: [ 'ruby', 'concurrency', 'thread-safety', 'mutex', 'performance' ]
comments: true
---

Thread safety means your code behaves correctly even when multiple threads run
at the same time. In MRI Ruby, the GIL limits true parallel execution of Ruby
bytecode, but thread safety still matters. Race conditions can happen whenever
threads interleave around shared state.

## The classic ||= pitfall

Using `||=` for lazy initialization looks harmless, but it is not thread-safe.
Two threads can observe `@cache` as `nil` and both compute the value.

```ruby
class ReportBuilder
  def report
    @report ||= expensive_report
  end

  private

  def expensive_report
    sleep 1
    "report"
  end
end
```

If two threads call `report` together, you may compute twice or partially update
shared state. This is a race condition.

## Make ||= safe with a Mutex

Wrap the lazy initialization in a mutex and double-check the value inside the
lock.

```ruby
class ReportBuilder
  def initialize
    @report_lock = Mutex.new
  end

  def report
    return @report if @report

    @report_lock.synchronize do
      @report ||= expensive_report
    end
  end

  private

  def expensive_report
    sleep 1
    "report"
  end
end
```

This keeps the fast path cheap and makes the write safe.

## A safer alternative: use Concurrent::Map

If you need a cache with multiple keys, use a thread-safe structure.

```ruby
require "concurrent/map"

class PricingCache
  def initialize
    @cache = Concurrent::Map.new
  end

  def price_for(sku)
    @cache.compute_if_absent(sku) { expensive_lookup(sku) }
  end

  private

  def expensive_lookup(sku)
    sleep 1
    42
  end
end
```

## Guidelines for thread-safe Ruby

- Avoid shared mutable state when possible.
- Protect writes with Mutex or use thread-safe collections.
- Keep critical sections small.
- Prefer immutability for shared objects.
- Test race conditions with many threads.

## Summary

Even with the GIL, Ruby code can hit race conditions. `||=` is a common source
of unsafe lazy initialization. Guard it with a mutex or use thread-safe data
structures for shared caches.

## References

- [The GIL and MRI - Working With Ruby](https://workingwithruby.com/wwrt/intro/)
