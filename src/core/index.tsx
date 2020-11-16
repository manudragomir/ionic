export const config = {
    headers: {
      'Content-Type': 'application/json'
    }
};

export const authConfig = (token?: string) => ({
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
});

export const withoutHttpUrl = 'localhost:3333'
export const baseUrl = 'http://localhost:3333';