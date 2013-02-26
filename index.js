#!/usr/bin/env node

//
// Danger: here be code pyramids...
//

// Dependencies
var colors = require('colors');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var path = require('path');
var pkg = require('./package.json');
var program = require('commander');
var vm = require('vm');

// Program config
program
    .version(pkg.version)
    .usage('[options] <archive-path>')
    .option('-d, --dbstring <string>', 'Specify a mongodb connection string (must include database part)', 'mongodb://localhost/twitter_archive')
    .option('-c, --collection <string>', 'Specify the collection to import tweets into', 'tweets')
    .parse(process.argv);

// Hello
console.error('\nTwimo - Twitter Archive to MongoDB'.cyan.underline);

// Only expect one argument
if (program.args.length !== 1) {
    program.help();
}

// Get tweet directory and verify
var dir = path.resolve(program.args[0]);
var indexPath = path.join(dir, 'data', 'js', 'tweet_index.js');
if (!fs.existsSync(dir) || !fs.existsSync(indexPath)) {
    console.error(('\n  > error: "' + program.args[0] + '" is not a twitter archive folder\n').red);
    process.exit(1);
}

// Connect to database and verify
MongoClient.connect(program.dbstring, function(err, db) {
    if (err) {
        console.error('\n  > error: could not connect to database\n'.red);
        process.exit(1);
    }

    // Get the tweet index
    var sandbox = {Grailbird: {data: {}}};
    vm.runInNewContext(fs.readFileSync(indexPath, 'utf-8'), sandbox);

    // Load in all tweets
    sandbox.tweet_index.forEach(function (data) {
        vm.runInNewContext(fs.readFileSync(path.join(dir, data.file_name), 'utf-8'), sandbox);
    });

    // Flatten tweets into single array
    var tweets = [], prop;
    for (prop in sandbox.Grailbird.data) {
        if (sandbox.Grailbird.data.hasOwnProperty(prop)) {
            tweets = tweets.concat(sandbox.Grailbird.data[prop]);
        }
    }

    // Tweet manipulation
    tweets.map(function (tweet) {
        tweet._id = tweet.id_str;
        tweet.created_at = new Date(tweet.created_at);
        return tweet;
    });

    // Just in case...
    console.log(('\nThis import will delete all existing data in "' + program.collection + '" collection.').yellow);
    program.confirm('Are you absolutely sure you want to import ' + tweets.length + ' tweets? ', function (ok) {
        if (!ok) {
            console.log(('\n  > import cancelled\n').green)
            process.exit();
        }

        // Remove existing collection
        db.collection(program.collection).remove(function(err, result) {
            if (err) {
                console.error('\n  > error: something went wrong with the database\n\n  '.red + err + '\n');
                process.exit(1);
            }

            db.collection(program.collection).insert(tweets, function(err, result) {
                if (err) {
                    console.error('\n  > error: something went wrong with the database\n\n  '.red + err + '\n');
                    process.exit(1);
                }

                // Ta-dah!
                console.log(('\n  > ' + tweets.length + ' tweets imported!\n').green)

                // Close the database connection
                db.close();
                process.exit();

            });

        });

    });

});
