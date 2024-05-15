// package: da
// file: da.proto

import * as jspb from "google-protobuf";

export class Namespace extends jspb.Message {
  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Namespace.AsObject;
  static toObject(includeInstance: boolean, msg: Namespace): Namespace.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Namespace, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Namespace;
  static deserializeBinaryFromReader(message: Namespace, reader: jspb.BinaryReader): Namespace;
}

export namespace Namespace {
  export type AsObject = {
    value: Uint8Array | string,
  }
}

export class Blob extends jspb.Message {
  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Blob.AsObject;
  static toObject(includeInstance: boolean, msg: Blob): Blob.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Blob, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Blob;
  static deserializeBinaryFromReader(message: Blob, reader: jspb.BinaryReader): Blob;
}

export namespace Blob {
  export type AsObject = {
    value: Uint8Array | string,
  }
}

export class ID extends jspb.Message {
  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ID.AsObject;
  static toObject(includeInstance: boolean, msg: ID): ID.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ID, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ID;
  static deserializeBinaryFromReader(message: ID, reader: jspb.BinaryReader): ID;
}

export namespace ID {
  export type AsObject = {
    value: Uint8Array | string,
  }
}

export class Commitment extends jspb.Message {
  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Commitment.AsObject;
  static toObject(includeInstance: boolean, msg: Commitment): Commitment.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Commitment, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Commitment;
  static deserializeBinaryFromReader(message: Commitment, reader: jspb.BinaryReader): Commitment;
}

export namespace Commitment {
  export type AsObject = {
    value: Uint8Array | string,
  }
}

export class Proof extends jspb.Message {
  getValue(): Uint8Array | string;
  getValue_asU8(): Uint8Array;
  getValue_asB64(): string;
  setValue(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Proof.AsObject;
  static toObject(includeInstance: boolean, msg: Proof): Proof.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Proof, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Proof;
  static deserializeBinaryFromReader(message: Proof, reader: jspb.BinaryReader): Proof;
}

export namespace Proof {
  export type AsObject = {
    value: Uint8Array | string,
  }
}

export class MaxBlobSizeRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MaxBlobSizeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MaxBlobSizeRequest): MaxBlobSizeRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MaxBlobSizeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MaxBlobSizeRequest;
  static deserializeBinaryFromReader(message: MaxBlobSizeRequest, reader: jspb.BinaryReader): MaxBlobSizeRequest;
}

export namespace MaxBlobSizeRequest {
  export type AsObject = {
  }
}

export class MaxBlobSizeResponse extends jspb.Message {
  getMaxBlobSize(): number;
  setMaxBlobSize(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MaxBlobSizeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: MaxBlobSizeResponse): MaxBlobSizeResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MaxBlobSizeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MaxBlobSizeResponse;
  static deserializeBinaryFromReader(message: MaxBlobSizeResponse, reader: jspb.BinaryReader): MaxBlobSizeResponse;
}

export namespace MaxBlobSizeResponse {
  export type AsObject = {
    maxBlobSize: number,
  }
}

export class GetRequest extends jspb.Message {
  clearIdsList(): void;
  getIdsList(): Array<ID>;
  setIdsList(value: Array<ID>): void;
  addIds(value?: ID, index?: number): ID;

  hasNamespace(): boolean;
  clearNamespace(): void;
  getNamespace(): Namespace | undefined;
  setNamespace(value?: Namespace): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetRequest): GetRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetRequest;
  static deserializeBinaryFromReader(message: GetRequest, reader: jspb.BinaryReader): GetRequest;
}

export namespace GetRequest {
  export type AsObject = {
    idsList: Array<ID.AsObject>,
    namespace?: Namespace.AsObject,
  }
}

export class GetResponse extends jspb.Message {
  clearBlobsList(): void;
  getBlobsList(): Array<Blob>;
  setBlobsList(value: Array<Blob>): void;
  addBlobs(value?: Blob, index?: number): Blob;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetResponse): GetResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetResponse;
  static deserializeBinaryFromReader(message: GetResponse, reader: jspb.BinaryReader): GetResponse;
}

export namespace GetResponse {
  export type AsObject = {
    blobsList: Array<Blob.AsObject>,
  }
}

export class GetIDsRequest extends jspb.Message {
  getHeight(): number;
  setHeight(value: number): void;

  hasNamespace(): boolean;
  clearNamespace(): void;
  getNamespace(): Namespace | undefined;
  setNamespace(value?: Namespace): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetIDsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetIDsRequest): GetIDsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetIDsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetIDsRequest;
  static deserializeBinaryFromReader(message: GetIDsRequest, reader: jspb.BinaryReader): GetIDsRequest;
}

export namespace GetIDsRequest {
  export type AsObject = {
    height: number,
    namespace?: Namespace.AsObject,
  }
}

export class GetIDsResponse extends jspb.Message {
  clearIdsList(): void;
  getIdsList(): Array<ID>;
  setIdsList(value: Array<ID>): void;
  addIds(value?: ID, index?: number): ID;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetIDsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetIDsResponse): GetIDsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetIDsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetIDsResponse;
  static deserializeBinaryFromReader(message: GetIDsResponse, reader: jspb.BinaryReader): GetIDsResponse;
}

export namespace GetIDsResponse {
  export type AsObject = {
    idsList: Array<ID.AsObject>,
  }
}

export class GetProofsRequest extends jspb.Message {
  clearIdsList(): void;
  getIdsList(): Array<ID>;
  setIdsList(value: Array<ID>): void;
  addIds(value?: ID, index?: number): ID;

