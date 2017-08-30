/*jslint browser: true*/
/*global require*/

var Alexa = require('alexa-sdk');
var http = require('http');

var states = {
    SEARCHMODE: '_SEARCHMODE',
    TOPFIVE: '_TOPFIVE'
};

var location = "Moers";

var numberOfResults = 3;

var APIKey = "4844d21f760b47359945751b9f875877";

var dict = {
	welcomeMessage: "Bürgerservice Moers. Du kannst mich zum Beispiel nach den Öffnungszeiten und den aktuellen Wartezeiten im Bürgerservice fragen. Los geht's!",
	welcomeRepromt: "Du kannst mich zum Beispiel nach den Öffnungszeiten und den aktuellen Wartezeiten im Bürgerservice fragen. Was möchtest du wissen?",
	helpMessage: "Du kannst mich zum Beispiel nach folgendem Fragen: Wann hast du offen? Nenne mir die Wartenummer. Ist es heute voll?  Was möchtest du als nächstes tun?",
	goodbyeMessage: "OK, bis zum nächsten Mal.",
	addressMessage: "Der Bürgerservice befindet sich im Rathaus Moers. Die genaue Adresse lautet Rathausplatz 1 in 47 441, Moers",
	openingHoursMessage: "Der Bürgerservice hat montags bis freitags von 8 bis 13 Uhr, donnerstags sogar bis 18 Uhr geöffnet. Am Samstag hat der Bürgerservice von 9 bis 12:30 Uhr geöffnet.",
	phoneNumberMessage: "Den Bürgerservice kannst du unter der Telefonnummer 0 28 41 / 201 648 erreichen. 201 648.",
	todo: "Das ist eine gute Frage. Das kann ich dir in Kürze beantworten."
};

var moreInformation = "See your  Alexa app for  more  information.";
var tryAgainMessage = "please try again.";
var noAttractionErrorMessage = "What attraction was that? " + tryAgainMessage;
var topFiveMoreInfo = " You can tell me a number for more information. For example, open number one.";
var getMoreInfoRepromtMessage = "What number attraction would you like to hear about?";
var getMoreInfoMessage = "OK, " + getMoreInfoRepromtMessage;
var newsIntroMessage = "These are the " + numberOfResults + " most recent " + location + " headlines, you can read more on your Alexa app. ";
var hearMoreMessage = "Would you like to hear about another top thing that you can do in " + location + "?";
var newline = "\n";

var output = "";

var alexa;

// Create a web request and handle the response.
function httpGet(callback) {
	'use strict';

	var options = {
		// https://tursics.com/api/moers/v1/wait/current
		host: 'tursics.com',
		path: '/api/moers/v1/wait/current',
		method: 'GET'
	},
		req = http.request(options, (res) => {
		var body = '';

		res.on('data', (d) => {
			body += d;
		});
		res.on('end', function () {
			callback(body);
		});
	});
	req.end();

	req.on('error', (e) => {
		console.error(e);
	});
}

var newSessionHandlers = {
    'LaunchRequest': function () {
		'use strict';

		this.handler.state = states.SEARCHMODE;
        output = dict.welcomeMessage;
        this.emit(':ask', output, dict.welcomeRepromt);
    },
    'getAddress': function () {
		'use strict';

		this.handler.state = states.SEARCHMODE;
        this.emitWithState('getAddress');
    },
    'getOpeningHours': function () {
		'use strict';

		this.handler.state = states.SEARCHMODE;
        this.emitWithState('getOpeningHours');
    },
    'getPhoneNumber': function () {
		'use strict';

		this.handler.state = states.SEARCHMODE;
        this.emitWithState('getPhoneNumber');
    },
    'getNextTicket': function () {
		'use strict';

		this.handler.state = states.SEARCHMODE;
        this.emitWithState('getNextTicket');
    },
    'getWaitingPeople': function () {
		'use strict';

		this.handler.state = states.SEARCHMODE;
        this.emitWithState('getWaitingPeople');
    },
    'getWaitingTime': function () {
		'use strict';

		this.handler.state = states.SEARCHMODE;
        this.emitWithState('getWaitingTime');
    },
    'AMAZON.StopIntent': function () {
		'use strict';

		this.emit(':tell', dict.goodbyeMessage);
    },
    'AMAZON.CancelIntent': function () {
		'use strict';

		// Use this function to clear up and save any data needed between sessions
        this.emit(":tell", dict.goodbyeMessage);
    },
    'SessionEndedRequest': function () {
		'use strict';

		// Use this function to clear up and save any data needed between sessions
        this.emit('AMAZON.StopIntent');
    },
    'Unhandled': function () {
		'use strict';

		output = dict.helpMessage;
        this.emit(':ask', output, dict.welcomeRepromt);
    }
};

var startWaitingHandlers = Alexa.CreateStateHandler(states.SEARCHMODE, {
    'getAddress': function () {
		'use strict';

		output = dict.addressMessage;
        this.emit(':tellWithCard', output, location, dict.addressMessage);
    },
    'getOpeningHours': function () {
		'use strict';

		output = dict.openingHoursMessage;
        this.emit(':tellWithCard', output, location, dict.openingHoursMessage);
    },
    'getPhoneNumber': function () {
		'use strict';

		output = dict.phoneNumberMessage;
        this.emit(':tellWithCard', output, location, dict.phoneNumberMessage);
    },
    'AMAZON.YesIntent': function () {
		'use strict';

		output = dict.helpMessage;
        this.emit(':ask', output, dict.helpMessage);
    },
    'AMAZON.NoIntent': function () {
		'use strict';

		output = dict.helpMessage;
        this.emit(':ask', dict.helpMessage, dict.helpMessage);
    },
    'AMAZON.StopIntent': function () {
		'use strict';

		this.emit(':tell', dict.goodbyeMessage);
    },
    'AMAZON.HelpIntent': function () {
		'use strict';

		output = dict.helpMessage;
		this.emit(':ask', output, dict.helpMessage);
    },
    'getNextTicket': function () {
		'use strict';

        this.emit(':ask', dict.todo, dict.todo);
		return;

		httpGet(function (response) {
			// Parse the response into a JSON object ready to be formatted.
			var responseData = JSON.parse(response);
			var cardContent = "Data provided by New York Times\n\n";

            // Check if we have correct data, If not create an error speech out to try again.
            if (responseData == null) {
				output = "There was a problem with getting data please try again";
			} else {
				output = responseData.ticketnumber;
                output += " See your Alexa app for more information.";
            }

            var cardTitle = location + " News";

            alexa.emit(':tellWithCard', output, cardTitle, cardContent);
        });
    },
    'getWaitingPeople': function () {
		'use strict';

        this.emit(':ask', dict.todo, dict.todo);
		return;
	},
    'getWaitingTime': function () {
		'use strict';

        this.emit(':ask', dict.todo, dict.todo);
		return;
	},
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', output, dict.helpMessage);
    },
    'AMAZON.CancelIntent': function () {
        // Use this function to clear up and save any data needed between sessions
        this.emit(":tell", dict.goodbyeMessage);
    },
    'SessionEndedRequest': function () {
        // Use this function to clear up and save any data needed between sessions
        this.emit('AMAZON.StopIntent');
    },
    'Unhandled': function () {
        output = dict.helpMessage;
        this.emit(':ask', output, dict.welcomeRepromt);
    }
});

exports.handler = function (event, context, callback) {
    alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers, startWaitingHandlers);
    alexa.execute();
};

String.prototype.trunc =
    function (n) {
        return this.substr(0, n - 1) + (this.length > n ? '&hellip;' : '');
    };
