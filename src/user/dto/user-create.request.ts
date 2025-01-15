export class UserCreateRequest {
	nickname: string;
	username: string;
	password: string;

	constructor(props: UserCreateRequest) {
		Object.assign(this, props);
	}
}
