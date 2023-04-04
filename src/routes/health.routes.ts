import { Router } from "express";

const healthRoutes = Router();

healthRoutes.get("/health", (req, res) => {
  res.status(200);
  res.send(
    JSON.stringify({
      status: "pass",
      version: "v1",
    })
  );
});

export { healthRoutes };
