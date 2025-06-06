---
layout: post
section-type: post
title: Rails Anycable setup with dockerise
category: rails
tags: [ 'rails', 'anycable', 'docker', 'devops']
comments: false
---

# Setting up AnyCable with Rails using Docker: A Complete Guide

AnyCable is a powerful alternative to Action Cable that allows you to use any WebSocket server (like the Go-based ws) with your Rails application. This setup provides better performance, scalability, and resource efficiency compared to the traditional Action Cable implementation.

In this guide, we'll walk through setting up AnyCable with a Rails application using Docker for a production-ready development environment.

## Prerequisites

Before we begin, ensure you have the following installed:

* Docker and Docker Compose
* Ruby 3.0+
* Rails 7.0+
* Redis (we'll use Docker for this)

## What is AnyCable?

AnyCable allows you to use Action Cable protocol with any WebSocket server implementation. The key benefits include:

* **Better Performance**: Uses a more efficient WebSocket server (typically Go-based)
* **Resource Efficiency**: Lower memory footprint compared to Action Cable
* **Language Agnostic**: WebSocket server can be written in any language
* **Scalability**: Better horizontal scaling capabilities

## Step 1: Rails Application Setup

First, let's set up a new Rails application or modify an existing one to work with AnyCable.

### Add AnyCable Gems

Add the following gems to your `Gemfile`:

```ruby
# Gemfile
gem 'anycable-rails', '~> 1.4'
gem 'redis', '~> 5.0'

group :development, :test do
  gem 'anycable-rails-jwt', '~> 0.3.0' # Optional: for JWT authentication
end
```

Run bundle install:

```bash
bundle install
```

### Generate AnyCable Configuration

Generate the AnyCable configuration files:

```bash
rails generate anycable:install
```

This creates:
* `config/anycable.yml` - AnyCable configuration
* `config/cable.yml` updates - Cable configuration for AnyCable
* Basic channel setup

### Configure AnyCable

Update your `config/anycable.yml`:

```yaml
# config/anycable.yml
default: &default
  # Turn on/off access logs ("Started..." and "Finished...")
  access_logs_disabled: true
  # Whether to enable gRPC level logging or not
  log_grpc: true
  # Use Redis to broadcast messages to AnyCable server
  broadcast_adapter: redis
  # You can use REDIS_URL env var to configure Redis URL.
  # Localhost is used by default.
  redis_url: <%= ENV.fetch('ANYCABLE_REDIS_URL', 'redis://localhost:6379/1') %>
  # Use the same channel name for WebSocket server, e.g.:
  #   $ ws --redis_channel="__anycable__"
  # redis_channel: "__anycable__"

development:
  <<: *default
  # WebSocket endpoint of your AnyCable server for clients to connect to
  # Make sure you have the `action_cable_meta_tag` in your HTML layout
  # to propogate this value to the client app
  websocket_url: <%= ENV.fetch('ANYCABLE_CABLE_URL', 'ws://localhost:8080/cable') %>

test:
  <<: *default

production:
  <<: *default
  websocket_url: ~
```

### Update Cable Configuration

Modify `config/cable.yml` to use Redis:

```yaml
# config/cable.yml
default: &default
  adapter: <%= ENV.fetch("ACTION_CABLE_ADAPTER", "any_cable") %>
  url: <%= ENV.fetch('ANYCABLE_CABLE_URL', 'redis://localhost:6379/0') %>

development:
  <<: *default

test:
  <<: *default

production:
  channel_prefix: <%= ENV.fetch('ANYCABLE_REDIS_CHANNEL_PREFIX', 'myapp_production') %>
```

## Step 2: Docker Configuration

Now let's create the Docker setup with multiple services.

### Create Dockerfile

Create a `Dockerfile` for your Rails application:

```dockerfile
# Dockerfile
FROM ruby:3.2-alpine

# Install dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    nodejs \
    npm \
    git \
    tzdata

WORKDIR /app

# Copy Gemfile and install gems
COPY Gemfile Gemfile.lock ./
RUN bundle config set --local deployment 'true' && \
    bundle config set --local without 'development test' && \
    bundle install

# Copy application code
COPY . .

# Precompile assets (if using asset pipeline)
RUN bundle exec rails assets:precompile

# Expose port
EXPOSE 3000

# Default command
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]
```

### Create Docker Compose Configuration

Create a comprehensive `docker-compose.yml`:

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Redis for AnyCable pub/sub and Rails cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # PostgreSQL database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp_development
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 3s
      retries: 3

  # Rails application
  backend: &backend
    build: .
    environment: &backend_environment
      DATABASE_URL: postgresql://postgres:password@postgres:5432/myapp_development
      ANYCABLE_CABLE_URL: ws://localhost:8080/cable
      ACTION_CABLE_ADAPTER: ${ACTION_CABLE_ADAPTER:-anycable}
      ANYCABLE_RPC_HOST: 0.0.0.0:50051
      ANYCABLE_BROADCAST_ADAPTER: redis
      ANYCABLE_REDIS_URL: redis://redis:6379/0
      ANYCABLE_DEBUG: 1
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  web:
    <<: *backend
    command: /bin/bash -c "rm -f tmp/pids/server.pid && bundle exec rails s -p 3000 -b 0.0.0.0"
    ports:
      - "3000:3000"
    depends_on:
      ws:
        condition: service_started
      anycable:
        condition: service_started
    volumes:
      - .:/app
      - bundle_cache:/usr/local/bundle

  # AnyCable RPC server
  ws:
    image: anycable/ws:1.5
    ports:
      - "8080:8080"
      - "8090:8090"
    environment:
      ANYCABLE_HOST: "0.0.0.0"
      ANYCABLE_PORT: 8080
      ANYCABLE_METRICS_PORT: 8080
      ANYCABLE_HTTP_BROADCAST_PORT: 8090
      ANYCABLE_REDIS_URL: redis://redis:6379/0
      ANYCABLE_RPC_HOST: anycable:50051
      ANYCABLE_BROADCAST_ADAPTER: "redis"
      ANYCABLE_PUBSUB: redis
      ANYCABLE_BROKER: memory
      ANYCABLE_DEBUG: ${ANYCABLE_DEBUG:-1}
      ANYCABLE_SECRET: ${ANYCABLE_SECRET:-secret}
      ANYCABLE_LOG_LEVEL: debug
    depends_on:
      redis:
        condition: service_healthy

  anycable:
    <<: *backend
    command: "bundle exec anycable"
    environment:
      <<: *backend_environment
      ANYCABLE_SECRET: ${ANYCABLE_SECRET:-secret}
    ports:
      - "50051"
    depends_on:
      ws:
        condition: service_started

volumes:
  postgres_data:
  redis_data:
  bundle_cache:
```

## Step 3: Create a Sample Channel

Let's create a sample chat channel to test our AnyCable setup:

```ruby
# app/channels/chat_channel.rb

# ChatChannel handles real-time messaging functionality using AnyCable.
#
# This channel provides a scalable WebSocket connection for chat features,
# leveraging AnyCable's performance benefits over traditional Action Cable.
#
# == Usage
#
#   Connect to the channel from JavaScript:
#     consumer.subscriptions.create("ChatChannel", {
#       room: "general"
#     })
#
# == Methods
#
# * +subscribed+ - Called when a client subscribes to the channel
# * +unsubscribed+ - Called when a client unsubscribes from the channel
# * +receive+ - Handles incoming messages from clients
# * +send_message+ - Broadcasts messages to all channel subscribers
#
class ChatChannel < ApplicationCable::Channel

  # Subscribes the client to the chat room stream.
  #
  # Validates the room parameter and creates a stream for the specified room.
  # Logs the subscription event for debugging purposes.
  #
  # == Parameters
  #
  # * +params[:room]+ - The chat room identifier (required)
  #
  # == Raises
  #
  # * +ActionCable::Connection::Authorization::UnauthorizedError+ - When room parameter is missing
  #
  def subscribed
    room = params[:room]

    if room.present?
      stream_from "chat_#{room}"
      logger.info "User #{connection.current_user&.id} subscribed to chat_#{room}"
    else
      reject
    end
  end

  # Handles client disconnection from the channel.
  #
  # Performs cleanup operations when a client unsubscribes from the chat channel.
  # Logs the unsubscription event for debugging purposes.
  #
  def unsubscribed
    room = params[:room]
    logger.info "User #{connection.current_user&.id} unsubscribed from chat_#{room}"
  end

  # Processes incoming messages from connected clients.
  #
  # Validates and broadcasts the message to all subscribers of the chat room.
  # Includes sender information and timestamp in the broadcast.
  #
  # == Parameters
  #
  # * +data+ - Hash containing message data
  #   * +:message+ - The message content (required)
  #   * +:room+ - The target chat room (required)
  #
  # == Example
  #
  #   # Client sends:
  #   channel.send({ message: "Hello World", room: "general" })
  #
  def receive(data)
    room = data['room']
    message = data['message']

    if room.present? && message.present?
      send_message(room, message)
    end
  end

  private

  # Broadcasts a message to all subscribers of the specified chat room.
  #
  # Constructs a message payload with sender information, content, and timestamp,
  # then broadcasts it to all clients subscribed to the room's stream.
  #
  # == Parameters
  #
  # * +room+ - The chat room identifier
  # * +message+ - The message content to broadcast
  #
  # == Message Format
  #
  # The broadcast payload includes:
  # * +message+ - The message content
  # * +user+ - Sender information (id and username if available)
  # * +timestamp+ - ISO 8601 formatted timestamp
  # * +room+ - The originating room identifier
  #
  def send_message(room, message)
    ActionCable.server.broadcast("chat_#{room}", {
      message: message,
      user: {
        id: connection.current_user&.id,
        username: connection.current_user&.username || 'Anonymous'
      },
      timestamp: Time.current.iso8601,
      room: room
    })
  end
end
```

### Update Application Cable Connection

```ruby
# app/channels/application_cable/connection.rb

module ApplicationCable
  # ApplicationCable::Connection handles WebSocket connection authentication and identification.
  #
  # This connection class manages the WebSocket lifecycle and provides user identification
  # for AnyCable channels. It supports both authenticated and anonymous connections.
  #
  # == Authentication
  #
  # The connection attempts to identify users through:
  # * Session-based authentication (cookies)
  # * Token-based authentication (query parameters)
  # * Anonymous connections (fallback)
  #
  # == Usage
  #
  # Connections are established automatically when clients connect to the WebSocket endpoint.
  # The identified user is available throughout channel subscriptions as +current_user+.
  #
  class Connection < ActionCable::Connection::Base
    identified_by :current_user_id

    # Establishes the WebSocket connection and identifies the current user.
    #
    # Attempts multiple authentication strategies to identify the connecting user.
    # Falls back to anonymous user if no authentication method succeeds.
    #
    # == Authentication Flow
    #
    # 1. Attempts session-based authentication using cookies
    # 2. Falls back to token-based authentication from query parameters
    # 3. Creates anonymous user if no authentication succeeds
    #
    # == Raises
    #
    # * +ActionCable::Connection::Authorization::UnauthorizedError+ - When connection should be rejected
    #
    def connect
      self.current_user_id = current_user.id
      logger.info "AnyCable connection established for user: #{current_user.id}"
    end

    private

    def current_user
      find_verified_user || create_anonymous_user
    end

    # Attempts to find and verify the current user through available authentication methods.
    #
    # Tries multiple authentication strategies in order of preference:
    # 1. Session-based authentication (most secure)
    # 2. Token-based authentication (for API clients)
    #
    # == Returns
    #
    # * +User+ - The authenticated user object
    # * +nil+ - When no authentication method succeeds
    #
    def find_verified_user
      find_user_by_session || find_user_by_token
    end

    # Authenticates user through session cookies.
    #
    # Extracts user ID from the encrypted session cookie and loads the corresponding
    # user record from the database. This is the preferred authentication method
    # for web browser connections.
    #
    # == Returns
    #
    # * +User+ - The authenticated user object
    # * +nil+ - When session authentication fails
    #
    def find_user_by_session
      user_id = cookies.encrypted[:user_id] || session[:user_id]
      return nil unless user_id

      User.find_by(id: user_id)
    rescue ActiveRecord::RecordNotFound
      nil
    end

    # Authenticates user through access tokens passed as query parameters.
    #
    # Extracts the access token from WebSocket connection query parameters
    # and validates it against stored user tokens. Used primarily for
    # API clients and mobile applications.
    #
    # == Returns
    #
    # * +User+ - The authenticated user object
    # * +nil+ - When token authentication fails
    #
    # == Security Notes
    #
    # Tokens should be short-lived and properly validated to prevent unauthorized access.
    #
    def find_user_by_token
      token = request.params[:token]
      return nil unless token.present?

      # Implement your token validation logic here
      # This could involve JWT validation, database lookup, etc.
      # User.find_by_access_token(token)
      nil # Placeholder - implement based on your auth system
    end

    # Creates an anonymous user for unauthenticated connections.
    #
    # Generates a temporary user object for connections that cannot be authenticated.
    # Anonymous users have limited capabilities and are primarily used for
    # public channels or guest access scenarios.
    #
    # == Returns
    #
    # * +OpenStruct+ - Anonymous user object with basic attributes
    #
    # == Anonymous User Attributes
    #
    # * +id+ - Unique session-based identifier
    # * +username+ - Generic anonymous label
    # * +authenticated+ - Always false for anonymous users
    #
    def create_anonymous_user
      OpenStruct.new(
        id: "anonymous_#{SecureRandom.hex(8)}",
        username: 'Anonymous',
        authenticated?: false
      )
    end
  end
end
```

## Step 4: Frontend Integration

Create a simple HTML page to test the WebSocket connection:

```html
<!-- app/views/chat/index.html.erb -->
<!DOCTYPE html>
<html>
<head>
  <title>AnyCable Chat Demo</title>
  <script src="https://cdn.jsdelivr.net/npm/@rails/actioncable@7.0.0/dist/actioncable.esm.js" type="module"></script>
</head>
<body>
  <div id="chat-container">
    <div id="messages"></div>
    <div>
      <input type="text" id="message-input" placeholder="Type your message...">
      <button onclick="sendMessage()">Send</button>
    </div>
  </div>

  <script type="module">
    import { createConsumer } from "https://cdn.jsdelivr.net/npm/@rails/actioncable@7.0.0/dist/actioncable.esm.js";

    // Connect to AnyCable WebSocket server
    const consumer = createConsumer('ws://localhost:8080/cable');

    const chatChannel = consumer.subscriptions.create(
      { channel: "ChatChannel", room: "general" },
      {
        connected() {
          console.log("Connected to chat channel");
        },

        disconnected() {
          console.log("Disconnected from chat channel");
        },

        received(data) {
          const messagesDiv = document.getElementById('messages');
          const messageElement = document.createElement('div');
          messageElement.innerHTML = `
            <strong>${data.user.username}:</strong>
            ${data.message}
            <small>(${new Date(data.timestamp).toLocaleTimeString()})</small>
          `;
          messagesDiv.appendChild(messageElement);
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
      }
    );

    window.sendMessage = function() {
      const input = document.getElementById('message-input');
      const message = input.value.trim();

      if (message) {
        chatChannel.send({
          message: message,
          room: "general"
        });
        input.value = '';
      }
    };

    // Send message on Enter key
    document.getElementById('message-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  </script>
</body>
</html>
```

## Step 5: Running the Application

### Start all services:

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database (port 5432)
- Redis server (port 6379)
- Rails application (port 3000)
- AnyCable RPC server (port 50051)
- ws WebSocket server (port 8080)

### Verify the setup:

1. **Check service health:**

```bash
docker-compose ps
```

2. **View logs:**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f ws
```

3. **Test WebSocket connection:**

Open your browser to `http://localhost:3000/chat` and test the real-time messaging.

## Step 6: Production Considerations

### Scaling Configuration

For production scaling, consider:

```yaml
# docker-compose.production.yml
version: '3.8'

services:
  anycable:
    deploy:
      replicas: 3

  ws:
    deploy:
      replicas: 2
    environment:
      - ANYCABLE_RPC_POOL_SIZE=30 # Should not greater than DB pool
```

### Monitoring and Health Checks

Add comprehensive health checks:

```ruby
# config/routes.rb
Rails.application.routes.draw do
  get '/health', to: 'health#check'
  get '/anycable/health', to: 'anycable_health#check'
end

# app/controllers/anycable_health_controller.rb
class AnycableHealthController < ApplicationController
  def check
    redis_status = check_redis
    rpc_status = check_anycable_rpc

    if redis_status && rpc_status
      render json: { status: 'ok', services: { redis: 'up', anycable_rpc: 'up' } }
    else
      render json: {
        status: 'error',
        services: {
          redis: redis_status ? 'up' : 'down',
          anycable_rpc: rpc_status ? 'up' : 'down'
        }
      }, status: 503
    end
  end

  private

  def check_redis
    AnyCable.redis.ping == 'PONG'
  rescue
    false
  end

  def check_anycable_rpc
    # Implement RPC health check
    true # Simplified for demo
  end
end
```

## Troubleshooting

### Common Issues:

1. **Connection refused errors:**
   - Ensure all services are running: `docker-compose ps`
   - Check service logs: `docker-compose logs ws`

2. **Messages not broadcasting:**
   - Verify Redis connectivity
   - Check AnyCable RPC server logs
   - Confirm channel subscription

3. **Performance issues:**
   - Monitor Redis memory usage
   - Adjust ws pool sizes
   - Scale RPC servers horizontally

### Debug Commands:

```bash
# Enter Rails console
docker-compose exec web rails console

# Test Redis connection
docker-compose exec redis redis-cli ping

# Monitor AnyCable logs
docker-compose logs -f anycable ws
```

## Conclusion

You now have a fully functional AnyCable setup with Rails using Docker! This configuration provides:

- **High Performance**: ws WebSocket server handles connections efficiently
- **Scalability**: Easy to scale RPC servers and WebSocket servers independently
- **Development Ready**: Hot reloading and debug modes enabled
- **Production Ready**: Health checks, monitoring, and scaling considerations included

The AnyCable architecture separates concerns between your Rails application logic and WebSocket connection handling, resulting in better resource utilization and performance compared to traditional Action Cable setups.

For more advanced features, explore AnyCable's JWT authentication, custom serializers, and integration with background job processors like Sidekiq.

