class FiledResponse{
    message = "Not Expected"
    data = {}
    constructor(message, data){
        this.message = message;
        this.data = data || {};
    }
}

module.exports = FiledResponse