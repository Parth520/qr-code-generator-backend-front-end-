import bodyParser from "body-parser";
import qr from 'qr-image';
import fs from 'fs';
import express from 'express';
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(
    import.meta.url));
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // serve static files like QR image

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/submit", (req, res) => {
    const barcode = req.body["url"];

    if (!barcode || barcode.trim() === "") {
        return res.status(400).send("Error: Invalid input. Please provide a valid URL or text.");
    }

    try {
        const qr_svg = qr.image(barcode, { type: 'png' });
        const qrPath = __dirname + '/qrcode.png';
        qr_svg.pipe(fs.createWriteStream(qrPath));

        fs.writeFile("message.txt", barcode, (err) => {
            if (err) throw err;
            console.log('message.txt has been saved!');
        });

        res.sendFile(__dirname + "/output.html");
    } catch (err) {
        console.error("Failed to generate QR:", err.message);
        res.status(500).send("Failed to generate QR code. Please try again.");
    }
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});