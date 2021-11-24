import {ServerRoute} from 'hapi'
export const mainRoutes: ServerRoute[] = [
  {
    method: 'GET',
    path: '/',
    handler: (request: any, h: any) => {
        return true;
    }
  },
  {
    method: 'POST',
    path: '/',
    handler: (request: any, h: any) => {
      return  !!request.payload.data
    }
  },
  {
    method: 'PUT',
    path: '/',
    handler: (request: any, h: any) => {
      return  !!request.payload.data
    }
  }
]