import isNil from 'lodash/isNil';

// Verify that obj1 and obj2 have different 'field' field
// Returns false if either object is null/undefined
export const ensureFieldHasChanged = (obj1: any, obj2: any) =>
  isNil(obj1) || isNil(obj2)
    ? () => false
    : (field: string) => obj1[field] !== obj2[field];
