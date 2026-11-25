---
layout: post
section-type: post
title: "Ruby WeakRef: Hold Objects Without Keeping Them Alive"
category: ruby
tags: [ 'ruby', 'memory', 'weakref', 'garbage-collection' ]
comments: true
---

A normal reference keeps an object alive. A `WeakRef` points at an object *without*
preventing garbage collection. When nothing else references that object, the GC can
reclaim it and the weak reference becomes dead.

## Why it helps

Use `WeakRef` when you want a lookup cache, observer list, or registry that should
not pin objects in memory forever. Strong references in those places create leaks.
Weak references let the GC free unused objects while you still try to reuse them
when they are still around.

## Where to use it

- caches keyed by objects you do not own
- observer / listener lists that should not keep publishers or subscribers alive
- registries of temporary wrappers, proxies, or metadata
- memoization that should shrink when memory pressure rises

Do not use it for data you must keep. If the object must survive, hold a normal
reference.

## Minimal example

```ruby
require "weakref"

user = Object.new
weak = WeakRef.new(user)

weak.weakref_alive?  # => true
weak.__getobj__      # => the same Object

user = nil
GC.start

weak.weakref_alive?  # => false (usually, after GC runs)
# weak.__getobj__    # raises WeakRef::RefError
```

`weakref_alive?` tells you whether the object still exists. Calling methods on a
dead `WeakRef` raises `WeakRef::RefError`, so always check or rescue before use.

## Practical example: a soft cache

```ruby
require "weakref"

class SoftCache
  def initialize
    @store = {}
  end

  def fetch(key)
    if (weak = @store[key]) && weak.weakref_alive?
      return weak.__getobj__
    end

    value = yield
    @store[key] = WeakRef.new(value)
    value
  end
end

cache = SoftCache.new
obj = cache.fetch(:report) { Object.new }
same = cache.fetch(:report) { Object.new }  # reuses obj while it is alive

obj = same = nil
GC.start

cache.fetch(:report) { Object.new }  # builds a fresh object
```

While callers still hold the cached object, `fetch` returns it. Once everyone
drops it, GC can clear the entry and the next `fetch` rebuilds.

## Caveats

- GC timing is not guaranteed; an object may stay reachable longer than you expect.
- Always guard with `weakref_alive?` or rescue `WeakRef::RefError`.
- Weak refs are about memory lifetime, not thread safety. Protect shared stores with
  a mutex if multiple threads touch them.

`WeakRef` is a small stdlib tool with a big effect: remember objects when useful,
forget them when nothing else needs them.
