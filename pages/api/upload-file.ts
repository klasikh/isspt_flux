import { createRouter } from "next-connect";
import onError from "../../common/errorMiddleware";
import multer from "multer";
import path from "path";
// import { executeQuery } from "../../../config/db";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handlerfunc(req: NextApiRequest, res: NextApiResponse) {
    let handler = createRouter();

    let storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, "upload");
        },
        filename: function (req, file, cb) {
            cb(
                null,
                file.fieldname + "-" + Date.now() + path.extname(file.originalname)
            );
        },
    });

    let upload = multer({
        storage: storage,
    });

    let uploadFile = upload.single("file");
    // handler.use(uploadFile);
    // console.log(storage.getDestination)
    handler.post(uploadFile, async (req, res) => {
        return 'toto';
    })

    try {
            // console.log("req.file", req.query.file);
            let url = "http://" + req.headers.host;
            let filename = req.query.file;
            // let result = await executeQuery("insert into upload(pic) values(?)", [
            //   filename,
            // ]);
            // result = await executeQuery(
            //   `select * from upload where pic_id=${result.insertId}`
            // );
            return res.status(200).json({
                url: url + "/public/" + req.query.file,
            });

    } catch (error) {
        console.log(error)
    }
}

