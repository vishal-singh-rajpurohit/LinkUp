const {Router} = require("express");
const { searchContacts } = require("../controllers/contacts.controller");
const auth = require("../middlewares/auth.middleware");


const contactRouter = Router();


contactRouter.route("/search").post(auth, searchContacts);


module.exports = contactRouter;