const googleTrends = require('google-trends-api');
const fs = require('fs')
const c = require('colors')
const getTrends = async (key) => {
    let content = await googleTrends.dailyTrends({geo: key})

    let a = JSON.parse(content)

    let array = []
    a.default.trendingSearchesDays[0].trendingSearches.forEach(t => {
        array.push(t.title.query)
    })

    fs.writeFile('./files/trends.txt', array.join(", "), () => {
        console.log(c.bold('[ SERVER ] Trends Top salvo em ./files/trends.txt'))
    })
    return a.default.trendingSearchesDays[0].trendingSearches
}

module.exports = getTrends