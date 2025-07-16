---
layout: post
section-type: post
title: Setting up Google Ads API for Offline Upload with OAuth2 Authentication
category: tech
tags: [ 'google-ads', 'oauth2', 'api', 'ruby', 'authentication' ]
comments: true
---

# Setting up Google Ads API for Offline Upload with OAuth2 Authentication

The [Google Ads API](https://developers.google.com/google-ads/api/docs/get-started/introduction) is a powerful tool for managing large or complex Google Ads accounts programmatically. Whether you're building automated account management, custom reporting, or inventory-based ad management, proper authentication setup is crucial for accessing the API.

This guide walks you through setting up a Google Cloud project with OAuth2 authentication for the Google Ads API, specifically focusing on offline upload scenarios using the Ruby client library.

## Prerequisites

Before we begin, ensure you have:
- A Google Ads manager account
- A developer token (applied through your Google Ads manager account)
- Access to Google Cloud Console
- Ruby development environment

## 1. Setting up a New Google Cloud Project

First, you'll need to create a Google Cloud project that will host your OAuth2 credentials.

### Steps:
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select **"New Project"** from the project dropdown
3. Enter a descriptive project name (e.g., "google-ads-api-integration")
4. Select your organization (if applicable)
5. Click **"Create"**

### Enable the Google Ads API:
1. In your new project, go to **"APIs & Services" > "Library"**
2. Search for **"Google Ads API"**
3. Click on the **Google Ads API** result
4. Click **"Enable"**

## 2. Setting up OAuth2 Consent Screen

The OAuth consent screen is what users see when your application requests access to their Google Ads data. For offline upload scenarios, you'll typically use this for initial authorization.

### Steps:
1. Navigate to **"APIs & Services" > "OAuth consent screen"**
2. Choose **"External"** user type (unless you're in a Google Workspace organization)
3. Click **"Create"**

### Configure the consent screen:
```yaml
App Information:
  App name: "Your App Name - Google Ads Integration"
  User support email: your-email@example.com
  Developer contact information: your-email@example.com

App domain (optional but recommended):
  Application home page: https://your-domain.com
  Application privacy policy link: https://your-domain.com/privacy
  Application terms of service link: https://your-domain.com/terms
```

### Important Notes:
- For production use, you'll need to verify your domain
- Keep app descriptions clear and honest about data usage
- Ensure your privacy policy covers Google Ads data handling

## 3. Setting up OAuth2 Client Credentials

Now you'll create the OAuth2 client that your application will use to authenticate.

### Steps:
1. Go to **"APIs & Services" > "Credentials"**
2. Click **"+ CREATE CREDENTIALS"**
3. Select **"OAuth client ID"**
4. Choose **"Desktop application"** as the application type
   - This is appropriate for offline upload scenarios where the application runs on your server/local machine
5. Enter a name: "Google Ads API Client"
6. Click **"Create"**

### Download credentials:
1. After creation, click the download icon next to your new OAuth client
2. Save the JSON file securely (e.g., `google_ads_client_secret.json`)
3. **Never commit this file to version control**

The downloaded JSON will look like:
```json
{
  "installed": {
    "client_id": "your-client-id.apps.googleusercontent.com",
    "project_id": "your-project-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "your-client-secret",
    "redirect_uris": ["http://localhost"]
  }
}
```

## 4. Adding Test Users for Development

During development, you'll need to add test users who can access your application before it's verified by Google.

### Steps:
1. In **"OAuth consent screen"**, scroll to **"Test users"**
2. Click **"+ ADD USERS"**
3. Enter email addresses of users who need access:
   - Your own email address
   - Team members who will test the integration
   - The Google Ads account owner's email
4. Click **"Save"**

### Important considerations:
- Test users can use your app even if it's not verified
- You can add up to 100 test users
- These users won't see the "unverified app" warning

## 5. Adding Google Ads API Scopes

The OAuth2 scopes define what permissions your application requests from users.

### Required scope for Google Ads API:
```
https://www.googleapis.com/auth/adwords
```

### Adding scopes:
1. In **"OAuth consent screen"**, go to **"Scopes"**
2. Click **"ADD OR REMOVE SCOPES"**
3. Search for **"adwords"**
4. Select **"https://www.googleapis.com/auth/adwords"**
5. Click **"UPDATE"**

### Scope permissions:
The `adwords` scope provides:
- Read access to Google Ads account data
- Write access to modify campaigns, ad groups, ads, and keywords
- Access to reporting data
- Ability to upload offline conversions

## 6. Implementing Authentication with Ruby

Now let's implement the authentication flow using the [Google Ads Ruby client library](https://github.com/googleads/google-ads-ruby).

### Installation:
Add to your Gemfile:
```ruby
gem 'google-ads-googleads'
```

### Generate User Credentials

Based on the [generate_user_credentials.rb](https://github.com/googleads/google-ads-ruby/blob/main/examples/authentication/generate_user_credentials.rb) example:

```ruby
#!/usr/bin/env ruby
# encoding: utf-8

require 'google/ads/google_ads'
require 'optparse'

def generate_user_credentials(client_id, client_secret)
  # Initialize the Google Ads client for authentication
  client = Google::Ads::GoogleAds::GoogleAdsClient.new do |config|
    config.client_id = client_id
    config.client_secret = client_secret
  end

  # Generate the OAuth2 authorization URL
  auth_url = client.generate_authorization_url

  puts "Visit the following URL to authorize the application:"
  puts auth_url
  puts "\nAfter authorizing, enter the authorization code:"

  authorization_code = gets.chomp

  # Exchange authorization code for refresh token
  token_hash = client.generate_refresh_token(authorization_code)

  puts "\nYour refresh token is: #{token_hash[:refresh_token]}"
  puts "Save this refresh token securely - you'll need it for API calls"

  token_hash
end

if __FILE__ == $0
  options = {}
  OptionParser.new do |opts|
    opts.banner = "Usage: #{$0} [options]"
    opts.on('-i', '--client-id CLIENT_ID', 'OAuth2 client ID') do |v|
      options[:client_id] = v
    end
    opts.on('-s', '--client-secret CLIENT_SECRET', 'OAuth2 client secret') do |v|
      options[:client_secret] = v
    end
  end.parse!

  generate_user_credentials(options[:client_id], options[:client_secret])
end
```

### Configuration File Setup

Create a `google_ads_config.rb` file:

```ruby
# google_ads_config.rb
require 'google/ads/google_ads'

def create_google_ads_client
  Google::Ads::GoogleAds::GoogleAdsClient.new do |config|
    # OAuth2 credentials
    config.client_id = ENV['GOOGLE_ADS_CLIENT_ID']
    config.client_secret = ENV['GOOGLE_ADS_CLIENT_SECRET']
    config.refresh_token = ENV['GOOGLE_ADS_REFRESH_TOKEN']

    # Developer token from your Google Ads manager account
    config.developer_token = ENV['GOOGLE_ADS_DEVELOPER_TOKEN']

    # Optional: Login customer ID (manager account)
    config.login_customer_id = ENV['GOOGLE_ADS_LOGIN_CUSTOMER_ID']
  end
end
```

### Environment Variables

Set up your environment variables:

```bash
export GOOGLE_ADS_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_ADS_CLIENT_SECRET="your-client-secret"
export GOOGLE_ADS_REFRESH_TOKEN="your-refresh-token"
export GOOGLE_ADS_DEVELOPER_TOKEN="your-developer-token"
export GOOGLE_ADS_LOGIN_CUSTOMER_ID="your-manager-account-id"
```

## 7. Testing the Setup

Create a simple test script to verify your setup:

```ruby
#!/usr/bin/env ruby
# test_connection.rb

require_relative 'google_ads_config'

def test_google_ads_connection
  client = create_google_ads_client

  # Test with a simple customer listing
  customer_service = client.service.customer

  # Replace with your actual customer ID
  customer_id = 'your-customer-id'

  begin
    customer = customer_service.get_customer(
      resource_name: client.path.customer(customer_id)
    )

    puts "Successfully connected to Google Ads API!"
    puts "Customer: #{customer.descriptive_name}"
    puts "Account ID: #{customer.id}"
  rescue Google::Ads::GoogleAds::Errors::GoogleAdsError => e
    puts "Error connecting to Google Ads API:"
    puts e.message
  end
end

test_google_ads_connection if __FILE__ == $0
```

## Security Best Practices

### 1. Credential Management
- **Never** commit OAuth2 credentials to version control
- Use environment variables or secure credential management systems
- Rotate client secrets periodically
- Store refresh tokens securely and encrypt them at rest

### 2. Access Control
- Use the principle of least privilege
- Regularly audit test users and remove unnecessary access
- Monitor API usage for unusual patterns
- Implement proper logging for authentication events

### 3. Production Considerations
- Submit your app for verification before going live
- Implement proper error handling for authentication failures
- Set up monitoring for API quota usage
- Have a backup authentication strategy

## Common Issues and Troubleshooting

### Invalid Grant Error
```
Error: invalid_grant
```
**Solution**: Your refresh token may have expired. Generate a new one using the authentication flow.

### Insufficient Permissions
```
Error: Request had insufficient authentication scopes
```
**Solution**: Ensure the `adwords` scope is properly configured and the user has granted permission.

### Developer Token Issues
```
Error: Developer token is not approved
```
**Solution**: Apply for API access through your Google Ads manager account and wait for approval.

## Conclusion

Setting up Google Ads API authentication involves several steps, but following this systematic approach ensures you have a robust foundation for offline upload scenarios. The key components are:

1. A properly configured Google Cloud project
2. OAuth2 consent screen with appropriate scopes
3. Desktop application OAuth2 client
4. Test users for development
5. Secure credential management
6. Proper error handling and monitoring

With this setup, you're ready to implement offline upload functionality, automated reporting, or any other Google Ads API integration your business requires.

## References

- [Google Ads API Introduction](https://developers.google.com/google-ads/api/docs/get-started/introduction)
- [Configure Google Cloud Project](https://developers.google.com/google-ads/api/docs/get-started/configure-cloud-project?authpath=user_authentication)
- [Google Ads Ruby Client Library](https://github.com/googleads/google-ads-ruby)
- [Generate User Credentials Example](https://github.com/googleads/google-ads-ruby/blob/main/examples/authentication/generate_user_credentials.rb)
