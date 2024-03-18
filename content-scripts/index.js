
const Config = {
  Host: '',
  UseLeaderboard: false,
  AppId: '',
}

// host = 'https://leaderboards-dev.sunstudio.io'
// const host = 'https://fbig-leaderboards.citigo.site'
// const host = 'https://fbig-leaderboards.citigo.site'

async function main() {
  await sleepAsync(500)

  initConfig()
  
  console.log(Config)

  addHistory({
    type: CommandType.TRAFFIC,
  })

  addCss()
  initPopup()

  scanAllPages()
  showConfig()

  tryCheckPendingTournament()
  tryCheckPendingLeaderboard()

  start()
}

if (myLink.includes('instant-games/instant_tournament')) {
  main()
} 

