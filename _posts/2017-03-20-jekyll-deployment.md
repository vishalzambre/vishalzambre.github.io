---
layout: post
section-type: post
title: Jekyll Deployment using git hook
category: tech
tags: [ 'ruby', 'git', 'devops' ]
---
Sites built using Jekyll can be deployed in a large number of ways due to the static nature of the generated output. A one of them deployment techniques is described below using git hook.

<ul class='list-unstyled text-left content'>
  <li>
    To have a remote server handle the deploy for you every time you push changes using Git, you can create a user account which has all the public keys that are authorized to deploy in its authorized_keys file. With that in place, setting up the post-receive hook is done as follows:
  </li>

  <li>
    <pre><code data-trim class="yaml">
      laptop$ ssh deployer@example.com
      server$ mkdir myrepo.git
      server$ cd myrepo.git
      server$ git --bare init
      server$ cp hooks/post-receive.sample hooks/post-receive
      server$ mkdir /var/www/myrepo
    </code></pre>
  </li>

  <li>
    Next, add the following lines to <code>hooks/post-receive</code> and be sure Jekyll is installed on the server:
  </li>

  <li>
    <pre><code data-trim class="yaml">
    GIT_REPO=$HOME/myrepo.git
    TMP_GIT_CLONE=$HOME/tmp/myrepo
    PUBLIC_WWW=/var/www/myrepo

    git clone $GIT_REPO $TMP_GIT_CLONE
    $HOME/.rvm/scripts/rvm default # if rvm installed
    cp $TMP_GIT_CLONE/_config.yml.sample $TMP_GIT_CLONE/_config.yml # if sample file present
    cd $TMP_GIT_CLONE && sudo ./scripts/install
    JEKYLL_ENV=production jekyll build -s $TMP_GIT_CLONE -d $PUBLIC_WWW
    sudo /etc/init.d/nginx restart # assume that web server is nginx
    rm -Rf $TMP_GIT_CLONE
    exit
    </code></pre>
  </li>

  <li>
    Next, add the following lines to <code>/etc/nginx/sites-available/default</code>:
  </li>

  <li>
    <pre><code data-trim class="yaml">
      server {
        listen 80;
        server_name example.com;
        root /var/www/myrepo;
      }
    </code></pre>
  </li>

  <li>
    Finally, run the following command on any users laptop that needs to be able to deploy using this hook:
  </li>

  <li>
    <pre><code data-trim class="yaml">
      laptops$ git remote add deploy deployer@example.com:~/myrepo.git
    </code></pre>
  </li>

  <li>
    Deploying is now as easy as telling nginx or Apache to look at <code>/var/www/myrepo</code> and running the following:
  </li>
  <li>
    <pre><code data-trim class="yaml">
      laptops$ git push deploy master
    </code></pre>
  </li>
</ul>
