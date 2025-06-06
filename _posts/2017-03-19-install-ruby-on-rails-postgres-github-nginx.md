---
layout: post
section-type: post
title: Install Ruby On Rails, Postgres, GitHub, Nginx with Passenger
category: tech
tags: [ 'ruby', 'postgres', 'git', 'nginx', 'rails', 'devops' ]
comments: false
---
To setup production environment with ruby, rails, nginx and passengeruse following steps one by one

<ul class='list-unstyled text-left'>
  <li>
    Install dev dependencies
    <pre><code data-trim class="yaml">
      sudo apt-get install zlib1g zlib1g-dbg zlib1g-dev sqlite3 libsqlite3-dev build-essential openssl libreadline6 libreadline6-dev curl git-core libssl-dev libyaml-dev libxml2-dev libxslt-dev autoconf libc6-dev ncurses-dev automake libtool bison subversion g++ openjdk-6-jdk git nodejs
    </code></pre>
  </li>

  <li>
    Install rvm with latest stable ruby version
    <pre><code data-trim class="yaml">
      curl -L https://get.rvm.io | bash -s stable --ruby
    </code></pre>
  </li>

  <li>
    Edit .bash_profile file and add following file then press Ctrl-D if you are using cat
    <pre><code data-trim class="yaml">
      cat >>~/.bash_profile
      [[ -s "$HOME/.rvm/scripts/rvm" ]] && . "$HOME/.rvm/scripts/rvm"
      Ctrl+D
    </code></pre>
  </li>

  <li>
    Latest rubygems
    <pre><code data-trim class="yaml">
      rvm rubygems latest
    </code></pre>
  </li>

  <li>
    Install Rails you can provide versions
    <pre><code data-trim class="yaml">
      sudo gem install rails
    </code></pre>
  </li>

  <li>
    Install postgres
    <pre><code data-trim class="yaml">
      sudo apt-get -y install postgresql libpq-dev
    </code></pre>
  </li>

  <li>
    Installation of Git
    <pre><code data-trim class="yaml">
      sudo apt-get install git
      sudo apt-get update
      which git
      sudo apt-get install git-core
      which git
      git --version
    </code></pre>
  </li>

  <li>
    Git Configuration
    <pre><code data-trim class="yaml">
      git config --global user.name "vishalzambre"
      git config --global user.email v.zambre@gmail.com
      git config –list
    </code></pre>
  </li>

  <li>
    Installation of Nginx
    <pre><code data-trim class="yaml">
      sudo apt-get -y update
      sudo apt-get -y install build-essential zlib1g-dev libssl-dev libreadline-dev libyaml-dev libcurl4-openssl-dev curl git-core python-software-properties
    </code></pre>
  </li>

  <li>
    Installation of passenger
    <pre><code data-trim class="yaml">
      gem install passenger
      rvmsudo passenger-install-nginx-module

      NOTE: Choose "download, compile, and install Nginx for me"
      Accept defaults for any other questions it asks you
    </code></pre>
  </li>

  <li>
    Next we want to setup a script to allow us to control Nginx
    <pre><code data-trim class="yaml">
      wget -O init-deb.sh http://library.linode.com/assets/660-init-deb.sh
      sudo mv init-deb.sh /etc/init.d/nginx
      sudo chmod +x /etc/init.d/nginx
      sudo /usr/sbin/update-rc.d -f nginx defaults
    </code></pre>
  </li>

  <li>
    You can now control Nginx with this script. To start and stop the server manually, you run:
    <pre><code data-trim class="yaml">
      sudo /etc/init.d/nginx stop
      sudo /etc/init.d/nginx start
      We can verify nginx is running by opening up Firefox and going to http://localhost
    </code></pre>
  </li>

  <li>
    Node.js for the Rails asset pipeline
    <pre><code data-trim class="yaml">
      sudo apt-add-repository ppa:chris-lea/node.js
      sudo apt-get -y update
      sudo apt-get -y install nodejs
    </code></pre>
  </li>
  <li>
    Configure Your Rails App
    <pre><code data-trim class="yaml">
      You can modify your /opt/nginx/conf/nginx.conf
      server {
          listen 80;
          server_name example.com;
          root /home/deploy/myapplication/public;   # <--- be sure to point to 'public'!
          passenger_enabled on;
      }
      Just change the application folder name and the server name and then restart the nginx service.
    </code></pre>
  </li>
</ol>
