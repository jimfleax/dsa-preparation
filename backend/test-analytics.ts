import mongoose from "mongoose";
import dotenv from "dotenv";
import { getAnalytics } from "./src/controllers/admin/analyticsController.js";

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || "");
  const req = {} as any;
  const res = {
    json: (data: any) => console.log(JSON.stringify(data, null, 2)),
    status: (code: number) => {
      console.log(`Status: ${code}`);
      return { json: (data: any) => console.log(data) };
    }
  } as any;
  await getAnalytics(req, res);
  await mongoose.disconnect();
}
test().catch(console.error);
