import { NextApiRequest, NextApiResponse } from "next";
import { findUser, newUser } from "../../utils/db";
import fs from "fs";
import { signUpReq, messageType } from "../../apiTypes/types";
import User from "../../utils/User";
import { user } from "../../utils/type"
import sum from "hash-sum"
export default function signup(req: NextApiRequest, res: NextApiResponse) {
    const { username, password } = <signUpReq>req.query;
    let status = "error";
    let message: messageType = {
        text: "Unknown error occured"
    }
    findUser(username).then(user => {
        if (user == null) {
            status = "ok";
            message = {
                text: "ok"
            }

            const newUser = new User() as user;
            newUser.username = username;
            newUser.salt = sum((new Date().getTime()).toString() + (Math.random()).toString());
            newUser.password = sum(password + newUser.salt);
            newUser.save()

            fs.mkdir(`./files/${newUser._id}`, (err) => {
                if (!err) {
                    fs.mkdir(`./files/${newUser._id}/posts`, (err) => {
                        if (err) {
                            res.status(400).json({ err: "NO folder" })
                        }
                    })
                }
                res.status(400).json({ err: "NO folder" })
            });
        } else {
            status = "error";
            message = {
                text: "Username Taken"
            }
        }
        res.status(200).json({ status, message });
        // return;
    })
}

