require('dotenv').config()

var Particle = require('particle-api-js');
var particle = new Particle();



var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "user",
  password: "pass",
  database: "test"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


particle.login({ username : process.env.PARTICLE_LOGIN, password : process.env.PARTICLE_PASSWORD }).then(function(data) {
  particle.getEventStream({ deviceId: 'mine', auth: data.body.access_token }).then(function(stream) {
    stream.on('event', function(e) {
      var sql = "INSERT INTO event (name, data, published_at) VALUES (?, ?, ?)";
      var sub = e.published_at.substring(0,18);
      console.log("hoho");
      var value = [e.name, e.data, sub];
      console.log("haha");
      con.query(sql, value, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
      console.log("Event: " + e.name);
    });
  });
});
