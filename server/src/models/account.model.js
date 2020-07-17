// Mongoose schema that represents a user account.

const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({
    file_urls:[{
        type: String
    }],
    file_storage_type:{
        type: String
    }
});
const accountSchema = new mongoose.Schema({
   username: {
       type: String,
       required: true,
       unique: true
   },
   full_legal_name: {
       type:String,
       required:true
   },
   password: { // SHA-256 hashed, salted password
       type: String,
       required: true
   },
   email: {
       type: String,
       required: true,
	   unique: true
   },
   group_ids: [{
       type: mongoose.ObjectId,
       ref: "Group"
   }],
   is_supervisor: {
       type: Boolean,
       required: true
   },
   requested_groups_ids:[{
      type: mongoose.ObjectId,
      ref: "Group"
   }],
   requested_groups_files:[{
        requested_group_id:{
            type: mongoose.ObjectId,
            ref: "Group"
        },
        fileInfo:fileSchema
   }],
   managed_groups_ids: [{
       type: mongoose.ObjectId,
       ref: "Group"
   }],
   invited_groups_ids: [{
       type: mongoose.ObjectId,
       ref: "Group"
   }],
   requested_to_join_groups_ids: [{
        type: mongoose.ObjectId,
        ref: "Group"
   }]
});

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
