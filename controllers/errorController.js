const triggerError = (req, res, next) => {
    const error = new Error("Oh no! There was a crash. Maybe try a diferent route?")
    error.status = 500
    next(error) // Pass the error to the middleware
  }
  
  module.exports = { triggerError }