import { NextApiRequest, NextApiResponse } from "next";
import { connect } from "../../utils/db";
import User from "../../utils/User"
import Message from "../../utils/Message"
import { user, message } from "../../utils/type"
export default async function removePendingMessages(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const hash = req.cookies.hash
        if (hash) {
            const user = await User.findOne({ hash: hash }) as user;
            const pendingMessageIds = user.pendingMessages;
            const remove = await Message.deleteMany({ _id: { $in: pendingMessageIds } })
            user.pendingMessages = [];
            user.save();
            res.send("ok");
        }
    }
}