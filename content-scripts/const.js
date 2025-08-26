const myLink = window.location.href

const TOKEN = ''

const URL = 'leaderboards'

const DEFAULT_HOST = 'https://fbig-leaderboards.citigo.site'

const HOSTS = ['https://fbig-leaderboards.citigo.site', 'https://leaderboards-dev.sunstudio.io', 'https://igs-leaderboard.suncs.app']

const DEFAULT_LEADERBOARD = {
    description: 'Sample',
    appId: 'unknown',
    name: 'Sample', // title

    resetScore: 0,
    numberOfLeaders: 15,
    timezone: 'utc+0',
    sortOrder: 'desc',
    statistics: 'max',
    resettable: 'manually',
    createdBy: 'bot',
    type: 'world_tournament_leaderboard',
    expireTime: 21 * 24 * 60 * 60,
}

const CommandType = {
    ADD_PENDING_LEADERBOARD: 'ADD_PENDING_LEADERBOARD',
    CREATE_LEADERBOARD: 'CREATE_LEADERBOARD',
    ADD_PENDING_TOURNAMENT: 'ADD_PENDING_TOURNAMENT',
    TRAFFIC: 'TRAFFIC',
}

const DataKey = {
    PREFILL_PENDING_TOURNAMENT: `prefill-pending-tournament`,
    PENDING_TOURNAMENT: `pending-tournament`,
    PENDING_LEADERBOARD: `pending-leaderboard`,
    HOST: 'host',
    USE_LEADERBOARD: 'use-leaderboard',
    HISTORY: 'history',
    IMAGES: 'images',
    TOURNAMENT_QUEUE: 'tournament-queue',
    TOTAL_CREATED: 'total-created',
    STATE: 'state',
    RUNNING: 'running',
}

const POPUP_HTML = `
<div>
  <div class="hugeDiv">
    <div style="display: grid;">
      <pre id="app-info"></pre>
    </div>
  
    
    <div class="">
      <label id='info'>Total: 0\nImages: 0\nCreated: 0</label>
    </div>
      
    <div class="buttonContainer">
      <button id="button-clear" class="buttonStyle">Clear</button>
      <button id="button-set" class="buttonStyle">Set</button>
    </div>
    
    <div class="buttonContainer">
      <button id="button-run" class="buttonStyle">Run</button>
    </div>

  </div>

</div>
`
