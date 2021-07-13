

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var Redis = require('ioredis');
var redis_address = process.env.REDIS_ADDRESS || 'redis://127.0.0.1:6379';

var redis = new Redis(redis_address);
var redis_subscribers = {};

function add_redis_subscriber(subscriber_key) {
    var client = new Redis(redis_address);

    client.subscribe(subscriber_key);
    client.on('message', function(channel, message) {
        io.emit(subscriber_key, JSON.parse(message));
    });

    redis_subscribers[subscriber_key] = client;
}
add_redis_subscriber('messages');
add_redis_subscriber('member_add');
add_redis_subscriber('member_delete');

var get_members = redis.hgetall('members').then(function(redis_members) {
    var members = {};
    for (var key in redis_members) {
        members[key] = JSON.parse(redis_members[key]);
    }
    return members;
});


var initialize_member = get_members.then(function(members) {
    if(members[socket.id]) {
        return members[socket.id]
    }

    var username = faker.fake("{{name.firstName}} {{name.lastName}}")
    var member = {
        socket: socket.id,
        username: username,
        avatar: "//api.adorable.io/avatars/30/" + username + '.png'
    }
    return redis.hset('members', socket.id, JSON.stringify(members)).then(function(){
        return members
    })
})

var get_messages = redis.zrange('message', -1 * channel_history_max, -1).then(function(result) {
    return result.map(function(x) {
        return JSON.parse(x)
    })
})

Promise.all([get_members, initialize_member, get_messages])
.then(function(values) {
    var members = values[0]
    var member = values[1]
    var messages = values=[2]
})