import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../utils/db";
import User from "../../utils/User"
import Message from "../../utils/Message"
import { user, message } from "../../utils/type"
export default async function removePendingMessages(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { roomId } = <{ roomId: string }>req.body;
        const hash = req.cookies.hash
        if (hash) {
            if (roomId) {
                const user = await User.findOne({ hash: hash }) as user;
                const pendingMessageIds = user.pendingMessages;
                const messagesToBeDeleted = await Message.find({ _id: { $in: pendingMessageIds }, roomId: roomId })
                const remove = await Message.deleteMany({ _id: { $in: pendingMessageIds }, roomId: roomId })
                user.pendingMessages = [];
                user.save();
                res.send("ok");
            }
        }
    }
}