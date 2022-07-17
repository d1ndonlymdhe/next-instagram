import { Schema, model, models } from "mongoose";
import User from "./User";
import mongoose from "mongoose";
const postSchema = new Schema({
    caption: {
        type: String,
        default: "",
    },
    postedBy: mongoose.SchemaTypes.ObjectId,
    likedBy: [mongoose.SchemaTypes.ObjectId],
    likes: {
        type: Number,
        default: 0
    }
})

const Post = models.Post || model("Post", postSchema);

export default Post;