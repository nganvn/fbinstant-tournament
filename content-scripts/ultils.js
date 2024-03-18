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
        const { banner, title, description, extraData } = tournament
        const url = chrome.runtime.getURL(`banners/${Config.AppId}/${banner}`)
        const base64 = await urlToBase64(url)

        correctTournaments.push({
            base64: base64,
            title,
            description,
            extraData,
        })
    }

    return correctTournaments
}

function extractTournaments() {
    const content = $('#content-input').val()

    if (content.length === 0) return []

    const tournaments = content
        .split('\t\n')
        .map((n) => {
            const contentArr = n.split('\t')

            if (contentArr.length < 4) return null

            let extraData = {}

            try {
                extraData = JSON.parse(contentArr[3])
            } catch {
                extraData = {}
            }

            return {
                banner: contentArr[0],
                title: contentArr[1],
                description: contentArr[2],
                extraData,
            }
        })
        .filter((n) => n)

    return tournaments
}

async function fillOnFacebookTournament(tournament) {
    const { banner, title, description, extraData } = tournament

    if (!title || !description) {
        alert('Title, description cannot be empty')
        return
    }

    const textareas = document.getElementsByTagName('textarea')

    textareas[0].textContent = description // tournament description
    textareas[0].value = description // tournament description
    textareas[1].textContent = title // tournament title
    textareas[1].value = title // tournament title

    const url = chrome.runtime.getURL(`banners/${Config.AppId}/${banner}`)
    const base64 = await urlToBase64(url)

    if (base64.length) {
        document.querySelector('#base64Image').value = base64
    }

    if (Config.UseLeaderboard) {
        leaderboardId = generateObjectId()
        // tournament payload
        const payload = JSON.stringify({
            leaderboardId,
            gameType: extraData.gameType,
            options: extraData.options,
        })

        textareas[2].textContent = payload
        textareas[2].value = payload

        const pendingTournament = {
            leaderboardId,
            title,
            host: Config.Host,
            appId: Config.AppId,
        }

        setData(DataKey.PENDING_TOURNAMENT, pendingTournament)

        addHistory({
            type: CommandType.ADD_PENDING_TOURNAMENT,
            pendingTournament,
        })
    } else {
        setData(DataKey.PENDING_TOURNAMENT, null)
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
        description,
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

        let extraData = getData(DataKey.LEADERBOARD_EXTRA_DATA)

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

async function scanAllPages() {
    document.getElementsByClassName('_aoxu')[1].getElementsByTagName('a')[0].click()

    await sleepAsync(10)

    const pages = document.getElementsByClassName('_54nf')[0].getElementsByClassName('fwb')

    const pageTexts = [...pages].map((n) => n.innerText)

    const length = pageTexts.length

    const pageKeys = pageTexts.map((pageName) => pageName.replaceAll(' ', ''))
    const drowdown = document.getElementById('page-dropdown')

    for (let i = 0; i < length; i++) {
        var newOption = document.createElement('option')

        newOption.text = pageTexts[i]
        newOption.value = pageKeys[i]
        drowdown.add(newOption, null)
    }

    const savedKey = getData('pageKey')
    const pageIndex = pageKeys.indexOf(savedKey)

    console.log({
        savedKey,
        pageKeys,
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
    document.getElementById('use-leaderboard').checked = Config.UseLeaderboard
}

function initPopup() {
    const divJQuery = $(POPUP_HTML)
    divJQuery.attr('style', 'position: fixed; right: 0px; bottom: 0px; z-index: 10000;')

    divJQuery.find('#button-set').click(setTournaments)
    divJQuery.find('#button-run').click(onClickRun)
    divJQuery.find('#button-clear').click(onClickClear)

    divJQuery.find('#use-leaderboard').on('change', function () {
        Config.UseLeaderboard = this.checked

        setData(DataKey.USE_LEADERBOARD, Config.UseLeaderboard)
    })

    divJQuery.find('#content-input').on('change keyup paste', function () {
        const tournaments = extractTournaments()

        document.getElementById('total-tournaments').innerText =
            `Tournaments: ${tournaments.length}`
    })

    const dropdown = divJQuery.find('#leaderboard-api-dropdown')

    for (let leaderboardApi of HOSTS) {
        var newOption = document.createElement('option')

        newOption.text = leaderboardApi
        newOption.value = leaderboardApi
        dropdown.append(newOption, null)
    }

    dropdown.val(Config.Host).change()

    dropdown.on('change', function () {
        Config.Host = this.value

        setData(DataKey.HOST, Config.Host)
    })

    $('body').append(divJQuery)
}

function initConfig() {
    Config.AppId = document.getElementsByClassName('_2lj1')[0].innerText || ''

    Config.Host = getData(DataKey.HOST) || DEFAULT_HOST
    Config.UseLeaderboard = getData(DataKey.USE_LEADERBOARD) || true
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
