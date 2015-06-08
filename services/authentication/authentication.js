

exports.authorization = function(request, response){
    if (!request.headers.authorization) {
        console.log('authorization failure');
        return response.status(401).send({
            message: 'You are not authorized!'
        });
    }
};


