import { setDefaultBaseUrl, StoreApi } from "../../api-helper";

class TestStore extends StoreApi{
    constructor() {
        super('')
    }

    public setserverUrl(host: string): void{
        setDefaultBaseUrl(host);
    }
}

export const testStore  = new TestStore()