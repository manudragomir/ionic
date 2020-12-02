import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

export const authOptimisedConfig = (token?: string, date?: string) => (
  {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'If-Modified-Since': `${date}`
    }
  }
);

export function storeDate(date: string) {
  (async() => {
    await Storage.set({
      key: 'DATE',
      value: JSON.stringify(date)
    })
  })();
  console.log("stored date");
}

export const loadDate: () => Promise<string | null> = async () => {
  const ret = await Storage.get({ key: 'DATE' });
  if(ret.value !== null){
    return JSON.parse(ret.value);
    }
  else {
    return null;
  }
}
