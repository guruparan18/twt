var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.render('index', {});
});

app.post('/connect', function(req, res, next) {
    var userName = req.body.userName;
    res.redirect('/' + userName);
});

//app.get('/[a-zA-Z]+', function(req, res) {
/*
app.get('/:userId(\[a-zA-Z]+)', function(req, res) {
    res.send(req.params.userId)
});
*/

//var uri = "mongodb://kay:myRealPassword@mycluster0-shard-00-00-wpeiv.mongodb.net:27017,mycluster0-shard-00-01-wpeiv.mongodb.net:27017,mycluster0-shard-00-02-wpeiv.mongodb.net:27017/admin?ssl=true&replicaSet=Mycluster0-shard-0&authSource=admin";

//var uri = "mongodb://AdminSree:12Willer!!@cluster0-shard-00-00-w1yyv.mongodb.net:27017,cluster0-shard-00-01-w1yyv.mongodb.net:27017,cluster0-shard-00-02-w1yyv.mongodb.net:27017/test?replicaSet=Cluster0-shard-0/admin?ssl=true&replicaSet=Mycluster0-shard-0&authSource=admin";

MongoClient.connect('mongodb://localhost:27017/twitter', function(err, db) {
    assert.equal(null, err);

    app.get('/:userId', function(req, res) {
        var userName = req.params.userId;

        if (userName == '') {
            next('Please provide an entry for all fields.');
        }

        var Twit = require('twit');

        var T = new Twit({
            consumer_key: 'H7kUZTLf1xUPk1410ADKb1zQM',
            consumer_secret: 'AZC8mU6m3Cr8GvwuwCTFaeNLebr17RZBKEYIRDvZmvwP4oNxAi',
            access_token: '827574158565507072-DDPFfMldxaNwGLPlq55jDLAvfAHPjLb',
            access_token_secret: 'SLgmtWUll5cOZjUVQmaxDlcVA7i9SWyxZAx0ooprE7Cym',
            timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
        });

        T.get('users/show', { screen_name: userName }, function(err, data, response) {

            var data_json = {
                "id": data.id,
                "name": data.name,
                "screen_name": data.screen_name,
                "location": data.location,
                "profile_location": data.profile_location,
                "description": data.description,
                "followers_count": data.followers_count,
                "friends_count": data.friends_count,
                "created_at": data.created_at,
                "time_zone": data.time_zone,
                "verified": data.verified,
                "statuses_count": data.statuses_count,
                "profile_background_image_url": data.profile_background_image_url,
                "profile_image_url": data.profile_image_url,
                "profile_banner_url": data.profile_banner_url
            }

            imgURL = data_json.profile_image_url;
            description = data_json.description;
            screenName = data_json.screen_name + "/"
            data_json.profile_location + "/" + data_json.location;
            followersCount = data_json.followers_count;
            followingCount = data_json.friends_count;

            res.render('connect', {
                'userName': userName,
                'description': description,
                'profile_image_url': imgURL,
                'screenName': screenName,
                'followersCount': followersCount,
                'followingCount': followingCount
            });

            db.collection('twitter').insertOne(data_json,
                function(err, r) {
                    assert.equal(null, err);
                    res.send("Document inserted with _id: " + r.insertedId);
                }
            );
        });
    });

    app.listen(3000, function() {
        console.log('Example app listening on port 3000!')
    });
});