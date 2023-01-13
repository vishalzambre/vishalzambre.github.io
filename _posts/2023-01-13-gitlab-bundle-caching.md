---
layout: post
section-type: post
title: Caching in GitLab CI/CD
category: tech
tags: [ 'gitlab', 'ci', 'ruby' ]
comments: true
---

If you are using mutliple stages to the CI and each stage needs bundle install, cache bundle and just reuse it.

```
stages:
  - test

.app: &app
  image: ruby:3.1.3
  variables:
    RAILS_ENV: test
    BUNDLE_PATH: vendor/bundle

  before_script:
    - gem install bundler --no-document
    - bundle config set --local path 'vendor/bundle'
    - bundle install

  cache:
    - key:
        files:
          - Gemfile.lock
      paths:
        - vendor/bundle
      policy: pull

build:
  extends: .app
  stage: .pre
  script:
    - bundle install
  cache:
    - key:
        files:
          - Gemfile.lock
      paths:
        - vendor/bundle
      policy: pull-push

test:
  extends: .app
  stage: test
  needs: ["build"]
  script:
    - bundle exec rspec
```

Here we used different policies

At `app` we used `pull` policy which is extended to each below stages, where we pull cache if available. At `build` stage we used `pull-push` which means first pull existing cache and if anything modified push.

Cache policies can be changed or override inside each stage as well if needed

```
job:
  cache:
    # inherit all global cache settings
    <<: *global_cache
    # override the policy
    policy: pull
```

Same way you can disable cache for particular stage

```
job:
  cache: []
```

For more detailed [refer](https://docs.gitlab.com/ee/ci/caching/)

