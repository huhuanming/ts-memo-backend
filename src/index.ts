import bodyParser from "body-parser";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import kue, { DoneCallback, Job } from "kue";
import "reflect-metadata";
import {createConnection, getConnection, getManager} from "typeorm";
import WebSocket from "ws";
import { WorkItem } from "./entity/workItem";

const QUEUE_NAME = "checklist";

createConnection();

const queue = kue.createQueue();

queue.create(QUEUE_NAME, Date().toString()).delay(10 * 1000).priority("high").save();

const app = express();
const router = express.Router();

app.get("/", (req, res) => {
    res.json({ promote: "hello word"});
});

router.get("", async (req, res, next) => {
    const workItemRepository = getConnection().manager.getRepository(WorkItem);
    try {
        const workItems = await workItemRepository.find({ order: { createdAt: "DESC" } });
        res.json(workItems);
    } catch (error) {
        next(error);
    }
});

router.post("", async (req, res, next) => {
    const workItem = new WorkItem();
    workItem.text = req.body.text;
    const workItemRepository = getManager().getRepository(WorkItem);
    try {
        res.json(await workItemRepository.save(workItem));
    } catch (error) {
        next(error);
    }
});

router.put("/:id", async (req, res, next) => {
    const body = req.body;
    const workItemRepository = getConnection().manager.getRepository(WorkItem);
    try {
        await workItemRepository.updateById(req.params.id, { isChecked: body.isChecked});
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    const workItemRepository = getConnection().manager.getRepository(WorkItem);
    try {
        await workItemRepository.deleteById(req.params.id);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

app.use(bodyParser.json());
app.use("/work-items", router);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, port: 8181 });

wss.on("connection", (ws: WebSocket) => {
    ws.send("hello");
    queue.process(QUEUE_NAME, (job: Job, done: DoneCallback) => {
        ws.send(job.data);
        done();
    });
});

app.listen(3000);
