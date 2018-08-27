var Client = require('mariasql');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
//  console.log('a user connected');
  socket.on('disconnect', function(){
//    console.log('user disconnected');
  });
  socket.on('query', function(data){
        var c = new Client({
          host: 'localhost',
          user: 'root',
          password: 'team7336',
          multiStatements: true,
          db: 'railroad'
        });
//    console.log(data);
        if (data.password === 'team7336') {
                c.query(data.sql, null, {metadata: true}, (err, rows)=>{
                        if (err) io.sockets.to(socket.id).emit('query_result',err);
                        else io.sockets.to(socket.id).emit('query_result',rows);
                })
        } else {
            io.sockets.to(socket.id).emit('query_result',{code: 'WRONG DEV PASSWORD'});
        }
        c.end();
  })
  socket.on('create_user', function(data){
    var c = new Client({
        host: 'localhost',
        user: 'root',
        password: 'team7336',
        multiStatements: true,
        db: 'railroad'
    });
    c.query(
        `SELECT COUNT(*) FROM passengers WHERE email LIKE '${data.email}' OR preferred_card_number LIKE '${data.card}'`,
        null, {metadata: true},
        (err, rows) => {
            if (err) io.sockets.to(socket.id).emit('create_user_backend_err', err);
            else {
                if (rows[0]['COUNT(*)'] >= 1 || rows[0]['count(*)'] >= 1) {
                    io.sockets.to(socket.id).emit('create_user_exists', {email: data.email, card: data.card})
                } else {
                    c.query(
                        `INSERT INTO passengers VALUES (NULL, '${data.fname}', '${data.lname}', '${data.email}', '${data.password}', '${data.card}', '${data.address}' );`,
                        null, {metadata:true},
                        (err, rows) => {
                            if (err) io.sockets.to(socket.id).emit('create_user_err', err);
                            else {
                                c.query(`select passenger_id from passengers where email = '${data.email}'`,
                                null, {metadata:true},(err,rows)=>{
                                    if (err) io.sockets.to(socket.id).emit('create_user_err', err);
                                    else io.sockets.to(socket.id).emit('create_user_success', {id: rows[0]["passenger_id"]})
                                })
                                io.sockets.to(socket.id).emit('create_user_success', {success: true})
                            }
                        }
                    )
                }
            }
        }
    )
    c.end();
  })
  socket.on('get_station',function(d){
        var c = new Client({
            host: 'localhost',
            user: 'root',
            password: 'team7336',
            multiStatements: true,
            db: 'railroad'
        });
        c.query('SELECT * FROM stations;', null, {metadata:true}, (err, rows)=>{
            if (err) io.sockets.to(socket.id).emit('fetch_station_err', err);
            else io.sockets.to(socket.id).emit('station_list',rows);
        })
        c.end();
  })
  socket.on('get_avail_trains',function(data){
        var c = new Client({
            host: 'localhost',
            user: 'root',
            password: 'team7336',
            multiStatements: true,
            db: 'railroad'
        });
        c.query(`CALL get_avail_trains("${data.date}", ${data.from}, ${data.to}, '${data.time}', NULL, @'holder');`,null,{metadata:false},
        (err,rows)=>{
            if (err) io.sockets.to(socket.id).emit('fetch_train_err', err);
            else io.sockets.to(socket.id).emit('available_trains', rows[0]);
        })
        c.end();
  })
  socket.on('make_reservation', function(data){
        var c = new Client({
            host: 'localhost',
            user: 'root',
            password: 'team7336',
            multiStatements: true,
            db: 'railroad'
        });
        var seg0 = -1;
        var seg1 = -1;
        if (data.from < data.to) {
            seg0 = data.from;
            seg1 = data.to - 1;
        } else {
            seg0 = data.to;
            seg1 = data.from -1;
        }
        if (seg0 === -1 || seg1 === -1) io.sockets.to(socket.id).emit('reservation_err', err);
        else {
            c.query(`CALL make_reservation('${data.date}', ${data.train}, ${seg0}, ${seg1}, ${data.pid}, ${data.card}, '${data.address}', @'output');`,
            null,
            {metadata: true},
            (err,rows)=>{
                if (err) io.sockets.to(socket.id).emit('reservation_err', err);
                else io.sockets.to(socket.id).emit('confirm_reserve', rows);
            });
        }
        c.end();
  })
  socket.on('delete_reservation',function(data){
        var c = new Client({
            host: 'localhost',
            user: 'root',
            password: 'team7336',
            multiStatements: true,
            db: 'railroad'
        });
        c.query(`call delete_reservation(${data.num})`,null,
        {metadata:true},(err,rows)=>{
            if (err) io.sockets.to(socket.id).emit('cancel_err',err);
            else io.sockets.to(socket.id).emit('cancel_success',rows);
        })
        c.end();
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});