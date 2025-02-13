// SPDX-License-Identifier: Apache-2.0
// Licensed to the Ed-Fi Alliance under one or more agreements.
// The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
// See the LICENSE and NOTICES files in the project root for more information.

import { MeadowlarkId } from '../../src/model/BrandedTypes';
import { meadowlarkIdForDocumentIdentity } from '../../src/model/DocumentIdentity';
import { BaseResourceInfo } from '../../src/model/ResourceInfo';
import { isMeadowlarkIdValidForResource, isMeadowlarkIdWellFormed } from '../../src/validation/DocumentIdValidator';

describe('given a valid id', () => {
  let id: MeadowlarkId;
  let validResourceInfo: BaseResourceInfo;

  beforeAll(async () => {
    validResourceInfo = {
      isDescriptor: false,
      projectName: 'ProjectName',
      resourceName: 'ResourceName',
    };

    const validDocumentIdentity = {
      key: 'value',
    };

    // Act
    id = meadowlarkIdForDocumentIdentity(validResourceInfo, validDocumentIdentity);
  });

  it('should be well formed', () => {
    expect(isMeadowlarkIdWellFormed(id)).toEqual(true);
  });

  it('should be valid for the provided resource info', () => {
    expect(isMeadowlarkIdValidForResource(id, validResourceInfo)).toEqual(true);
  });
});

describe('given a valid id with a mismatched resource info', () => {
  let id: MeadowlarkId;
  let mismatchedResourceInfo: BaseResourceInfo;

  beforeAll(async () => {
    const validResourceInfo: BaseResourceInfo = {
      isDescriptor: false,
      projectName: 'ProjectName',
      resourceName: 'ResourceName',
    };

    mismatchedResourceInfo = {
      isDescriptor: false,
      projectName: 'MismatchedProjectName',
      resourceName: 'MismatchedResourceName',
    };

    const validDocumentIdentity = {
      key: 'value',
    };

    // Act
    id = meadowlarkIdForDocumentIdentity(validResourceInfo, validDocumentIdentity);
  });

  it('should be well formed', () => {
    expect(isMeadowlarkIdWellFormed(id)).toEqual(true);
  });

  it('should be invalid for the mismatched resource info', () => {
    expect(isMeadowlarkIdValidForResource(id, mismatchedResourceInfo)).toEqual(false);
  });
});

describe('given an invalid id', () => {
  const invalidId: MeadowlarkId = 'NotAValidId' as MeadowlarkId;
  const mismatchedResourceInfo: BaseResourceInfo = {
    isDescriptor: false,
    projectName: 'MismatchedProjectName',
    resourceName: 'MismatchedResourceName',
  };

  it('should not be well formed', () => {
    expect(isMeadowlarkIdWellFormed(invalidId)).toEqual(false);
  });

  it('should be invalid for the mismatched resource info', () => {
    expect(isMeadowlarkIdValidForResource(invalidId, mismatchedResourceInfo)).toEqual(false);
  });
});
