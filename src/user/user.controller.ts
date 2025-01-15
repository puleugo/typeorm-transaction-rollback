import {Body, Controller, Post} from '@nestjs/common';
import {UserService} from "src/user/user.service";
import {UserCreateRequest} from "src/user/dto/user-create.request";
import {UserCreatedResponse} from "src/user/dto/user-created.response";

@Controller('user')
export class UserController {
	constructor(
		private readonly userService: UserService
	) {}

	@Post()
	async register(@Body() dto: UserCreateRequest): Promise<UserCreatedResponse> {
		return this.userService.register(dto);
	}
}
