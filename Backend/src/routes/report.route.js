const {Router} = require("express")
const {report} = require("../controllers/report.controller")
const auth = require("../middlewares/auth.middleware")



const reportRoute = Router()


reportRoute.route('/report').post(auth, report);

module.exports = reportRoute