import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from 'src/controller/user.controller';
import { UserService } from 'src/service/user.service';

describe('UserController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUserByUserName: jest.fn().mockResolvedValue({
              id: '39ad37d7-00f7-4692-8e4a-a2e58585bd0a',
              nickName: 'test',
              userName: 'test',
            }),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
  });

  describe('root', () => {
    it('根据用户名查询用户', () => {
      const result = {
        id: '39ad37d7-00f7-4692-8e4a-a2e58585bd0a',
        nickName: 'test',
        userName: 'test',
      };
      expect(userController.getUserByUserName('test')).resolves.toEqual(result);
    });
  });
});
