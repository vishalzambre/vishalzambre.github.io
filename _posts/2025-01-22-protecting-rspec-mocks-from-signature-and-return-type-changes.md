---
layout: post
section-type: post
title: Protecting RSpec Mocks from Signature and Return Type Changes
category: rails
tags:  [ 'ruby', 'rspec', 'rails' ]
comments: true
---

# Protecting RSpec Mocks

## Description

This document describes techniques for protecting RSpec mocks against method signature
and return type changes, ensuring more robust test suites.

## Usage

### Basic Configuration

Configure RSpec to use strict verification:

```
  # spec/spec_helper.rb
  RSpec.configure do |config|
    config.mock_with :rspec do |mocks|
      # Verify mocked methods exist
      mocks.verify_partial_doubles = true

      # Verify doubled constants exist
      mocks.verify_doubled_constant_names = true
    end
  end
```

### Method Signature Protection

#### Using instance_double

```
  # Example class
  class UserService
    # @param user [User] The user to process
    # @param role [String] The role to assign
    # @param notify [Boolean] Whether to send notifications
    # @return [void]
    def process_user(user, role:, notify: false)
      # Implementation
    end
  end

  RSpec.describe UserService do
    let(:service) { instance_double(UserService) }
    let(:user) { instance_double(User) }

    it "verifies method signatures" do
      expect(service).to receive(:process_user)
        .with(user, role: "admin", notify: true)
    end
  end
```

### Return Type Protection

#### Basic Type Checking

```
  RSpec.describe UserService do
    let(:service) { instance_double(UserService) }

    it "verifies return types" do
      # For single objects
      expect(service).to receive(:find_user)
        .with(kind_of(Integer))
        .and_return(kind_of(User))

      # For collections
      expect(service).to receive(:find_active_users)
        .and_return(all(kind_of(User)))
    end
  end
```

#### Custom Type Matcher

Create a reusable type matcher:

```
  RSpec::Matchers.define :be_of_type do |expected_type|
    match do |actual|
      case expected_type
      when Array
        actual.is_a?(Array) &&
        actual.all? { |item| item.is_a?(expected_type.first) }
      else
        actual.is_a?(expected_type)
      end
    end
  end

  # Usage
  it "uses type matcher" do
    expect(service).to receive(:find_user)
      .and_return(be_of_type(User))
  end
```

### Type System Integration

#### With Sorbet

```
  sig { params(id: Integer).returns(User) }
  def find_user(id); end

  it "respects type signatures" do
    expect(service).to receive(:find_user)
      .with(type_of(Integer))
      .and_return(type_of(User))
  end
```

#### With dry-types

```
  module Types
    include Dry.Types()

    UserType = Instance(User)
    UsersList = Array.of(UserType)
  end

  it "validates types" do
    result = service.find_user(1)
    expect(Types::UserType.valid?(result)).to be true
  end
```

## Best Practices

### Required Arguments

Always be explicit about required arguments:

```
  expect(service).to receive(:process_user)
    .with(
      kind_of(User),
      role: match(/admin|user/),  # Required
      notify: boolean             # Optional
    )
```

### Optional Parameters

Use flexible matching for optional parameters:

```
  expect(service).to receive(:process_user)
    .with(
      anything,
      hash_including(role: "admin")  # Only specify what matters
    )
```

### Nullable Returns

Handle nullable return values:

```
  expect(service).to receive(:find_user)
    .and_return(
      satisfy { |result| result.nil? || result.is_a?(User) }
    )
```

### Complex Return Types

Verify complex return structures:

```
  expect(service).to receive(:get_user_stats)
    .and_return(
      match(
        id: kind_of(Integer),
        name: kind_of(String),
        roles: all(kind_of(Symbol))
      )
    )
```

## See Also

* RSpec Mocks Documentation[https://rspec.info/documentation/3.12/rspec-mocks/]
* Sorbet Documentation[https://sorbet.org/]
* dry-rb Documentation[https://dry-rb.org/]
