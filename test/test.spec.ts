import {expect, describe, test, beforeEach} from 'vitest';
import request from 'supertest';
import {StoreApi, setFetchImplementation} from '../src/api-helper.js';

const testStore = new class extends StoreApi {
    constructor() {
        super('api/test');
    }
}();

describe('GET test', () => {
    beforeEach(() => {
        setFetchImplementation(() => Promise.resolve(new Response(JSON.stringify({data: 'test'}), {status: 200})));
    });

    test('should get resource', async () => {
        const response = await testStore.get('resource-id');
        expect(response).toBeDefined();
    });
});
describe('POST test', () => {
    beforeEach(() => {
        setFetchImplementation(() => Promise.resolve(new Response(JSON.stringify({data: 'created'}), {status: 201})));
    });

    test('should create resource', async () => {
        const data = {name: 'Test Resource'};
        const response = await testStore.create(data);
        expect(response).toBeDefined();
    });
});
describe('Update test', () => {
    beforeEach(() => {
        setFetchImplementation(() => Promise.resolve(new Response(JSON.stringify({data: 'updated'}), {status: 200})));
    });

    test('should update resource', async () => {
        const data = {name: 'Updated Resource'};
        const response = await testStore.update('resource-id', data);
        expect(response).toBeDefined();
    });
});

describe('Delete test', () => {
    beforeEach(() => {
        setFetchImplementation(() => Promise.resolve(new Response(null, {status: 204})));
    });

    test('should delete resource', async () => {
        const response = await testStore.remove('resource-id');
        expect(response).toBeDefined();
    });
});

describe('Custom operation test', () => {
    beforeEach(() => {
        setFetchImplementation(() => Promise.resolve(new Response(JSON.stringify({data: 'custom'}), {status: 200})));
    });

    test('should perform custom operation', async () => {
        const response = await testStore.operation('custom-operation', {param: 'value'});
        expect(response).toBeDefined();
    });
});