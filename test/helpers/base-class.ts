import {StoreApi} from "../../src/api-helper";


class TestStore extends StoreApi{
    constructor(port = 3001) {
        super('http://localhost:'+port, false)
    }

}

export const testStore  = new TestStore()