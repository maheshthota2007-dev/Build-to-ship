import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./cyberquest-auth";
import missionRouter from "./missions";
import progressRouter from "./progress";
import mentorRouter from "./mentor";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(missionRouter);
router.use(progressRouter);
router.use(mentorRouter);

export default router;
