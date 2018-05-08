import bodyParser from "body-parser";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import "reflect-metadata";
import {createConnection, getConnection, getManager} from "typeorm";
import { WorkItem } from "./entity/workItem";

createConnection();

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

app.listen(3000);
