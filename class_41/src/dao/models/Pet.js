import mongoose from 'mongoose';

mongoose.pluralize(null);

const collection = 'adoptme_pets_tests';

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    specie:{
        type:String,
        required:true
    },
    birthDate:Date,
    adopted:{
        type:Boolean,
        default:false
    },
    owner:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'Users'
    },
    image:String
})

const petModel = mongoose.model(collection,schema);

export default petModel;