---
layout: post
section-type: post
title: Ruby in WebAssembly
category: ruby-3.2.0
tags: [ 'tag1', 'tag2' ]
comments: true
---

There is an official [Wasm build of Ruby](https://github.com/ruby/ruby.wasm/). It supports WASI and a wide array of features.

https://www.ruby-lang.org/en/news/2022/04/03/ruby-3-2-0-preview1-released/

## What is WebAssembly?

WebAssembly (commonly shortened as Wasm) is a binary low-level instruction format that runs on a virtual machine. The language was designed as an alternative to JavaScript. Its aim is to run applications on any browser at near-native speeds. Wasm can be targeted from any high-level language like C, Go, Rust, and now also Ruby.

Wasm [became a W3C standard](https://www.w3.org/2019/12/pressrelease-wasm-rec.html.en) in 2019, opening the path to writing high-performing applications for the Web. The standard itself is still evolving, and its ecosystem is growing. Currently, this technology is receiving a lot of focus from the Cloud Native Computing Foundation (CNCF), with several projects under development.

`rlang` (a subset of Ruby) can run Wasm32 code in a `wasm32-wasi` runtime like `wasmtime`.

## Usage

To use the official Ruby Wasm,[ download a prebuilt binary](https://github.com/ruby/ruby.wasm/releases) and decompress the downloaded archive.

## Try ruby.wasm (no installation needed)

Try ruby.wasm in [TryRuby](https://try.ruby-lang.org/playground/#code=puts+RUBY_DESCRIPTION&engine=cruby-3.2.0dev) in your browser.

## Quick Example: Ruby on browser

Create and save `index.html` page with the following contents:

```
<html>
  <script src="https://cdn.jsdelivr.net/npm/ruby-3_2-wasm-wasi@1.0.1/dist/browser.script.iife.js"></script>
  <script type="text/ruby">
    puts "Hello, world!"
  </script>
</html>
```

## Quick Example: How to package your Ruby application as a WASI application

Dependencies: [wasi-vfs](https://github.com/kateinoigakukun/wasi-vfs), [wasmtime](https://github.com/bytecodealliance/wasmtime)

```
# Download a prebuilt Ruby release
$ curl -LO https://github.com/ruby/ruby.wasm/releases/latest/download/ruby-3_2-wasm32-unknown-wasi-full.tar.gz
$ tar xfz ruby-3_2-wasm32-unknown-wasi-full.tar.gz

# Extract ruby binary not to pack itself
$ mv 3_2-wasm32-unknown-wasi-full/usr/local/bin/ruby ruby.wasm

# Put your app code
$ mkdir src
$ echo "puts 'Hello'" > src/my_app.rb

# Pack the whole directory under /usr and your app dir
$ wasi-vfs pack ruby.wasm --mapdir /src::./src --mapdir /usr::./3_2-wasm32-unknown-wasi-full/usr -o my-ruby-app.wasm

# Run the packed scripts
$ wasmtime my-ruby-app.wasm -- /src/my_app.rb
Hello
```

## npm packages (for JavaScript host environments)

  * [ruby-3_2-wasm-wasi](https://github.com/ruby/ruby.wasm/blob/main/packages/npm-packages/ruby-3_2-wasm-wasi)
  * [ruby-head-wasm-wasi](https://github.com/ruby/ruby.wasm/blob/main/packages/npm-packages/ruby-head-wasm-wasi)
  * [ruby-head-wasm-emscripten](https://github.com/ruby/ruby.wasm/blob/main/packages/npm-packages/ruby-head-wasm-emscripten)

