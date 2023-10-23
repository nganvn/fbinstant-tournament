function setData(sKey, sValue) {
  if (typeof sValue === 'string') {
    localStorage.setItem('tournament' + sKey + Config.AppId, sValue);

    return
  }

  const str = JSON.stringify(sValue);
  localStorage.setItem('tournament' + sKey + Config.AppId, str);
}

function getData(sKey) {
  let data = localStorage.getItem('tournament' + sKey + Config.AppId);

  try {
    return JSON.parse(data);
  } catch {
    return data
  }
}

const generateObjectId = (radix = 16) => {
  const s = (i) => Math.floor(i).toString(radix)

  const time = s(Date.now() / 1000)
  return time + ' '.repeat(radix).replace(/./g, () => s(Math.random() * radix))
}

const sleepAsync = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

const currentTournament = {
  title: '',
  description: ''
}

function extractTournament() {      
  const content = $("#content-input").val()

  const contentArr = content.split('\t')

  const tournament = {
    title: contentArr[0],
    description: contentArr[1]
  }

  fillOnFacebookTournament(tournament)

  return tournament
}

function fillOnFacebookTournament(tournament) {
  const { title, description } = tournament

  const textareas = document.getElementsByTagName('textarea')

  textareas[0].textContent = description // tournament description
  textareas[1].textContent = title // tournament title
}

function createTournament() {
  const { title, description } = extractTournament()

  if (!title || !description) {
    alert('Title, description cannot be empty')
    return
  }

  if (Config.UseLeaderboard) {
    const textareas = document.getElementsByTagName('textarea')
    leaderboardId = generateObjectId()
    textareas[2].textContent = `{"leaderboardId":"${leaderboardId}"}` // tournament payload

    const pendingTournament = {
      leaderboardId,
      title,
      host: Config.Host,
      appId: Config.AppId
    }

    setData(DataKey.PENDING_TOURNAMENT, pendingTournament)

    addHistory({
      type: CommandType.ADD_PENDING_TOURNAMENT,
      pendingTournament
    })
  } else {
    setData(DataKey.PENDING_TOURNAMENT, null)
  }

  const createButton = [...document.getElementsByTagName('button')].find(n=>n.innerText === 'Create')
  createButton.click()
}

async function requestCreateLeaderboardAsync(pendingLeaderboard) {
  const {
    leaderboardId,
    title,
    host,
    appId,
    description
  } = pendingLeaderboard

  const newTournament = {...DEFAULT_LEADERBOARD, _id: leaderboardId, appId, name: title, description, description}
  
  addHistory({
    type: CommandType.CREATE_LEADERBOARD,
    newTournament
  })

  const result = await post(URL, newTournament, {}, host)
  console.log(result?.data)
}

function getNewestTournament() {
  const tournamentElement = document.getElementsByTagName('table')[0].getElementsByTagName('tr')[1]

  if (!tournamentElement) return null
  
  const tournament = tournamentElement.innerText.split('\t')
  
  return {
    context: tournament[1], 
    tournamentId: tournament[2]
  }
}

async function tryCheckPendingTournament() {
  const pendingTournament = getData(DataKey.PENDING_TOURNAMENT)

  setData(DataKey.PENDING_TOURNAMENT, null)

  const tournament = getNewestTournament()

  if (tournament && pendingTournament) {
    const { context, tournamentId } = tournament

    const description = `{\"contextID\":\"${context}\",\"tournamentID\":\"${tournamentId}\"}`
    
    const pendingLeaderboard = {
      ...pendingTournament,
      description
    }
    setData(DataKey.PENDING_LEADERBOARD, pendingLeaderboard)

    addHistory({
      type: CommandType.ADD_PENDING_LEADERBOARD,
      pendingLeaderboard
    })
  }
}

function tryCheckPendingLeaderboard() {
  const pendingLeaderboard = getData(DataKey.PENDING_LEADERBOARD)


  if (pendingLeaderboard) {
    const {
      leaderboardId,
      description
    } = pendingLeaderboard
    
    const message = `Create leaderboard\n` +
    '{\n' +
    `LeaderboardID: ${leaderboardId}\n` +
    description +
    '\n}'

    const shouldCreate = true || confirm(message)

    if (shouldCreate) {
      requestCreateLeaderboardAsync(pendingLeaderboard)

      setData(DataKey.PENDING_LEADERBOARD, null)
      
    }
  }
}

async function scanAllPages() {  
  document.getElementsByClassName('_aoxu')[1].getElementsByTagName('a')[0].click()
  
  await sleepAsync(10)
 
  const pages = document.getElementsByClassName('_54nf')[0].getElementsByClassName('fwb')

  const pageTexts = [...pages].map(n=>n.innerText)

  const length = pageTexts.length

  const pageKeys = pageTexts.map(pageName => pageName.replaceAll(' ',''))
  const drowdown = document.getElementById('page-dropdown')
  
  for (let i = 0; i<length; i++) {
    
    var newOption = document.createElement('option');
    
    newOption.text = pageTexts[i];
    newOption.value = pageKeys[i];
    drowdown.add(newOption, null)
    
  }
  
  const savedKey = getData('pageKey')
  const pageIndex = pageKeys.indexOf(savedKey)

  console.log({
    savedKey, pageKeys
  })

  if (pageIndex >= 0) {
      pages[pageIndex].click()
      drowdown.value = savedKey
  } else {
    document.getElementsByClassName('_aoxu')[1].getElementsByTagName('a')[0].click()
  }

  drowdown.addEventListener('change', async (env, value) => {
    const pageIndex = pageKeys.indexOf(drowdown.value)

    document.getElementsByClassName('_aoxu')[1].getElementsByTagName('a')[0].click()
    await sleepAsync(10)
    pages[pageIndex].click()

    setData('pageKey', drowdown.value)
  })
}

function showConfig() {
  document.getElementById('host').value = Config.Host

  document.getElementById('use-leaderboard').checked = Config.UseLeaderboard
}

function initPopup() {
  const divJQuery = $(POPUP_HTML);
  divJQuery.attr("style", "position: fixed; right: 0px; bottom: 0px; z-index: 10000;");

  divJQuery.find("#create-button").click(createTournament)
  
  divJQuery.find("#fill-button").click(extractTournament)
  divJQuery.find("#host").on('change', function() {
    Config.Host = this.value

    setData(DataKey.HOST, Config.Host)
  })

  
  divJQuery.find("#use-leaderboard").on('change', function() {
    Config.UseLeaderboard = this.checked

    setData(DataKey.USE_LEADERBOARD, Config.UseLeaderboard)
  })

  $('body').append(divJQuery);
}

function initConfig() {
  Config.AppId = document.getElementsByClassName('_2lj1')[0].innerText || ''

  Config.Host = getData(DataKey.HOST) || ''
  Config.UseLeaderboard = getData(DataKey.USE_LEADERBOARD) || false
}

function addHistory(command) {
  let history = getData(DataKey.HISTORY) || []

  if (!Array.isArray(history)) {
    history = []
  }

  history.push(command)
  
  console.log(history)

  setData(DataKey.HISTORY, history)
}