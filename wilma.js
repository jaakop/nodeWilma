const request = require('request');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

/** Gets the SID */
function GetSID() {
    return new Promise(resolve => {
        fetch('https://gradia.inschool.fi/index_json')
        .then(res => res.json())
        .then(json => resolve(json.SessionID));
    });

}
/** Login to wilma and returns a SID*/
exports.LoginWilma = async function (username, password) {
    //Get SID for login
    let SESSIONID = await GetSID();

    return new Promise(resolve => {
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
        fetch('https://gradia.inschool.fi/index_json', requestOptions)
            .then(res => res)
            .then(body => {
                let cookie = body.headers.raw()['set-cookie'][1]
                resolve(cookie.slice(cookie.indexOf('=') + 1, cookie.indexOf(';')))
            }
            );
    })
}
/** Get all messages and return a JSON of the messages*/
exports.GetMessages = function (SID) {
    return new Promise(resolve => {
        let postOptions = {
            url: 'https://wilma.gradia.fi/messages/list',
            headers: {
                'Cookie': 'Wilma2SID=' + SID
            },
            method: 'GET'
        }
        //Make a request
        request(postOptions, (error, res, body) => {
            resolve(JSON.parse(body));
        });
    });
}
/** Gets the whole schedule of the month and returns a JSON of the schedule*/
exports.GetSchedule = function (SID) {
    return new Promise(resolve => {
        let postOptions = {
            url: 'https://wilma.gradia.fi/overview',
            headers: {
                'Cookie': 'Wilma2SID=' + SID
            },
            method: 'GET'
        }
        request(postOptions, (error, res, body) => {
            resolve(JSON.parse(body));
        });
    });
}
/** Get the content of a message and returns the message information in a nice JSON format*/
exports.GetMessageBody = function (messageID, SID) {

    return new Promise(resolve => {
        let postOptions = {
            url: 'https://wilma.gradia.fi/messages/' + messageID + '?recipients',
            headers: {
                'Cookie': 'Wilma2SID=' + SID
            },
            method: 'GET'
        }
        request(postOptions, (error, res, body) => {
            var text = body;
            var start = text.search('<!-- Sivukohtainen alue alkaa -->');
            var end = text.search(' <!-- Sivukohtainen alue loppuu -->')
            text = text.slice(start + 34, end);

            var result = {
                title: text.slice(text.search('<h1>') + 4, text.search('</h1>')),
                sender: text.slice(text.indexOf('">', text.search('</th>')) + 2, text.indexOf('</div>', text.search('<th>Lähettäjä: </th>'))).trim(),
                recipients: [],
                info: {
                    replies: Number(text.slice(text.search('vastausta') - 2, text.search('vastausta') - 1)),
                    date: text.slice(text.indexOf('<td>', text.search('<th>Lähetetty: </th>')) + 4, text.indexOf('<', text.indexOf('<td>', text.search('<th>Lähetetty: </th>')) + 4)),
                },
                mainMessageBody: text.slice(text.indexOf('class="ckeditor') + 24, text.indexOf('</div>', text.indexOf('class="ckeditor') + 24)),
                replies: [

                ]
            }

            //Gets the date
            result.info.date = result.info.date.replace(' klo ', '-');
            result.info.date = result.info.date.replace('.', '-');
            result.info.date = result.info.date.replace('.', '-');
            result.info.date = result.info.date.replace(':', '-');

            if (Number(result.info.date.slice(0, result.info.date.indexOf('-'))) < 10) {
                result.info.date.replace(result.info.date.slice(0, result.info.date.indexOf('-')), '0' + result.info.date.slice(0, result.info.date.indexOf('-')));
            }


            if (Number(result.info.date.slice(3, result.info.date.indexOf('-', 3))) < 10) {
                result.info.date = result.info.date.replace(result.info.date.slice(3, result.info.date.indexOf('-', 3)), '0' + result.info.date.slice(3, result.info.date.indexOf('-', 3)));
            }
            var dates = result.info.date.split('-');
            result.info.date = new Date(dates[2], dates[1], dates[0], dates[3], dates[4]);

            //Fixing the sender if it is a teacher

            if (result.sender.includes('</a>')) {
                result.sender = result.sender.slice(result.sender.indexOf('>') + 1, result.sender.indexOf('</a>'));
            }

            // Get the recipients
            var recipientsCell = text.slice(text.indexOf('<a', text.indexOf('recipients-cell')), text.indexOf('\n', text.indexOf('<a', text.indexOf('id="recipients-cell"'))));

            if (recipientsCell.trim() == '')
                result.recipients.push({ name: 'Piilotettu' });
            else {
                recipientsCell = recipientsCell.replace(/\r/g, '');
                recipientsCell = recipientsCell.replace(/, /g, '');
                recipientsCell = recipientsCell.trim();
                recipientsCell = recipientsCell.split('</a>');
                for (let i = 0; i < recipientsCell.length; i++) {
                    let recipient = recipientsCell[i].slice(recipientsCell[i].indexOf('>') + 1);
                    if (recipientsCell[i].trim() != '')
                        result.recipients.push({ name: recipient });
                }
            }

            // Get the reply bodies

            var numberOfReplies = (text.match(/m-replybox /g)).length;

            for (let i = 0; i < numberOfReplies; i++) {
                let reply = text.slice(text.indexOf('<div class="m-replybox '), text.indexOf('</div>', text.indexOf('<div class="m-replybox')));
                text = text.replace(reply, '');
                //Get the name of the replier
                let name = reply.slice(reply.indexOf('>', reply.indexOf('<h2')) + 1, reply.indexOf('</h2>'));
                if (name.includes('<a href')) {
                    name = name.slice(name.indexOf('>') + 1, name.indexOf('</'))
                } else {
                    name = 'Sinä';
                }
                //Get the reply body
                let body = reply.slice(reply.indexOf('>', reply.indexOf('<div class="inner hidden"')) + 1, reply.indexOf('</div>'));

                //push the replies to the result
                result.replies.push({ name: name, messageContent: body });
            }


            resolve(result);
        });
    });
}