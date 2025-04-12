
class ApiResponse {
    constructor(statusCode, data, message = "Successful"){
        this.statusCode = statusCode,
        this.data = data,
        this.message = message < 400
    }
}

module.exports = ApiResponse;