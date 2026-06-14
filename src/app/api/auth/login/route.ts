import { authController } from "@/controllers/AuthController";

export async function POST(request: Request) {
  return authController.login(request);
}
