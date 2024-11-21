
/** Get saved leagues (league ID and league site) from local storage. */
export function getSavedLeagues(): { leagueId: string; site: string }[] {
    const savedLeagues = localStorage.getItem('savedLeagues');

    return savedLeagues ? JSON.parse(savedLeagues) : null;
}

/** Save league ID and league site to local storage (if it's not already there) */
export function saveLeague(leagueToSave: { leagueId: string, site: string }) {
    // Save the new or selected league to localStorage
    const parsedLeagues = getSavedLeagues() ?? [];

    // Add the new or selected league if it doesn't already exist
    const existingLeague = parsedLeagues.find(
        (league: { leagueId: string; site: string }) =>
            league.leagueId === leagueToSave.leagueId && league.site === leagueToSave.site
    );

    if (!existingLeague) {
        parsedLeagues.push(leagueToSave);
        localStorage.setItem('savedLeagues', JSON.stringify(parsedLeagues));
    }
}

/** Delete all saved leagues from local storage */
export function removeSavedLeagues() {
    localStorage.removeItem('savedLeagues');
}