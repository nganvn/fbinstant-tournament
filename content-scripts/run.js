const State = {
    PREPARE: 'PREPARE',
    RUNNING: 'RUNNING',
    STOPPED: 'STOPPED',
}

async function updateInfo() {
    const rawTournaments = getData(DataKey.TOURNAMENT_QUEUE) || []

    const tournaments = await processTournaments(rawTournaments)
    const total = tournaments.length
    const totalCreated = getData(DataKey.TOTAL_CREATED) || 0

    document.getElementById('info').innerText =
        `Total: ${total}, Images: ${tournaments.filter((n) => n.base64).length}, Created: ${totalCreated}`
}

function onClickRun() {
    switch (getData(DataKey.STATE)) {
        case State.PREPARE:
            setState(State.STOPPED)

            return
        case State.RUNNING:
            setState(State.STOPPED)
            return
        case State.STOPPED:
            setState(State.PREPARE)
            setData(DataKey.RUNNING, true)
        default:
    }
}

function onClickClear() {
    setData(DataKey.RUNNING, false)
    setData(DataKey.TOURNAMENT_QUEUE, [])
    setData(DataKey.TOTAL_CREATED, 0)

    updateInfo()

    setState(State.STOPPED)
}

function onClickSet() {
    const totalWeeks = Math.floor(Config.Tournaments.length / Config.TournamentsPerWeek)

    const weekIndex = getWeekIndex(new Date()) % totalWeeks * Config.TournamentsPerWeek

    const tournaments = Config.Tournaments.slice(weekIndex, weekIndex + Config.TournamentsPerWeek)
    if (tournaments.length === 0) {
        alert('No tournament to run')
        return
    }

    setData(DataKey.TOURNAMENT_QUEUE, tournaments)
    updateInfo()
}

async function start() {
    const running = getData(DataKey.RUNNING)
    if (running) {
        setState(State.PREPARE)
    } else {
        setState(State.STOPPED)
    }

    updateInfo()
}

function setState(state) {
    setData(DataKey.STATE, state)
    processState()
}

function processState() {
    const state = getData(DataKey.STATE)

    switch (state) {
        case 'PREPARE':
            prepareCreateTournament()
            break
        case 'RUNNING':
            createTournamentAsync()
            break
        case 'STOPPED':
            document.getElementById('button-run').innerText = `Run`
            setData(DataKey.RUNNING, false)
            setData(DataKey.PENDING_TOURNAMENT, null)
            break
    }
}

async function prepareCreateTournament() {
    const tournaments = getData(DataKey.TOURNAMENT_QUEUE)

    if (tournaments.length === 0) {
        setState(State.STOPPED)
        return
    }

    const tournament = (await processTournaments(tournaments))[0]
    fillOnFacebookTournament(tournament)
    await correctTournamentPage()

    setState(State.RUNNING)
}

async function correctTournamentPage() {
    const pageElement = document.getElementsByClassName('_aoxu')[1].getElementsByTagName('a')[0]
    
    if (pageElement.innerText !== Config.PageName) {
        pageElement.click()
        await sleepAsync(10)

        const pages = document.getElementsByClassName('_54nf')[0].getElementsByClassName('fwb')

        const pageToClick = [...pages].find((n) => n.innerText === Config.PageName)
        if (!pageToClick) {
            throw new Error(`Cannot find page ${Config.PageName}`)
        }
        pageToClick.click()
        await sleepAsync(10)
    }
}

async function createTournamentAsync() {
    await waiting('Creating', 5)

    const pendingTournament = getData(DataKey.PREFILL_PENDING_TOURNAMENT)

    setData(DataKey.PENDING_TOURNAMENT, pendingTournament)
    setData(DataKey.PREFILL_PENDING_TOURNAMENT, null)

    addHistory({
        type: CommandType.ADD_PENDING_TOURNAMENT,
        pendingTournament,
    })

    if (getData(DataKey.STATE) === State.STOPPED) {
        return
    }

    document.getElementById('button-run').innerText = `Do not close! 🚑🦽`

    const tournaments = getData(DataKey.TOURNAMENT_QUEUE)
    tournaments.shift()
    setData(DataKey.TOURNAMENT_QUEUE, tournaments)

    const createButton = [...document.getElementsByTagName('button')].find(
        (n) => n.innerText === 'Create'
    )
    createButton.click()

    const totalCreated = getData(DataKey.TOTAL_CREATED) || 0
    setData(DataKey.TOTAL_CREATED, totalCreated + 1)
}

async function waiting(text, seconds) {
    document.getElementById('button-run').innerText = `${text} (${seconds}s)`

    for (let i = seconds - 1; i >= 0; i--) {
        if (getData(DataKey.STATE) === State.STOPPED) {
            return
        }

        await sleepAsync(1000)

        if (getData(DataKey.STATE) === State.STOPPED) {
            return
        }

        document.getElementById('button-run').innerText = `${text} (${i}s)`
    }
}
