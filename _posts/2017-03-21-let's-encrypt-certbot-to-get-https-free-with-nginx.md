---
layout: post
section-type: post
title: Free HTTPS Using Let’s Encrypt Certbot with NGINX
category: tech
tags: [ 'devops', 'nginx', 'ubuntu' ]
comments: true
---
Let’s Encrypt is a new <i>Certificate Authority</i> which provides free SSL certificates (up to a certain limit per week). It came out of beta around a month back and is supported by a <a target='_blank' href='https://community.letsencrypt.org/t/which-browsers-and-operating-systems-support-lets-encrypt/4394'>wide array of browsers</a>.

<b>Certbot</b> is the official Let’s Encrypt client, developed by the <a target='_blank' href='https://www.eff.org/'>Electronic Frontier Foundation</a>. It makes automatically fetching and deploying SSL/TLS certificates for your web server a relatively straight forward process.

Lets get started.

Make sure that you have opened up ports 80 (HTTP) and 443 (HTTPS) in your instance Security Group to public. Certbot will use this to establish connections while generating your certificates.
<ul class='list-unstyled text-left content'>
  <li>
    Install Certbot on your instance. Based on your operating system and server, you can find out how to install it on <a target='_blank' href='https://certbot.eff.org/'>Certbot’s homepage</a>. For NGINX on Ubuntu 14.04, use <a target='_blank' href='https://certbot.eff.org/#ubuntutrusty-nginx'>this</a>.
    Run this command in your home directory:
  </li>

  <li>
    <pre><code data-trim class="yaml">
      cd $HOME
      wget https://dl.eff.org/certbot-auto
      chmod a+x certbot-auto
    </code></pre>
  </li>

  <li>
    Stop any existing servers running on the port 80 and 443, since those are used by Certbot to verify your domain and generate certificates.

    You can restart those servers once you have finished generating the certificates.
  </li>

  <li>
    Run the following command to generate certificates for your domain:
  </li>

  <li>
    <pre><code data-trim class="yaml">
      ./certbot-auto certonly --standalone -d xyz.yourdomain.com
    </code></pre>
    Replace your domain name at <code>xyz.yourdomain.com</code>
    You can generate certificates for multiple domains using this approach.
  </li>

  <li>
    Change your NGINX configuration in <code>/etc/nginx/nginx.conf</code> to <a target='_blank' href='http://nginx.org/en/docs/http/configuring_https_servers.html'>enable SSL</a>:
  </li>

  <li>
    Replace your domain name at <code>xyz.yourdomain.com</code>
    <pre><code data-trim class="yaml">
      http {
        ##
        # Logging Settings
        ##
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;
        server {
          listen 80;
          server_name xyz.yourdomain.com;
          location / {
            # Redirect any http requests to https
            return 301 https://$server_name$request_uri;
          }
        }
        server {
          listen 443 ssl;
          server_name xyz.yourdomain.com;
          ssl_certificate /etc/letsencrypt/live/xyz.yourdomain.com/fullchain.pem;
          ssl_certificate_key /etc/letsencrypt/live/xyz.yourdomain.com/privkey.pem;
          add_header Strict-Transport-Security “max-age=31536000”;

          location / {
            proxy_pass http://127.0.0.1:3000;
          }
        }
      }
    </code></pre>
  </li>

  <li>
    The <a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/Security/HTTP_strict_transport_security'>Strict-Transport-Security</a> (HSTS) header ensures that any internal links that are not HTTPS will <a target='_blank' href='https://loune.net/2016/01/https-with-lets-encrypt-ssl-and-nginx'>automatically be routed</a> to the HTTPS version during a HTTPS session.
  </li>
  <li>
    Lastly, reload your NGINX configuration:
    <pre><code data-trim class="yaml">
      sudo service nginx reload
    </code></pre>
    Congratulations! Your site xyz.example.com is now successfully running on HTTPS.
  </li>
</ul>

NOTE: Let’s Encrypt certificates are only valid for 3 months after issue. So every 3 months, renewal is required. Here’s how you can automate this using a cron job.

<ul class='list-unstyled text-left content'>
  <li>
    Let's assume your home directory path is <code>/home/ubuntu</code> and <code>certbot-auto</code> is downloaded at home.
    <pre><code data-trim class="yaml">
      0 6 * * * /home/ubuntu/certbot-auto renew --text >> /home/ubuntu/certbot-cron.log && sudo service nginx reload
    </code></pre>
  </li>
</ul>
