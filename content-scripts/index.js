let Config = null

const AppID = extractAppIdFromUrl(window.location.href)

async function main() {
    Config = Configs.find(predicate => predicate.AppId === AppID)

    addCss()
    initPopup()
    

    const appInfoPre = document.getElementById('app-info');
    if (appInfoPre && Config) {
        const displayConfig = { ...Config };
        displayConfig.Tournaments = displayConfig.Tournaments.length;
        appInfoPre.innerText = Object.entries(displayConfig).map(([key, value]) => {
            return `${key}: ${value}`;
        }).join('\n');
    } else {
        console.error('Config not found for this appId: ' + AppID);
        return;
    }

    tryCheckPendingTournament()
    tryCheckPendingLeaderboard()

    start()
}

if (myLink.includes('instant-games/instant_tournament')) {
    main()
}
