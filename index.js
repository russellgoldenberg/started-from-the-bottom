const fs = require('fs')
const csvParse = require('d3-dsv').csvParse

const csvData = fs.readFileSync('./data/nba-franchise-win-totals.csv', 'utf8')
const data = csvParse(csvData)

// where the team starts so we can strip out other properties
const firstTeamIndex = 3

// turn team names into array
const getTeams = obj =>
	Object.keys(obj).slice(firstTeamIndex)

// filter to seasons since the merger (1976)
const sinceMerger = data.filter(d => +(d.Season.split('-')[0]) > 1975)

// create team dict
const teams = getTeams(sinceMerger[0]).map(team => ({ team }))

// sorted wins each season
const sortedWins = sinceMerger.map(d =>
	// get teams, get wins, sort, get most
	getTeams(d)
		.map(team => d[team] || 0)
		.filter(val => val > 0)
		.sort((a, b) => b - a)
)

// each team games back from first each season
teams.forEach(t =>
	// go thru each year, find the team, calculate wins back and rank
	t.data = sinceMerger.map((d, index) => {
		const season = d.Season
		const curSeason = sortedWins[index]
		const wins = d[t.team] || 0
		const most = curSeason[0]
		const gamesBack = wins ?  most - wins : false
		const worst = wins ? curSeason.lastIndexOf(wins) === curSeason.length - 1 : false
		const first = gamesBack === 0

		return { season, gamesBack, worst, first }
	})
)

fs.writeFileSync('./data/output.json', JSON.stringify(teams, null, 2))
