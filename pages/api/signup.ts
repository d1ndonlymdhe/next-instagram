import { NextApiRequest, NextApiResponse } from "next";
import { findUser, newUser } from "../../utils/db";
import fs from "fs";
import { signUpReq, messageType } from "../../apiTypes/types";
import User from "../../utils/User";
import { user } from "../../utils/type"
import sum from "hash-sum"
export default function signup(req: NextApiRequest, res: NextApiResponse) {
    console.log("ok");
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

            const newUser = new User() as user;
            newUser.username = username;
            newUser.salt = sum((new Date().getTime()).toString() + (Math.random()).toString());
            newUser.password = sum(password + newUser.salt);
            newUser.save()
            if (!fs.existsSync("./files")) {
                fs.mkdirSync("./files");
                console.log("files directory created")
            } else {
                fs.mkdir(`./files/${newUser._id}`, (err) => {
                    console.log(err);
                    if (!err) {
                        fs.mkdir(`./files/${newUser._id}/posts`, (err) => {
                            console.log(err);
                        })
                    }
                });
            }

            // newUser(username, password).then(user => {
            //     if (!fs.existsSync("./files")) {
            //         fs.mkdirSync("./files");
            //         console.log("files directory created")
            //     } else {
            //         fs.mkdir(`./files/${user._id}`, (err) => {
            //             console.log(err);
            //             if (!err) {
            //                 fs.mkdir(`./files/${user._id}/posts`, (err) => {
            //                     console.log(err);
            //                 })
            //             }
            //         });
            //     }
            // })

        } else {
            status = "error";
            message = {
                text: "Username Taken"
            }
        }
        res.status(200).json({ status, message });
        return;
    })
}

