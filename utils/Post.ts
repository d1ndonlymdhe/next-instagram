import { Schema, model, models } from "mongoose";
import mongoose from "mongoose";
const postSchema = new Schema({
    caption: {
        type: String,
        default: "",
    },
    postedBy: mongoose.SchemaTypes.ObjectId,
    postedByUsername: [{ username: String }],
    likedBy: [mongoose.SchemaTypes.ObjectId],
    likedByUsernames: [{ username: String }],
    likes: {
        type: Number,
        default: 0
    },
    postedOn: {
        type: Number,
        default: 0,
    }
})

const Post = models.Post || model("Post", postSchema);

export default Post;