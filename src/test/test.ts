import { expect } from 'chai';
import 'mocha';
import { testStore } from './helpers/base-class';

testStore.setserverUrl('http://localhost:3000')
describe('Hello function', () => {
  it('should return hello world', () => {
    const result = testStore.get([]);
    console.log({result})
    expect(result).to.equal(true);
  });
});