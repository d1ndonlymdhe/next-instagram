import { NextApiRequest, NextApiResponse } from "next";
import { findUser } from "../../utils/db";
import User from "../../utils/User";
import user from "../../utils/type";
// import User as UserType from "../../utils/User";
export default async function follow(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { toFollow, hash } = req.body;

        const selectedUser = await findUser(undefined, hash);
        const toFollowUser = await findUser(toFollow);

        if (selectedUser) {
            if (toFollowUser) {
                const toFollowId = toFollowUser._id;
                console.log("selected user: ", selectedUser);
                if (selectedUser.followingUsers.includes(toFollowId)) {
                    // res.setHeader("Content Type", "application/json");
                    // res.send(JSON.stringify({ status: "error", message: { text: "Already following" } }));
                    res.status(200).json({ status: "error", message: { text: "Already following" } })
                } else {
                    selectedUser.followingUsers.push(toFollowId);
                    // selectedUser.followingCount++;
                    selectedUser.followingCount = selectedUser.followingUsers.length;

                    toFollowUser.followerUsers.push(selectedUser._id);
                    toFollowUser.followersCount = toFollowUser.followerUsers.length;
                    selectedUser.save();
                    toFollowUser.save();
                    // res.setHeader("Content Type", "application/json");

                    // res.send(JSON.stringify({ status: "ok", message: { text: "Followed" } }));
                    res.status(200).json({ status: "ok", message: { text: "Followed" } })
                }
            }
        }
    }
}