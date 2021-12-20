import { expect } from 'chai';
import 'mocha';
import { testStore } from './helpers/base-class';

describe('GET test', () => {
  it('should return true', async () => {
    const result = await testStore.get([]);
    expect(result).to.equal(true);
  });
});
describe('POST test', () => {
  it('should return true', async () => {
    const data = {};
    const result = await testStore.post({data});
    expect(result).to.equal(true);
  });
});
describe('Update test', () => {
  it('should return true', async () => {
    const result = await testStore.update('1',[]);
    expect(result).to.equal(true);
  });
});