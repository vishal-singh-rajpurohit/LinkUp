
class ApiResponse {
    constructor(statusCode, data, message = "Successful"){
        this.statusCode = statusCode,
        this.data = data,
        this.message = statusCode < 400? message : false
    }
}

module.exports = ApiResponse;