//Defining these variables lets me use the "http", "fs", and "url" modules included in node.js
const http = require('http'),
  fs = require('fs'),
  url = require('url');

//This function creates a server using the http module
http.createServer((request, response) => {
    let addr = request.url,
    q = url.parse(addr, true),
    filePath = '';

    //This will append the URL entered by the user, along with a timestamp, to the end of the "log.txt" file in the directory
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) =>{
      if (err) {
        console.log(err);
      } else {
        console.log('Added to log.');
      }
    });

    // This checks to see if the URL pathname entered by the user includes "documentation"
    // "q" is where we stored the parsed URL from the user above
    if (q.pathname.includes('documentation')) {
      filePath = (__dirname + '/documentation.html'); //if it does, it adds "/documentation.html" to the current directory and assigns that to the "filePath" variable
    } else {
      filePath = 'index.html'; //if it doesn't, it assigns "index.html" to the "filePath" variable
    }

    // This grabs the correct file from the server and responds with the data associated with that request
    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }

      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(data);
      response.end();

    });

}).listen(8080);

console.log('My first Node test server is running on Port 8080.');
