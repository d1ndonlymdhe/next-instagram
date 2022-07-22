import { NextApiRequest, NextApiResponse } from "next";
import { findUser } from "../../utils/db";
import { updateUser } from "../../utils/db";
import { signUpReq, messageType } from "../../apiTypes/types";
import sum from "hash-sum";

export default function login(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        const { username, password } = <signUpReq>req.body;
        let status = "error";
        let message: messageType = {
            text: "unknown error"
        }
        findUser(username).then(user => {
            console.log(user);
            if (user == null) {
                message = {
                    text: "Incorrect Username"
                }
            } else {
                if (user.password === password) {
                    status = "ok";
                    const uniqueHash = sum(user._id);
                    message = {
                        text: "ok",
                        hash: uniqueHash,
                    }
                    updateUser(username, { hash: uniqueHash })
                    res.status(200).json({ status, message });
                    return;

                } else {
                    message = {
                        text: "Incorrect Username"
                    }
                    res.status(200).json({ status, message });

                    return;
                }
            }
            res.status(200).json({ status, message });
            return;
        })
    }
}