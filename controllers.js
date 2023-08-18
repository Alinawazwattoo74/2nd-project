const cloudinary= require("cloudinary")
const Location=require("./Model")
exports.getAllShops=async(req,res)=>{
    try{
const allLocations=await Location.find()
res.json(allLocations)
    }catch(e){
        console.log(e)
    }
}


exports.addShop = async (req, res) => {
  try {
    const { name, items,  longitude, latitude } = req.body;

    const shopExist = await Location.findOne({ latitude, longitude });

    if (shopExist) {
      return res.json({ message: "There is already a Shop at this Location" });
    }

    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "ShopBanner",
      width: 2048,
      crop: "scale",
    });

    const shop = await Location.create({
      name,
      items, // Update to use the correct "items" field from the request body
      image: {
        public_id: myCloud.public_id,
        url: myCloud.url,
      },
      latitude,
      longitude,
    });

    res.json(shop);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.deleteShop=async(req,res)=>{
    const {latitude,longitude}=req.body
    try{
const shopExist=await Location.findOne({latitude,longitude})
if(!shopExist){
  return  res.json({message:"There is no Shop At This Location"})
}
await cloudinary.v2.uploader.destroy(req.body.image.public_id)
await Location.findOneAndDelete({latitude:latitude,longitude:longitude})
res.json("Shop Deleted ")
    }catch(e){
        console.log(e)
    }
}
exports.updateShop = async (req, res) => {
  try {
    const shopId=req.params.id
    console.log(shopId)
    JSON.stringify(shopId)
    const {  name, items, image,latitude,longitude } = req.body;
    const shopExist = await Location.findOne({_id:shopId});

    if (!shopExist) {
      return res.json({ message: "There is no Shop with this " });
    }

    let updatedShop;
    if (image) {
      await cloudinary.v2.uploader.destroy(shopExist.image.public_id);
      const myCloud = await cloudinary.v2.uploader.upload(image, {
        folder: "ShopBanner",
        width: 2048,
        crop: "scale",
      });

      updatedShop = await Location.findOneAndUpdate(
        {_id:shopId},
        {
          name,
          items,
          image: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url, // Use secure_url instead of url
          },
          latitude,
          longitude
        },
        { new: true }
      );
    } else {
      updatedShop = await Location.findOneAndUpdate(
        {_id:shopId},
        { name, items,latitude,longitude },
        { new: true }
      );
    }

    const updatedShopWithImageUrl = { ...updatedShop._doc, image: updatedShop.image.url };
    res.json(updatedShopWithImageUrl);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

  
  exports.getShopByCoordinates = async (req, res) => {
    try {
      const { latitude,longitude } = req.body;
  console.log(latitude,longitude)
      const shop = await Location.findOne({ latitude:latitude,longitude:longitude });
  
      if (!shop) {
        return res.status(404).json({ error: "Shop not found" });
      }
  
      res.json(shop);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };