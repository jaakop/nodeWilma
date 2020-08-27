const request = require('request');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

let wilmaUrl = '';
let userSlug = '';

/** Gets the SID */
function GetSID() {
    return new Promise((resolve, reject) => {
        if(!wilmaUrl) reject('Wilma url cannot be empty')

        fetch(wilmaUrl + '/index_json')
        .then(res => res.json())
        .then(json => resolve(json.SessionID))
        .catch(err => {
            reject(err);
        })
    });

}
/** Login to wilma and returns a SID*/
exports.LoginWilma = async function (username, password) {
    //Get SID for login
    let SESSIONID = await GetSID();

    return new Promise((resolve, reject) => {
        if(!wilmaUrl) reject('Wilma url cannot be empty')
        //Format data
        let formdata = new URLSearchParams();
        formdata.append('SESSIONID', SESSIONID);
        formdata.append("Login", username);
        formdata.append("Password", password);

        //Make post options
        let requestOptions = {
            method: 'POST',
            body: formdata,
            redirect: 'manual'
        };

        //Make the request
        fetch(wilmaUrl + '/index_json', requestOptions)
            .then(res => res)
            .then(body => {
                let cookie = body.headers.raw()['set-cookie'][1]
                resolve(cookie.slice(cookie.indexOf('=') + 1, cookie.indexOf(';')))
            })
            .catch(err => {
                reject(err);
            })
    })
}
/** Set Wilma url */
exports.SetURL = function(url) {
    wilmaUrl = url
}
/** Set user slug for wilma */
exports.SetUserSlug = function(slug){
    userSlug = '/' + slug
}
/** Gets the whole schedule of the month and returns a JSON of the schedule*/
exports.GetSchedule = function (SID, Day) {
    return new Promise(resolve => {
        let requestOptions = {
            headers: {
                'Cookie': 'Wilma2SID=' + SID
            },
            method: 'GET'
        }
        let date = Day ? Day.getDate() + '.' + (Day.getMonth() + 1) + '.' + Day.getFullYear() : ''

        fetch(wilmaUrl + userSlug + '/overview?date=' + date, requestOptions)
        .then(res => res.json())
        .then(body => resolve(body))
        .catch(err => console.log('There was an error: \n' + err));
    });
}
/** Get all messages and return a JSON of the messages*/
exports.GetMessages = function (SID) {
    return new Promise((resolve, reject) => {
        let postOptions = {
            headers: {
                'Cookie': 'Wilma2SID=' + SID
            },
            method: 'GET'
        }
        fetch(wilmaUrl + userSlug + '/messages/list', postOptions)
        .then(res => res.json())
        .then(body => resolve(body))
        .catch(err => reject('There was an error \n' + err));

    });
}
/** Get the content of a message and returns the message information in a nice JSON format*/
exports.GetMessageBody = function (messageID, SID) {

    return new Promise((resolve, reject) => {
        let postOptions = {
            headers: {
                'Cookie': 'Wilma2SID=' + SID
            },
            method: 'GET'
        }
        fetch(wilmaUrl + userSlug + '/messages/' + messageID + '?format=json', postOptions)
        .then(res => res.json())
        .then(body => resolve(body.messages[0]))
        .catch(err => reject('There was an error \n' + err));
    });
}