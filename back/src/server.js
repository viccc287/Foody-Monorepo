import app from "./app.js";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(process.env.RESTAURANT_NAME);
  console.log(`Server is running on http://localhost:${PORT}`);
});