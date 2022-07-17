import { Schema, model, models } from "mongoose";
import mongoose from "mongoose";
const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    followingCount: {
        type: Number,
        default: 0,
    },
    followingUsers: [mongoose.SchemaTypes.ObjectId],
    followersCount: {
        type: Number,
        default: 0,
    },
    followerUsers: [mongoose.SchemaTypes.ObjectId],
    firstLogin: {
        type: Boolean,
        default: true
    },
    hash: {
        type: String,
    },
    bio: {
        type: String,
        default: ""
    }
})

const User = models.User || model("User", userSchema);

export default User;