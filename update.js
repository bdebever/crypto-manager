const { pool } = require('./config')
const axios = require('axios');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Select distinct tokens -> fetch prices -> update in DB
 */
const getFollowingsTokensList = async() => {
    const results = await pool.query('SELECT distinct id FROM followings')
        //if (error) throw error
    console.log(results.rows)
    return results.rows;
}

const callCoingeckoAPI = async(list) => {
    const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${list}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`);
    return data;
}

const updatePricesFollowingsTokensList = async() => {
    const tokens = await getFollowingsTokensList();
    console.log(tokens);
    const tokens_list = tokens.map(entry => entry.id).join(',')

    // TODO Check on size of the list -> delay otherwise
    const apiResults = await callCoingeckoAPI(tokens_list);

    for (const token in apiResults) {
        console.log(token)
        const tokenObj = apiResults[token];
        console.log(tokenObj)
        const values = [
            token,
            tokenObj.usd,
            parseInt(tokenObj.usd_market_cap),
            tokenObj.usd_24h_change,
            new Date(tokenObj.last_updated_at * 1000)
        ];

        await pool.query(
            'INSERT INTO prices (id, price, market_cap, price_change_daily, received_at) VALUES ($1, $2, $3, $4, $5)', values
        )
    }

    return;
}

// Kick off for
updatePricesFollowingsTokensList();