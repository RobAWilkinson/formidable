var multiparty = require('multiparty');
var app = require('express')();
var fs = require('fs');

app.get('/', function(req, res) {
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
});
app.post('/upload', function(req, res) {
    var writeable = new require('stream').Writable();
    var bufs = [];
    var chunks = [];
    writeable._write = function(chunk, enc, next) {
      chunks.push(chunk);
      next();
    }
    var form = new multiparty.Form({autoFiles: false});
    form.on('part', function(part) {
      part.on('error', function(err) {
        throw new Error(err);
      });
      part.pipe(writeable);
      part.resume();
    });
    form.on('error', function(error) {
      console.log(error);
    });
    form.on('progress', function(bytesReceived, bytesExpected) {
      console.log('bytes received: ', bytesReceived);
      console.log('bytesExpected: ', bytesExpected);
      console.log(chunks.length);
    });
    form.on('close', function() {
      console.log('closed');
      var b = Buffer.concat(chunks);
      console.log(b);
      console.log(b.toString("base64"));
      //res.writeHead(200, {'content-type': 'text/html'});
      res.send('<img src="data:image/png;base64,' + b.toString("base64") + '">');
    });

    form.parse(req);
    writeable.on('error', function(err) {
      console.log(err);
    });
})
app.listen(3000, function() {
  console.log('listening');
});
