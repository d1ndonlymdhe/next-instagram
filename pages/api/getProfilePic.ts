import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { findUser } from "../../utils/db";

export default async function getProfilePicture(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const username = <string>req.query.username;
        console.log(username)
        const user = await findUser(username);
        if (user) {
            const id = user._id;
            const file = `./files/${id}/profilepicture.jpg`;
            fs.createReadStream(file).pipe(res);
        } else {
            res.send("not found")
        }
    }
}