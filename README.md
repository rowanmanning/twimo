
Twimo
=====

Quickly and easily import your [Twitter archive][twarchive-post] into MongoDB. Why? Because data.


Requirements
------------

You'll need the following:

* [Node.js][node] `>=0.8`
* [MongoDB][mongodb] (tested with `2.2.2`)

Mac users, you can install these with [Homebrew][brew]:

```sh
$ brew install node
$ brew install mongodb
```


Usage
-----

Install the node module globally:

```sh
$ npm install -g twimo
```

[Download your Twitter archive][twarchive-download] and unzip it somewhere.

From the command line, run the following to import tweets into the mongodb database at `mongodb://localhost/twitter_archive` in the `tweets` collection.

```sh
$ twimo path/to/tweets
```

`path/to/tweets` should be the path to the folder that was created by unzipping your archive.


Configuration
-------------

The command line interface has a couple of options which allow you to change the database/collection which Tweets get imported into:

```sh
$ twimo --help

  Usage: twimo [options] <archive-path>

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -d, --dbstring <string>    Specify a mongodb connection string (must include database part)
    -c, --collection <string>  Specify the collection to import tweets into

```


License
-------

Copyright 2013, Rowan Manning  
Licensed under the [MIT][mit] license.



[brew]: http://mxcl.github.com/homebrew/
[mit]: http://opensource.org/licenses/mit-license.php
[node]: http://nodejs.org/
[mongodb]: http://www.mongodb.org/
[twarchive-download]: https://support.twitter.com/articles/20170160-how-to-download-your-twitter-archive
[twarchive-post]: http://blog.twitter.com/2012/12/your-twitter-archive.html
