var mongoose= require('mongoose');

var userRecipeSchema = new mongoose.Schema({
    userId:String,
    recipes: [{
        recipeId: String
    }]
});

module.exports = mongoose.model('UserRecipes', userRecipeSchema);