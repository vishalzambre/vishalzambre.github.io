---
layout: post
section-type: post
title: Go Installation and Uninstallation on Mac
category: go
tags: [ 'go', 'tech' ]
comments: false
---

# Installation

  * Download package
    Visit <a href="https://go.dev/dl/" target="_blank">go</a> and select respected version to download and just double click

  * Using brew

  `brew install go`

## Managing Go installations
  You can install multiple Go versions on the same machine. For example, you might want to test your code on multiple Go versions. For a list of versions you can install this way, see the <a href="https://go.dev/dl/" target="_blank">download page</a>.

  Note: To install using the method described here, you'll need to have <a href="https://git-scm.com/" target="_blank">git</a> installed.

  To install additional Go versions, run the <a href="https://go.dev/cmd/go/#hdr-Compile_and_install_packages_and_dependencies" target="_blank">go install command</a>, specifying the download location of the version you want to install. The following example illustrates with version 1.22.0:

  ```
  $ go install golang.org/dl/go1.22.0@latest
  $ go1.22.0 download
  ```

  To run go commands with the newly-downloaded version, append the version number to the go command, as follows:

  ```
  $ go1.22.0 version
  go version go1.22.0 linux/amd64
  ```

  When you have multiple versions installed, you can discover where each is installed, look at the version's GOROOT value. For example, run a command such as the following:

  ```
  $ go1.22.0 env GOROOT
  ```

  To uninstall a downloaded version, just remove the directory specified by its GOROOT environment variable and the goX.Y.Z binary.

# Uninstallation

Found the <a href="https://golang.org/doc/manage-install#uninstalling" target="_blank">official uninstall docs</a> worked as expected (on Mac OSX).

Linux / macOS / FreeBSD

Delete the go directory.
This is usually `/usr/local/go.`

Remove the Go bin directory from your PATH environment variable.
Under Linux and FreeBSD, edit `/etc/profile` or `$HOME/.profile`. If you installed Go with the macOS package, remove the `/etc/paths.d/go` file.

```
$ which go
/usr/local/go
```

To uninstall

```
$ sudo rm -rf /usr/local/go
$ sudo rm /etc/paths.d/go
```


In MacOS, you can just do it with `brew`:

```
brew uninstall go
brew install go
brew upgrade go
```
