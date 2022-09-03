import { NextApiRequest, NextApiResponse } from "next";
import { findUser } from "../../utils/db";
import User from "../../utils/User";
import { user } from "../../utils/type";
//@ts-ignore
interface mutatedUser extends user {
    followingUsers: String[];
    followerUsers: String[];
    friendUsers: String[];
}
export default async function unfollow(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { toUnFollow, hash } = req.body;
        const selectedUser = await User.findOne({ hash: hash }) as mutatedUser;
        const toUnFollowUser = await User.findOne({ username: toUnFollow }) as mutatedUser;
        if (selectedUser) {
            if (toUnFollowUser) {
                const toUnFollowId = toUnFollowUser._id;
                if (!selectedUser.followingUsers.includes(toUnFollowId)) {
                    res.status(200).json({ status: "error", message: { text: "Already Not Following" } })
                } else {
                    if (toUnFollowUser.followingUsers.includes(selectedUser._id)) {
                        toUnFollowUser.friendUsers.splice(toUnFollowUser.friendUsers.indexOf(selectedUser._id), 1);
                        toUnFollowUser.friendsCount = toUnFollowUser.friendUsers.length;
                        selectedUser.friendUsers.splice(selectedUser.friendUsers.indexOf(toUnFollowUser._id), 1);
                        selectedUser.friendsCount = selectedUser.friendUsers.length;
                    }
                    selectedUser.followingUsers = selectedUser.followingUsers.filter((following: any) => {
                        return (following == toUnFollowId)
                    })
                    selectedUser.followingCount = selectedUser.followingUsers.length;
                    toUnFollowUser.followerUsers = toUnFollowUser.followerUsers.filter((follower: any) => {
                        return (follower == selectedUser._id);
                    })
                    toUnFollowUser.followersCount = toUnFollowUser.followerUsers.length;
                    //@ts-ignore
                    selectedUser.save();
                    //@ts-ignore
                    toUnFollowUser.save();
                    res.status(200).json({ status: "ok", message: { text: "UnFollowed" } })
                }
            }
        }
    }
}