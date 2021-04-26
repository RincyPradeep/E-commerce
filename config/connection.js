
/* code for mongodb connection */

const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=function(done){
    
    // const url='mongodb://localhost:27017';
    const url='mongodb+srv://shopping:00m3cPnatqZlhFk5@cluster0.vj0om.mongodb.net/shopping?retryWrites=true&w=majority';
    const dbname='shopping';

    /* connect... */
    mongoClient.connect(url,(err,data)=>{
        if(err)
        return done(err);
        state.db=data.db(dbname);
        done()
    })
}

module.exports.get=function(){
    return state.db
}