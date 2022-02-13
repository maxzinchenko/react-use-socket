import { Deserializer, Serializer } from './typedef';


export class SerializerService<Serialize, Deserialize, Serialized = Serialize, Deserialized = Deserialize> {
  readonly #serializer?: Serializer<Serialize, Serialized>;
  readonly #deserializer?: Deserializer<Deserialize, Deserialized>;

  constructor(serializer?: Serializer<Serialize, Serialized>, deserializer?: Deserializer<Deserialize, Deserialized>) {
    this.#serializer = serializer;
    this.#deserializer = deserializer;
  }

  static deserializeJSON = <T extends {} = {}>(data: string): T => {
    try {
      return JSON.parse(data);
    } catch {
      return data as any;
    }
  }

  static serializeJSON = <T extends {} = {}>(data: T) => {
    if (typeof data === 'string') return data;

    return JSON.stringify(data);
  }


  serialize = (data: Serialize): string => {
    const serializedData = this.#serializer?.(data) || data;

    return SerializerService.serializeJSON(serializedData);
  }

  deserialize = (data: Deserialize): Deserialize | Deserialized => {
    return this.#deserializer?.(data) || data;
  }
}
