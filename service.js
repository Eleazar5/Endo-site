var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Endo-site',
  description: 'The Endo site backend server.',
  script: 'C:\\Mobi Duka\\Backend\\Mobi-duka\\index.js'
});

svc.on('install',function(){
  svc.start();
});

svc.install();


// To run this, open root file on command prompt as an adminsitraor and run
// node service.js
// To delete the service, open command prompt as an adminsitraor and run
// sc delete endosite.exe
