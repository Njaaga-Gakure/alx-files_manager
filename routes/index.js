import express from "express";
import AppController from "../controllers/AppController";
import UsersController from "../controllers/UsersController";
import AuthController from "../controllers/AuthController";

const router = express.Router();

router.route("/status").get(AppController.getStatus);
router.route("/stats").get(AppController.getStats);
router.route("/connect").get(AuthController.getConnect);
router.route("/disconnect").get(AuthController.getDisconnect);
router.route("/user/me").get(AuthController.getMe);
router.route("/users").post(UsersController.postNew);

export default router;
