---
layout: post
section-type: post
title: Ruby 4.0.0 Released - Key Features and Improvements
category: ruby-4.0.0
tags: [ 'ruby', 'tech' ]
comments: false
---

Ruby 4.0.0 was released on December 25, 2025, bringing significant enhancements focused on code isolation, performance optimization, and parallel execution capabilities. This release introduces several experimental features and improvements that will shape the future of Ruby development.

## Ruby Box - Experimental Code Isolation

One of the most notable additions in Ruby 4.0.0 is **Ruby Box**, an experimental feature that provides a mechanism for isolating definitions within a `Ruby::Box` class. This isolation encompasses:

- Monkey patches
- Global and class variables
- Class and module definitions
- Loaded libraries

To enable Ruby Box, set the environment variable `RUBY_BOX=1`:

```ruby
# Example usage (when RUBY_BOX=1 is set)
box = Ruby::Box.new do
  # Isolated code environment
  class MyClass
    def hello
      "Hello from isolated box"
    end
  end
end
```

### Use Cases for Ruby Box

1. **Test Isolation**: Run test cases in isolation to prevent interference from monkey patches
2. **Parallel Web Application Instances**: Execute multiple web application instances in parallel for blue-green deployments within a single Ruby process
3. **Dependency Evaluation**: Test dependency updates by running multiple application instances concurrently and comparing responses

## ZJIT - The New JIT Compiler

Ruby 4.0.0 introduces **ZJIT**, a new just-in-time compiler developed as the successor to YJIT. To build Ruby with ZJIT support, you'll need:

- Rust 1.85.0 or newer
- Enable ZJIT using the `--zjit` flag

```bash
# Building Ruby with ZJIT
./configure --enable-zjit
make
```

While ZJIT currently outperforms the interpreter, it hasn't yet surpassed YJIT in speed. The Ruby team encourages developers to experiment with ZJIT, but advises waiting for future releases before deploying it in production environments.

## Ractor Improvements

Ractor, Ruby's parallel execution mechanism, has received several important enhancements:

### Ractor::Port

A new `Ractor::Port` class addresses issues related to message sending and receiving:

```ruby
# Example of Ractor::Port usage
port = Ractor::Port.new

ractor = Ractor.new(port) do |p|
  p.send("Hello from Ractor")
end

message = port.receive
puts message  # => "Hello from Ractor"
```

### Ractor.shareable_proc

The new `Ractor.shareable_proc` method facilitates sharing `Proc` objects between Ractors:

```ruby
# Creating a shareable proc
shareable_proc = Ractor.shareable_proc do |x|
  x * 2
end

# Can be used across multiple Ractors
ractor = Ractor.new(shareable_proc) do |proc|
  proc.call(5)  # => 10
end
```

### Performance Improvements

- Reduced contention on global locks
- Minimized CPU cache contention during parallel execution

These updates aim to stabilize and optimize Ractor, moving it closer to leaving its experimental status.

## Language Changes

### Splat Operator Behavior

The splat operator `*nil` no longer invokes `nil.to_a`, aligning its behavior with `**nil`, which does not call `nil.to_hash`:

```ruby
# Ruby 3.x behavior
[*nil]  # => [] (called nil.to_a)

# Ruby 4.0.0 behavior
[*nil]  # => [] (no method call)
```

### Logical Binary Operators Line Continuation

Logical binary operators (`||`, `&&`, `and`, `or`) at the beginning of a line now continue the previous line, similar to the fluent dot syntax:

```ruby
# Ruby 4.0.0 allows this:
result = some_condition
  || default_value
  || fallback_value

# Similar to how method chaining works:
result = object
  .method_one
  .method_two
```

## Core Class Updates

### Array Improvements

**Array#rfind**: A more efficient alternative to `array.reverse_each.find`:

```ruby
array = [1, 2, 3, 4, 5]
array.rfind { |n| n > 3 }  # => 5 (finds from the end)
```

**Array#find**: An optimized override of `Enumerable#find` for better performance on arrays.

### Set Enhancements

**Set is now a core class**: Previously an autoloaded stdlib class, `Set` is now part of Ruby's core, making it available without requiring `require 'set'`.

**Set#inspect improvement**: `Set#inspect` now uses a simpler display format, similar to literal arrays:

```ruby
# Set is now a core class (no require needed in Ruby 4.0.0)
set = Set.new([1, 2, 3])

# Ruby 3.x behavior
set.inspect  # => "#<Set: {1, 2, 3}>"

# Ruby 4.0.0 behavior
set.inspect  # => "Set[1, 2, 3]"
```

**Deprecation**: Passing arguments to `Set#to_set` and `Enumerable#to_set` is now deprecated. [Feature #21390]

```ruby
# Deprecated in Ruby 4.0.0
[1, 2, 3].to_set(:some_arg)  # => Warning: passing arguments to to_set is deprecated

# Use without arguments
[1, 2, 3].to_set  # => Set[1, 2, 3]
```


### Binding Enhancements

`Binding#local_variables` no longer includes numbered parameters. New methods have been added to access numbered parameters and the "it" parameter:

```ruby
binding = binding()

# New methods for implicit parameters
binding.implicit_parameters          # => Returns numbered parameters
binding.implicit_parameter_get(1)    # => Get specific numbered parameter
binding.implicit_parameter_defined?(1)  # => Check if parameter exists
```

### Enumerator.produce Enhancement

`Enumerator.produce` now accepts an optional `size` keyword argument:

```ruby
# Specify size as integer
enum = Enumerator.produce(0) { |n| n + 1 }.take(10)
enum.size  # => 10

# Specify size as Float::INFINITY
infinite_enum = Enumerator.produce(0, size: Float::INFINITY) { |n| n + 1 }

# Specify size as callable
dynamic_size_enum = Enumerator.produce(0, size: -> { calculate_size }) { |n| n + 1 }

# Unknown size (nil)
unknown_size_enum = Enumerator.produce(0, size: nil) { |n| n + 1 }
```

## Migration Considerations

When upgrading to Ruby 4.0.0, consider the following:

1. **Ruby Box**: Currently experimental - use with caution in production
2. **ZJIT**: Requires Rust 1.85.0+ and is still experimental
3. **Splat Operator**: Review code using `*nil` as behavior has changed
4. **Binding Changes**: Update code that relies on `Binding#local_variables` including numbered parameters
5. **Ractor**: While improved, still experimental - test thoroughly before production use

## Summary

Ruby 4.0.0 represents a significant milestone in Ruby's evolution, introducing powerful new features for code isolation, performance optimization, and parallel execution. While some features are experimental, they provide a glimpse into Ruby's future direction.

Key highlights:
- **Ruby Box** for code isolation
- **ZJIT** as the next-generation JIT compiler
- **Enhanced Ractor** for better parallel execution
- **Language improvements** for better developer experience
- **Core class optimizations** for better performance

For the complete list of changes, bug fixes, and improvements, refer to the [official Ruby 4.0.0 release notes](https://www.ruby-lang.org/en/news/2025/12/25/ruby-4-0-0-released/).

