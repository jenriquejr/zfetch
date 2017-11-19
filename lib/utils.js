class ApiError extends Error {
  constructor(name, status, data) {
    const details = typeof data === 'string' ? data : JSON.stringify(data);
    super(`API(${name}) HttpError(${status}) Details(${details})`);

    this.status = status;
    this.data = data;
  }
}

exports.ApiError = ApiError;
