import { NextApiRequest, NextApiResponse } from "next";
// import { handleClientScriptLoad } from "next/script";
import Post from "../../utils/Post";
import { post } from "../../utils/type";
import { user } from "../../utils/type";
import User from "../../utils/User";
import { connect } from "../../utils/db"
export default async function getPosts(req: NextApiRequest, res: NextApiResponse) {
    const hash: string = <string>req.query.hash!;
    let flatPost: post[] = []
    const connection = await connect();
    if (hash) {
        const reqUser = await User.findOne({ hash: hash }, "followingUsers") as user;
        if (reqUser) {
            const following = reqUser.followingUsers;
            if (following.length > 0) {
                let posts: post[] = await Post.aggregate([
                    {
                        $redact: {
                            $cond: {
                                if: { $in: ["$postedBy", following] },
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
                ]).sort({ postedOn: -1 }).limit(10);
                res.status(200).json({ status: "ok", posts: posts });
            } else {
                res.status(200).json({ status: "error", message: "Not Following AnyOne" })
            }
        } else {
            res.status(200).json({ status: "error", message: "User not found" });
            return;
        }
    } else {
        res.status(200).json({ status: "error", message: "Invalid Request" });
    }
    // res.status(200).json({ status: "error", posts: flatPost });
}
