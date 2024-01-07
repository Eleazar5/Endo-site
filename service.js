var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Endo-site',
  description: 'The Endo site backend server.',
  script: 'C:\\CFT\\Eleazar\\Mobi Duka\\Backend\\Mobi-duka\\index.js'
});

svc.on('install',function(){
  svc.start();
});

svc.install();