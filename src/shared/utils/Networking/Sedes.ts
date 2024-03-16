import BitBuffer from "@rbxts/bitbuffer";
import { Object } from "../Object";

export namespace Sedes {
	export class Serializer<T extends { [key: string]: any }> implements Method<T> {
		private methods: { [key in keyof T]: Method<T[key]> }; // mappedObject

		constructor(methods: Serializer<T>["methods"]) {
			this.methods = methods;
		}

		public Des = (buffer: BitBuffer): T => {
			let data: { [k: string]: any } = {};
			for (const key of Object.keys(this.methods)) {
				// Manual type assertion (caution: weakens type safety)
				data[key as string] = this.methods[key].Des(buffer);
			}
			return data as T; // Caution: manual type assertion weakens type safety
		};

		public Ser = (data: T, buffer?: BitBuffer): BitBuffer => {
			buffer ||= BitBuffer();

			for (const key of Object.keys(this.methods)) {
				// Manual type assertion (caution: weakens type safety)
				this.methods[key].Ser(data[key], buffer);
			}

			return buffer;
		};

		public ToSelected<R extends { [key: string]: any }>(keys: (keyof T)[]): Serializer<R> {
			let selectedMethods: { [key: string]: Method<any> } = {}; // mappedObject
			for (const key of keys) {
				selectedMethods[key as string] = this.methods[key]; // Assuming key exists in methods
			}

			return new Serializer<R>(selectedMethods as { [key in keyof R]: Method<any> });
		}

		// ... rest of the code (unchanged)
	}

	export const NoSerializer = new Serializer<{}>({});

	export type Method<T> = {
		Des: (buffer: BitBuffer) => T;
		Ser: (data: T, buffer: BitBuffer) => BitBuffer;
	};

	export const ToString = (): Method<string> => {
		return {
			Des: (buffer) => {
				return buffer.readString();
			},
			Ser: (data, buffer) => {
				buffer.writeString(data);
				return buffer;
			},
		};
	};

	export const ToUnsigned = (bits: number): Method<number> => {
		return {
			Des: (buffer) => {
				return buffer.readUnsigned(bits);
			},
			Ser: (data, buffer) => {
				buffer.writeUnsigned(bits, data);
				return buffer;
			},
		};
	};
	export const ToSigned = (bits: number): Method<number> => {
		return {
			Des: (buffer) => {
				return buffer.readSigned(bits);
			},
			Ser: (data, buffer) => {
				buffer.writeSigned(bits, data);
				return buffer;
			},
		};
	};

	export const ToFloat = (exponent: number, mantisa: number): Method<number> => {
		return {
			Des: (buffer) => {
				return buffer.readFloat(exponent, mantisa);
			},
			Ser: (data, buffer) => {
				buffer.writeFloat(exponent, mantisa, data);
				return buffer;
			},
		};
	};

	export const ToColor3 = (): Method<Color3> => {
		return {
			Des: (buffer) => {
				return buffer.readColor3();
			},
			Ser: (data, buffer) => {
				buffer.writeColor3(data);
				return buffer;
			},
		};
	};

	export const ToUnsignedVector2 = (xBits: number, yBits: number): Method<Vector2> => {
		return {
			Des: (buffer) => {
				return new Vector2(buffer.readUnsigned(xBits), buffer.readUnsigned(yBits));
			},
			Ser: (data, buffer) => {
				buffer.writeUnsigned(xBits, data.X);
				buffer.writeUnsigned(yBits, data.Y);
				return buffer;
			},
		};
	};

	export const ToVector2 = (): Method<Vector2> => {
		return {
			Des: (buffer) => {
				return buffer.readVector2();
			},
			Ser: (data, buffer) => {
				buffer.writeVector2(data);
				return buffer;
			},
		};
	};

	export const ToVector3 = (): Method<Vector3> => {
		return {
			Des: (buffer) => {
				return buffer.readVector3();
			},
			Ser: (data, buffer) => {
				buffer.writeVector3(data);
				return buffer;
			},
		};
	};

	export const ToArray = <T>(method: Method<T>): Method<T[]> => {
		return {
			Des: (buffer) => {
				let arr = [];
				while (buffer.readBits(1)[0] === 1) {
					const value = method.Des(buffer);
					arr.push(value);
				}
				return arr;
			},
			Ser: (data, buffer) => {
				for (const value of data) {
					buffer.writeBits(1);
					method.Ser(value, buffer);
				}
				buffer.writeBits(0);
				return buffer;
			},
		};
	};

	export const ToDict = <T>(method: Method<T>): Method<{ [key: string]: T }> => {
		return {
			Des: (buffer) => {
				const dict: { [key: string]: T } = {};
				while (buffer.readBits(1)[0] === 1) {
					const key = Sedes.ToString().Des(buffer);
					const value = method.Des(buffer);
					dict[key] = value;
				}
				return dict;
			},
			Ser: (data, buffer) => {
				for (const [key, value] of pairs(data)) {
					buffer.writeBits(1);
					Sedes.ToString().Ser(key as string, buffer);
					method.Ser(value, buffer);
				}
				buffer.writeBits(0);
				return buffer;
			},
		};
	};

	export const ToEmpty = (): Method<BitBuffer> => {
		return {
			Des: (buffer) => {
				return buffer;
			},
			Ser: (data, buffer) => {
				return buffer;
			},
		};
	};

	export const ToBool = (): Method<boolean> => {
		return {
			Des: (buffer) => {
				return buffer.readBits(1)[0] === 1 ? true : false;
			},
			Ser: (data, buffer) => {
				buffer.writeBits(data ? 1 : 0);
				return buffer;
			},
		};
	};
}
