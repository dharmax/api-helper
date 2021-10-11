# API-Helper

## Install
`npm install @dharmax/api-helper`



## General & Features
This library as one main class, which is StoreApi. Since ReST has a resource-oriented, you are supposed to
define, virtually, a store for each "resource" (e.g. UserStore) - a class and a singleton, of course - which will, by default,
require only the base name of the url ("users", or "api/users", typically, for that example) and you'll have
automatically the default REST verbs for it, with the basic functionality. Naturally, you'd want to add 
more operations and add some types, and when relevant - broadcast events, and so on - that's up to you,
in your derived UserStore class, etc. 

A spinner will also appear while waiting for server replies. You have to add CSS rules for "spinner" in order to see it.
Also, you can set the errorHandler to point to your application error handler, for nice error messages.


# example      
```typescript
export userStore = new class extends StoreApi {

    constructor() {
        super('users')
    }

    async getMyProfile() {
        return this.get('myProfile')
    }

    async getPublicProfile(shortLink: string) {
        return this.get(['publicProfile', shortLink])
    }

    async updateMe(fields) {
        return super.update('self', fields)
    }

    async resetPassword(email: string) {
        return super.operation('resetPassword', {email})
    }

    async changePassword(token: string, password: string) {

        return super.operation('changePassword', {newPassword: password, token},)
    }

    async getFriendship(sourceId: string, targetId: string): Promise<{ follow: boolean, follows: boolean, friend: boolean }> {
        return this.get('friendship', {sourceId, targetId})
    }

    deleteNotification(notificationId: string) {
        return this.remove(notificationId, 'notifications')
    }
}

``` 

# License
This library provided as-is, with absolutely no guarantee. Enjoy, support, etc, in
short, it's [ISC](https://opensource.org/licenses/ISC).

# Support me
I'd be happy to receive a star 
  

```
