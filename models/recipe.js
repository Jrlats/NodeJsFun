var mongoose= require('mongoose');

var recipeSchema = new mongoose.Schema({
    name:String,
    ingredients: [{
        name: String,
        quantity: String
    }],
    ownerId: String
});

module.exports = mongoose.model('Recipe', recipeSchema);

