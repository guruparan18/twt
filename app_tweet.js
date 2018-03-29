var Twit = require('twit');
var trend = new Object();
var T = new Twit({
    consumer_key: 'sJgS07cqtr9MV1f9rf8qQ4UFi',
    consumer_secret: 'wpWtluZkpOkbW0VIpSXJZxYk0P6zBhOPrDhRlwiJhmI1kCLoOg',
    access_token: '946472828374745089-MmGThSplpTkTxqklo8RFcmnnXWtbRKm',
    access_token_secret: '2Zkqo9YRzl7xOSsPgU1xbtYsuvzR2qbtFuT4sExau9Wkd',
    timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
});

var data_json = "";

const { Client } = require('pg');
const connectionString = 'postgresql://twttrend_user:twttrend_user@127.0.0.1:5432/twttrend';

const client = new Client({
    connectionString: connectionString,
});

client.connect();

const text = 'INSERT INTO tweets(created_at, id_str, text, in_reply_to_status_id_str, user_id_str, screen_name, quoted_status_id_str, retweet_count, favorite_count, lang, truncated, id, retweeted_id, media, media_json, hashtags, urls, media_ent) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, substr($14,1,3000), substr($15,1,3000), substr($16,1,100), substr($17,1,1000), substr($18,1,1000)) ON CONFLICT(ID_STR) DO UPDATE SET retweet_count=$8, favorite_count=$9, hashtags=$16, urls=$17, media_ent=$18 WHERE tweets.retweet_count!=$8 or tweets.favorite_count!=$9 RETURNING *';

/*
const text = 'INSERT INTO tweets(created_at, id_str, text, in_reply_to_status_id_str, user_id_str, screen_name, quoted_status_id_str, retweet_count, favorite_count, lang, truncated, id, retweeted_id, media, media_json) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) ON CONFLICT(ID_STR) DO UPDATE SET retweet_count=$8, favorite_count=$9, id=$12, retweeted_id=$13, media=$14, media_json=$15 RETURNING *';

const text = 'INSERT INTO tweets(created_at, id_str, text, in_reply_to_status_id_str, user_id_str, screen_name, quoted_status_id_str, retweet_count, favorite_count, lang, truncated, id, retweeted_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *';
*/
T.get('statuses/home_timeline', { count: 200 }, async function(err, data, response) {
    const queryPromises = [];
    var item
    for (item in data) {
        var values = [
        /*1*/    data[item].created_at,
        /*2*/    data[item].id_str,
        /*3*/    data[item].text,
        /*4*/    data[item].in_reply_to_status_id_str,
        /*5*/    data[item].user.id_str,
        /*6*/    data[item].user.screen_name,
        /*7*/    data[item].quoted_status_id_str,
        /*8*/    data[item].retweet_count,
        /*9*/    data[item].favorite_count,
        /*10*/   data[item].lang,
        /*11*/   data[item].truncated,
        /*12*/   data[item].id,
        /*13*/   data[item].retweeted_status ? data[item].retweeted_status.id : '',
        /*14*/   data[item].extended_entities ? JSON.stringify((data[item].extended_entities.media).map(a=> a.media_url)) : '', //[0].media_url : '',
        /*15*/   data[item].extended_entities ? JSON.stringify(data[item].extended_entities.media) : ''
        /*16*/,  data[item].entities ? JSON.stringify((data[item].entities.hashtags).map(a=>a.text)):''
        /*17*/,  data[item].entities ? JSON.stringify((data[item].entities.urls).map(a=>a.expanded_url)):''
        // /*18*/,  ''
        /*18*/,  data[item].entities ? ( data[item].entities.media ? JSON.stringify((data[item].entities.media).map(a=>a.media_url_https)):'' ): ''
           // data[item].extended_entities ? data[item].extended_entities.media[0].media_url : ''
           // data[item].extended_entities ? data[item].extended_entities.media : '{"MEDIA":NULL}'
        ];

        queryPromises.push(client.query(text, values)
            .then(res => {
                console.log(res.rows[0])
            })
            .catch(e => console.error(e.stack, values))
        );
    }

/*
    console.log(data[item])
    console.log(data[item].entities.hashtags)
    console.log(data[item].entities.urls)
    console.log(data[item].extended_entities.media)
*/

    await Promise.all(queryPromises);
    client.end();
})
