// package: da
// file: da.proto

var da_pb = require("./da_pb");
var grpc = require("@improbable-eng/grpc-web").grpc;

var DAService = (function () {
  function DAService() {}
  DAService.serviceName = "da.DAService";
  return DAService;
}());

DAService.MaxBlobSize = {
  methodName: "MaxBlobSize",
  service: DAService,
  requestStream: false,
  responseStream: false,
  requestType: da_pb.MaxBlobSizeRequest,
  responseType: da_pb.MaxBlobSizeResponse
};

DAService.Get = {
  methodName: "Get",
  service: DAService,
  requestStream: false,
  responseStream: false,
  requestType: da_pb.GetRequest,
  responseType: da_pb.GetResponse
};

DAService.GetIDs = {
  methodName: "GetIDs",
  service: DAService,
  requestStream: false,
  responseStream: false,
  requestType: da_pb.GetIDsRequest,
  responseType: da_pb.GetIDsResponse
};

DAService.GetProofs = {
  methodName: "GetProofs",
  service: DAService,
  requestStream: false,
  responseStream: false,
  requestType: da_pb.GetProofsRequest,
  responseType: da_pb.GetProofsResponse
};

DAService.Commit = {
  methodName: "Commit",
  service: DAService,
  requestStream: false,
  responseStream: false,
  requestType: da_pb.CommitRequest,
  responseType: da_pb.CommitResponse
};

DAService.Submit = {
  methodName: "Submit",
  service: DAService,
  requestStream: false,
  responseStream: false,
  requestType: da_pb.SubmitRequest,
  responseType: da_pb.SubmitResponse
};

DAService.Validate = {
  methodName: "Validate",
  service: DAService,
  requestStream: false,
  responseStream: false,
  requestType: da_pb.ValidateRequest,
  responseType: da_pb.ValidateResponse
};

exports.DAService = DAService;

function DAServiceClient(serviceHost, options) {
  this.serviceHost = serviceHost;
  this.options = options || {};
}

DAServiceClient.prototype.maxBlobSize = function maxBlobSize(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DAService.MaxBlobSize, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

DAServiceClient.prototype.get = function get(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DAService.Get, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

DAServiceClient.prototype.getIDs = function getIDs(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DAService.GetIDs, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

DAServiceClient.prototype.getProofs = function getProofs(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DAService.GetProofs, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

DAServiceClient.prototype.commit = function commit(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DAService.Commit, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

DAServiceClient.prototype.submit = function submit(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DAService.Submit, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

DAServiceClient.prototype.validate = function validate(requestMessage, metadata, callback) {
  if (arguments.length === 2) {
    callback = arguments[1];
  }
  var client = grpc.unary(DAService.Validate, {
    request: requestMessage,
    host: this.serviceHost,
    metadata: metadata,
    transport: this.options.transport,
    debug: this.options.debug,
    onEnd: function (response) {
      if (callback) {
        if (response.status !== grpc.Code.OK) {
          var err = new Error(response.statusMessage);
          err.code = response.status;
          err.metadata = response.trailers;
          callback(err, null);
        } else {
          callback(null, response.message);
        }
      }
    }
  });
  return {
    cancel: function () {
      callback = null;
      client.close();
    }
  };
};

exports.DAServiceClient = DAServiceClient;

