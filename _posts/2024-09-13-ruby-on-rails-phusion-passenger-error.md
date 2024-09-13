---
layout: post
section-type: post
title: Ruby on Rails Phusion passenger error
category: rails
tags:  [ 'ruby', 'nginx', 'rails', 'devops' ]
comments: true
---

# Problem

You have already activated base64 0.1.0, but your Gemfile requires base64 0.2.0. Since base64 is a default gem, you can either remove your dependency on it or try updating to a newer version of bundler that supports base64 as a default gem.

If you get such error to start Phusion Passenger, then try following steps

# Solution

1.  In your Gemfile lock the base64 to lower version.

    ```
    gem "base64", "0.1.1"
    ```

    Until they upgrade passenger to support base64 0.2.0, you have to use this solution.

## Another Solution

  Add `passenger_preload_bundler on` in your nginx config file.

  ```
  passenger_preload_bundler on;
  ```

  Then restart nginx

  ```
  sudo systemctl restart nginx

  Refer [Nginx#passenger_preload_bundler](https://www.phusionpassenger.com/docs/references/config_reference/nginx/#passenger_preload_bundler)
