export const handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify('This is updated by GitHub Actions.'),
  };
  return response;
};
