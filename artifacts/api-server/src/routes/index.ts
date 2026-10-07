import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./cyberquest-auth";
import missionRouter from "./missions";
import progressRouter from "./progress";
import mentorRouter from "./mentor";
import codeRouter from "./code";
import eventsRouter from "./events";
import lessonsRouter from "./lessons";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(missionRouter);
router.use(progressRouter);
router.use(mentorRouter);
router.use(codeRouter);
router.use(eventsRouter);
router.use(lessonsRouter);

export default router;
