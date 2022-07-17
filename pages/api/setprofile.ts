import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import formidable from "formidable";
import { findUser } from "../../utils/db";
import Jimp from "jimp";
export default async function setprofile(req: NextApiRequest, res: NextApiResponse) {
    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
        if (err) { console.log(err) }
        const { hash, bio } = <{ hash: string; bio: string }>fields;
        const file = <formidable.File>files.profilePicture;
        const user = await findUser(undefined, hash);
        if (user) {
            fs.readFile(file.filepath, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    if (file.originalFilename) {
                        if (getExtension(file.originalFilename) !== "png") {
                            Jimp.read(data, (err, image) => {
                                if (!err) {
                                    image.write(`./files/${user._id}/profilepicture.png`);
                                }
                            })
                        } else {
                            fs.writeFile(`./files/${user._id}/profilepicture.png`, data, (err) => {
                                console.log("write err", err);
                            });
                        }
                    }
                }
            })
            user.bio = bio;
            user.firstLogin = false;
            //@ts-ignore
            user.save();
        }
        res.send("ok");
    })

}

export function getExtension(fileName: string) {
    const splits = fileName.split(".");
    return splits[splits.length - 1]
}

export const config = {
    api: {
        bodyParser: false
    }
}