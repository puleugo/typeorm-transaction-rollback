import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "src/user/user.entity";
import {Repository} from "typeorm";

@Injectable()
export class UserRepository {
	constructor(@InjectRepository(UserEntity) private readonly repository: Repository<UserEntity>) {
	}

	async existNickname(nickname: string): Promise<boolean> {
		return await this.repository.exists({where: {nickname}});
	}

	async existUsername(username: string): Promise<boolean> {
		return await this.repository.exists({where: {username}});
	}

	async save(userEntity: UserEntity): Promise<UserEntity> {
		return await this.repository.save(userEntity);
	}
}
