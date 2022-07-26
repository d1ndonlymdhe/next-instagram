import { NextApiRequest, NextApiResponse } from "next"
import Post from "../../utils/Post";
import { post } from "../../utils/type";
import User from "../../utils/User";

export default async function getPostsFromUser(req: NextApiRequest, res: NextApiResponse) {
    const { username } = <{ username: string }>req.query!
    console.log("username = ", username);
    if (username) {
        const user = await User.findOne({ username });
        if (user) {
            const posts: post[] = await Post.aggregate([
                {
                    $redact: {
                        $cond: {
                            if: { $in: ["$postedBy", [user._id]] },
                            then: "$$DESCEND",
                            else: "$$PRUNE"
                        }
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "likedBy",
                        foreignField: "_id",
                        let: { ids: "$likedBy" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ["$_id", "$$ids"]
                                    }
                                }
                            },
                            { $project: { username: 1, _id: 0 } },
                        ],
                        as: "likedByUsernames"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "postedBy",
                        foreignField: "_id",
                        let: { id: "$postedBy" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$_id", "$$id"]
                                    }
                                }
                            },
                            { $project: { username: 1, _id: 0 } }
                        ],
                        as: "postedByUsername"
                    }
                }
            ]).sort({ postedOn: -1 })
            // console.log(posts)
            res.status(200).json({ status: "ok", posts: posts })
        } else {
            res.status(200).json({ status: "error" })
        }
    } else {
        res.status(200).json({ status: "error" })
    }
    // res.status(200).json({ status: "error" })


}