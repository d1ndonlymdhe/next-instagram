import { NextApiRequest, NextApiResponse } from "next";
import { findUser, newUser } from "../../utils/db";
import fs from "fs";
import { signUpReq, messageType } from "../../apiTypes/types";
export default function signup(req: NextApiRequest, res: NextApiResponse) {
    const { username, password } = <signUpReq>req.body;
    let status = "error";
    let message: messageType = {
        text: "Unknown error occured"
    }
    findUser(username).then(user => {
        console.log(user);
        if (user == null) {
            status = "ok";
            message = {
                text: "ok"
            }
            newUser(username, password).then(user => {
                fs.mkdir(`./files/${user._id}`, (err) => {
                    console.log(err);
                    if (!err) {
                        fs.mkdir(`./files/${user._id}/posts`, (err) => {
                            console.log(err);
                        })
                    }
                });
            })

        } else {
            status = "error";
            message = {
                text: "Username Taken"
            }
        }
        res.send(JSON.stringify({ status, message }));
        return;
    })
}