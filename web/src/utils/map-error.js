export function mapError(type, errors) {
  if (type && errors.length > 0) {
    return errors.map((error) => {
      if (error.field === type) return error.message;
    })[0];
  }
}
