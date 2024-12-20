const mongoose=require('mongoose')


async function mongoDbConnect(url){
    return mongoose.connect(url)
}
module.exports={
    mongoDbConnect
}