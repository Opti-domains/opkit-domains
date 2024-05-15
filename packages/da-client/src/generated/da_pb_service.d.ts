// package: da
// file: da.proto

import * as da_pb from "./da_pb";
import {grpc} from "@improbable-eng/grpc-web";

type DAServiceMaxBlobSize = {
  readonly methodName: string;
  readonly service: typeof DAService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof da_pb.MaxBlobSizeRequest;
  readonly responseType: typeof da_pb.MaxBlobSizeResponse;
};

type DAServiceGet = {
  readonly methodName: string;
  readonly service: typeof DAService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof da_pb.GetRequest;
  readonly responseType: typeof da_pb.GetResponse;
};

type DAServiceGetIDs = {
  readonly methodName: string;
  readonly service: typeof DAService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof da_pb.GetIDsRequest;
  readonly responseType: typeof da_pb.GetIDsResponse;
};

type DAServiceGetProofs = {
  readonly methodName: string;
  readonly service: typeof DAService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof da_pb.GetProofsRequest;
  readonly responseType: typeof da_pb.GetProofsResponse;
};

type DAServiceCommit = {
  readonly methodName: string;
  readonly service: typeof DAService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof da_pb.CommitRequest;
  readonly responseType: typeof da_pb.CommitResponse;
};

type DAServiceSubmit = {
  readonly methodName: string;
  readonly service: typeof DAService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof da_pb.SubmitRequest;
  readonly responseType: typeof da_pb.SubmitResponse;
};

type DAServiceValidate = {
  readonly methodName: string;
  readonly service: typeof DAService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof da_pb.ValidateRequest;
  readonly responseType: typeof da_pb.ValidateResponse;
};

export class DAService {
  static readonly serviceName: string;
  static readonly MaxBlobSize: DAServiceMaxBlobSize;
  static readonly Get: DAServiceGet;
  static readonly GetIDs: DAServiceGetIDs;
  static readonly GetProofs: DAServiceGetProofs;
  static readonly Commit: DAServiceCommit;
  static readonly Submit: DAServiceSubmit;
  static readonly Validate: DAServiceValidate;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class DAServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  maxBlobSize(
    requestMessage: da_pb.MaxBlobSizeRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: da_pb.MaxBlobSizeResponse|null) => void
  ): UnaryResponse;
  maxBlobSize(
    requestMessage: da_pb.MaxBlobSizeRequest,
    callback: (error: ServiceError|null, responseMessage: da_pb.MaxBlobSizeResponse|null) => void
  ): UnaryResponse;
  get(
    requestMessage: da_pb.GetRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: da_pb.GetResponse|null) => void
  ): UnaryResponse;
  get(
    requestMessage: da_pb.GetRequest,
    callback: (error: ServiceError|null, responseMessage: da_pb.GetResponse|null) => void
  ): UnaryResponse;
  getIDs(
    requestMessage: da_pb.GetIDsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: da_pb.GetIDsResponse|null) => void
  ): UnaryResponse;
  getIDs(
    requestMessage: da_pb.GetIDsRequest,
    callback: (error: ServiceError|null, responseMessage: da_pb.GetIDsResponse|null) => void
  ): UnaryResponse;
  getProofs(
    requestMessage: da_pb.GetProofsRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: da_pb.GetProofsResponse|null) => void
  ): UnaryResponse;
  getProofs(
    requestMessage: da_pb.GetProofsRequest,
    callback: (error: ServiceError|null, responseMessage: da_pb.GetProofsResponse|null) => void
  ): UnaryResponse;
  commit(
    requestMessage: da_pb.CommitRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: da_pb.CommitResponse|null) => void
  ): UnaryResponse;
  commit(
    requestMessage: da_pb.CommitRequest,
    callback: (error: ServiceError|null, responseMessage: da_pb.CommitResponse|null) => void
  ): UnaryResponse;
  submit(
    requestMessage: da_pb.SubmitRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: da_pb.SubmitResponse|null) => void
  ): UnaryResponse;
  submit(
    requestMessage: da_pb.SubmitRequest,
    callback: (error: ServiceError|null, responseMessage: da_pb.SubmitResponse|null) => void
  ): UnaryResponse;
  validate(
    requestMessage: da_pb.ValidateRequest,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: da_pb.ValidateResponse|null) => void
  ): UnaryResponse;
  validate(
    requestMessage: da_pb.ValidateRequest,
    callback: (error: ServiceError|null, responseMessage: da_pb.ValidateResponse|null) => void
  ): UnaryResponse;
}

