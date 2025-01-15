import {DataSource, QueryRunner, Repository} from "typeorm";
import {getRepositoryToken} from "@nestjs/typeorm";
import {UserEntity} from "src/user/user.entity";
import {TestingModuleBuilder} from "@nestjs/testing";

/**
 * TestModule를 생성할 시 QueryRunner를 의존하는 객체에게 싱글톤의 인스턴스를 주입해준다.
 * 하나의 커넥션만을 필요로하는 트랜잭션 테스트 격리성 보장 전략에 사용된다.
 * @see TestingModule
 * @example
 * beforeAll(async () => {
 * 		queryRunnerManager = new QueryRunnerManager();
 * 		await queryRunnerManager.initialize();
 * 	})
 *
 * 	beforeEach(async () => {
 * 		await queryRunnerManager.startTransaction();
 * 		const moduleBuilder = Test.createTestingModule({
 * 			imports: [AppModule],
 * 		});
 * 		const module = await queryRunnerManager.injectRepositories(moduleBuilder).compile();
 *
 * 		userFactory = module.get(getRepositoryToken(UserEntity));
 * 	});
 *
 * 	afterEach(async () => {
 * 		await queryRunnerManager.rollbackTransaction();
 * 	})
 */
export class QueryRunnerManager {
	private readonly entities = [UserEntity];
	private readonly dataSource: DataSource;
	private queryRunner: QueryRunner;

	constructor() {
		this.dataSource = new DataSource({
			type: 'mysql',
			host: 'localhost',
			port: 3306,
			username: 'mysql',
			password: 'mysql',
			database: 'test-db',
			entities: this.entities,
			logging: 'all',
		});
	}

	async initialize(): Promise<QueryRunnerManager> {
		await this.dataSource.initialize();
		return this;
	}

	/**
	 * 새로운 세션을 생성하고 트랜잭션을 시작한다.
	 */
	async start(): Promise<QueryRunnerManager> {
		if (!this.dataSource.isInitialized) {
			await this.dataSource.initialize();
		}
		this.queryRunner = this.dataSource.createQueryRunner();
		await this.queryRunner.startTransaction();
		return this;
	}

	/**
	 * 트랜잭션을 커밋하고 세션을 종료한다.
	 */
	async end() {
		await this.queryRunner.rollbackTransaction();
		await this.queryRunner.release();
	}

	/**
	 * QueryRunner를 의존하는 Repository 객체에게 싱글톤 커넥션을 가르키는 Repository를 주입한다.
	 * @param builder
	 */
	injectRepositories(builder: TestingModuleBuilder): TestingModuleBuilder {
		this.getProviderWithToken().forEach((value) => {
			builder.overrideProvider(value.token).useValue(value.provider);
		});
		return builder;
	}

	private getProviderWithToken(): {
		token: Function | string;
		provider: Repository<any>;
	}[] {
		if (!this.queryRunner) {
			throw new Error('QueryRunner is not initialized');
		}
		return this.entities.map((entity) => ({
			token: getRepositoryToken(entity),
			provider: new Repository(
				entity,
				this.queryRunner.manager,
				this.queryRunner,
			),
		}));
	}

}
