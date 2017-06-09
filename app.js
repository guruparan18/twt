var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    bodyParser = require('body-parser'),
    assert = require('assert');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.render('index', {});
});

//app.get('/[a-zA-Z]+', function(req, res) {
/*
app.get('/:userId(\[a-zA-Z]+)', function(req, res) {
    res.send(req.params.userId)
});
*/

app.post('/connect', function(req, res, next) {
    var userName = req.body.userName;
    res.redirect('/' + userName);
});

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
        /*
        id
        name
        screen_name
        location
        profile_location
        description
        followers_count
        friends_count
        created_at
        time_zone
        verified
        statuses_count
        profile_background_image_url
        profile_image_url
        profile_banner_url
        */
        imgURL = data.profile_image_url;
        description = data.description;
        screenName = data.screen_name;
        followersCount = data.followers_count;
        followingCount = data.friends_count;

        res.render('connect', {
            'userName': userName,
            'description': description,
            'profile_image_url': imgURL,
            'screenName': screenName,
            'followersCount': followersCount,
            'followingCount': followingCount
        });
    });
});

app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
});