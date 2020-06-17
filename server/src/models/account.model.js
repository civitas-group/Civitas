// Mongoose schema that represents a user account.

const mongoose = require('mongoose');
const accountSchema = new mongoose.Schema({
   username: {
       type: String,
       required: true,
       unique: true
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
   managed_groups_ids: [{
       type: mongoose.ObjectId,
       ref: "Group"
   }],
   invited_groups_ids: [{
       type: mongoose.ObjectId,
       ref: "Group"
   }]
});

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
