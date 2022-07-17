import { NextApiRequest, NextApiResponse } from "next";
import User from "../../utils/User";
import { connect } from "../../utils/db";
import { user } from "../../utils/type";
export default async function search(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { searchTerm, hash } = req.query;
        const limit: number = parseInt(<string>req.query.limit!, 10);
        console.log(typeof searchTerm)
        if (typeof searchTerm === "string") {
            const connection = await connect();
            //limit + 1 because one user may be the same as the requesting user
            let results: user[] = [];
            try {
                results = await User.find({ username: { $regex: searchTerm } }, "_id username").limit(limit + 1) as user[]
            }
            catch (err) {
                console.log(err);
                res.status(200).json({
                    status: "error", message: {
                        error: "Invalid username"
                    }
                });
            }
            if (hash) {
                const requestingUser = await User.findOne({ hash }, "username followingUsers") as user;
                const sendThis: { username: string, isFollowing: boolean }[] = [];
                for (let i = 0; i < results.length; i++) {
                    if (results[i].username !== requestingUser.username) {
                        sendThis.push({
                            username: results[i].username,
                            isFollowing: requestingUser.followingUsers.includes(results[i]._id)
                        })
                    }
                }
                if (sendThis.length > limit) {
                    sendThis.pop()
                };
                res.status(200).json({ status: "ok", results: sendThis });
            } else {
                const sendThis = results.map(result => { username: result.username });
                res.status(200).json({ status: "ok", results: sendThis });
            }
        }

    }
}