# Anime Tosho Cache Browser

This repository holds the code underlying https://cache.animetosho.org/

Although you may use this for any purpose, it is not designed to be used by others, thus no support will be given for your own use case. This is provided mostly as information to those curious.

## Overview

The *app* folder holds a simple NodeJS application, which generates the pages the user sees. It queries a MariaDB database, the schema of can be found in *schema.sql*.

The application is managed by systemd - the service definition provided by *cachesrv.service* - and the *www* folder holds the webroot to be served by the webserver.

## Requirements

This site requires the following:

* MariaDB 10+ database server
* NodeJS 12+
* a webserver to serve the root and proxy requests to the application

The NodeJS application must be run with the following environment variables set:

* `DB_USER` and `DB_PASS` (credentials to database)
* `LISTEN_SOCK` or `LISTEN_PORT` (where the application will listen on)
* `LOG_FILE` and/or `LOG_LEVEL` (optional; controls logging)