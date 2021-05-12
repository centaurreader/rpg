const http = require('http');
const fs = require('fs');
const path = require('path');

const options = {};

const server = http.createServer(options, (request, response) => {
  console.log('request starting...');

  let filePath = '../src' + request.url;
  if (filePath == '../src/')
      filePath = '../src/index.html';

  const extname = path.extname(filePath);
  let contentType = 'text/html';
  switch (extname) {
      case '.js':
          contentType = 'text/javascript';
          break;
      case '.css':
          contentType = 'text/css';
          break;
      case '.json':
          contentType = 'application/json';
          break;
      case '.png':
          contentType = 'image/png';
          break;      
      case '.jpg':
          contentType = 'image/jpg';
          break;
      case '.wav':
          contentType = 'audio/wav';
          break;
  }
  console.log(path.resolve(filePath));
  fs.readFile(path.resolve(__dirname, filePath), function(error, content) {
      if (error) {
          if(error.code == 'ENOENT'){
              fs.readFile('./404.html', function(error, content) {
                  response.writeHead(200, { 'Content-Type': contentType });
                  response.end(content, 'utf-8');
              });
          }
          else {
              response.writeHead(500);
              response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
              response.end(); 
          }
      }
      else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
      }
  });
});

server.listen(3000, () => {
  console.log('listening');
});