  hasNamespace(): boolean;
  clearNamespace(): void;
  getNamespace(): Namespace | undefined;
  setNamespace(value?: Namespace): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetProofsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetProofsRequest): GetProofsRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetProofsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetProofsRequest;
  static deserializeBinaryFromReader(message: GetProofsRequest, reader: jspb.BinaryReader): GetProofsRequest;
}

export namespace GetProofsRequest {
  export type AsObject = {
    idsList: Array<ID.AsObject>,
    namespace?: Namespace.AsObject,
  }
}

export class GetProofsResponse extends jspb.Message {
  clearProofsList(): void;
  getProofsList(): Array<Proof>;
  setProofsList(value: Array<Proof>): void;
  addProofs(value?: Proof, index?: number): Proof;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetProofsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetProofsResponse): GetProofsResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetProofsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetProofsResponse;
  static deserializeBinaryFromReader(message: GetProofsResponse, reader: jspb.BinaryReader): GetProofsResponse;
}

export namespace GetProofsResponse {
  export type AsObject = {
    proofsList: Array<Proof.AsObject>,
  }
}

export class CommitRequest extends jspb.Message {
  clearBlobsList(): void;
  getBlobsList(): Array<Blob>;
  setBlobsList(value: Array<Blob>): void;
  addBlobs(value?: Blob, index?: number): Blob;

  hasNamespace(): boolean;
  clearNamespace(): void;
  getNamespace(): Namespace | undefined;
  setNamespace(value?: Namespace): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommitRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CommitRequest): CommitRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommitRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommitRequest;
  static deserializeBinaryFromReader(message: CommitRequest, reader: jspb.BinaryReader): CommitRequest;
}

export namespace CommitRequest {
  export type AsObject = {
    blobsList: Array<Blob.AsObject>,
    namespace?: Namespace.AsObject,
  }
}

export class CommitResponse extends jspb.Message {
  clearCommitmentsList(): void;
  getCommitmentsList(): Array<Commitment>;
  setCommitmentsList(value: Array<Commitment>): void;
  addCommitments(value?: Commitment, index?: number): Commitment;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CommitResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CommitResponse): CommitResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CommitResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CommitResponse;
  static deserializeBinaryFromReader(message: CommitResponse, reader: jspb.BinaryReader): CommitResponse;
}

export namespace CommitResponse {
  export type AsObject = {
    commitmentsList: Array<Commitment.AsObject>,
  }
}

export class SubmitRequest extends jspb.Message {
  clearBlobsList(): void;
  getBlobsList(): Array<Blob>;
  setBlobsList(value: Array<Blob>): void;
  addBlobs(value?: Blob, index?: number): Blob;

  getGasPrice(): number;
  setGasPrice(value: number): void;

  hasNamespace(): boolean;
  clearNamespace(): void;
  getNamespace(): Namespace | undefined;
  setNamespace(value?: Namespace): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SubmitRequest): SubmitRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubmitRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubmitRequest;
  static deserializeBinaryFromReader(message: SubmitRequest, reader: jspb.BinaryReader): SubmitRequest;
}

export namespace SubmitRequest {
  export type AsObject = {
    blobsList: Array<Blob.AsObject>,
    gasPrice: number,
    namespace?: Namespace.AsObject,
  }
}

export class SubmitResponse extends jspb.Message {
  clearIdsList(): void;
  getIdsList(): Array<ID>;
  setIdsList(value: Array<ID>): void;
  addIds(value?: ID, index?: number): ID;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubmitResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SubmitResponse): SubmitResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SubmitResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubmitResponse;
  static deserializeBinaryFromReader(message: SubmitResponse, reader: jspb.BinaryReader): SubmitResponse;
}

export namespace SubmitResponse {
  export type AsObject = {
    idsList: Array<ID.AsObject>,
  }
}

export class ValidateRequest extends jspb.Message {
  clearIdsList(): void;
  getIdsList(): Array<ID>;
  setIdsList(value: Array<ID>): void;
  addIds(value?: ID, index?: number): ID;

  clearProofsList(): void;
  getProofsList(): Array<Proof>;
  setProofsList(value: Array<Proof>): void;
  addProofs(value?: Proof, index?: number): Proof;

  hasNamespace(): boolean;
  clearNamespace(): void;
  getNamespace(): Namespace | undefined;
  setNamespace(value?: Namespace): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidateRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ValidateRequest): ValidateRequest.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidateRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidateRequest;
  static deserializeBinaryFromReader(message: ValidateRequest, reader: jspb.BinaryReader): ValidateRequest;
}

export namespace ValidateRequest {
  export type AsObject = {
    idsList: Array<ID.AsObject>,
    proofsList: Array<Proof.AsObject>,
    namespace?: Namespace.AsObject,
  }
}

export class ValidateResponse extends jspb.Message {
  clearResultsList(): void;
  getResultsList(): Array<boolean>;
  setResultsList(value: Array<boolean>): void;
  addResults(value: boolean, index?: number): boolean;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidateResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ValidateResponse): ValidateResponse.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidateResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidateResponse;
  static deserializeBinaryFromReader(message: ValidateResponse, reader: jspb.BinaryReader): ValidateResponse;
}

export namespace ValidateResponse {
  export type AsObject = {
    resultsList: Array<boolean>,
  }
}

