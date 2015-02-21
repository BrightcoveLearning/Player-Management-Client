#! /usr/bin/env node
var argv = require('yargs')
    .usage('Usage: $0 -accountId [num] -accessToken [string]')
    .demand(['accountId','accessToken'])
    .argv,

  apiOptions = {
    accountId: argv.accountId,
    accessToken: argv.accessToken
  },
  // use 'player-management-client' in your code
  playerManagementAPI = require('../lib/playerManagementAPI.js')(apiOptions);

playerManagementAPI.players.list(function(error, response) {
  var players;
  if (error) {
    // do something
  } else {
    players = JSON.parse(response.body).items;

    console.log({players: players});
  }
});