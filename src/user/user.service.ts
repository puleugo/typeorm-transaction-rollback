import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import {UserCreateRequest} from "src/user/dto/user-create.request";
import {UserEntity} from "src/user/user.entity";
import {UserRepository} from "src/user/user.repository";

@Injectable()
export class UserService {
	constructor(@Inject(UserRepository) private readonly userRepository: UserRepository) {}

	async register(dto: UserCreateRequest): Promise<UserEntity> {
		if (await this.userRepository.existUsername(dto.username)) {
			throw new BadRequestException('username already exists');
		}
		if (await this.userRepository.existNickname(dto.nickname)) {
			throw new BadRequestException('nickname already exists');
		}

		return await this.userRepository.save(new UserEntity(dto));
	}
}
