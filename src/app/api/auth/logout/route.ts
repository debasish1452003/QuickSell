import { authController } from "@/controllers/AuthController";

export function GET(request: Request) {
  return authController.logout(request);
}

export function POST(request: Request) {
  return authController.logout(request);
}
