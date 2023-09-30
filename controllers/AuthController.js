class AuthController {
  static getConnect(req, res) {
    return res.json({ status: "connected" });
  }
  static getDisconnect(req, res) {
    return res.json({ status: "disconnected" });
  }
  static getMe(req, res) {
    return res.json({ status: "access granted" });
  }
}

export default AuthController;
