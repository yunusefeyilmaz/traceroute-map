const Traceroute = require('nodejs-traceroute');

const traceRoute = (destination,callback) => {
    try{
        const tracer = new Traceroute();
        tracer.on('pid', (pid) => {
            console.log(`pid: ${pid}`);
        })
        .on('destination', (destination) => {
            console.log(`destination: ${destination}`);
        })
        .on('hop', (hop) => {
            if(hop.ip===null){
               callback(undefined,'Private',undefined);
            }
            callback(undefined,undefined,hop);
        })
        .on('close', (code) => {
            console.log(`close: code ${code}`);
            callback('close',undefined,undefined);
        }).on('error', (error) => {
            callback(undefined,error,undefined);
        });
        tracer.trace(destination);
    }catch(ex){
        callback(undefined,ex,undefined);
    }
}

module.exports = traceRoute;