import { UpsertRequest, newSecurity, NoResourceInfo, NoDocumentInfo, MeadowlarkId, TraceId } from '@edfi/meadowlark-core';
import * as utilities from '@edfi/meadowlark-utilities';
import { upsertDocument } from '../../src/repository/Upsert';
import * as DB from '../../src/repository/Db';

describe('given a transaction on a resource', () => {
  const retryNumberOfTimes = 2;
  let mongoClientMock = {};
  let replaceOneMock = jest.fn();
  const error = {
    codeName: 'WriteConflict',
  };

  beforeAll(() => {
    replaceOneMock = jest.fn().mockImplementation(async () => Promise.reject(error));

    jest.spyOn(DB, 'getDocumentCollection').mockReturnValue({
      replaceOne: replaceOneMock,
      findOne: jest.fn().mockReturnValue(null),
      updateMany: jest.fn(),
    } as any);

    mongoClientMock = {
      startSession: jest.fn().mockReturnValue({
        withTransaction: async (cb: any) => {
          await cb();
        },
        endSession: jest.fn(),
        abortTransaction: jest.fn(),
      }),
    };
  });

  describe('when it tries to upsert the same resource and mongo db returns write conflict error', () => {
    const newUpsertRequest = (): UpsertRequest => ({
      meadowlarkId: '' as MeadowlarkId,
      resourceInfo: NoResourceInfo,
      documentInfo: NoDocumentInfo,
      edfiDoc: {},
      validateDocumentReferencesExist: false,
      security: { ...newSecurity() },
      traceId: 'traceId' as TraceId,
    });
    let result;

    describe('given that a number of retries greater than zero has been configured', () => {
      beforeAll(async () => {
        jest.spyOn(DB, 'writeLockReferencedDocuments').mockImplementationOnce(async () => Promise.resolve());
        jest.spyOn(utilities.Config, 'get').mockReturnValue(retryNumberOfTimes);
        result = await upsertDocument(newUpsertRequest(), mongoClientMock as any);
      });

      it('returns error', async () => {
        expect(result.response).toBe('UPSERT_FAILURE_WRITE_CONFLICT');
      });

      it('should retry a number of times based on configuration', () => {
        expect(replaceOneMock).toHaveBeenCalledTimes(retryNumberOfTimes + 1);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });
    });

    describe('given that a number of retries equal to zero has been configured', () => {
      beforeAll(async () => {
        jest.spyOn(DB, 'writeLockReferencedDocuments').mockImplementationOnce(async () => Promise.resolve());
        jest.spyOn(utilities.Config, 'get').mockReturnValue(0);
        result = await upsertDocument(newUpsertRequest(), mongoClientMock as any);
      });

      it('should not retry', () => {
        expect(replaceOneMock).toHaveBeenCalledTimes(1);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });
    });

    describe('given that a number of retries was not configured', () => {
      beforeAll(async () => {
        jest.spyOn(DB, 'writeLockReferencedDocuments').mockImplementationOnce(async () => Promise.resolve());
        result = await upsertDocument(newUpsertRequest(), mongoClientMock as any);
      });

      it('should not retry', () => {
        expect(replaceOneMock).toHaveBeenCalledTimes(1);
      });

      afterAll(() => {
        jest.clearAllMocks();
      });
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
  });
});
