import express, {Application, Router} from 'express';
import WebSocket from 'ws';
import * as http from 'http';
import fs from "fs";
import bodyParser from 'body-parser';
import cors from 'cors';

const PORT_WEBSOCKET = 8081;
const PORT_HTTP = 8080;


const app: express.Application = express();
app.use(cors());
app.use(bodyParser.json());




let alertsFromFile: Alert[] = []

interface Alert {
    name: string;
    description: string;
    date: string;
    source: string,
    alert_id: number,
    severity: number
}

//----- Read JSON  file -------------------------------
fs.readFile("./src/mockdata.json", "utf8", (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err);
        return;
    }
    alertsFromFile = JSON.parse(jsonString);
});

//----- HTTP Server-----------------------------------------------------------------------------------------------------

//initialize http server
const server = http.createServer(app);

app.post("/auth", (req: express.Request, res: express.Response) => {
    // console.log(req.body.login);

    if (!(req.body.login == "test" && req.body.password == "test")) {
        return res.status(400).json({
            status: 'error',
            error: 'req body cannot be empty',
        });
    }


    res.status(200).json({
        status: 'success',
        data: req.body,
    })
});

app.listen(PORT_HTTP, () => {
    console.log(`HTTP server started at http://localhost:${PORT_HTTP} :)`);
});

//----- Websocket Server-----------------------------------------------------------------------------------------------------

//initialize the WebSocket server instance
const wss = new WebSocket.Server({server});

wss.on('connection', (ws: WebSocket) => {

    let i = 0

    setInterval(() => ws.send(
        sendMessage(randomInteger(), i++, alertsFromFile)
    ), 15000)
});

//start our server
server.listen(PORT_WEBSOCKET || 8081, () => {
    console.log(`WebSocket server started at http://localhost:${PORT_WEBSOCKET} :)`);
});

const randomInteger = () => {
    // get random number (min-0.5) to (max+0.5)
    let rand = 1 - 0.5 + Math.random() * (10 - 1 + 1);
    return Math.round(rand);
};

const sendMessage = function (rand: number, ind: number, alerts: Alert[]) {
    let al = alerts[ind];
    al.severity = rand;
    return JSON.stringify(al);
}
