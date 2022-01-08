import { Deserializer, Serializer } from './typedef';


export class SerializerService<Serialize, Deserialize, Serialized = Serialize, Deserialized = Deserialize> {
  readonly #serializer?: Serializer<Serialize, Serialized>;
  readonly #deserializer?: Deserializer<Deserialize, Deserialized>;

  constructor(serializer?: Serializer<Serialize, Serialized>, deserializer?: Deserializer<Deserialize, Deserialized>) {
    this.#serializer = serializer;
    this.#deserializer = deserializer;
  }

  serialize = (data: Serialize): Serialized  | string => {
    const serializedData = this.#serializer?.(data) || data;

    return typeof serializedData === 'string' ? serializedData : JSON.stringify(data);
  }

  deserialize = (data: Deserialize): Deserialized => {
    const deserializedData = this.#deserializer?.(data) || data;

    return typeof deserializedData === 'string' ? JSON.parse(deserializedData) : deserializedData;
  }
}
