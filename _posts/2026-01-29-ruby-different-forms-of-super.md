---
layout: post
section-type: post
title: "Ruby: Different Forms of super With Examples"
category: Ruby
tags: [ 'ruby', 'inheritance', 'super', 'methods' ]
comments: true
---

# Ruby: Different Forms of +super+

This short note explains the different ways to call +super+ in Ruby and what each form does.
Every example is minimal and focused on the exact behavior of +super+.

## 1) +super+ (implicit arguments)

When you call +super+ with no parentheses, Ruby forwards the *same* arguments and block
received by the current method to the parent implementation.

```
  class Base
    def greet(name)
      "Hello, #{name}"
    end
  end

  class Child < Base
    def greet(name)
      super + "!"
    end
  end

  Child.new.greet("Vishal")
  # => "Hello, Vishal!"
```

## 2) +super(args)+ (explicit arguments)

When you pass arguments explicitly, Ruby uses *exactly* those arguments for the parent call.

```
  class Base
    def greet(name)
      "Hello, #{name}"
    end
  end

  class Child < Base
    def greet(name)
      super("Guest")
    end
  end

  Child.new.greet("Vishal")
  # => "Hello, Guest"
```

## 3) +super()+ (no arguments)

When you call +super()+ with empty parentheses, Ruby calls the parent method with *no arguments*,
even if the current method received arguments.

```
  class Base
    def greet
      "Hello"
    end
  end

  class Child < Base
    def greet(name)
      super()
    end
  end

  Child.new.greet("Vishal")
  # => "Hello"
```

## 4) +super(&block)+ (forward or replace block)

Blocks are forwarded with +super+ implicitly. You can also pass a specific block using +&block+.

```
  class Base
    def wrap
      "[#{yield}]"
    end
  end

  class Child < Base
    def wrap(&block)
      super(&block)
    end
  end

  Child.new.wrap { "content" }
  # => "[content]"
```

## 5) +super+ with keyword arguments

Keyword arguments follow the same rules. If you use implicit +super+, Ruby forwards keywords.
If you pass keywords explicitly, only those are used.

```
  class Base
    def build(name:, role: "user")
      "#{name} (#{role})"
    end
  end

  class Child < Base
    def build(name:, role: "admin")
      super
    end
  end

  Child.new.build(name: "Vishal")
  # => "Vishal (admin)"
```

## 6) Error when no parent method exists

If the parent class does not implement the same method, +super+ raises +NoMethodError+.
Make sure the parent method exists or guard the call.

```
  class Base
  end

  class Child < Base
    def greet
      super
    end
  end

  Child.new.greet
  # => NoMethodError
```

## Summary

* +super+ forwards the same arguments and block.
* +super(args)+ uses only the given arguments.
* +super()+ calls the parent with no arguments.
* +super(&block)+ forwards a specific block.
* Missing parent method raises +NoMethodError+.
