import { authController } from "@/controllers/AuthController";

export function GET(request: Request) {
  return authController.finishGoogle(request);
}
