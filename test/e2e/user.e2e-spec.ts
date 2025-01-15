import {INestApplication} from "@nestjs/common";
import {Repository} from "typeorm";
import {QueryRunnerManager} from "../util/data-source-manager";
import {Test} from "@nestjs/testing";
import {AppModule} from "src/app.module";
import {UserEntity} from "src/user/user.entity";
import {getRepositoryToken} from "@nestjs/typeorm";
import {UserCreateRequest} from "src/user/dto/user-create.request";
import {faker} from "@faker-js/faker/locale/en";
import * as request from 'supertest';

describe('User E2E Spec', () => {
	let app: INestApplication;

	let queryRunnerManager: QueryRunnerManager;

	let userFactory: Repository<UserEntity>;

	beforeAll(async () => {
		queryRunnerManager = await new QueryRunnerManager().initialize();
	})

	beforeEach(async () => {
		await queryRunnerManager.start();
		const moduleBuilder = Test.createTestingModule({
			imports: [AppModule],
		});
		const module = await queryRunnerManager.injectRepositories(moduleBuilder).compile();

		userFactory = module.get(getRepositoryToken(UserEntity));

		app = module.createNestApplication();
		await app.init();
	});

	afterEach(async () => {
		await queryRunnerManager.end();
		await app.close();
	});

	describe('POST /user', () => {
		it('should return 201', async () => {
			const dto = new UserCreateRequest({
				nickname: faker.internet.username(),
				username: faker.internet.username(),
				password: faker.internet.password(),
			})

			const response = await request(app.getHttpServer())
				.post('/user')
				.send(dto);

			expect(response.status).toBe(201);
		})

		it('should register user', async () => {
			//given
			const dto = new UserCreateRequest({
				nickname: faker.internet.username(),
				username: faker.internet.username(),
				password: faker.internet.password(),
			})

			// when
			await request(app.getHttpServer()).post('/user').send(dto);

			// then
			const user = await userFactory.findOneBy({username: dto.username});

			expect(user).toBeDefined();
			expect(user.username).toBe(dto.username);
			expect(user.nickname).toBe(dto.nickname);
		})

		it('should return 400 when username is duplicated', async () => {
			// given
			const duplicatedUsername = faker.internet.username();
			await userFactory.save(new UserEntity({
				nickname: faker.internet.username(),
				username: duplicatedUsername,
				password: faker.internet.password(),
			}));

			const dto = new UserCreateRequest({
				nickname: faker.internet.username(),
				username: duplicatedUsername,
				password: faker.internet.password(),
			})

			// when
			const response = await request(app.getHttpServer()).post('/user').send(dto);

			// then
			expect(response.status).toBe(400);
		})

		it('should return 400 when nickname is duplicated', async () => {
			// given
			const duplicatedNickname = faker.internet.username();
			await userFactory.save(new UserEntity({
				nickname: duplicatedNickname,
				username: faker.internet.username(),
				password: faker.internet.password(),
			}));

			const dto = new UserCreateRequest({
				nickname: duplicatedNickname,
				username: faker.internet.username(),
				password: faker.internet.password(),
			})

			// when
			const response = await request(app.getHttpServer()).post('/user').send(dto);

			// then
			expect(response.status).toBe(400);
		})
	})
})
