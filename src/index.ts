import server from "./api/server";

const port = 3333;
server.listen(port, () => {
  console.log(`Running signature service on port ${port}`);
});
