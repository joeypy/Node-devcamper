// @desc    Logs request to console
const logger = (request, response, next) => { 
    console.log(`${request.method}`)
    next()
}

module.exports = logger