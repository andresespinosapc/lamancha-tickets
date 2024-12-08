import Hashids from 'hashids';
import { env } from '~/env';

const hashids = new Hashids(env.HASHIDS_SALT, 8);

export class HashidService {
  encode(number: number): string {
    return hashids.encode(number);
  }

  decode(id: string) {
    return hashids.decode(id)[0] as number | undefined;
  }
}
