import { NextApiRequest, NextApiResponse } from "next";
import { findUser, connect } from "../../utils/db";
import { user } from "../../utils/type";
import User from "../../utils/User"
type mutatedUser = user & {
    followingUsers: String[];
    followerUsers: String[];
    friendUsers: String[];
}
export default async function follow(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { toFollow, hash } = req.body;
        const selectedUser = await User.findOne({ hash: hash }) as mutatedUser;
        const toFollowUser = await User.findOne({ username: toFollow }) as mutatedUser;
        if (selectedUser) {
            if (toFollowUser) {
                const toFollowId = toFollowUser._id;
                //@ts-ignore
                if (selectedUser.followingUsers.includes(toFollowId)) {
                    res.status(200).json({ status: "error", message: { text: "Already following" } })
                } else {
                    //@ts-ignore
                    selectedUser.followingUsers.push(toFollowId);
                    selectedUser.followingCount = selectedUser.followingUsers.length;

                    //@ts-ignore
                    toFollowUser.followerUsers.push(selectedUser._id);
                    toFollowUser.followersCount = toFollowUser.followerUsers.length;
                    if (toFollowUser.followingUsers.includes(selectedUser._id)) {
                        selectedUser.friendUsers.push(toFollowUser._id);
                        selectedUser.friendsCount = selectedUser.friendUsers.length;
                        toFollowUser.friendUsers.push(selectedUser._id);
                        toFollowUser.friendsCount = toFollowUser.friendUsers.length
                    }
                    selectedUser.save();
                    toFollowUser.save();
                    res.status(200).json({ status: "ok", message: { text: "Followed" } })
                }
            }
        }
    }
}