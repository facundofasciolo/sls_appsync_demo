exports.handler = async (event) => {
  console.log({event});

  const books = [
    {
      id: '1',
      title: 'First mocked book'
    },
    {
      id: '2',
      title: 'Second mocked book'
    }
  ];
  console.log(books);
  return books;
};
