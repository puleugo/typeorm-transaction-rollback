import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity('users')
export class UserEntity {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({unique: true})
	username: string;

	@Column({unique: true})
	nickname: string;

	@Column()
	password: string;

	constructor(props?: Partial<UserEntity>) {
		Object.assign(this, props);
	}
}
