import { NextApiRequest, NextApiResponse } from "next";
import { findUser } from "../../utils/db";
import User from "../../utils/User";
import user from "../../utils/type";
// import User as UserType from "../../utils/User";
export default async function unfollow(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { toUnFollow, hash } = req.body;

        const selectedUser = await findUser(undefined, hash);
        const toUnFollowUser = await findUser(toUnFollow);

        if (selectedUser) {
            if (toUnFollowUser) {
                const toUnFollowId = toUnFollowUser._id;
                console.log("To Unfollow : ", toUnFollowUser);
                if (!selectedUser.followingUsers.includes(toUnFollowId)) {
                    // res.setHeader("Content Type", "application/json");
                    // res.send(JSON.stringify({ status: "error", message: { text: "Already Not Following" } }));
                    res.status(200).json({ status: "error", message: { text: "Already Not Following" } })
                } else {
                    selectedUser.followingUsers = selectedUser.followingUsers.filter((following) => {
                        return (following == toUnFollowId)
                    })
                    selectedUser.followingCount = selectedUser.followingUsers.length;
                    toUnFollowUser.followerUsers = toUnFollowUser.followerUsers.filter((follower) => {
                        return (follower == selectedUser._id);
                    })
                    toUnFollowUser.followersCount = toUnFollowUser.followerUsers.length;
                    selectedUser.save();
                    toUnFollowUser.save();
                    // res.setHeader("Content Type", "application/json");
                    // res.send(JSON.stringify({ status: "ok", message: { text: "UnFollowed" } }));
                    res.status(200).json({ status: "ok", message: { text: "UnFollowed" } })

                }
            }
        }
    }
}