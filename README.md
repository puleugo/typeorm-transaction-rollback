# Transaction Rollback 전략을 활용한 테스트 격리성 보장 예제 프로젝트
Transaction Rollback 전략을 활용하여 테스트 격리성을 보장하는 예제 프로젝트입니다.

# 설명

```typescript
import {afterEach, beforeAll, describe} from "@jest/globals";
import {UserEntity} from "./user.entity";
import {QueryRunnerManager} from "./data-source-manager";
import {Test} from "@nestjs/testing";
import {AppModule} from "./app.module";

describe('Transaction Rollback 전략을 활용한 테스트 격리성 보장 예제 프로젝트', () => {
	let queryRunnerManager: QueryRunnerManager;

	let userFactory: Repository<UserEntity>

	beforeAll(async () => {
		// 1️⃣ QueryRunnerManager 초기화
		queryRunnerManager = await new QueryRunnerManager().initialize();
	})

	beforeEach(async () => {
		// 2️⃣ 세션 생성 & 트랜잭션 시작
		await queryRunnerManager.start();
		const moduleBuilder = Test.createTestingModule({
			imports: [AppModule],
		});
		const module = await queryRunnerManager
			// 3️⃣ ModuleBuilder가 가지고 있는 Repository(Default: Prototype 세션)를 싱글톤 세션을 주입한 Repository로 교체한다.
            		.injectRepositories(moduleBuilder)
            		.compile();

		userFactory = module.get(getRepositoryToken(UserEntity));
	});

	afterEach(async () => {
		// 4️⃣ 트랜잭션 롤백 & 세션 종료
        	await queryRunnerManager.end();
	})
});
```
# 실행 방법
    
```shell
$ nvm use
$ npm install
$ npm run test
```
