const request = require('postman-request');

const iplocation = (ip, callback) => {
    const url = `http://ip-api.com/json/${ip}`;
    request({ url, json: true }, (error, { body }) => {
        if (error) {
            callback('Unable to connect to location services!', undefined);
        } else if (body.error) {
            callback('Unable to find location. Try another search.', undefined);
        }else if (body.status === 'fail') {
            callback(undefined, { city: 'Private', region: '', country: '', latitude: '', longitude: '', isp: '', org: '', ip: body.query});
        } else {
            callback(undefined, {
                city: body.city,
                region: body.region,
                country: body.country,
                latitude: body.lat,
                longitude: body.lon,
                isp: body.isp,
                org: body.org,
                ip: body.query 
            });
        }
    });
}

module.exports = iplocation;