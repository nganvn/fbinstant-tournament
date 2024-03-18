const State = {
    PREPARE: 'PREPARE',
    RUNNING: 'RUNNING',
    STOPPED: 'STOPPED',
}

async function updateInfo() {
    const rawTournaments = getData(DataKey.TOURNAMENT_QUEUE)

    const tournaments = await processTournaments(rawTournaments)
    const total = tournaments.length
    const totalEmptyExtraData = tournaments.filter(
        (n) => Object.keys(n.extraData).length === 0
    ).length
    const totalCreated = getData(DataKey.TOTAL_CREATED) || 0

    document.getElementById('info').innerText =
        `Total: ${total}, Images: ${tournaments.filter((n) => n.base64).length}, EmptyExtraData: ${totalEmptyExtraData} Created: ${totalCreated}`
}

async function setTournaments() {
    const tournaments = extractTournaments()

    if (tournaments.length === 0) {
        alert('No tournament')
    } else {
        setData(DataKey.TOURNAMENT_QUEUE, tournaments)
        setData(DataKey.TOTAL_CREATED, 0)
        updateInfo()
    }
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
        default:
            const tournaments = getData(DataKey.TOURNAMENT_QUEUE)
            if (tournaments.length === 0) {
                alert('No tournament to run')
                return
            }

            setState(State.PREPARE)
            setData(DataKey.RUNNING, true)
    }
}

function onClickClear() {
    setData(DataKey.RUNNING, false)
    setData(DataKey.TOURNAMENT_QUEUE, [])
    setData(DataKey.TOTAL_CREATED, 0)

    updateInfo()

    setState(State.STOPPED)
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

    const tournament = tournaments[0]
    fillOnFacebookTournament(tournament)

    setState(State.RUNNING)
}

async function createTournamentAsync() {
    await waiting('Creating', 3)

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
