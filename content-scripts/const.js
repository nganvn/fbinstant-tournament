const myLink = window.location.href;

const TOKEN = ''

const URL = 'leaderboards'

const DEFAULT_HOST = 'https://fbig-leaderboards.citigo.site'

const DEFAULT_LEADERBOARD = {
    description: 'Sample',
    appId: 'unknown',  
    name: "Sample", // title

    resetScore: 0,
    numberOfLeaders: 15,
    timezone: 'utc+0',
    sortOrder: 'desc',
    statistics: 'max',
    resettable: 'manually',
    createdBy: 'bot',
    type: 'world_tournament_leaderboard',
    expireTime: 7 * 24 * 60 * 60,
}

const CommandType = {
  ADD_PENDING_LEADERBOARD: 'ADD_PENDING_LEADERBOARD',
  CREATE_LEADERBOARD: 'CREATE_LEADERBOARD',
  ADD_PENDING_TOURNAMENT: 'ADD_PENDING_TOURNAMENT',
  TRAFFIC: 'TRAFFIC',
}

const DataKey = {
    PENDING_TOURNAMENT: `pending-tournament`,
    PENDING_LEADERBOARD: `pending-leaderboard`,
    HOST: 'host',
    USE_LEADERBOARD: 'use-leaderboard',
    HISTORY: 'history'
}

const POPUP_HTML = `
<div>
  <div class="hugeDiv">
    <div style="display: grid;">
        <div>
            <label for="pages">Page to host:</label>
            <select name="pages" id="page-dropdown">
            </select>
        </div>

        <div>
            <label>Host: </label>
            <input type="string" id="host" value="">
        </div>
        
        <div>
            <label>Use Leaderboard</label>
            <input type="checkbox" id="use-leaderboard" value="Bike">
        </div>

        <label>Tournament</label>
        <br>
        <textarea id="content-input" class="textareaStyle"></textarea>

    </div>

    <div class="buttonContainer">
      <button id="fill-button" class="buttonStyle">Preview</button>
      <button id="create-button" class="buttonStyle">Create</button>
    </div>
  </div>

</div>
`

