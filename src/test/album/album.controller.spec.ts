import { Test, TestingModule } from '@nestjs/testing';
import { AlbumController } from 'src/controller';
import { AuditStatus } from 'src/enum';
import { AlbumService } from 'src/service';
import { IUserRequest } from 'src/typings';

const mockValue = {
  getRecommendAlbums: [
    {
      id: 4372,
      name: 'L.R.L.D.',
      artists: [
        {
          id: 2936,
          nickName: 'Qlank',
        },
        {
          id: 2935,
          nickName: 'Axel Boy',
        },
      ],
      cover: 'https://p2.music.126.net/SwB-O7677raASnn1-n25sw==/109951165484536344.jpg',
      styles: [
        {
          id: 1,
          name: 'House',
        },
        {
          id: 10,
          name: 'Bass House',
        },
      ],
      songs: [
        {
          id: 4650,
        },
      ],
    },
  ],
  getAlbumById: {
    id: 4790,
    name: 'Alpha',
    describe: null,
    commentedCount: 0,
    createTime: '2022-01-19T12:03:45.000Z',
    artists: [
      {
        id: 11049,
        nickName: 'Jauz',
      },
    ],
    songs: [
      {
        id: 5066,
        name: 'Alpha',
        artists: [
          {
            id: 11049,
            nickName: 'Jauz',
          },
        ],
        file: 'https://music.163.com/song/media/outer/url?id=499275135.mp3',
        cover: 'https://p2.music.126.net/d9KPVvWlX5DiaJgEBwQ1Xw==/109951164939371399.jpg',
      },
    ],
    cover: 'https://p2.music.126.net/d9KPVvWlX5DiaJgEBwQ1Xw==/109951164939371399.jpg',
    styles: [
      {
        id: 1,
        name: 'House',
      },
      {
        id: 10,
        name: 'Bass House',
      },
    ],
  },
  getAlbumByUserId: [
    {
      id: 5193,
      name: 'Far From Behind',
      artists: [
        {
          id: 1837,
          nickName: 'Clara Yates',
        },
        {
          id: 1971,
          nickName: 'Denis Kenzo',
        },
      ],
      cover: 'https://p2.music.126.net/JWcCGACoNYGqWKFfhUYulg==/109951166252657949.jpg',
      styles: [
        {
          id: 2,
          name: 'Trance',
        },
        {
          id: 13,
          name: 'Progressive Trance',
        },
      ],
      songs: [
        {
          id: 5464,
        },
        {
          id: 5465,
        },
      ],
    },
    {
      id: 5432,
      name: 'Other Side',
      artists: [
        {
          id: 1837,
          nickName: 'Clara Yates',
        },
        {
          id: 1971,
          nickName: 'Denis Kenzo',
        },
      ],
      cover: 'https://p2.music.126.net/B24CnzRiEnTMIQuJT3aWLg==/109951163160538490.jpg',
      styles: [
        {
          id: 2,
          name: 'Trance',
        },
        {
          id: 13,
          name: 'Progressive Trance',
        },
      ],
      songs: [
        {
          id: 5702,
        },
      ],
    },
  ],
  getApprovingAlbums: {
    data: [
      {
        id: 9406,
        name: 'afdsadfs',
        describe: 'adsfdafs',
        createTime: '2022-03-13T07:28:51.000Z',
        createBy: {
          id: 2,
          nickName: '水巷',
        },
        artists: [
          {
            id: 2,
            nickName: '水巷',
          },
        ],
        cover: '/fstatic/img/0X5R706oJHgq3dc72BjJceOZUx22mzNq.jpg',
        styles: [
          {
            id: 2,
            name: 'Trance',
          },
        ],
        songs: [
          {
            id: 9642,
            name: 'adfsdfa',
            describe: 'sdfadfas',
            styles: [
              {
                id: 2,
                name: 'Trance',
              },
            ],
            artists: [
              {
                id: 3,
                nickName: '徐梦圆',
              },
              {
                id: 4,
                nickName: '水巷手机',
              },
              {
                id: 5,
                nickName: '水巷手机2',
              },
            ],
            file: '/fstatic/song/pFa8L7JmDGKuo8VOIixhHf5DUehAUrEg.flac',
            cover: '/fstatic/img/Robc32bcjqrqjpyCRzPEoLAI0KK21qIF.jpg',
          },
        ],
      },
    ],
    totalCount: 1,
  },
  ok: {
    code: '1',
    message: 'ok',
    data: true,
  },
};

describe('AlbumController', () => {
  let albumController: AlbumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumController],
      providers: [
        {
          provide: AlbumService,
          useValue: {
            getRecommendAlbums: jest.fn().mockResolvedValue(mockValue.getRecommendAlbums),
            getAlbumById: jest.fn().mockResolvedValue(mockValue.getAlbumById),
            getAlbumByUserId: jest.fn().mockResolvedValue(mockValue.getAlbumByUserId),
            getApprovingAlbums: jest.fn().mockResolvedValue(mockValue.getApprovingAlbums),
            createAlbum: jest.fn().mockResolvedValue(mockValue.ok),
            changeAlbumsAuditStatus: jest.fn().mockResolvedValue(mockValue.ok),
          },
        },
      ],
    }).compile();

    albumController = module.get<AlbumController>(AlbumController);
  });

  describe('getRecommendAlubms', () => {
    it('获取推荐专辑', () => {
      const result = mockValue.getRecommendAlbums;
      expect(albumController.getRecommendAlbums(1)).resolves.toEqual(result);
    });
  });

  describe('getAlbumById', () => {
    it('根据id获取专辑', () => {
      const result = mockValue.getAlbumById;
      expect(albumController.getAlbumById(4790)).resolves.toEqual(result);
    });
  });

  describe('getAlbumByUserId', () => {
    it('根据制作人id获取专辑', () => {
      const result = mockValue.getAlbumByUserId;
      expect(albumController.getAlbumByUserId(1837, 1, 10)).resolves.toEqual(result);
    });
  });

  describe('getApprovingAlbums', () => {
    it('获取待审核专辑', () => {
      const result = mockValue.getApprovingAlbums;
      expect(albumController.getApprovingAlbums(1, 10)).resolves.toEqual(result);
    });
  });

  describe('createAlbum', () => {
    it('创建专辑', () => {
      const result = mockValue.ok;
      expect(
        albumController.createAlbum(
          {
            cover: 1,
            describe: '1111',
            name: '2222',
            songs: [
              {
                cover: 1,
                name: '2222',
                file: 2,
                describe: '',
                artist: [2],
                style: [3],
              },
            ],
          },
          { user: { id: 2 } } as IUserRequest,
        ),
      ).resolves.toEqual(result);
    });
  });

  describe('changeAlbumsAuditStatus', () => {
    it('修改专辑审核状态', () => {
      const result = mockValue.ok;
      expect(albumController.changeAlbumsAuditStatus(9407, AuditStatus.RESOLVE)).resolves.toEqual(
        result,
      );
    });
  });
});
