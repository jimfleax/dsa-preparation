import mongoose from "mongoose";
import dotenv from "dotenv";
import { googleLogin } from "./src/controllers/authController.ts";

dotenv.config({ path: "./.env" });

// Mock Request and Response
const mockReq = {
  body: { token: "mock_token" }
} as any;

const mockRes = {
  status: function(code: number) {
    this.statusCode = code;
    return this;
  },
  json: function(data: any) {
    console.log("Response:", this.statusCode, data);
    return this;
  }
} as any;

// We need to mock OAuth2Client verifyIdToken
import { OAuth2Client } from "google-auth-library";
OAuth2Client.prototype.verifyIdToken = async function() {
  return {
    getPayload: () => ({
      email: "newuser@example.com",
      sub: "1234567890_new",
      name: "New User"
    })
  } as any;
};

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test");
    await mongoose.connection.collection("users").drop().catch(() => {});
    
    console.log("Calling googleLogin...");
    await googleLogin(mockReq, mockRes);
    
  } catch (error) {
    console.error("Test error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// execute using ts-node or compile
test();
