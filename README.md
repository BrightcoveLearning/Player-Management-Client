Player Management Client
========================

This module can be used to access the Brightcove Player Management API.  Documentation for the 
underlying API can be found [here](http://docs.brightcove.com/en/video-cloud/player-management/index.html).


### Getting Started

Look at examples/list.js as an example of how to use this module.  Two thing to note:

  1. This line should refer to the official module rather than the local lib.  Change:
    
    
     ```
     playerManagementAPI = require('../lib/playerManagementAPI.js')(apiOptions);
     ```
     
     to 
     
     ```
     playerManagementAPI = require('bc-player-management-client')(apiOptions);
     ```
  2. accessToken.  This is a short-lived token created by the OAuth API.  For more information go 
     [here](http://docs.brightcove.com/en/video-cloud/oauth-api/index.html)
     
### License

Copyright 2015 Brightcove Learning Services

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this software except in compliance with the License. You may obtain a copy of the License at

	http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.