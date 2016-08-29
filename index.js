'use strict';

const env = require('node-env-file');
const _ = require('lodash');
const fs = require('fs-extra');
const request = require('request');
env(__dirname + '/.env');

let Wit = null;
let interactive = null;

try {
  // if running from repo
  Wit = require('../').Wit;
  interactive = require('../').interactive;
} catch (e) {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
}

const accessToken = (() => {
  return process.env.WIT_TOKEN;
})();

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    return new Promise(function(resolve, reject) {
      console.log('user said...', request.text);
      console.log('sending...', JSON.stringify(response));
      return resolve();
    });
  },
  // What should I pack for my trip to California on November 12?
  getPackingList({context, entities}) {
    return new Promise(function(resolve, reject) {
      console.log("getPackingList");
      var destination = firstEntityValue(entities, "destination");
      var datetime = firstEntityValue(entities, "datetime");

      if (datetime && destination) {
        context.datetime = datetime;
        context.destination = destination;
        context.list = makePackingList(context);
      } else if (!datetime) {
        context.missingDatetime = true;
        delete context.packingList;
      } else if (!destination) {
        context.missingDestination = true;
        delete context.packingList;
      }
      console.log(JSON.stringify(context));
      return resolve(context);
    });
  },
  getOutfit({context, entities}) {
    return new Promise(function(resolve, reject) {
      var datetime = firstEntityValue(entities, "datetime");
      var location = firstEntityValue(entities, "location");

      if (!datetime) {
        context.datetime = Date.now();
      }

      if (!location) {
        context.location = "San Francisco";
      }

      context.forecast = getForecast(context);
      context.outfit = makeOutfit(context);
      console.log(JSON.stringify(context));
      return resolve(context)
    });
  }
};

function makePackingList({datetime, location, destination}) {
  return "nothing";
}

function makeOutfit({forecast}) {
  return "a paper bag";
}

function getForecast({datetime, location}) {
  const url = `api.openweathermap.org/data/2.5/forecast/daily?q=${location.replace(" ", "")}&cnt=1&appId=${process.env.APP_ID}`;
  console.log(url);
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      return body
    }
  });
}

function getCurrent({location}) {
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${location.repalce(" ", "")}&units=metric&appId=${process.env.APP_ID}`;
}

const client = new Wit({accessToken, actions});
interactive(client);
