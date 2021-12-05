// import { MockOf, Spec } from '@aromajs/sinon';
//
// describe('SomeService Unit Test', () => {
//   let someService: SomeService;
//   let logger: MockOf<Logger>;
//   let userService: MockOf<UserService>;
//
//   const USERS_DATA = [{ name: 'user', email: 'user@user.com' }];
//
//   beforeAll(() => {
//     const { unit, unitRef } = Spec.createUnit<SomeService>(SomeService)
//       .mock(FeatureFlagService)
//       .using({
//         isFeatureOn: () => Promise.resolve(true),
//       })
//       // All the rest of the dependencies will be mocked
//       // Pass true if you want to deep mock all of the rest
//       .compile();
//
//     someService = unit;
//     userService = unitRef.get(UserService);
//   });
//
//   describe('When something happens', () => {
//     beforeAll(() => (userService.getUsers.mockResolvedValueOnce(USERS_DATA));
//
//     test('then check something', async () => {
//       const result = await service.doSomethingNice();
//
//       expect(logger.log).toHaveBeenCalledWith(USERS_DATA);
//       expect(result).toEqual(USERS_DATA);
//     });
//   });
// });
