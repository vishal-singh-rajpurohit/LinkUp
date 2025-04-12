
const asyncHandler = (reqestMethod) =>{
    return (req, resp, next) =>{
        Promise.resolve(reqestMethod(req, resp, next))
        .catch((err)=>{
            console.log("Error : ", err)
            next(err)
        })
    }
}

module.exports = asyncHandler;
