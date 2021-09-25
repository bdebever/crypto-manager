const express = require('express')
const cors = require('cors')
const { pool } = require('./config')

const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())

/**
 * Select distinct tokens -> fetch prices -> update in DB
 * 
 * @param {*} request 
 * @param {*} response 
 */
const getFollowingsTokensList = (request, response) => {
    pool.query('SELECT * FROM books', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const updatePricesFollowingsTokensList = (request, response) => {
    const { author, title } = request.body

    pool.query(
        'INSERT INTO books (author, title) VALUES ($1, $2)', [author, title],
        (error) => {
            if (error) {
                throw error
            }
            response.status(201).json({ status: 'success', message: 'Book added.' })
        }
    )
}

app
    .route('/followings')
    // GET endpoint
    .get(getFollowingsTokensList)
    // POST endpoint
    .post(updatePricesFollowingsTokensList)

// Start server
app.listen(process.env.PORT || 3002, () => {
    console.log(`Server listening`)
})