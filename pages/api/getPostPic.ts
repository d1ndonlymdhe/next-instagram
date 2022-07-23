import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
export default async function getPostPic(req: NextApiRequest, res: NextApiResponse) {
    const { postId, uploaderId } = <{ postId: string, uploaderId: string }>req.query
    if (postId && uploaderId) {
        try {
            fs.createReadStream(`./files/${uploaderId}/posts/${postId}/image.jpg`).pipe(res);
        } catch (err) {
            res.status(200).json({ status: "error" });
        }

    }
}