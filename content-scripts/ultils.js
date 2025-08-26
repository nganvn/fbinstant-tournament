
function setData(sKey, sValue) {
    if (typeof sValue === 'string') {
        localStorage.setItem('tournament' + sKey + Config.AppId, sValue)

        return
    }

    const str = JSON.stringify(sValue)
    localStorage.setItem('tournament' + sKey + Config.AppId, str)
}

function getData(sKey) {
    let data = localStorage.getItem('tournament' + sKey + Config.AppId)

    try {
        return JSON.parse(data)
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
    description: '',
}

async function processTournaments(tournaments) {
    const correctTournaments = []
    for (tournament of tournaments) {
        const { bannerUrl, title, description, extraData } = tournament
        const url = bannerUrl ? chrome.runtime.getURL(`banners/${Config.AppId}/${bannerUrl}`) : ''
        const base64 = url ? await urlToBase64(url) : ''

        correctTournaments.push({
            base64: base64,
            title,
            description,
            extraData,
        })
    }

    return correctTournaments
}

async function fillOnFacebookTournament(tournament) {
    const { base64, title, description, extraData } = tournament

    if (!title || !description) {
        alert('Title, description cannot be empty')
        return
    }

    const textareas = document.getElementsByTagName('textarea')

    textareas[0].textContent = description // tournament description
    textareas[0].value = description // tournament description
    textareas[1].textContent = title // tournament title
    textareas[1].value = title // tournament title


    if (base64.length) {
        document.querySelector('#base64Image').value = base64
    }

    if (Config.UseLeaderboard) {
        leaderboardId = generateObjectId()
        // tournament payload
        const payload = JSON.stringify({
            leaderboardId,
            ...extraData,
        })

        textareas[2].textContent = payload
        textareas[2].value = payload

        const pendingTournament = {
            leaderboardId,
            title,
            host: Config.Host,
            appId: Config.AppId,
            extraData,
        }
        setData(DataKey.PREFILL_PENDING_TOURNAMENT, pendingTournament)
    } else {
        setData(DataKey.PREFILL_PENDING_TOURNAMENT, null)
    }
}

async function requestCreateLeaderboardAsync(pendingLeaderboard) {
    const { leaderboardId, title, host, appId, description } = pendingLeaderboard

    const newTournament = {
        ...DEFAULT_LEADERBOARD,
        _id: leaderboardId,
        appId,
        name: title,
        description,
        expireTime: Config.ExpireTime || DEFAULT_LEADERBOARD.expireTime,
    }

    addHistory({
        type: CommandType.CREATE_LEADERBOARD,
        newTournament,
    })

    const result = await post(URL, newTournament, {}, host)
    console.log(result?.data)
}

function getNewestTournament() {
    const tournamentElement = document
        .getElementsByTagName('table')[0]
        .getElementsByTagName('tr')[1]

    if (!tournamentElement) return null

    const tournament = tournamentElement.innerText.split('\t')

    return {
        context: tournament[1],
        tournamentId: tournament[2],
    }
}

function tryCheckPendingTournament() {
    const pendingTournament = getData(DataKey.PENDING_TOURNAMENT)

    setData(DataKey.PENDING_TOURNAMENT, null)

    const tournament = getNewestTournament()

    if (tournament && pendingTournament) {
        const { context, tournamentId } = tournament

        let extraData = pendingTournament.extraData

        const leaderboardData = {
            contextID: context,
            tournamentID: tournamentId,
            ...extraData,
        }

        const description = JSON.stringify(leaderboardData)

        const pendingLeaderboard = {
            ...pendingTournament,
            description,
        }
        setData(DataKey.PENDING_LEADERBOARD, pendingLeaderboard)

        addHistory({
            type: CommandType.ADD_PENDING_LEADERBOARD,
            pendingLeaderboard,
        })
    }
}

function tryCheckPendingLeaderboard() {
    const pendingLeaderboard = getData(DataKey.PENDING_LEADERBOARD)

    if (pendingLeaderboard) {
        const { leaderboardId, description } = pendingLeaderboard

        const message =
            `Create leaderboard\n` +
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

function initPopup() {
    const divJQuery = $(POPUP_HTML)
    divJQuery.attr('style', 'position: fixed; right: 0px; bottom: 0px; z-index: 10000;')

    divJQuery.find('#button-run').click(onClickRun)
    divJQuery.find('#button-clear').click(onClickClear)
    divJQuery.find('#button-set').click(onClickSet)


    $('body').append(divJQuery)
}

function addHistory(command) {
    let history = getData(DataKey.HISTORY) || []

    if (!Array.isArray(history)) {
        history = []
    }

    history.push(command)

    setData(DataKey.HISTORY, history)
}

async function getBase64(file) {
    return new Promise((resolve, reject) => {
        var reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = function () {
            resolve(reader.result)
        }
        reader.onerror = function (error) {
            reject('')
        }
    })
}

function urlToBase64(url) {
    return new Promise((r) => {
        var xhr = new XMLHttpRequest()
        xhr.onload = function () {
            var reader = new FileReader()
            reader.onloadend = function () {
                r(reader.result)
            }
            reader.readAsDataURL(xhr.response)
        }
        xhr.onerror = function () {
            r('')
        }
        xhr.open('GET', url)
        xhr.responseType = 'blob'
        xhr.send()
    })
}

function getWeekIndex(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return weekNo;
}


function extractAppIdFromUrl(url) {
  const match = url.match(/\/apps\/(\d+)\//);
  return match ? match[1] : null;
}