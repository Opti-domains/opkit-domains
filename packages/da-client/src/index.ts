import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import {
  MaxBlobSizeRequest,
  MaxBlobSizeResponse,
  GetRequest,
  GetResponse,
  GetIDsRequest,
  GetIDsResponse,
  GetProofsRequest,
  GetProofsResponse,
  CommitRequest,
  CommitResponse,
  SubmitRequest,
  SubmitResponse,
  ValidateRequest,
  ValidateResponse,
  ID,
  Namespace,
  Blob,
  Proof
} from './generated/da_pb';

// Load the protobuf definitions
const PROTO_PATH = './proto/da.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const daProto: any = grpc.loadPackageDefinition(packageDefinition).da;

// Create a client instance
const client = new daProto.DAService('localhost:50051', grpc.credentials.createInsecure());

// Function to call MaxBlobSize
export const getMaxBlobSize = async (): Promise<MaxBlobSizeResponse> => {
  return new Promise((resolve, reject) => {
    const request = new MaxBlobSizeRequest();
    client.MaxBlobSize(request, (error: grpc.ServiceError | null, response: MaxBlobSizeResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

// Function to call Get
export const getBlobs = async (ids: ID[], namespace: Namespace): Promise<GetResponse> => {
  return new Promise((resolve, reject) => {
    const request = new GetRequest();
    request.setIdsList(ids);
    request.setNamespace(namespace);
    client.Get(request, (error: grpc.ServiceError | null, response: GetResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

// Function to call GetIDs
export const getIDs = async (height: number, namespace: Namespace): Promise<GetIDsResponse> => {
  return new Promise((resolve, reject) => {
    const request = new GetIDsRequest();
    request.setHeight(height);
    request.setNamespace(namespace);
    client.GetIDs(request, (error: grpc.ServiceError | null, response: GetIDsResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

// Function to call GetProofs
export const getProofs = async (ids: ID[], namespace: Namespace): Promise<GetProofsResponse> => {
  return new Promise((resolve, reject) => {
    const request = new GetProofsRequest();
    request.setIdsList(ids);
    request.setNamespace(namespace);
    client.GetProofs(request, (error: grpc.ServiceError | null, response: GetProofsResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

// Function to call Commit
export const commitBlobs = async (blobs: Blob[], namespace: Namespace): Promise<CommitResponse> => {
  return new Promise((resolve, reject) => {
    const request = new CommitRequest();
    request.setBlobsList(blobs);
    request.setNamespace(namespace);
    client.Commit(request, (error: grpc.ServiceError | null, response: CommitResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

// Function to call Submit
export const submitBlobs = async (blobs: Blob[], gasPrice: number, namespace: Namespace): Promise<SubmitResponse> => {
  return new Promise((resolve, reject) => {
    const request = new SubmitRequest();
    request.setBlobsList(blobs);
    request.setGasPrice(gasPrice);
    request.setNamespace(namespace);
    client.Submit(request, (error: grpc.ServiceError | null, response: SubmitResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

// Function to call Validate
export const validateCommits = async (ids: ID[], proofs: Proof[], namespace: Namespace): Promise<ValidateResponse> => {
  return new Promise((resolve, reject) => {
    const request = new ValidateRequest();
    request.setIdsList(ids);
    request.setProofsList(proofs);
    request.setNamespace(namespace);
    client.Validate(request, (error: grpc.ServiceError | null, response: ValidateResponse) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};