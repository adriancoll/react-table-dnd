import Cookies from "js-cookie";

export const cookieStorage = {
  getItem: (name: string) => {
    const item = Cookies.get(name);
    return item ? Promise.resolve(item) : Promise.reject('No item found');
  },
  setItem: (name: string, value: string) => {
    Cookies.set(name, value, { expires: 7 }); // Cookies expiran en 7 días
    return Promise.resolve(true);
  },
  removeItem: (name: string) => {
    Cookies.remove(name);
    return Promise.resolve();
  },
};