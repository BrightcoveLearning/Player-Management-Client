/**
 * This is a simple node module for interacting with the Brightcove Player Management REST API.
 * Example usage:
 *
 * playerManagementApi = require('playerManagementApi.js')({accountId: 123, accessToken: 'insert your token here'});
 *
 * playerManangementApi.player.get.config(myPlayerId, branch, function (error, response) {
 *   var config;
 *   if (error) {
 *     // something catastrophic happened during the call
 *   } else if (response.status !== 200) {
 *     // a response was returned but it was not successful
 *   } else {
 *     // a successful response was returned
 *     config = JSON.parse(request.body);
 *   }
 * }
 */

module.exports = function(apiInfo) {
  var
    path = require('path'),
    request = require('request'),
    urlTool = require('url'),

    bcAccount = apiInfo.accountId.toString(), // can come in as -a '1234' or -a 1234
    baseUrl = apiInfo.baseUrl || 'https://players.api.brightcove.com',
    apiVersion = apiInfo.version || 'v1',
    accessToken = apiInfo.accessToken,
    email = apiInfo.email,
    customHeaders = [],

    urlPath = path.join(apiVersion, 'accounts', bcAccount),
    url = urlTool.resolve(baseUrl, urlPath),

    /**
     * Logs a curl representation of the request being made.
     * @param method HTTP method
     * @param json Data being sent
     * @param url URL that is being called
     * @param _extraParams Any other params being provided.
     */
    logCurlRequest = function(method, json, url, _extraParams){
      var extraParams = _extraParams || '',
        data = json? '--data \'' + json + '\' ' : '',

        authCreds = apiInfo.email + ':' + apiInfo.password,
        contentType = method === 'POST' || method === 'PUT'?
          '-H \'Content-Type: application/json\' ':
          '',
        authParam = accessToken?
          '-H \'Authorization: Bearer ' + accessToken + '\' ' :
          '-u ' + email + ' ';

      console.info();
      console.info('curl command:');
      console.info('> curl -k ' + '-X ' + method + ' ' +
        authParam + data + contentType + extraParams + ' ' + url);
    },

    /**
     * Creates a request param object for a read operation.
     * * @param path Relative path of API call after the account ID.
     */
    getRequestParamsRead = function(path) {
      var params = {
        url: url + path,
        strictSSL: false,
        headers: {}
      };
      // Loop over custom headers adding them to params.headers
      for (customHeader in customHeaders)
      {
        params.headers[customHeader] = customHeaders[customHeader];
      }
      if (accessToken) {
        params.headers.Authorization = 'Bearer ' + accessToken;
      }
      return params;
    },

    /**
     * Creates a request param object for a write operation.  This injects a content type header as
     * well as body data if provided.
     * @param path Relative path of API call after the account ID.
     * @param data (optional) Body to be passed in the call.
     */
    getRequestParamsWrite = function(path, data) {
      var params = getRequestParamsRead(path);
      params.headers['content-type'] = 'application/json';
      if (data) {
        params.body = data;
      }
      return params;
    };

  return {
    /**
     * Add any additional headers
     * @param key
     * @param value
     */
    addCustomHeader: function (key, value) {
      customHeaders[key] = value;
    },

    players: {
      /**
       * Gets a list of all players in the account.
       * @param callback
       */
      list: function(callback) {
        var requestParams = getRequestParamsRead('/players');

        logCurlRequest('GET', requestParams.headers, requestParams.url);
        console.time('List Response Time');

        request.get(requestParams,
          function (error, response) {
            console.timeEnd('List Response Time');
            callback(error, response);
          }
        );
      }
    },

    player: {
      /**
       * Creates a player based on the JSON provided.
       * @param json
       * @param callback
       */
      create: function(json, callback) {
        var requestParams = getRequestParamsWrite('/players', json);

        logCurlRequest('POST', json, requestParams.url);
        console.time('Player Creation Response Time');

        request.post(requestParams,
          function (error, response) {
            console.timeEnd('Player Creation Response Time');
            callback(error, response);
          }
        );
      },

      /**
       * Deletes the specified player.
       * @param playerId
       * @param callback
       */
      delete: function(playerId, callback) {
        console.log('Deleting player ' + playerId);
        console.time('Delete player time');
        // Parameters to send to the http server
        var requestParams = getRequestParamsWrite('/players/' + playerId);

        request.del(requestParams,
          function (error, response) {
            console.timeEnd('Delete player time');
            callback(error, response);
          }
        );
      },

      /**
       * Gets the specified player.
       * @param playerId
       * @param callback
       */
      get: function(playerId, callback) {
        var requestParams = getRequestParamsRead('/players/' + playerId);

        logCurlRequest('GET', requestParams.headers, requestParams.url);
        console.time('Get Player Response Time');

        request.get(requestParams,
          function (error, response) {
            console.timeEnd('Get Player Response Time');
            callback(error, response);
          }
        );
      },

      /**
       * Patches a player with the JSON provided.
       * @param playerId
       * @param json
       * @param callback
       */
      patch: function(playerId, json, callback) {
        var requestParams = getRequestParamsWrite('/players/'  + playerId, json);

        logCurlRequest('PATCH', json, requestParams.url);
        console.time('Patch Player Response Time');

        request.patch(requestParams,
          function(error, response) {
            console.timeEnd('Patch Player Response Time');
            callback(error, response);
          }
        );
      },

      /**
       * Publishes the specified player.
       * @param playerId
       * @param json
       * @param callback
       */
      publish: function(playerId, json, callback) {
        var requestParams = getRequestParamsWrite('/players/' + playerId + '/publish', json);

        logCurlRequest('POST', json, requestParams.url);
        console.time('Publish Response Time');

        request.post(requestParams,
          function (error, response) {
            console.time('Publish Response Time');
            callback(error, response);
          }
        );
      },

      config: {
        /**
         * Gets the configuration for the player and branch specified.
         * @param playerId
         * @param branch One of master or preview.
         * @param callback
         */
        get: function(playerId, branch, callback) {
          var requestParams = getRequestParamsRead('/players/' + playerId +
              '/configuration/' + (branch || ''));

          logCurlRequest('GET', requestParams.headers, requestParams.url);
          console.time('getPlayerConfig Response Time');

          request.get(requestParams, function(error, response) {
            console.timeEnd('getPlayerConfig Response Time');
            callback(error, response);
          });
        },

        /**
         * Replaces the player's configuration with the one that is provided.
         * @param playerId
         * @param json
         * @param callback
         */
        put: function(playerId, json, callback) {
          var requestParams = getRequestParamsWrite('/players/' + playerId + '/configuration', json);

          logCurlRequest('PUT', json, requestParams.url);
          console.time('Put Player Config Response Time');

          request.put(requestParams,
            function (error, response) {
              console.timeEnd('Put Player Config Response Time');
              callback(error, response);
            }
          );
        },

        /**
         * Merges the data in the provided JSON with the player's existing configuration.
         * @param playerId
         * @param json
         * @param callback
         */
        patch: function(playerId, json, callback) {
          var requestParams = getRequestParamsWrite('/players/'  + playerId + '/configuration',json);

          logCurlRequest('PATCH', json, requestParams.url);
          console.time('Patch Player Config Response Time');

          request.patch(requestParams,
            function(error, response) {
              console.timeEnd('Patch Player Config Response Time');
              callback(error, response);
            }
          );
        }
      }
    },

    embeds: {
      /**
       * Gets a list of embeds that belong to the specified player.
       * @param playerId
       * @param callback
       */
      list: function(playerId, callback) {
        var requestParams = getRequestParamsRead('/players/' + playerId + '/embeds');
        logCurlRequest('GET', requestParams.headers, requestParams.url);
        console.time('Embed List Response Time');

        request.get(requestParams,
          function (error, response) {
            console.timeEnd('Embed List Response Time');
            callback(error, response);
          }
        );
      }
    },

    embed: {
      /**
       * Creates an embed for the player specified with the provided JSON.
       * @param playerId
       * @param json
       * @param callback
       */
      create: function(playerId, json, callback) {
        var requestParams = getRequestParamsWrite('/players/'  + playerId + '/embeds', json);

        logCurlRequest('POST', json, requestParams.url);
        console.time('createEmbed Response Time');

        request.post(requestParams,
          function(error, response) {
            console.timeEnd('createEmbed Response Time');
            callback(error, response);
          }
        );
      },

      /**
       * Deletes the specified embed from the specified player
       */
      delete: function(playerId, embedId, callback) {
        var requestParams = getRequestParamsWrite('/players/' + playerId + '/embeds/' + embedId, null);

        logCurlRequest('DELETE', null, requestParams.url);
        console.time('deleteEmbed Response Time');

        // Delete the player from the request parameters on the server
        request.del(requestParams,
          function(error, response) {
            console.timeEnd('deleteEmbed Response Time');
            callback(error, response);
          }
        );
      },

      /**
       * Gets the specified embed.
       * @param playerId
       * @param embedId
       * @param callback
       */
      get: function(playerId, embedId, callback) {
        var requestParams = getRequestParamsRead('/players/'  + playerId + '/embeds/' + embedId);

        logCurlRequest('GET', null, requestParams.url);
        console.time('getEmbed Response Time');

        request.get(requestParams,
          function(error, response) {
            console.timeEnd('getEmbed Response Time');
            callback(error, response);
          }
        );
      },

      /**
       * Publishes a single embed.
       * @param playerId
       * @param embedId
       * @param json
       * @param callback
       */
      publish: function(playerId, embedId, json, callback) {
        var requestParams = getRequestParamsWrite('/players/' + playerId + '/embeds/' + embedId + '/publish', json);

        logCurlRequest('POST', json, requestParams.url);
        console.time('Publish Response Time');

        request.post(requestParams,
          function (error, response) {
            console.time('Publish Response Time');
            callback(error, response);
          }
        );
      },

      config: {
        /**
         * Gets the config for the specified player / embed / branch combination.
         * @param playerId
         * @param embedId
         * @param branch
         * @param callback
         */
        get: function(playerId, embedId, branch, callback) {
          var path = '/players/' + playerId + '/embeds/' + embedId + '/configuration' +
              (branch? '/' + branch : ''),
            requestParams = getRequestParamsRead(path);

          logCurlRequest('GET', null, requestParams.url);
          console.time('getEmbedConfig Response Time');

          request.get(requestParams,
            function (error, response) {
              console.timeEnd('getEmbedConfig Response Time');
              callback(error, response);
            }
          );
        },

        /**
         * Gets the merged config result of the player/branch and embed/branch combination requested.
         * @param playerId
         * @param playerBranch
         * @param embedId
         * @param embedBranch
         * @param callback
         */
        getMerged: function(playerId, playerBranch, embedId, embedBranch, callback) {
          var path = '/players/' + playerId + '/embeds/' + embedId + '/configuration/merged?' +
              'playerBranch=' + playerBranch + '&embedBranch=' + embedBranch,
            requestParams = getRequestParamsRead(path);

          logCurlRequest('GET', null, requestParams.url);
          console.time('getEmbedConfig Response Time');

          request.get(requestParams,
            function (error, response) {
              console.timeEnd('getEmbedConfig Response Time');
              callback(error, response);
            }
          );
        },

        /**
         * Replaces the embed's configuration with the one that is provided.
         * @param playerId
         * @param embedId
         * @param json
         * @param callback
         */
        put: function(playerId, embedId, json, callback) {
          var requestParams = getRequestParamsWrite(
              '/players/' + playerId + '/embeds/' + embedId + '/configuration',
              json);
          console.log('update config for embed: ' + embedId);

          logCurlRequest('PUT', json, requestParams.url);
          console.time('updateEmbed Response Time');

          request.put(requestParams,
            function (error, response) {
              console.timeEnd('updateEmbed Response Time');
              callback(error, response);
            }
          );
        },

        /**
         * Merges the data in the provided JSON with the embed's existing configuration.
         * @param playerId
         * @param embedId
         * @param json
         * @param callback
         */
        patch: function(playerId, embedId, json, callback) {
          var requestParams = getRequestParamsWrite(
              '/players/'  + playerId + '/embeds/' + embedId + '/configuration',
              json);

          logCurlRequest('PATCH', json, requestParams.url);
          console.time('Patch Embed Config Response Time');

          request.patch(requestParams,
            function(error, response) {
              console.timeEnd('Patch Embed Config Response Time');
              callback(error, response);
            }
          );
        }
      }
    }
  };
};