import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { Public } from "./auth/decorators/public.decorator";

@ApiTags("app")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Get application health status" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Application is running properly",
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
