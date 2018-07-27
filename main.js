require('dotenv').config()

var Particle = require('particle-api-js');
var particle = new Particle();



var mysql = require('mysql');
var con = mysql.createConnection({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBDATABASE
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


particle.login({ username : process.env.PARTICLE_LOGIN, password : process.env.PARTICLE_PASSWORD }).then(function(data) {
  particle.getEventStream({ deviceId: 'mine', auth: data.body.access_token }).then(function(stream) {
    stream.on('event', function(e) {
      var core_id = e.coreid;
      var sql  ='SELECT * FROM device WHERE core_id = ?';
      con.query(sql, [core_id], function (err, result) {
        if (err) throw err;
        if (result.length <= 0) {
          sql = "INSERT INTO device (core_id) VALUES (?)";
          con.query(sql, [core_id], function (err, result) {
            if (err) throw err;
            console.log("1 record inserted into device");
          });
        }
      });

      var device_id;
      sql  = 'SELECT id FROM device WHERE core_id = ?';
      con.query(sql, [core_id], function (err, result) {
        if (err) throw err;
        console.log("id of particle device to insert for event: ", result);
        device_id = result[0].id;
      });

      sql = "INSERT INTO event (name, data, published_at, device_id) VALUES (?, ?, ?, ?)";
      var sub = e.published_at.substring(0,18);
      var value = [e.name, e.data, sub, device_id];
      con.query(sql, value, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted into event");
      });
    });
  });
});
