/**
 * Creates a deep copy of an object.
 * @param {object} obj The object to copy.
 */
export function deepCopy(obj: Record<string, any>): any {
  return JSON.parse(JSON.stringify(obj));
}

export function deepClone(obj: Record<string, any>): Record<string, any> {
  let copy;

  // Handle the 3 simple types, and null or undefined
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date
  if (obj instanceof Date) {
    copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    copy = [];
    for (let i = 0; i < obj.length; i++) {
      copy[i] = deepClone(obj[i]);
    }
    return copy;
  }

  // Handle Function
  if (obj instanceof Function) {
    copy = function() {
      return obj.apply(this, arguments);
    };
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    copy = {} as any;
    for (const attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = deepClone((obj as any)[attr]);
      }
    }
    return copy;
  }

  throw new Error(`Unable to copy obj as type isn't supported ${(obj as any).constructor.name}`);
}
