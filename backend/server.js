import app from './src/app.js';
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";

dotenv.config();


// connect database
connectDB();



const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});