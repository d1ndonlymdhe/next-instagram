import formidable from "formidable";
import fs from "fs";
import Jimp from "jimp";
import { getExtension } from "./setprofile";
import { NextApiRequest, NextApiResponse } from "next";
import { findUser, newPost } from "../../utils/db";
export default async function upload(req: NextApiRequest, res: NextApiResponse) {
    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        if (err) { console.log(err) }
        else {
            const { hash, caption } = <{ hash: string, caption: string }>fields;
            const postedOn = new Date().getTime();
            const file = <formidable.File>files.file;
            const user = await findUser(undefined, hash);
            if (user) {
                const post = await newPost(user._id, postedOn, caption);
                const path = `./files/${user._id}/posts/${post._id}`;
                fs.readFile(file.filepath, (err, data) => {
                    if (err) {
                        console.log(err)
                    } else {
                        fs.mkdir(path, (err) => {
                            if (err) {
                                console.log(err);
                            } else {
                                if (file.originalFilename) {
                                    if (getExtension(file.originalFilename) !== "png") {
                                        Jimp.read(data, (err, image) => {
                                            if (!err) {
                                                image.write(`${path}/image.png`);
                                                res.status(200).json({ status: "ok" });
                                            }
                                        })
                                    } else {
                                        fs.writeFile(`${path}/image.png`, data, (err) => {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.status(200).json({ status: "ok" });
                                            }
                                        })
                                    }
                                }
                            }
                        })

                    }
                })
            } else {
                res.status(200).json({ status: "error" });
            }
        }
    });

}
//no bodyparser
export const config = {
    api: {
        bodyParser: false
    }
}