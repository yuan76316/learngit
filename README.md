Before using the file, change CouchDb URLs and creditionals in initServer.js and dataMashupsServer.js

Requirement

NodeJS hosting server, CouchDB, OpenWeatherMap, Leaflet, Google Maps API, jQuery, jQuery UI, Bootstrap, W3.css

Node modules used:

Express 4.13.4
Express-json
Body-parser 1.15
Nano 6.2
Request 2.72

ssh to hosting server

In commandline window, change directory to where all files are placed

To install all modules, type:

npm i

Initialise CouchDB >> node initServer.js

Start the server >> node dataMashupsServer.js

Go to 

http://[username].host.cs.st-andrews.ac.uk:8081

or 

https://[username].host.cs.st-andrews.ac.uk:8082

in a web browser

The certificate for SSL is self-signed, dismiss warnings to proceed.