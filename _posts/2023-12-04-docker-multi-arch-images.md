---
layout: post
section-type: post
title: Build Multi Arch Docker Images
category: Category
tags: [ 'docker', 'multi-arch', 'devops' ]
comments: true
---

## Build once and use anywhere

Building Multi-Architecture Images with Buildx and Docker Desktop

You can build a multi-arch image by creating the individual images for each architecture, pushing them to Docker Hub, and entering docker manifest to combine them within a tagged <a href="https://docs.docker.com/engine/reference/commandline/manifest/?_gl=1*1m616nh*_ga*NjA0Mzg4MzYxLjE3MDE3MDc1NzA.*_ga_XJWPQMJYHQ*MTcwMTcwNzU2OS4xLjEuMTcwMTcwNzg1My41OC4wLjA.">manifest</a> list. You can then push the manifest list to Docker Hub. This method is valid in some situations, but it can become tedious and relatively time consuming.

## Buildx

Buildx leverages the `docker build` command to build images from a `Dockerfile` and sets of files located at a specified `PATH` or `URL`. Buildx comes packaged within Docker Desktop, and is a CLI plugin at its core. We consider it a plugin because it extends this base command with complete support for BuildKit’s feature set.

Docker Buildx as a CLI command called `docker buildx`, which you can use with Docker Desktop. In Linux environments, the `buildx` command also works with the `build` command on the terminal. Check out Docker Buildx <a href="https://docs.docker.com/buildx/working-with-buildx/?_gl=1*1tnnquz*_ga*NjA0Mzg4MzYxLjE3MDE3MDc1NzA.*_ga_XJWPQMJYHQ*MTcwMTcwNzU2OS4xLjEuMTcwMTcwNzk1OC42MC4wLjA.">documentation</a> to learn more.

## Creating a Dockerfile for Multi-arch Deployments (Ruby)

Create a new file in the working directory and name it `Dockerfile`. Next, open that file and add in the following lines:

```
FROM ruby:alpine3.18

WORKDIR /app
ADD .ruby-version /app/
ADD Gemfile* /app/

RUN bundle install

ADD . /app/
CMD [ "./entrypoint.sh" ]
```

### Building with Buildx

Next, we need to build your multi-arch image. This image is compatible with both the `amd64` and `arm32` server architectures. Since we’re using Buildx, BuildKit is also enabled by default. You won’t have to switch on this setting or enter any extra commands to leverage its functionality.

The builder builds and provisions a container. It also packages the container for reuse. Additionally, Buildx supports multiple <a href="https://docs.docker.com/build/#work-with-builder-instances">builder instances</a> — which is pretty handy for creating scoped, isolated, and switchable environments for our image builds.

Enter the following command to create a new builder, which we’ll call rubybuilder:

`docker buildx create --name rubybuilder --use --bootstrap`

Terminal response that says `rubybuilder`. We can also view a list of builders using the `docker buildx ls` command. We can even <a href="https://docs.docker.com/engine/reference/commandline/buildx_inspect/?_gl=1*1swxo1x*_ga*NjA0Mzg4MzYxLjE3MDE3MDc1NzA.*_ga_XJWPQMJYHQ*MTcwMTcwNzU2OS4xLjEuMTcwMTcwODM4NS42MC4wLjA.">inspect a new builder</a> by entering `docker buildx inspect <name>`

### Triggering the Build

Now, we’ll jumpstart your multi-architecture build with the single `docker buildx` command shown below:


```
docker buildx build --push \
--platform linux/amd64,linux/arm64 \
--tag docker_username/multi_arch_sample:buildx-latest .
```


This does several things:

* Combines the `build` command to start a build
* Shares the image with <a href="https://hub.docker.com/?_gl=1*tjbbzs*_ga*NjA0Mzg4MzYxLjE3MDE3MDc1NzA.*_ga_XJWPQMJYHQ*MTcwMTcwNzU2OS4xLjEuMTcwMTcwODUxNy42MC4wLjA.">Docker Hub</a> using the push operation
* Uses the `--platform` flag to specify the target architectures you want to build for. BuildKit then assembles the image manifest for the architectures
* Uses the `--tag` flag to set the image name as `multi_arch_sample`

Once your build is finished, your terminal will display the following:

`[+] Building 90.0s (7/7) FINISHED`


