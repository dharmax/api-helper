import {StoreApi} from "../../src/api-helper";

export const testBaseUrl = 'http://localhost:8080'

class TestStore extends StoreApi{
    constructor( ) {
        super(testBaseUrl, false)
    }

}

export const testStore  = new TestStore()