const { getAllShops, addShop, deleteShop, updateShop } = require("./controllers")

const router=require("express").Router()


router.route("/shops").get(getAllShops)
router.route("/shop").post(addShop)
router.route("/shop").delete(deleteShop)
router.route("/shop/:id").put(updateShop)



module.exports=router